import { Card } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { SignUpForm } from './components/sign-up-form';
import watney from '@/assets/imges/home/watney.jpg';
import logo from '@/assets/imges/home/logo.png';
import { useEffect, useState } from 'react';
import axiosInstance from "@/lib/axios"



export default function SignUpPage() {

    const navigate = useNavigate();
  
    const [course, setCourse] = useState<any>(null);
    const [term, setTerm] = useState<any>(null);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [termId, setTermId] = useState<string | null>(null);
  
    useEffect(() => {
      const cId = localStorage.getItem('courseId');
      const tId = localStorage.getItem('termId');
  
      setCourseId(cId);
      setTermId(tId);
  
      const fetchData = async () => {
        try {
          if (cId) {
            const res = await axiosInstance.get(`/courses/${cId}`);
            setCourse(res.data.data);
          }
  
          if (tId) {
            const res = await axiosInstance.get(`/terms/${tId}`);
            setTerm(res.data.data);
          }
        } catch (err) {
          console.error('Error fetching course or term:', err);
        }
      };
  
      fetchData();
    }, []);
  

    
    return (
      <div
        className="relative flex min-h-screen items-center justify-center p-4 lg:p-8"
        style={{
          backgroundImage: "url('/login.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Blur Overlay */}
        <div className="absolute inset-0 z-0 bg-black/10 backdrop-blur-none" />

        {/* Sign Up Form Panel */}
        <div className="relative z-10 w-full max-w-2xl">
          <Card className="flex max-h-[96vh] w-full flex-col justify-start overflow-y-auto rounded-sm border border-gray-200 bg-white/80 p-4 backdrop-blur-md">
            <div className="flex flex-col text-left">
              <div className="mb-4 flex items-center gap-4">
               
                <h1 className="text-xl font-semibold tracking-tight">
                  Create an account
                </h1>
              </div>

              <p className="-mt-3 pb-2 text-sm text-black">
                Enter your email and password to create an account. <br />
                Already have an account?{' '}
                <Link to="/" className="underline underline-offset-4">
                  Login here
                </Link>
              </p>
            </div>

            <div>
              <SignUpForm />
            </div>
          </Card>
        </div>
      </div>
    );
    
}
