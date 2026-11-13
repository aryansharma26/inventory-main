import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import TopNavbar from '../components/TopNavbar.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs pathname={location.pathname} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
