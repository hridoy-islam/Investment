/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from 'react-select'; // Added react-select
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
  DollarSign, // Generic icon for inputs
  TrendingUp,
  ArrowLeft,
  Save,
  Plus,
  Calculator,
  Coins
} from 'lucide-react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form'; // Added Controller
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';

import axiosInstance from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { currency } from '@/types/currencyType';

// 1. UPDATE: Updated Schema to include currencyType
const investmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(100, 'Title must be less than 100 characters'),
  currencyType: z.string().min(1, 'Currency is required'), // Added
  amountRequired: z
    .number({
      invalid_type_error: 'Amount is required'
    })
    .positive('Amount must be greater than 0'),
  investmentAmount: z
    .number({
      invalid_type_error: 'Investment amount is required'
    })
    .min(0, 'Investment amount cannot be negative')
    .default(0),
  // Handle optional/NaN for adminCost
  adminCost: z.preprocess(
    (val) => (Number.isNaN(val) ? 0 : val),
    z.number().optional()
  )
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface Document {
  id: string;
  title: string;
  file?: File | null;
  size: string;
}

interface InvestmentData {
  title: string;
  details: string;
  currencyType: string; // Added
  image?: string;
  amountRequired: number;
  investmentAmount?: number;
  adminCost?: number;
  documents?: Array<{
    title: string;
    file?: string;
  }>;
}

// Transform currency object to react-select options
const currencyOptions = Object.entries(currency).map(([code, details]) => ({
  value: code,
  label: `${code} - ${details.name} (${details.symbol})`,
  symbol: details.symbol
}));

export default function EditInvestment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [investment, setInvestment] = useState<InvestmentData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<{
    title: string;
    file: File | null;
  }>({ title: '', file: null });

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control, // Needed for Controller
    formState: { errors },
    reset,
    watch
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      title: '',
      currencyType: '', // Added
      amountRequired: 0,
      investmentAmount: 0,
      adminCost: 0
    }
  });

  const watchedValues = watch();

  // 2. UPDATE: Dynamic Due Amount Calculation
  const dueAmount = (watchedValues.investmentAmount || 0) - (watchedValues.amountRequired || 0);

  // Helper to format currency dynamically based on selection
  const formatCurrency = (amount: number) => {
    const currencyCode = watchedValues.currencyType || 'GBP';
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      return `${amount}`;
    }
  };

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

  // Load investment data on mount
  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        const response = await axiosInstance.get(`/investments/${id}`);
        const data: InvestmentData = response.data.data;
        setInvestment(data);

        // 3. UPDATE: Reset form with currencyType and other fields
        reset({
          title: data.title || '',
          currencyType: data.currencyType || 'GBP', // Default to GBP if missing
          amountRequired: data.amountRequired || 0,
          investmentAmount: data.investmentAmount || 0,
          adminCost: data.adminCost || 0
        });

        setDetails(data.details || '');

        if (data.image) {
          setImagePreview(data.image);
        }

        if (data.documents) {
          const formattedDocs = data.documents.map((doc, index) => ({
            id: `existing-${index}`,
            title: doc.title,
            file: null,
            size: 'N/A'
          }));
          setDocuments(formattedDocs);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load investment data.',
          variant: 'destructive'
        });
        navigate('/dashboard/investments');
      }
    };

    fetchInvestment();
  }, [id, reset, toast, navigate]);

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

    try {
      // 4. UPDATE: Include currencyType in payload
      const formData = {
        action: "updateDetail",
        title: data.title,
        details,
        currencyType: data.currencyType, // Added
        image: featuredImage || investment?.image || null,
        amountRequired: data.amountRequired, // Should usually be included if edited
        investmentAmount: data.investmentAmount,
        adminCost: data.adminCost || 0,
        documents: documents.map((doc) => ({
          title: doc.title,
          file: doc.file || null
        }))
      };

      await axiosInstance.patch(`/investments/${id}`, formData);

      toast({
        title: 'Success',
        description: 'Investment updated successfully'
      });

      navigate('/dashboard/investments');
    } catch (error) {
      toast({
        title: 'Submission failed',
        description:
          'There was an error updating your project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Edit Investment Project
          </h1>
          <Button
            className="gap-2 bg-theme text-white hover:bg-theme/90"
            onClick={() => navigate(-1)}
          >
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
                    Update essential information about your investment project
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
                        placeholder="Provide a detailed description of your investment project..."
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
                    <Coins className="h-5 w-5 text-green-600" />
                    Financial Information
                  </CardTitle>
                  <CardDescription>
                    Set your funding requirements and financial details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Currency Selection Field (New) */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="currencyType">Currency *</Label>
                      <Controller
                        name="currencyType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={currencyOptions}
                            value={currencyOptions.find(c => c.value === field.value)}
                            onChange={(val) => field.onChange(val?.value)}
                            placeholder="Select Currency"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: errors.currencyType ? 'red' : base.borderColor,
                              })
                            }}
                          />
                        )}
                      />
                      {errors.currencyType && (
                        <p className="text-sm text-red-500">
                          {errors.currencyType.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Amount Required */}
                    <div className="space-y-2">
                      <Label htmlFor="amountRequired">Amount Required *</Label>
                      <div className="relative">
                        {/* Switched to generic icon since currency can change */}
                        <Input
                          id="amountRequired"
                          type="number"
                          disabled
                          {...register('amountRequired', {
                            valueAsNumber: true
                          })}
                          placeholder="0"
                          className={` ${
                            errors.amountRequired ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      {errors.amountRequired && (
                        <p className="text-sm text-red-500">
                          {errors.amountRequired.message}
                        </p>
                      )}
                    </div>

                    {/* Admin Cost */}
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

                    {/* 6. UPDATE: Investment Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="investmentAmount">Investment Amount</Label>
                      <div className="relative">
                        <Input
                          id="investmentAmount"
                          type="number"
                          {...register('investmentAmount', { valueAsNumber: true })}
                          placeholder="0"
                          className={` ${errors.investmentAmount ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.investmentAmount && (
                        <p className="text-sm text-red-500">
                          {errors.investmentAmount.message}
                        </p>
                      )}
                    </div>

                    {/* 7. UPDATE: Dynamic Due Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="dueAmount">Due Amount (Calculated)</Label>
                      <div className="relative">
                        <Calculator className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="dueAmount"
                          type="text"
                          value={formatCurrency(dueAmount)}
                          disabled
                          className="pl-10 bg-slate-50 font-semibold text-slate-700"
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
                        ) : investment?.image ? (
                          <div className="relative">
                            <img
                              src={investment.image}
                              alt="Current"
                              className="h-48 w-full rounded-lg object-cover"
                            />
                            <p className="mt-2 text-center text-xs text-gray-500">
                              Current Image (Click to Change)
                            </p>
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

              {/* 8. UPDATE: Project Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Currency:</span>
                        <span className="font-medium">
                            {watchedValues.currencyType || 'Not selected'}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Amount Required:</span>
                      <span className="font-medium">
                        {watchedValues.amountRequired
                          ? formatCurrency(watchedValues.amountRequired)
                          : formatCurrency(0)}
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

                    {/* Added Investment Amount Row */}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Investment Amount:</span>
                      <span className="font-medium text-blue-600">
                        {watchedValues.investmentAmount
                          ? formatCurrency(watchedValues.investmentAmount)
                          : formatCurrency(0)}
                      </span>
                    </div>

                    {/* Added Due Amount Row */}
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-slate-600 font-semibold">Due Amount:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(dueAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-slate-600">Documents:</span>
                      <span className="font-medium">{documents.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Image:</span>
                      <span className="font-medium">
                        {featuredImage || investment?.image
                          ? 'Uploaded'
                          : 'None'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-theme text-white hover:bg-theme/90"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}