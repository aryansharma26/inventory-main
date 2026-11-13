import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../utils/helpers.js';

const routeMap = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/brands': 'Brands',
  '/suppliers': 'Suppliers',
  '/customers': 'Customers',
  '/purchases': 'Purchases',
  '/sales': 'Sales',
  '/pos': 'POS',
  '/inventory': 'Inventory',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

function Breadcrumbs({ pathname }) {
  const segments = pathname.split('/').filter(Boolean);
  
  if (pathname === '/' || pathname === '/dashboard') {
    return (
      <nav className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2 mb-4 text-sm">
      <Link to="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-primary-600">
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <span className="text-gray-900 dark:text-white font-medium">
        {routeMap[pathname] || segments[segments.length - 1]}
      </span>
    </nav>
  );
}

export default Breadcrumbs;
