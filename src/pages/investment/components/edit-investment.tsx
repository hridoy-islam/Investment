import { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from 'react-select';
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
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/toaster';
import {
  FileText,
  Image as ImageIcon,
  X,
  Plus,
  ArrowLeft,
  Save,
  Calculator,
  CalendarClock,
  Layers,
  LayoutDashboard,
  Wallet
} from 'lucide-react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { currency } from '@/types/currencyType';

// --- Zod Schema ---
const investmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  currencyType: z.string().min(1, 'Currency is required'),

  // Structure & Financials
  projectDuration: z.coerce
    .number({ invalid_type_error: 'Duration is required' })
    .min(1, 'Duration must be at least 1 year'),
  installmentNumber: z.coerce
    .number({ invalid_type_error: 'Installments are required' })
    .min(1, 'At least 1 installment is required'),

  projectAmount: z.coerce
    .number({ invalid_type_error: 'Total Value is required' })
    .min(0, 'Value cannot be negative')
    .default(0),
  adminCost: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot exceed 100%')
    .default(0)
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface DocumentData {
  id: string;
  title: string;
  file?: File | null;
  size: string;
  isExisting?: boolean;
}

// --- Helper Data ---
const currencyOptions = Object.entries(currency).map(([code, details]) => ({
  value: code,
  label: `${code} - ${details.name}`,
  symbol: details.symbol
}));

export default function EditInvestment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0); // Store fetched paid amount

  // Media State
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  // Content State
  const [details, setDetails] = useState('');

  // Document State
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<{
    title: string;
    file: File | null;
  }>({
    title: '',
    file: null
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      title: '',
      currencyType: 'GBP',
      projectAmount: 0,
      adminCost: 0,
      projectDuration: 0,
      installmentNumber: 0
    }
  });

  const watchedValues = watch();

  // Calculations
  // Logic: Due = Project Amount - Total Amount Paid
  const dueAmount = (watchedValues.projectAmount || 0) - paidAmount;

  const currentSymbol =
    currencyOptions.find((c) => c.value === watchedValues.currencyType)
      ?.symbol || '£';

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: watchedValues.currencyType || 'GBP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'clean']
      ]
    }),
    []
  );

  // --- 1. Fetch Existing Data ---
  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        const response = await axiosInstance.get(`/investments/${id}`);
        const data = response.data.data;

        // Reset form fields
        // Note: Checking both projectAmount and investmentAmount for backward compatibility
        reset({
          title: data.title || '',
          currencyType: data.currencyType || 'GBP',
          projectAmount: data.projectAmount || 0,
          adminCost: data.adminCost || 0,
          projectDuration: data.projectDuration || 1,
          installmentNumber: data.installmentNumber || 1
        });

        // Set additional state
        setPaidAmount(data.totalAmountPaid || 0);
        setDetails(data.details || '');

        // Set Image
        if (data.image) {
          setExistingImage(data.image);
        }

        // Set Documents
        if (data.documents && Array.isArray(data.documents)) {
          const formattedDocs = data.documents.map(
            (doc: any, index: number) => ({
              id: `existing-${index}`,
              title: doc.title,
              file: null,
              size: 'N/A',
              isExisting: true
            })
          );
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

    if (id) fetchInvestment();
  }, [id, reset, toast, navigate]);

  // --- Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return toast({ title: 'File too large', variant: 'destructive' });
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentAdd = () => {
    if (newDocument.file && newDocument.title) {
      setDocuments((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          title: newDocument.title,
          file: newDocument.file!,
          size: (newDocument.file!.size / 1024).toFixed(0) + ' KB',
          isExisting: false
        }
      ]);
      setNewDocument({ title: '', file: null });
      setDocumentDialogOpen(false);
    }
  };

  const onSubmit = async (data: InvestmentFormData) => {
    // if (!details.trim() || details === '<p><br></p>') {
    //   return toast({
    //     title: 'Validation Error',
    //     description: 'Project details are required.',
    //     variant: 'destructive'
    //   });
    // }

    setIsSubmitting(true);
    // const interval = setInterval(
    //   () => setUploadProgress((prev) => Math.min(prev + 10, 90)),
    //   200
    // );

    try {
      const formData = {
        action: 'updateDetail',
        ...data,
        details,
        image: featuredImage ? featuredImage : existingImage || null,
        documents: documents.map((d) => ({
          title: d.title,
          file: d.file || null
        }))
      };

      await axiosInstance.patch(`/investments/${id}`, formData);

      // clearInterval(interval);
      setUploadProgress(100);
      toast({ title: 'Success', description: 'Project updated successfully' });
      navigate(-1);
    } catch (error) {
      // clearInterval(interval);
      toast({
        title: 'Error',
        description: error?.response?.data?.message||'Failed to update project',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="mx-auto space-y-3">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Edit Investment Project
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-theme text-white hover:bg-theme/90"
            >
              {isSubmitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Saving...' : 'Update Project'}
            </Button>
          </div>
        </div>

        {isSubmitting && (
          <Progress value={uploadProgress} className="h-1 w-full" />
        )}

        <form className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {/* LEFT COLUMN: Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* 1. Basic Details */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LayoutDashboard className="h-5 w-5 text-blue-600" />
                  Project Essentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Project Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g. Urban Real Estate Fund 2024"
                    className={`py-6 text-lg ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Details Input */}
                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <div className="prose-sm">
                    <ReactQuill
                      theme="snow"
                      value={details}
                      onChange={setDetails}
                      modules={quillModules}
                      className="mb-12 h-64"
                      placeholder="Describe the investment opportunity..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Documents */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Documentation
                  </CardTitle>
                  <CardDescription>
                    Attach legal documents and brochures.
                  </CardDescription>
                </div>
                <Dialog
                  open={documentDialogOpen}
                  onOpenChange={setDocumentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Add File
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        placeholder="Document Title"
                        value={newDocument.title}
                        onChange={(e) =>
                          setNewDocument((p) => ({
                            ...p,
                            title: e.target.value
                          }))
                        }
                      />
                      <Input
                        type="file"
                        onChange={(e) =>
                          setNewDocument((p) => ({
                            ...p,
                            file: e.target.files?.[0] || null
                          }))
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleDocumentAdd}>Attach</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed py-8 text-center text-sm text-slate-400">
                    No documents attached yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded border bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded bg-white p-2 shadow-sm">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {doc.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {doc.isExisting ? 'Existing File' : doc.size}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDocuments((d) =>
                              d.filter((x) => x.id !== doc.id)
                            )
                          }
                        >
                          <X className="h-4 w-4 text-slate-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Configuration Sidebar */}
          <div className="space-y-6">
            {/* 3. Financials */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4 text-green-600" />
                  Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Currency Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Currency <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="currencyType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={currencyOptions}
                        value={currencyOptions.find(
                          (c) => c.value === field.value
                        )}
                        onChange={(val) => field.onChange(val?.value)}
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: errors.currencyType
                              ? '#ef4444'
                              : '#e2e8f0',
                            boxShadow: 'none'
                          })
                        }}
                      />
                    )}
                  />
                  {errors.currencyType && (
                    <p className="text-xs text-red-500">
                      {errors.currencyType.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Project Amount */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Project Amount <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">
                        {currentSymbol}
                      </span>
                      <Input
                        type="number"
                        {...register('projectAmount')}
                        className={`pl-12 ${errors.projectAmount ? 'border-red-500' : ''}`}
                        disabled
                      />
                    </div>
                    {errors.projectAmount && (
                      <p className="text-xs text-red-500">
                        {errors.projectAmount.message}
                      </p>
                    )}
                  </div>

                  {/* Admin Cost */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Admin Fee (%)
                    </Label>
                    <Input type="number" {...register('adminCost')} />
                  </div>

                  {/* Duration Input */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Duration (Years) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <CalendarClock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        {...register('projectDuration')}
                        className={`pl-9 font-medium ${errors.projectDuration ? 'border-red-500' : ''}`}
                        placeholder="e.g. 5"
                      />
                    </div>
                    {errors.projectDuration && (
                      <p className="text-xs text-red-500">
                        {errors.projectDuration.message}
                      </p>
                    )}
                  </div>

                  {/* Installments Input */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Installments <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        {...register('installmentNumber')}
                        className={`pl-9 font-medium ${errors.installmentNumber ? 'border-red-500' : ''}`}
                        placeholder="e.g. 12"
                      />
                    </div>
                    {errors.installmentNumber && (
                      <p className="text-xs text-red-500">
                        {errors.installmentNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Calculation Preview: Due = Project Amount - Paid Amount */}
                <div className="space-y-3 rounded-lg bg-slate-900 p-4 text-white">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Due Amount</span>
                    <Calculator className="h-3 w-3" />
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {formatMoney(dueAmount)}
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-xs text-slate-500">
                    <span>Paid So Far:</span>
                    <span className="font-medium text-emerald-400">
                      {formatMoney(paidAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Featured Image */}
            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
              <div className="group relative h-48 bg-slate-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : existingImage ? (
                  <img
                    src={existingImage}
                    alt="Current"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="mb-2 h-8 w-8" />
                    <span className="text-sm font-medium">No Cover Image</span>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <label className="cursor-pointer">
                    <span className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50">
                      {imagePreview || existingImage
                        ? 'Change Image'
                        : 'Upload Image'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
