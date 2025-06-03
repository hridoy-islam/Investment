import { useEffect, useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, ImageIcon, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface InvestmentData {
  title: string;
  image?: File | null;
  details: string;
  documents: File[];
}

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InvestmentData) => void;
  initialData?: InvestmentData | null;
  isSubmitting?: boolean;
  uploadProgress?: number;
}

export function InvestmentDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting = false,
  uploadProgress = 0,
}: InvestmentDialogProps) {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [details, setDetails] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        ['link', 'image', 'video'],
      ],
    }),
    []
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDetails(initialData.details);
      setDocuments(initialData.documents || []);
      // Handle image preview if it's a URL (for editing existing data)
      if (typeof initialData.image === 'string') {
        setImagePreview(initialData.image);
      } else if (initialData.image instanceof File) {
        const preview = URL.createObjectURL(initialData.image);
        setImagePreview(preview);
        setImage(initialData.image);
      }
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle('');
    setImage(null);
    setDetails('');
    setDocuments([]);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocuments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, image, details, documents });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Clean up object URLs
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Investment' : 'Add New Investment'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className="flex h-18 w-18 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {imagePreview ? (
                  <div className="relative h-full w-full">
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
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-4 text-gray-500">
                    <ImageIcon size={24} />
                    <span className="mt-2 text-sm">Upload Image</span>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Recommended size: 800x600px</p>
                <p>Formats: JPG, PNG, WEBP</p>
                <p>Max size: 5MB</p>
              </div>
            </div>
          </div>

          <div className="rounded-md pb-14 ">
            <ReactQuill
              value={details}
              onChange={setDetails}
              modules={quillModules}
              theme="snow"
              placeholder="Write detailed description here..."
              className="bg-white text-black h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents</Label>
            <div className="space-y-4">
              <label
                htmlFor="document-upload"
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2 p-4 text-gray-500">
                  <FileUp size={20} />
                  <span>Click to upload documents</span>
                </div>
                <input
                  id="document-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected files:</h4>
                  <ul className="space-y-2">
                    {documents.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileUp size={16} className="text-gray-500" />
                          <span className="max-w-xs truncate text-sm">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
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
                </div>
              )}
            </div>
          </div>

          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="border-none bg-theme text-white hover:bg-theme/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}