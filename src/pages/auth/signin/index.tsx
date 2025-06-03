import UserAuthForm from './components/user-auth-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import watney from '@/assets/imges/home/watney.jpg';
import logo from '@/assets/imges/home/logo.png';
import { Card } from '@/components/ui/card';

export default function SignInPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard'); // Adjust the path as needed
    }
  }, [user, navigate]);

  return (
    <div
      className="relative flex h-screen w-full items-center justify-start lg:px-0"
      style={{
        backgroundImage: "url('/login.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Blur Overlay */}
      <div className="absolute inset-0 z-0 bg-black/10 backdrop-blur-0" />

      {/* Content aligned left */}
      <div className="relative z-10 flex h-full w-full items-center justify-start p-4 shadow-md lg:p-16">
        <Card className="ml-0 flex w-full max-w-[450px] flex-col space-y-4 rounded-[30px] border border-gray-200 px-8 py-10">
          <div className="flex w-full flex-row items-center justify-center gap-4 space-y-2 text-center">
            <h1 className="pb-4 text-center text-2xl font-semibold tracking-tight">
              Investment
            </h1>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-center text-2xl font-medium">
              <span className="font-bold">Welcome Back !</span>
            </h1>
            <h1 className="text-center text-xs">
              Please fill in your Email and Password to Sign In.
            </h1>
          </div>
          <UserAuthForm />
        </Card>
      </div>
    </div>
  );
  
}
