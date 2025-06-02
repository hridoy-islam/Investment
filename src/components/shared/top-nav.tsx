import { Link, useNavigate } from 'react-router-dom';
import { UserNav } from './user-nav';
import logo from '@/assets/imges/home/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { Edit, Edit2, LogOut } from 'lucide-react';
import { Button } from '../ui/button';

export function TopNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };
  const { user } = useSelector((state: any) => state.auth);
  const isCompleted = user?.isCompleted;

  // Dynamic navigation links configuration
  const navLinks = [
    // { path: '/dashboard/student-applications', label: 'Student Applications' },
    // // { path: '/dashboard/career-applications', label: 'Career Applications' },
    // { path: '/dashboard/courses', label: 'Course' },
    // { path: '/dashboard/terms', label: 'Term' },
    // { path: '/dashboard/jobs', label: 'Job' },
  ];

  return (
    <div className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        {isCompleted ? (
          <Link to="/dashboard" className="flex items-center space-x-4">
            <img src={logo} className="w-12" />
            <span className="text-lg font-semibold text-black"></span>
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <img src={logo} className="w-12" />
            <span className="text-lg font-semibold text-black"></span>
          </div>
        )}
      </div>

   
   {user?.role === 'admin' && <div className="flex items-center space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="text-black font-semibold py-1 px-2 hover:bg-watney hover:text-white rounded-sm transition-all"
          >
            {link.label}
          </Link>
        ))}
      </div>}

      <div className="flex items-center space-x-4">
        <div
          className={`flex flex-col items-start`}
          onClick={() => {
            if (isCompleted) navigate('/dashboard/profile');
          }}
        >
          <span className="text-sm font-semibold text-black">{user?.name}</span>
          <div className="text-[12px] gap-4 cursor-pointer flex flex-row items-center font-medium text-black">
            <span>{user?.email}</span>
            <span className='text-watney'>Edit Profile</span>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="flex cursor-pointer items-center space-x-6 rounded-md bg-watney p-2 text-white hover:bg-watney/90"
        >
          <div className="flex flex-row items-center justify-center gap-1 rounded-md p-2">
            <LogOut className="h-4 w-4" />
            <span className="font-semibold">Log out</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
