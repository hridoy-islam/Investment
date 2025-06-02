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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 lg:p-8">
      <div className="w-full max-w-6xl">
        <Card className=" flex max-h-[96vh] w-full flex-col justify-start overflow-y-auto rounded-sm border border-gray-200 p-4">
          <div className=" flex flex-col text-left">
            <div className="mb-4 flex items-center gap-4">
              <Link to="/">
                <img src={logo} alt="logo" className="w-12" />
              </Link>
              <div className="h-12 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold tracking-tight">
                Create an account
              </h1>
            </div>

            <p className="text-sm text-black pb-2 -mt-3">
              Enter your email and password to create an account. <br />
              Already have an account?{' '}
              <Link to="/" className="underline underline-offset-4">
                Login here
              </Link>
            </p>
          </div>

          <div >
            <SignUpForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
