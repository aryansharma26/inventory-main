import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  Warehouse,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../utils/helpers.js';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Tags, label: 'Categories', path: '/categories' },
  { icon: Award, label: 'Brands', path: '/brands' },
  { icon: Truck, label: 'Suppliers', path: '/suppliers' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: ShoppingCart, label: 'Purchases', path: '/purchases' },
  { icon: Receipt, label: 'Sales', path: '/sales' },
  { icon: Receipt, label: 'POS', path: '/pos' },
  { icon: Warehouse, label: 'Inventory', path: '/inventory' },
  { icon: DollarSign, label: 'Expenses', path: '/expenses' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

const adminItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState(true);

  const isActive = (path) => location.pathname === path;

  const renderMenuItem = (item) => (
    <Link
      key={item.path}
      to={item.path}
      onClick={() => onClose()}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        isActive(item.path)
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium text-sm">{item.label}</span>
      {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              InventoryPro
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          <div className="mb-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
          </div>
          {menuItems.map(renderMenuItem)}

          {user?.role === 'admin' && (
            <>
              <div className="mt-6 mb-4">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administration
                </p>
              </div>
              {adminItems.map(renderMenuItem)}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
