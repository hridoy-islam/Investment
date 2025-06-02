import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form'; // Import FormProvider and useForm
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const DOCUMENT_TYPES = ['PDF', 'Word', 'Image', 'Other'];

interface Document {
  type: string;
  fileUrl?: string;
  customTitle?: string;
  file?: File;
}

interface DocumentDataProps {
  userData: Document[];
  isEditing?: boolean;
  onSave: (documents: Document[]) => void;
  onCancel: () => void;
  onEdit: () => void;
}

const DocumentData: React.FC<DocumentDataProps> = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit,
}) => {
  const [localDocuments, setLocalDocuments] = useState<Document[]>(userData);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const methods = useForm(); // Initialize useForm here

  useEffect(() => {
    setLocalDocuments(userData);
  }, [userData]);

  const handleAddDocument = () => {
    if (!file) return;

    const newDoc: Document = {
      type: selectedType === 'Other' ? 'Other' : selectedType,
      customTitle: selectedType === 'Other' ? customTitle : undefined,
      file,
    }

    setLocalDocuments((prev) => [...prev, newDoc]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedType('');
    setCustomTitle('');
    setFile(null);
    setOpenDialog(false);
  };

  const handleRemoveDocument = (index: number) => {
    setLocalDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localDocuments);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <FormProvider {...methods}> {/* Wrap the component with FormProvider */}
      <div className="space-y-4">
        {/* Add Document Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="mb-4 bg-watney hover:bg-watney/90">
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={(value) => setSelectedType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-gray-800 hover:text-white">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {selectedType && (
                <>
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <Input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                  </FormItem>

                  {selectedType === 'Other' && (
                    <FormItem>
                      <FormLabel>Document Title</FormLabel>
                      <Textarea
                        className="border-gray-300"
                        placeholder="Enter document title"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                    </FormItem>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddDocument}
                      disabled={!file}
                      className="bg-watney text-white hover:bg-watney/90"
                    >
                      Save
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Documents Table */}
        {localDocuments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localDocuments.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      {doc.customTitle || doc.type}
                      {doc.file && <span className="block text-xs text-muted-foreground">{doc.file.name}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDocument(index)}
                      className="hover:bg-red-500 text-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </div>
        )}

        {/* <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="bg-watney hover:bg-watney/90 text-white">
            Save
          </Button>
        </div> */}
      </div>
    </FormProvider>
  );
};

export default DocumentData;
