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
    { path: '/dashboard/agents', label: 'Agent' },
    { path: '/dashboard/investors', label: 'Investor' },
    { path: '/dashboard/investments', label: 'Project' },
  ];

  return (
    <div className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Investment Portfolio</h1>
          <span className="text-lg font-semibold text-black"></span>
        </Link>
      </div>

      {user?.role === 'admin' && (
        <div className="flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="rounded-sm px-2 py-1 font-semibold text-black transition-all hover:bg-theme hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div
          className={`flex flex-col items-start`}
          // onClick={() => {
          //   if (isCompleted) navigate('/dashboard/profile');
          // }}
        >
          <span className="text-sm font-semibold text-black">{user?.name}</span>
          <div className="flex cursor-pointer flex-row items-center gap-4 text-[12px] font-medium text-black">
            <span>{user?.email}</span>
            {/* <span className="text-theme">Edit Profile</span> */}
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="flex cursor-pointer items-center space-x-6 rounded-md bg-theme p-2 text-white hover:bg-theme/90"
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
