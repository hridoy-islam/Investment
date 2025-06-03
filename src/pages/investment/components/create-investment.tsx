'use client';

import { useEffect, useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, ImageIcon, X, Save, MoveLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

interface InvestmentData {
  title: string;
  image?: File | null;
  details: string;
  documents: {
    file: File;
    title: string;
  }[];
}

export default function NewInvestment() {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [details, setDetails] = useState('');
  const [documents, setDocuments] = useState<{ file: File; title: string }[]>(
    []
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<{
    file: File | null;
    title: string;
  }>({ file: null, title: '' });
    const { toast } = useToast();
    const navigate = useNavigate();

  const quillModules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['clean'],
        ['link', 'image', 'video']
      ]
    }),
    []
  );

  // Image handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Document handlers
  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setNewDocument((prev) => ({ ...prev, file, title: file.name }));
    }
  };

  const handleAddDocument = () => {
    if (newDocument.file) {
      setDocuments((prev) => [
        ...prev,
        {
          file: newDocument.file as File,
          title: newDocument.title || newDocument.file.name
        }
      ]);
      setNewDocument({ file: null, title: '' });
      setDocumentDialogOpen(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

 
const handleSubmit = async (data: InvestmentData) => {
  try {
    setIsSubmitting(true);
    setUploadProgress(0); // Reset progress

    // Fake upload progress (optional)
    const fakeUpload = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(fakeUpload);
          setIsSubmitting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Create new investment
    const response = await axiosInstance.post(`/investments`, data);

    if (response.data && response.data.success === true) {
      toast({
        title: response.data.message || 'Investment created successfully',
        className: 'bg-theme border-none text-white'
      });
        navigate('/dashboard/investments'); 
    } else if (response.data && response.data.success === false) {
      toast({
        title: response.data.message || 'Operation failed',
        className: 'bg-red-500 border-none text-white'
      });
    } else {
      toast({
        title: 'Unexpected response. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }

    
  } catch (error) {
    toast({
      title: 'An error occurred. Please try again.',
      className: 'bg-red-500 border-none text-white'
    });
    setIsSubmitting(false);
    clearInterval(fakeUpload); 
  }
};
  return (
      <div className="mx-auto space-y-8 px-4">
          <div className='flex w-full  items-center justify-between'>
              <h1 className="mb-6 text-3xl font-bold">Add New Investment</h1>
              <Button className='bg-theme text-white hover:bg-theme' onClick={()=> navigate('/dashboard/investments')}><MoveLeft/>Back</Button>
              
          </div>



      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 md:grid-cols-2"
      >
        {/* Left Side - Title and Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-12 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-medium">Details</Label>
            <ReactQuill
              value={details}
              onChange={setDetails}
              modules={quillModules}
              theme="snow"
              placeholder="Write detailed description here..."
              className="h-[200px]  text-black"
            />
          </div>
        </div>

        {/* Right Side - Image and Supporting Documents */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image" className="text-lg font-medium">
              Featured Image
            </Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className="relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-4 text-gray-500">
                    <ImageIcon size={24} />
                    <span className="mt-2 text-sm">Upload Image</span>
                  </div>
                )}
              </label>

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />

              <div className="text-sm text-gray-500">
                <p>Recommended: 800x600px</p>
                <p>Formats: JPG, PNG, WEBP</p>
                <p>Max: 5MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents" className="text-lg font-medium">
              Supporting Documents
            </Label>
            <div className="space-y-4">
              <Dialog
                open={documentDialogOpen}
                onOpenChange={setDocumentDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-2 p-4 text-gray-500">
                      <FileUp size={20} />
                      <span>Click to upload documents</span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Supporting Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Document Title</Label>
                      <Input
                        value={newDocument.title}
                        onChange={(e) =>
                          setNewDocument((prev) => ({
                            ...prev,
                            title: e.target.value
                          }))
                        }
                        className="mt-2"
                        placeholder="Enter document title"
                      />
                    </div>
                    <div>
                      <Label>File</Label>
                      <label
                        htmlFor="document-file-upload"
                        className="mt-2 flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 hover:bg-gray-50"
                      >
                        {newDocument.file ? (
                          <div className="flex items-center gap-2">
                            <FileUp size={16} />
                            <span>{newDocument.file.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-500">
                            <FileUp size={24} />
                            <span className="text-sm">
                              Click to select file
                            </span>
                          </div>
                        )}
                      </label>
                      <input
                        id="document-file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleDocumentFileChange}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddDocument}
                      disabled={!newDocument.file}
                      className="flex items-center gap-2"
                    >
                      <Save size={16} /> Add Document
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {documents.length > 0 && (
                <ul className="space-y-2">
                  {documents.map((doc, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded border p-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <FileUp size={16} className="text-gray-500" />
                        <span className="max-w-xs truncate text-sm">
                          {doc.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(doc.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="md:col-span-2">
          {isSubmitting && (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="reset"
              variant="outline"
              onClick={() => {
                setTitle('');
                setImage(null);
                setDetails('');
                setDocuments([]);
                setImagePreview(null);
                  setUploadProgress(0);
                  navigate('/dashboard/investments'); 
              }}
              disabled={isSubmitting}
                          className="rounded-lg"
                          
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-theme text-white hover:bg-theme/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
