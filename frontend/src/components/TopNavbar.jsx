import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Menu, Bell, Search, Sun, Moon, User, LogOut, Settings,
  AlertTriangle, Package, Calendar
} from 'lucide-react';
import { logout } from '../stores/authSlice.js';
import { useNotifications } from '../hooks/useMisc.js';
import { cn } from '../utils/helpers.js';

function TopNavbar({ onMenuToggle }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications } = useNotifications();

  const notifCount = notifications?.length || 0;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'low-stock': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'out-of-stock': return <Package className="w-4 h-4 text-red-500" />;
      case 'expiring': return <Calendar className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-medium text-sm">
                Notifications ({notifCount})
              </div>
              {notifCount === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3">
                      {getNotifIcon(notif.type)}
                      <div>
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <span className="hidden md:block text-sm font-medium">
              {user?.name || 'User'}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
