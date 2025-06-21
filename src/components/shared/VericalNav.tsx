import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Building,
  Briefcase as BriefcaseBusiness,
  PoundSterling,
  Package,
  BookUser,
  Calculator
} from 'lucide-react';
import { useSelector } from 'react-redux';

const VerticalNav = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle smooth transitions with proper delays
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isHovering) {
      setIsExpanded(true);
    } else {
      // Delay collapse to prevent flickering
      timeoutId = setTimeout(() => {
        setIsExpanded(false);
      }, 150);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isHovering]);

  const baseNavItems = [{ name: 'Dashboard', path: '/dashboard', icon: Home }];

  // Role-based items with unique paths
  const roleBasedNavItems =
    user?.role === 'admin'
      ? [
          { name: 'Agent', path: '/dashboard/agents', icon: Users },
          {
            name: 'Investor',
            path: '/dashboard/investors',
            icon: BriefcaseBusiness
          },
          {
            name: 'Projects',
            path: '/dashboard/investments',
            icon: Building
          }
        ]
      : user?.role === 'investor'
        ? [
          { name: 'Offers', path: '/dashboard/offers', icon: Package },
            {
              name: 'Projects',
              path: '/dashboard/investor/projects',
              icon: Building
            },
            { name: 'Banks', path: '/dashboard/banks', icon: PoundSterling },
            { name: 'Transactions', path: '/dashboard/investors/transactions', icon: Calculator },
            { name: 'AML Update', path: '/dashboard/profile/aml', icon: BookUser  }
          ]
        : user?.role === 'agent'
          ? [
              {
                name: 'Investor List',
                path: '/dashboard/agent/referral',
                icon: BriefcaseBusiness
              },
              { name: 'Banks', path: '/dashboard/banks', icon: PoundSterling },
               { name: 'AML Update', path: '/dashboard/profile/aml', icon: BookUser  }
            ]
          : [];

  const navItems = [...baseNavItems, ...roleBasedNavItems];

  if (!mounted) return null;

  return (
    <aside
      className={`${
        isExpanded ? 'w-64' : 'w-16'
      } fixed bottom-0 left-0 top-16 z-[10000] h-full overflow-hidden bg-white  transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <nav className="mt-4 space-y-1 px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isCurrentPath =
            location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/dashboard');

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={() =>
                `group relative flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out ${
                  isCurrentPath
                    ? 'bg-blue-50 text-orange-500 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center">
                <IconComponent
                  size={20}
                  className={`min-h-[20px] min-w-[20px] transition-colors duration-200 ${
                    isExpanded ? '' : 'mx-auto'
                  }`}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? 'ml-3 translate-x-0 opacity-100'
                      : 'ml-0 -translate-x-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isExpanded ? '100ms' : '0ms'
                  }}
                >
                  {item.name}
                </span>
              </div>

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 transform">
                  <div className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -ml-1 -translate-y-1/2 transform border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Subtle gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1 bg-gradient-to-r from-transparent to-black/5"></div>
    </aside>
  );
};

export default VerticalNav;
