import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import RoleBasedRoute from '../components/RoleBasedRoute.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import ProductsPage from '../pages/products/ProductsPage.jsx';
import CategoriesPage from '../pages/categories/CategoriesPage.jsx';
import BrandsPage from '../pages/brands/BrandsPage.jsx';
import SuppliersPage from '../pages/suppliers/SuppliersPage.jsx';
import CustomersPage from '../pages/customers/CustomersPage.jsx';
import PurchasesPage from '../pages/purchases/PurchasesPage.jsx';
import SalesPage from '../pages/sales/SalesPage.jsx';
import PosPage from '../pages/pos/PosPage.jsx';
import InventoryPage from '../pages/inventory/InventoryPage.jsx';
import ExpensesPage from '../pages/expenses/ExpensesPage.jsx';
import ReportsPage from '../pages/reports/ReportsPage.jsx';
import SettingsPage from '../pages/settings/SettingsPage.jsx';
import ProfilePage from '../pages/profile/ProfilePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          
          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
