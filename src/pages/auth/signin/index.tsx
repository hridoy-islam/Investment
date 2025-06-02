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
      className="relative flex h-screen w-full items-center justify-center lg:px-0"
      style={{
        backgroundImage: "url('/login.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Blur Overlay */}
      <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-0" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center  p-4 shadow-md lg:p-8">
        <Card className="mx-auto flex w-full flex-col justify-center space-y-4 rounded-sm border border-gray-200 p-4 sm:w-[450px]">
          <div className="flex flex-row items-center gap-4 space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight pb-4">
             Investment 
            </h1>
          </div>
          <h1 className="text-2xl text-center font-medium"><span className='font-bold'>Login</span> to you account</h1>
          <UserAuthForm />
        </Card>
      </div>
    </div>
  );
  
}