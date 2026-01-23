

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from '@/routes/hooks';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

import type { HTMLAttributes } from 'react';
import { nationalities } from '@/types';

interface SignUpFormProps extends HTMLAttributes<HTMLDivElement> {}

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Title is required'),

    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 8 characters'),
    phone: z.string().min(7, 'Phone number is required'),

    dateOfBirth: z.string().min(1, 'Date of birth is required')
  })
  

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: ''
    }
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const response = await axiosInstance.post('/auth/signup', {
        ...data,
        name: data.name,

        dateOfBirth: data.dateOfBirth
      });

      if (response?.data?.success) {
        localStorage.setItem('hasVisitedBefore', 'false');
        toast({
          title: 'Account Created',
          description: 'Your account was successfully created.'
        });
        router.push('/');
      } else {
        toast({
          title: 'Registration Failed',
          description: response.data.message || 'Unexpected error occurred.',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Server Error',
        description: err.response?.data?.message || 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const selectedRole = useWatch({
    control: form.control,
    name: 'role'
  });

  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
          <div className="grid grid-cols-1 gap-4 ">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      className="border-gray-400"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1234567890"
                      {...field}
                      className="border-gray-400"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="border-gray-400" />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 ">
            {/* Email - Full width */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                      className="border-gray-400"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            {/* Password - Full width */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="border-gray-400"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage className="text-xs text-red-600" />
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters
                  </p>
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="h-12 w-full rounded-md bg-theme font-medium text-white shadow-sm transition-colors hover:bg-theme/90"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
