import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import NotFound from '@/pages/not-found';
import ProfilePage from '@/pages/profile';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import NotificationsPage from '@/pages/notification';
import Otp from '@/pages/auth/otp';
import NewPassword from '@/pages/new-password';
import AdminLayout from '@/components/layout/admin-layout';
import AgentPage from '@/pages/agent';
import InvestorPage from '@/pages/investor';
import InvestmentPage from '@/pages/investment';
import NewInvestment from '@/pages/investment/components/create-investment';
import EditInvestment from '@/pages/investment/components/edit-investment';
import ViewInvestorPage from '@/pages/investment/components/view-investor';
import ViewInvestmentPage from '@/pages/investment/components/view-investment';

const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const adminRoutes = [
    {
      path: '/dashboard',
      element: (
        <AdminLayout>
          <ProtectedRoute>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </AdminLayout>
      ),
      children: [
        {
          element: <DashboardPage />,
          index: true
        },
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'agents',
          element: <AgentPage />
        },
        {
          path: 'investors',
          element: <InvestorPage />
        },
        {
          path: 'investments',
          element: <InvestmentPage />
        },
        {
          path: 'investments/new',
          element: <NewInvestment />
        },
        {
          path: 'investments/edit/:id',
          element: <EditInvestment />
        },
        {
          path: 'investments/participant/:id',
          element: <ViewInvestorPage />
        },
        {
          path: 'investments/view/:id',
          element: <ViewInvestmentPage />
        },
        {
          path: 'notifications',
          element: <NotificationsPage />
        }
      ]
    }
  ];

  const publicRoutes = [

    {
      path: '/',
      element: <SignInPage />,
      index: true
    },
    {
      path: '/signup',
      element: <SignUpPage />,
      index: true
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
      index: true
    },
    {
      path: '/otp',
      element: <Otp />,
      index: true
    },
    {
      path: '/new-password',
      element: <NewPassword />,
      index: true
    },
    {
      path: '/404',
      element: <NotFound />
    },
   
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ];

  const routes = useRoutes([...publicRoutes, ...adminRoutes]);

  return routes;
}
