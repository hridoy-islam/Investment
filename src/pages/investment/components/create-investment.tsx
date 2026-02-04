/* eslint-disable @typescript-eslint/no-this-alias */
import { useState, useMemo } from 'react';
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
  TrendingUp,
  ArrowLeft,
  Save,
  Calculator,
  Coins,
  ChevronRight,
  Badge
} from 'lucide-react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "@/lib/axios";
import { currency } from '@/types/currencyType';

// Zod Schema preservation
const investmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(100, 'Title must be less than 100 characters'),
  currencyType: z.string().min(1, 'Currency is required'),
  amountRequired: z
    .number({ 
      invalid_type_error: 'Amount is required'
    })
    .positive('Amount must be greater than 0'),
  investmentAmount: z
    .number({ 
      invalid_type_error: 'Project Amount is required'
    })
    .min(0, 'Project Amount cannot be negative')
    .default(0),
  adminCost: z.preprocess(
    (val) => (Number.isNaN(val) ? 0 : val), 
    z.number().optional()
  )
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface Document {
  id: string;
  title: string;
  file: File;
  size: string;
}

const currencyOptions = Object.entries(currency).map(([code, details]) => ({
  value: code,
  label: `${code} - ${details.name} (${details.symbol})`,
  symbol: details.symbol
}));

export default function CreateInvestment() {
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
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      title: '',
      currencyType: 'GBP', 
      amountRequired: 0,
      investmentAmount: 0,
      adminCost: 0
    }
  });

  const watchedValues = watch();
  const dueAmount = (watchedValues.investmentAmount || 0) - (watchedValues.amountRequired || 0);

  // Mandatory logic preservation: Existing logic format helper
  const formatCurrency = (amount: number) => {
    const currencyCode = watchedValues.currencyType || 'GBP';
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${amount}`;
    }
  };

  // FULL Quill module preservation from previous codebase
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
    if (!details.trim() || details === "<p><br></p>") {
      toast({
        title: 'Details required',
        description: 'Please provide project details',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    // Maintain fake progress animation from original code
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      // Must use FormData because file uploads are involved
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('details', details);
      formData.append('currencyType', data.currencyType);
      formData.append('amountRequired', data.amountRequired.toString());
      formData.append('investmentAmount', data.investmentAmount.toString());
      formData.append('adminCost', (data.adminCost || 0).toString());
      
      if (featuredImage) {
        formData.append('image', featuredImage);
      }
      
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][title]`, doc.title);
        formData.append(`documents[${index}][file]`, doc.file);
      });

      await axiosInstance.post('/investments', formData);

      navigate('/dashboard/investments');

      toast({
        title: 'Investment project created',
        description: 'Your investment project has been successfully submitted'
      });

      reset();
      setDetails('');
      setFeaturedImage(null);
      setImagePreview(null);
      setDocuments([]);
      setUploadProgress(0);
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your project.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header - REDESIGNED with Project Theme */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              New Investment Project
            </h1>
            <p className="text-slate-500 mt-1">Fill in the details to launch a new investment asset.</p>
          </div>
          <div className="flex gap-3">
            <Button className="gap-2 bg-theme text-white hover:bg-theme/90 border-none" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                Discard
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Main Content Area */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Card: Narrative */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-theme rounded-full" />
                    <CardTitle className="text-xl">Project Narrative</CardTitle>
                  </div>
                  <CardDescription>
                    Provide essential titles and details for prospective investors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Project Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="e.g., Dubai Clock Tower Apartment"
                      className={`h-11 bg-slate-50/50 ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.title && (
                      <p className="text-sm font-medium text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details" className="text-sm font-semibold text-slate-700">Detailed Information *</Label>
                    <div className="min-h-[420px] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-inner">
                      <ReactQuill
                        value={details}
                        onChange={setDetails}
                        modules={quillModules}
                        theme="snow"
                        placeholder="Provide project objectives, market analysis, and returns model..."
                        className="h-[350px]"
                      />
                    </div>
                    <div className="flex justify-between px-1 pt-1 text-xs text-slate-500">
                      <span>{details.replace(/<[^>]*>/g, '').length} characters written</span>
                      {details.length === 0 && <span className="text-amber-600 font-medium">Description is mandatory</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Documents */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-indigo-500" />
                      Supporting Materials
                    </CardTitle>
                    <CardDescription>Brochures and legality documents</CardDescription>
                  </div>
                  <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-theme text-white hover:bg-theme/90 shadow-sm border-none">
                        <Plus className="h-4 w-4" />
                        Add Attachment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>Attach files like business plans or floor layouts.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>File Description</Label>
                          <Input
                            value={newDocument.title}
                            onChange={(e) => setNewDocument((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Q4 Financial Projection"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 transition-all hover:bg-slate-50 group flex flex-col items-center justify-center">
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleDocumentUpload}
                            />
                            {newDocument.file ? (
                              <>
                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <Upload className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-sm font-semibold">{newDocument.file.name}</p>
                              </>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-slate-400 group-hover:scale-110 transition-transform mb-2" />
                                <p className="text-xs font-medium text-slate-500 text-center">Click or Drag & Drop<br/>PDF, DOCX up to 10MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="mt-4">
                        <Button
                          className="w-full bg-theme text-white hover:bg-theme/90"
                          onClick={handleAddDocument}
                          disabled={!newDocument.file || !newDocument.title.trim()}
                        >
                          Confirm & Add
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  {documents.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white transition-colors hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 rounded flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                DOC
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{doc.title}</p>
                              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{doc.size}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                       <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                       <p className="text-sm text-slate-400">No documents attached.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Controls Area */}
            <div className="space-y-6">

              {/* Card: Financial Config */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-theme text-white pb-6">
                  <div className="flex items-center gap-2">
                    {/* <Coins className="h-5 w-5 text-theme" /> */}
                    <CardTitle className="text-lg">Financial Settings</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400 text-white">Manage targets and costs</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5 bg-white">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Operational Currency</Label>
                    <Controller
                      name="currencyType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={currencyOptions}
                          value={currencyOptions.find(c => c.value === field.value)}
                          onChange={(val) => field.onChange(val?.value)}
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                    {errors.currencyType && <p className="text-xs text-red-500">{errors.currencyType.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Project Raising Target</Label>
                    <Input
                      type="number"
                      {...register('amountRequired', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="font-bold border-slate-200 focus:border-theme h-11"
                    />
                    {errors.amountRequired && <p className="text-xs text-red-500 font-medium">{errors.amountRequired.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Platform Fee (%)</Label>
                      <Input
                        type="number"
                        {...register('adminCost', { valueAsNumber: true })}
                        placeholder="e.g. 10"
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Amount Pre-paid</Label>
                        <Input
                            type="number"
                            {...register('investmentAmount', { valueAsNumber: true })}
                            placeholder="0"
                            className="bg-slate-50 border-slate-200"
                        />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                     <span className="text-sm font-semibold text-slate-600">Initial Debt View</span>
                     <Badge 
                        className={`text-sm px-3 py-1 border-none shadow-none font-bold rounded-full
                        ${dueAmount <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                     >
                         {formatCurrency(dueAmount)}
                     </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Media Assets */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-amber-500" />
                    Cover Photo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 hover:border-theme/50 transition-all">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleRemoveImage}
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full shadow-lg"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2 p-6">
                                <ImageIcon className="h-10 w-10 text-slate-300" />
                                <p className="text-xs text-center font-medium text-slate-400">Recommend aspect ratio 4:3<br/>Click to Upload</p>
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>

              {/* Action Progress Area */}
              <div className="sticky top-6">
                <Card className="bg-white border border-slate-200  p-0 overflow-hidden">
                   <div className="p-6 flex flex-col gap-6">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500 text-sm font-medium">Platform Fee</span>
                            <span className="text-slate-900 font-bold">{watchedValues.adminCost || 0}%</span>
                         </div>
                         <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500 text-sm font-medium">Launch Target</span>
                            <span className="text-theme font-bold">{formatCurrency(watchedValues.amountRequired || 0)}</span>
                         </div>
                         <div className="flex items-center justify-between pb-2">
                            <span className="text-slate-900 text-base font-bold">Total Final Value</span>
                            <span className="text-emerald-600 font-black text-xl tracking-tight">{formatCurrency(watchedValues.investmentAmount || 0)}</span>
                         </div>
                      </div>

                      {isSubmitting && (
                         <div className="space-y-3 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                                <span>Encoding Payload...</span>
                                <span className="text-slate-900">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2 bg-slate-100" />
                         </div>
                      )}

                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full h-14 rounded-xl bg-theme text-white hover:bg-theme/90 transition-all text-base font-bold flex gap-2 group shadow-md shadow-theme/20"
                      >
                         {isSubmitting ? (
                            'Synthesizing Assets...'
                         ) : (
                            <>
                               Deploy Project Asset
                               <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                         )}
                      </Button>
                   </div>
                </Card>
              </div>

            </div>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}