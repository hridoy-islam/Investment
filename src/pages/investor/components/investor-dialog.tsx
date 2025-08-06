import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import axiosInstance from '@/lib/axios';
import Select from 'react-select';
// Schemas
const createInvestorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
   agent: z.string().optional() 
});

const editInvestorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  agent: z.string().optional()
});

export function InvestorDialog({ open, onOpenChange, onSubmit, initialData }) {
  const schema = useMemo(
    () => (initialData ? editInvestorSchema : createInvestorSchema),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      address: '',
      agent: ''
    }
  });
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get('/users?role=agent&limit=all');
        const formatted =
          response.data?.data?.result?.map((agent) => ({
            value: agent._id,
            label: agent.name
          })) || [];
        setAgents(formatted);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };
    fetchAgents();
  }, []);

useEffect(() => {
  if (initialData && agents.length > 0) {
    // Edit Mode: populate form with existing agent's data
    const defaultValues = {
      name: initialData.name || '',
      email: initialData.email || '',
      password: '',
      dateOfBirth: initialData.dateOfBirth
        ? moment(initialData.dateOfBirth).format('YYYY-MM-DD')
        : '',
      address: initialData.address || '',
      agent: initialData.agent?._id || ''
    };

    reset(defaultValues);
  } else if (!initialData) {
    // Add Mode: reset to blank values explicitly
    reset({
      name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      address: '',
      agent: ''
    });
  }
}, [initialData, agents, reset]);


  const onFormSubmit = (data) => {
     if (!data.agent) {
    delete data.agent;
  }
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Investor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Investor Name <span className="text-red-500">*</span>
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
            <Label htmlFor="agent">Agent</Label>
            <Controller
              control={control}
              name="agent"
              render={({ field }) => (
                <Select
                  {...field}
                  id="agent"
                  options={agents}
                  placeholder="Select an agent"
                  isClearable
             
                  value={
                    agents.find((option) => option?.value === field.value) ||
                    null
                  }
                  onChange={(selected) => field.onChange(selected?.value || '')}
                />
              )}
            />
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
              Password{!initialData && <span className="text-red-500"> *</span>}
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
