import { TopNav } from "@/components/shared/top-nav"
import { SideNav } from "@/components/shared/side-nav"
import AutoLogout from "../shared/auto-logout";
import { Toaster } from "@/components/ui/toaster";
import { useSelector } from "react-redux";
import VerifyPage from "@/pages/auth/verify";

export default function AdminLayout({
    children
  }: {
    children: React.ReactNode;
  })  {
      const { user } = useSelector((state: any) => state.auth);
 if (user && user.isValided === false) {
    return <VerifyPage user={user}/>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />
      <TopNav />
      {/* <SideNav /> */}

      <main className="px-4 mx-auto py-6">
      {children}
      </main>
      <Toaster />
    </div>
  )
}
