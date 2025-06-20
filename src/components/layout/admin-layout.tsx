import { TopNav } from '@/components/shared/top-nav';
import { SideNav } from '@/components/shared/side-nav';
import AutoLogout from '../shared/auto-logout';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import VerifyPage from '@/pages/auth/verify';
import VerticalNav from '../shared/VericalNav';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useSelector((state: any) => state.auth);
  // if (user && user.isValided === false) {
  //   return <VerifyPage user={user} />;
  // }

  return (
 <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
  <AutoLogout inactivityLimit={30 * 60 * 1000} />
  <TopNav />

  <div className="flex flex-1 overflow-hidden">
    <VerticalNav />
    
    <main className="flex-1 overflow-y-auto px-4 py-6 ml-16">
      {children}
    </main>
  </div>

  <Toaster />
</div>

  );
}
