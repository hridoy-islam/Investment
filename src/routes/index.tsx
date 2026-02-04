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
import ReferralPage from '@/pages/agent/referral';
import InvestmentProjectPage from '@/pages/investor/project-investment';
import InvestorInvestmentPage from '@/pages/investment/investor-projects';
import BankPage from '@/pages/bank';
import CreateBankPage from '@/pages/bank/components/create-account';
import EditBankPage from '@/pages/bank/components/edit-account';
import AgentReferralPage from '@/pages/agent-referral';
import InvestorBankPage from '@/pages/investor/investor-bank';
import CreateInvestorBankPage from '@/pages/investor/investor-bank/components/create-account';
import EditInvestorBankPage from '@/pages/investor/investor-bank/components/edit-account';
import OfferPage from '@/pages/offer';
import InvestorAccountHistoryPage from '@/pages/investor/account-history';
import AMLPage from '@/pages/aml';
import InvestmentTransactionPage from '@/pages/investment/view-transactions';
import InvestorTransactionPage from '@/pages/investor/investor-transaction';
import SaleLogTransactionPage from '@/pages/investment/view-saleLog';
import AgentTransactionPage from '@/pages/agent-transactions';
import AgentTransactionHistoryPage from '@/pages/agent/accountHistory';
import AgentAllTransactionPage from '@/pages/agent/agent-transaction';
import InvestorAMLPage from '@/pages/investor/aml-page';
import InvestmentManagePage from '@/pages/investment/investmentManage';

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
          path: 'profile/aml',
          element: <AMLPage />
        },
        {
          path: 'agents',
          element: <AgentPage />
        },
        {
          path: 'agent/transactions/:id',
          element: <AgentTransactionPage />
        },
        {
          path: 'agent/transactions',
          element: <AgentAllTransactionPage />
        },
        {
          path: 'agent/referral',
          element: <AgentReferralPage />
        },
        {
          path: 'agents/referral/:id',
          element: <ReferralPage />
        },
        {
          path: 'agents/referral/account-history/:id',
          element: <AgentTransactionHistoryPage />
        },
        {
          path: 'investors',
          element: <InvestorPage />
        },
        {
          path: 'investor/aml/:id',
          element: <InvestorAMLPage />
        },
        {
          path: 'investors/transactions',
          element: <InvestorTransactionPage />
        },
        {
          path: 'investor/projects',
          element: <InvestorInvestmentPage />
        },
        {
          path: 'investor/projects/:id',
          element: <InvestmentProjectPage />
        },
        {
          path: 'investor/projects/account-history/:id',
          element: <InvestorAccountHistoryPage />
        },

        {
          path: 'investments',
          element: <InvestmentPage />
        },
        {
          path: 'investments/:id',
          element: <InvestmentManagePage />
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
          path: 'investments/transactions/:id',
          element: <InvestmentTransactionPage />
        },
        {
          path: 'investments/transactions/sale-log/:id',
          element: <SaleLogTransactionPage />
        },
        {
          path: 'notifications',
          element: <NotificationsPage />
        },

        {
          path: 'investors/bank/:id',
          element: <InvestorBankPage />
        },
        {
          path: '/dashboard/banks/investor/create/:id',
          element: <CreateInvestorBankPage />
        },
        {
          path: '/dashboard/banks/investor/edit/:id',
          element: <EditInvestorBankPage />
        },
        // {
        //   path: 'investors/bank/:id',
        //   element: <CreateInvestorBankPage />
        // },
        {
          path: 'banks',
          element: <BankPage />
        },
        {
          path: 'banks/create',
          element: <CreateBankPage />
        },
        {
          path: 'banks/edit/:id',
          element: <EditBankPage />
        },
        {
          path: 'offers',
          element: <OfferPage />
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
