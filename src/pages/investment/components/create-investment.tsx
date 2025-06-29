import { useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

import { Toaster } from '@/components/ui/toaster';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Plus,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Save,

} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "@/lib/axios"

// Form validation schema matching exact model
const investmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(100, 'Title must be less than 100 characters'),
  amountRequired: z
    .number()
    .positive('Amount must be greater than 0'),
    

  adminCost: z.number().optional()
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface Document {
  id: string;
  title: string;
  file: File;
  size: string;
}

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<{
    title: string;
    file: File | null;
  }>({
    title: '',
    file: null
  });

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      title: '',
      amountRequired: 0,

      adminCost: 0
    }
  });

  const watchedValues = watch();

  // React Quill modules configuration
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
        ['link']
      ]
    }),
    []
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }

      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a document smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }

      setNewDocument((prev) => ({
        ...prev,
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  const handleAddDocument = () => {
    if (newDocument.file && newDocument.title.trim()) {
      const document: Document = {
        id: Date.now().toString(),
        title: newDocument.title.trim(),
        file: newDocument.file,
        size: (newDocument.file.size / 1024).toFixed(1) + ' KB'
      };

      setDocuments((prev) => [...prev, document]);
      setNewDocument({ title: '', file: null });
      setDocumentDialogOpen(false);

      toast({
        title: 'Document added',
        description: `${document.title} has been added successfully`
      });
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the project'
    });
  };

  const onSubmit = async (data: InvestmentFormData) => {
    if (!details.trim()) {
      toast({
        title: 'Details required',
        description: 'Please provide project details',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      // Prepare form data matching exact model schema
      const formData = {
        title: data.title,
        image: featuredImage, // This would be the actual image URL after upload
        details: details,
        amountRequired: data.amountRequired,

        adminCost: data.adminCost || 0,
        documents: documents.map((doc) => ({
          title: doc.title,
          file: doc.file // This would be processed for actual upload
        }))
      };

      await axiosInstance.post('/investments', formData)

      navigate('/dashboard/investments')

      toast({
        title: 'Investment project created',
        description:
          'Your investment project has been successfully submitted for review'
      });

      // Reset form
      reset();
      setDetails('');
      setFeaturedImage(null);
      setImagePreview(null);
      setDocuments([]);
      setUploadProgress(0);
    } catch (error) {
      toast({
        title: 'Submission failed',
        description:
          'There was an error submitting your project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };



  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className=" space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Create Investment Project
            </h1>
           
          </div>
          <Button  className="gap-2 bg-theme text-white hover:bg-theme/90" onClick={()=>navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Project Details
                  </CardTitle>
                  <CardDescription>
                    Provide essential information about your investment project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Enter project title"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">Project Details *</Label>
                    <div className="min-h-[400px]">
                      <ReactQuill
                        value={details}
                        onChange={setDetails}
                        modules={quillModules}
                        theme="snow"
                        placeholder="Provide a detailed description of your investment project, including objectives, market analysis, and business model..."
                        className="h-[350px]"
                      />
                    </div>
                    <div className="flex justify-between py-4 text-sm text-slate-500">
                      <span>
                        {details.length === 0 ? 'Details are required' : ''}
                      </span>
                      <span>
                        {details.replace(/<[^>]*>/g, '').length} characters
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              

              {/* Supporting Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Supporting Documents
                  </CardTitle>
                  <CardDescription>
                    Upload business plans, financial statements, and other
                    relevant documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog
                    open={documentDialogOpen}
                    onOpenChange={setDocumentDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-full gap-2 border-dashed"
                      >
                        <Plus className="h-4 w-4" />
                        Add Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Supporting Document</DialogTitle>
                        <DialogDescription>
                          Upload documents that support your investment project
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentTitle">Document Title</Label>
                          <Input
                            id="documentTitle"
                            value={newDocument.title}
                            onChange={(e) =>
                              setNewDocument((prev) => ({
                                ...prev,
                                title: e.target.value
                              }))
                            }
                            placeholder="Enter document title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Upload File</Label>
                          <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
                            <input
                              type="file"
                              id="documentFile"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                              onChange={handleDocumentUpload}
                            />
                            <label
                              htmlFor="documentFile"
                              className="cursor-pointer"
                            >
                              {newDocument.file ? (
                                <div className="space-y-2">
                                  <FileText className="mx-auto h-8 w-8 text-green-600" />
                                  <p className="text-sm font-medium">
                                    {newDocument.file.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {(newDocument.file.size / 1024).toFixed(1)}{' '}
                                    KB
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                                  <p className="text-sm text-slate-600">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max
                                    10MB)
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleAddDocument}
                          disabled={
                            !newDocument.file || !newDocument.title.trim()
                          }
                        >
                          Add Document
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {documents.length > 0 && (
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {doc.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {doc.size}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Financial Information
                  </CardTitle>
                  <CardDescription>
                    Set your funding requirements and financial details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amountRequired">Amount Required *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="amountRequired"
                          type="number"
                          {...register('amountRequired', {
                            valueAsNumber: true
                          })}
                          placeholder="0"
                          className={`pl-10 ${errors.amountRequired ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.amountRequired && (
                        <p className="text-sm text-red-500">
                          {errors.amountRequired.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminCost">Admin Cost %</Label>
                      <div className="relative">
                        <Input
                          id="adminCost"
                          type="number"
                          {...register('adminCost', { valueAsNumber: true })}
                          placeholder="0"
                          className="pr-10"
                        />
                      </div>
                    </div>
                  </div>

                  
                </CardContent>
              </Card>


              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-600" />
                    Featured Image
                  </CardTitle>
                  <CardDescription>
                    Upload a compelling image for your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border-2 border-dashed border-slate-300 p-4">
                      <input
                        type="file"
                        id="featuredImage"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="featuredImage" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-48 w-full rounded-lg object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute right-2 top-2"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveImage();
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-600">
                              Click to upload image
                            </p>
                            <p className="text-xs text-slate-500">
                              JPG, PNG, WEBP up to 5MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Amount Required:</span>
                      <span className="font-medium">
                        {watchedValues.amountRequired
                          ? formatCurrency(watchedValues.amountRequired)
                          : '$0'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Admin Cost:</span>
                      <span className="font-medium">
                        {watchedValues.adminCost
                          ? `%${watchedValues.adminCost}`
                          : '%0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Documents:</span>
                      <span className="font-medium">{documents.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Image:</span>
                      <span className="font-medium">
                        {featuredImage ? 'Uploaded' : 'None'}
                      </span>
                    </div>
                  </div>
                 
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Progress Bar */}
          {isSubmitting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading project...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}

          <div className="flex justify-end ">
            <Button type="submit" disabled={isSubmitting} className='bg-theme text-white hover:bg-theme/90'>
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </Button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
