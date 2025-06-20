import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import axiosInstance from '@/lib/axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
import Select from 'react-select';
import { countries, currencies } from '@/types/index';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { MoveLeft } from 'lucide-react';

// Zod Validation Schema
const bankSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  bankCountry: z.string().min(1, 'Bank country is required'),
  BeneficiaryCountry: z.string().min(1, 'Beneficiary country is required'),
  beneficiaryBankName: z.string().min(1, 'Beneficiary bank name is required'),
  beneficiaryBankAddress: z
    .string()
    .min(1, 'Beneficiary bank address is required'),
  beneficiaryBankAcountName: z
    .string()
    .min(1, 'Account holder name is required'),
  beneficiaryFirstName: z.string().min(1, 'First name is required'),
  beneficiaryLastName: z.string().min(1, 'Last name is required'),
  beneficiaryAddress: z.string().min(1, 'Beneficiary address is required'),
  beneficiaryCity: z.string().min(1, 'City is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  swift: z.string().optional(),
  addtionalNotes: z.string().optional()
});
type BankFormValues = z.infer<typeof bankSchema>;

export default function EditInvestorBankPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams(); 


  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      currency: '',
      bankCountry: '',
      BeneficiaryCountry: '',
      beneficiaryBankName: '',
      beneficiaryBankAddress: '',
      beneficiaryBankAcountName: '',
      beneficiaryFirstName: '',
      beneficiaryLastName: '',
      beneficiaryAddress: '',
      beneficiaryCity: '',
      accountNumber: '',
      swift: '',
      addtionalNotes: ''
    }
  });

  // Fetch bank data when component mounts
  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const res = await axiosInstance.get(`/banks/${id}`);
        const bankData = res.data.data;

        // Populate form with fetched data
        form.reset({
          currency: bankData.currency || '',
          bankCountry: bankData.bankCountry || '',
          BeneficiaryCountry: bankData.BeneficiaryCountry || '',
          beneficiaryBankName: bankData.beneficiaryBankName || '',
          beneficiaryBankAddress: bankData.beneficiaryBankAddress || '',
          beneficiaryBankAcountName: bankData.beneficiaryBankAcountName || '',
          beneficiaryFirstName: bankData.beneficiaryFirstName || '',
          beneficiaryLastName: bankData.beneficiaryLastName || '',
          beneficiaryAddress: bankData.beneficiaryAddress || '',
          beneficiaryCity: bankData.beneficiaryCity || '',
          accountNumber: bankData.accountNumber || '',
          swift: bankData.swift || '',
          addtionalNotes: bankData.addtionalNotes || ''
        });
      } catch (error) {
        console.error('Error fetching bank data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bank details.',
          variant: 'destructive'
        });
        navigate(-1);
      }
    };

    if (id) {
      fetchBankData();
    }
  }, [id, form, navigate, toast]);

  const onSubmit = async (data: BankFormValues) => {
    try {
      const payload = {
        ...data,
   
      };
      await axiosInstance.patch(`/banks/${id}`, payload); // Patch to /banks/{id}
      toast({
        title: 'Bank account updated successfully.'
      });
      navigate(-1);
    } catch (error: any) {
      console.error('Error updating bank:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  const countryOptions = countries.map((country) => ({
    label: country,
    value: country
  }));

  return (
    <motion.div
      className=""
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-200"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section: Basic Info */}
            <motion.div variants={itemVariants} className="space-y-4">
               <div className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-700">
                  Basic Information
                </h2>
                <Button
                  className="border-none bg-theme text-white hover:bg-theme/90"
                  size={'sm'}
                  onClick={() => navigate(-1)}
                >
                  <MoveLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select
                          options={currencies}
                          value={currencies.find(
                            (c) => c.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select currency..."
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Country</FormLabel>
                      <FormControl>
                        <Select
                          options={countryOptions}
                          value={countryOptions.find(
                            (c) => c.label === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.label)
                          }
                          placeholder="Select bank country..."
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
            {/* Section: Beneficiary Info */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Beneficiary Details
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="BeneficiaryCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Country</FormLabel>
                      <FormControl>
                        <Select
                          options={countryOptions}
                          value={countryOptions.find(
                            (c) => c.label === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.label)
                          }
                          placeholder="Select beneficiary country..."
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beneficiaryBankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g Bank of America" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beneficiaryBankAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Bank Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g 123 Main St, Cityville"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beneficiaryBankAcountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
            {/* Section: Personal Info */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="beneficiaryFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beneficiaryLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beneficiaryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g 456 Oak St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beneficiaryCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g Springfield" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
            {/* Section: Account & SWIFT */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Account & SWIFT
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="swift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SWIFT/BIC (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g BOFAUS3N" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
            {/* Section: Notes */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Additional Notes
              </h2>
              <FormField
                control={form.control}
                name="addtionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any extra details..."
                        {...field}
                        rows={4}
                        className="border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            {/* Submit Button */}
            <motion.div
              variants={itemVariants}
              className="flex justify-end gap-4 pt-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-theme px-6 text-white hover:bg-theme/90"
              >
                Update
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
}