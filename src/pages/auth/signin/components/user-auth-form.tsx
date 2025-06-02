import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  authWithFbORGoogle,
  loginUser,
  resetError
} from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import {
  useSignInWithFacebook,
  useSignInWithGoogle
} from 'react-firebase-hooks/auth';
import { firebaseAuth } from '@/firebaseConfig';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string()
});

type googleUserSchema = {
  name: string;
  email: string;
  googleUid: string;
  image: string | undefined;
  phone: string | undefined;
};

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const [signInWithGoogle, googleUser, gLoading, gError] =
    useSignInWithGoogle(firebaseAuth);
  const [signInWithFacebook, facebookUser, fLoading, fError] =
    useSignInWithFacebook(firebaseAuth);
  const router = useRouter();
  const { loading, error } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    const result: any = await dispatch(loginUser(data));
    if (result?.payload?.success) {
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const handleFacebookLogin = async () => {
    await signInWithFacebook();
  };

  const loginWithFbOrGoogle = async (data: googleUserSchema) => {
    const result: any = await dispatch(authWithFbORGoogle(data));
    if (result?.payload?.success) {
      router.push('/dashboard');
    }
  };

  useEffect(() => {
    if (googleUser) {
      const { email, displayName, uid, photoURL, phoneNumber } =
        googleUser?.user;
      const data = {
        name: displayName,
        email,
        password: '123456',
        googleUid: uid,
        image: photoURL ? photoURL : undefined,
        phone: phoneNumber ? phoneNumber : undefined
      };
      loginWithFbOrGoogle(data);
    }
  }, [googleUser]);

  useEffect(() => {
    if (facebookUser) {
      const { email, displayName, uid, photoURL, phoneNumber } =
        facebookUser?.user;
      const data = {
        name: displayName,
        email,
        password: '123456',
        googleUid: uid,
        image: photoURL ? photoURL : undefined,
        phone: phoneNumber ? phoneNumber : undefined
      };
      loginWithFbOrGoogle(data);
    }
  }, [facebookUser]);
  useEffect(() => {
    // Reset the error when the component mounts
    dispatch(resetError());
  }, [dispatch]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className=''>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    disabled={loading}
                    {...field}
                    className='w-full h-12'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    disabled={loading}
                    {...field}
                    className='w-full h-12'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={loading}
            className="ml-auto h-12  w-full bg-watney text-white hover:bg-watney/90"
            type="submit"
          >
            Login
          </Button>
        </form>
      </Form>
      {error && <Badge className="mt-2 bg-white text-red-500">{error}</Badge>}
      {/* <p className="text-sm">
        Don't have account? <span className='hover:underline'> <Link to="/signup">Signup</Link></span>{' '}
      </p> */}
      <p className="text-sm text-right">
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>

      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div> */}
      {/* <Button
        onClick={handleGoogleLogin}
        className="border-1 mt-6 flex h-12 items-center justify-center gap-2 border border-gray-400"
      >
        <img
          src={`https://www.material-tailwind.com/logos/logo-google.png`}
          alt="google"
          className="h-6 w-6"
        />{' '}
        sign in with google
      </Button>

      <Button
        onClick={handleFacebookLogin}
        className="border-1 mt-6 flex h-12 items-center justify-center gap-2 border border-gray-400"
      >
        <img
          src={`https://www.material-tailwind.com/logos/logo-facebook.png`}
          alt="google"
          className="h-6 w-6"
        />{' '}
        sign in with facebook
      </Button> */}
    </>
  );
}