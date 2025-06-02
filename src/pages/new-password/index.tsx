import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { changePassword } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import watney from '@/assets/imges/home/watney.jpg';
import logo from '@/assets/imges/home/logo.png';

import { Link } from 'react-router-dom';
import { z } from 'zod';

const formSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function NewPassword() {
  const { loading } = useSelector((state: any) => state.auth);
  const [error, setError] = useState('');
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); // State to control dialog visibility
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const defaultValues = {
    password: '',
    confirmPassword: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const userData = JSON.parse(localStorage.getItem('tp_user_data') || '{}');
    const result: any = await dispatch(
      changePassword({
        password: data.password,
        userId: userData._id
      })
    );
    if (result?.payload?.success) {
      setError('');
      localStorage.removeItem('tp_user_data');
      localStorage.removeItem('tp_otp_email');
      setDialogOpen(true); // Open the dialog when password changes successfully
      setFieldsDisabled(true);
    }
  };

  // useEffect(() => {
  //   if (localStorage.getItem('tp_user_data') === null) router.push('/login');
  // }, []);

  return (
    <div className="relative h-screen flex-col items-center justify-center">
      {/* Right Side (Form) */}
      <div className="flex h-full items-center bg-gray-100  p-4 sm:p-16">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[680px] py-8 ">
          {dialogOpen ? (
            <Card className="space-y-6 py-8 px-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Password Changed Successfully
              </h1>
              <p className="text-sm text-muted">
                Your password has been updated successfully. You can now log in
                using your new password.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full hover:bg-watney/90 bg-watney text-white hover:text-white"
              >
                Login Now
              </Button>
            </Card>
          ) : (
            <Card className="flex w-full flex-col justify-center space-y-4 border border-gray-200 p-4 ">
              <div className="flex  flex-col space-y-2 text-center">
                {/* <div className="flex flex-row items-center gap-4  text-center">
                  <Link to="/">
                    <img src={logo} alt="logo" className="w-12 " />
                  </Link>

                  <div className="h-12 border"></div>
                  <h1 className='font-semibold text-2xl'>Watney College</h1>
                </div> */}
                <h1 className="text-2xl font-semibold tracking-tight">
                  Enter New Password
                </h1>
                <p className="text-sm text-muted">
                  Enter your new password to login.
                </p>
              </div>

              {error && (
                <p className="mt-2 text-center text-sm text-red-500">{error}</p>
              )}

              <div className="space-y-6 p-2">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password..."
                              disabled={loading || fieldsDisabled}
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password..."
                              disabled={loading || fieldsDisabled}
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      disabled={loading || fieldsDisabled}
                      className="w-full bg-watney text-white hover:bg-watney/90"
                      type="submit"
                    >
                      Submit
                    </Button>
                  </form>
                </Form>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
