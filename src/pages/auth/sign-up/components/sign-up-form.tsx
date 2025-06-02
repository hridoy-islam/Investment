'use client';

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
    title: z.string().min(1, 'Title is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    initial: z.string().optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 8 characters'),
    phone: z.string().min(7, 'Phone number is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    role: z.string().min(1, 'Purpose of your visit is required'),
    studentType: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.role === 'student' && !data.studentType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Student type is required for students',
        path: ['studentType'] // points to the studentType field
      });
    }
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      title: '',
      firstName: '',
      lastName: '',
      initial: '',
      email: '',
      password: '',
      phone: '',
      nationality: '',
      dateOfBirth: '',
      role: '',
      studentType: ''
    }
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const response = await axiosInstance.post('/auth/signup', {
        ...data,
        name: `${data.title} ${data.firstName} ${data.initial} ${data.lastName}`,

        title: data.title,
        firstName: data.firstName,
        initial: data.initial,
        lastName: data.lastName,
        nationality: data.nationality,
        dateOfBirth: data.dateOfBirth,
        role: data.role,
        studentType: data.studentType || undefined,
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'].map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {/* Middle Name */}
            <FormField
              control={form.control}
              name="initial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Middle Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="(Optional)" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
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
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {/* Nationality */}
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Nationality <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nationalities.map((nation, index) => (
                        <SelectItem key={index} value={nation}>
                          {nation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Please select the role that describes you
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">
                        Course Registration
                      </SelectItem>
                      <SelectItem value="applicant">Job Application</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {selectedRole === 'student' && (
              <FormField
                control={form.control}
                name="studentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Student Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="eu">Home Student</SelectItem>
                        <SelectItem value="international">Overseas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
         
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
              className="h-12 w-full rounded-md bg-watney font-medium text-white shadow-sm transition-colors hover:bg-watney/90"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
