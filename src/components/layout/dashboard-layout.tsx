import { useState } from 'react';
import Sidebar from '../shared/sidebar';
import Header from '../shared/header';
import MobileSidebar from '../shared/mobile-sidebar';
import { MenuIcon } from 'lucide-react';
import {UserNav} from '../shared/user-nav';
import AutoLogout from '../shared/auto-logout';
import { NotificationDropdown } from '../shared/notification-dropdown';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />
      {/* <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <Sidebar /> */}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-10 flex h-20 flex-shrink-0 md:hidden">
          <button
            className="pl-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 xl:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <Header />
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <NotificationDropdown />
          <UserNav />
        </div>

        <main className="relative mx-2 my-3 mr-2 flex-1 overflow-hidden rounded-xl  border border-gray-300 bg-gray-100 focus:outline-none md:mx-0 md:my-4 md:mr-4 ">
          {children}
        </main>
      </div>
    </div>
  );
}
