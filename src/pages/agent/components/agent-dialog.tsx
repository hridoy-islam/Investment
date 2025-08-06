import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';

// Dynamic schema based on mode (create vs edit)
const getAgentSchema = (isEdit: boolean) =>
  z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: isEdit
      ? z.string().optional()
      : z.string().min(1, 'Password is required'),
    dateOfBirth: z.string().optional(),
    address: z.string().optional()
  });

export function AgentDialog({ open, onOpenChange, onSubmit, initialData }) {
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(getAgentSchema(isEdit)),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      address: ''
    }
  });

useEffect(() => {
  if (initialData) {
    reset({
      name: initialData.name || '',
      email: initialData.email || '',
      password: '',
      dateOfBirth: initialData.dateOfBirth
        ? moment(initialData.dateOfBirth).format('YYYY-MM-DD')
        : '',
      address: initialData.address || ''
    });
  } else {
    // Add Mode — reset to default empty values
    reset({
      name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      address: ''
    });
  }
}, [initialData, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add'} Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Agent Name <span className="text-red-500">*</span>
            </Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password{!isEdit && <span className="text-red-500"> *</span>}
            </Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="border-none bg-theme text-white hover:bg-theme/90"
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
