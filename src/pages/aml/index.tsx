// AMLPage.tsx or AMLPage.jsx

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  FileText,
  ExternalLink,
  Upload,
  CheckCircle
} from 'lucide-react';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import Loader from '@/components/shared/loader';
import { ImageUploader } from './components/document-uploader';
import axiosInstance from "@/lib/axios"

export const amlSchema = z.object({
  image: z.string().optional(),
  proofOfAddress: z.array(z.string()).optional(),
  passport:  z.array(z.string()).optional(),
});
export type AMLFile = z.infer<typeof amlSchema>;

interface AMLProps {}

const AMLPage: React.FC<AMLProps> = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [documents, setDocuments] = useState<AMLFile>({
    image: '',
    passport: [],
    proofOfAddress: []
  });
  const [uploadState, setUploadState] = useState<{
    isOpen: boolean;
    field: keyof AMLFile | null;
  }>({
    isOpen: false,
    field: null
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Load existing documents on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = axiosInstance.get(`/users/${user?._id}`);
        const data = await res.data.data;
        if (data.success) {
          setDocuments({
            image: data.image || '',
            passport: data.passport || [],
            proofOfAddress: data.proofOfAddress || []
          });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user?._id]);


  // Auto-save whenever documents change
  useEffect(() => {
    if (!user?._id || loading) return;

    const timer = setTimeout(async () => {
      if (hasChanges()) {
        await saveToServer(documents);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [documents, user?._id, loading]);

  const hasChanges = () => {
    const original = {
      image: user?.image || '',
      passport: user?.passport || [],
      proofOfAddress: user?.proofOfAddress || []
    };

    return (
      JSON.stringify(original) !== JSON.stringify(documents)
    );
  };

 const saveToServer = async (updatedDocuments: AMLFile) => {
  setSaving(true);
  try {
    await axiosInstance.patch(`/users/${user?._id}`, updatedDocuments);
  } catch (error) {
    console.error('Auto-save failed', error);
  } finally {
    setSaving(false);
  }
};

  const handleRemoveFile = (field: keyof AMLFile, fileName: string) => {
    if (field === 'image') {
      setDocuments((prev) => ({
        ...prev,
        image: ''
      }));
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter(
          (file) => file !== fileName
        )
      }));
    }
  };

  const handleUploadComplete = (uploadResponse: any) => {
    const { field } = uploadState;
    if (!field || !uploadResponse?.success || !uploadResponse.data?.fileUrl) {
      setUploadState({ isOpen: false, field: null });
      return;
    }

    const fileUrl = uploadResponse.data.fileUrl;
    if (field === 'image') {
      setDocuments((prev) => ({ ...prev, image: fileUrl }));
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), fileUrl]
      }));
    }

    setUploadState({ isOpen: false, field: null });
  };

  const renderUploadedFiles = (field: keyof AMLFile) => {
    if (field === 'image') {
      const fileUrl = documents.image;
      if (fileUrl) {
        const fileName = decodeURIComponent(
          fileUrl.split('/').pop() || 'Profile Image'
        );
        return (
          <div className="mt-3 space-y-2">
            <div className="flex w-auto items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
                  >
                    <span className="truncate">{fileName}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(field, fileUrl)}
                className="h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      }
      return null;
    }

    const value = documents[field];
    if (Array.isArray(value) && value.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {value.map((fileUrl, index) => {
            const fileName = decodeURIComponent(
              fileUrl.split('/').pop() || `File-${index}`
            );
            return (
              <div
                key={`${fileUrl}-${index}`}
                className="flex w-auto items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex min-w-0 flex-1 gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
                    >
                      <Button className="flex flex-row items-center gap-4 bg-blue-600 text-white hover:bg-blue-700">
                        View <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </Button>
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(field, fileUrl)}
                  className="h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const openImageUploader = (field: keyof AMLFile) => {
    setUploadState({ isOpen: true, field });
  };

  const documentTypes = [
    {
      id: 'passport',
      label: 'Passport',
      required: false,
      instructions: "Upload a clear copy of your passport",
      formats: 'PDF, JPG, PNG',
      error: validationErrors.passport,
      icon: FileText
    },
    {
      id: 'proofOfAddress',
      label: 'Proof of Residence',
      required: false,
      instructions: 'Upload recent utility bill or bank statement showing your address',
      formats: 'PDF, JPG, PNG',
      error: validationErrors.proofOfAddress,
      icon: FileText
    },
    {
      id: 'image',
      label: 'Profile Photo',
      required: false,
      instructions: 'Upload a profile picture or passport-style photo',
      formats: 'JPG, PNG',
      error: validationErrors.image,
      icon: FileText
    }
  ];

  return (
    <div className="">
      <Card className="border-0 shadow-none">
        <CardHeader>
          {/* <h2 className="text-2xl font-bold text-gray-900">AML Documents</h2> */}
          <h2 className="text-3xl font-medium text-gray-900">AML For : {user?.name}</h2>

        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {documentTypes.map(({ id, label, required, instructions, formats, error, icon: Icon }) => {
                  const hasFiles =
                    id === 'image'
                      ? !!documents.image
                      : Array.isArray(documents[id as keyof AMLFile]) &&
                        (documents[id as keyof AMLFile] as string[]).length > 0;

                  return (
                    <div
                      key={id}
                      className={`rounded-xl border-2 ${
                        error
                          ? 'border-red-200 bg-red-50'
                          : hasFiles
                            ? 'border-gray-100 bg-gray-50 hover:border-gray-200'
                            : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-3">
                              <div
                                className={`rounded-lg p-2 ${
                                  error
                                    ? 'bg-red-100'
                                    : hasFiles
                                      ? 'bg-gray-100'
                                      : 'bg-gray-100'
                                }`}
                              >
                                <Icon
                                  className={`h-5 w-5 ${
                                    error
                                      ? 'text-red-600'
                                      : hasFiles
                                        ? 'text-green-600'
                                        : 'text-gray-600'
                                  }`}
                                />
                              </div>
                              <div>
                                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                  {label}
                                  {required && (
                                    <span className="ml-2 text-red-500">*</span>
                                  )}
                                  {hasFiles && (
                                    <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {instructions}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Accepted formats: {formats}
                                </p>
                              </div>
                            </div>
                            {error && (
                              <div className="mt-2 rounded-lg border border-red-200 bg-red-100 p-3">
                                <p className="text-sm font-medium text-red-700">
                                  {error}
                                </p>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() =>
                              openImageUploader(id as keyof AMLFile)
                            }
                            className="ml-4 flex items-center space-x-2 rounded-lg bg-theme px-6 py-2 text-white transition-colors hover:bg-theme/90"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Upload</span>
                          </Button>
                        </div>
                        {renderUploadedFiles(id as keyof AMLFile)}
                      </div>
                      <ImageUploader
                        open={uploadState.isOpen}
                        onOpenChange={(isOpen) =>
                          setUploadState((prev) => ({ ...prev, isOpen }))
                        }
                        onUploadComplete={handleUploadComplete}
                        entityId={user?._id}
                      />
                    </div>
                  );
                })}
              </div>

              {saving && (
                <div className="mt-4 text-sm text-gray-500">
                  Saving changes...
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AMLPage;