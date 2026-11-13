import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  FileText, Download, DollarSign, ShoppingCart, Package, Users, TrendingUp, Calendar
} from 'lucide-react';
import { useSaleStats } from '../../hooks/useSales.js';
import { usePurchaseStats } from '../../hooks/usePurchases.js';
import { useProductStats } from '../../hooks/useProducts.js';
import { useExpenseStats } from '../../hooks/useMisc.js';
import { useInventoryStats } from '../../hooks/usePurchases.js';
import { formatCurrency, formatDate } from '../../utils/helpers.js';

function ReportsPage() {
  const { user } = useSelector((state) => state.auth);
  const [activeReport, setActiveReport] = useState('sales');
  const { data: saleStats } = useSaleStats();
  const { data: purchaseStats } = usePurchaseStats();
  const { data: productStats } = useProductStats();
  const { data: expenseStats } = useExpenseStats();
  const { data: inventoryStats } = useInventoryStats();

  const reports = [
    { key: 'sales', label: 'Sales Report', icon: ShoppingCart },
    { key: 'purchase', label: 'Purchase Report', icon: TrendingUp },
    { key: 'inventory', label: 'Inventory Report', icon: Package },
    { key: 'expense', label: 'Expense Report', icon: DollarSign },
  ];

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: saleStats?.totalSales || 0 },
          { label: 'Today Revenue', value: formatCurrency(saleStats?.todayRevenue || 0) },
          { label: 'Week Revenue', value: formatCurrency(saleStats?.weekRevenue || 0) },
          { label: 'Month Revenue', value: formatCurrency(saleStats?.monthRevenue || 0) },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPurchaseReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: purchaseStats?.total || 0 },
          { label: 'Pending', value: purchaseStats?.pending || 0 },
          { label: 'Received', value: purchaseStats?.received || 0 },
          { label: 'Total Value', value: formatCurrency(purchaseStats?.totalAmount || 0) },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: inventoryStats?.totalProducts || 0 },
          { label: 'Total Stock', value: inventoryStats?.totalStock || 0 },
          { label: 'Low Stock', value: inventoryStats?.lowStock || 0 },
          { label: 'Stock Value', value: formatCurrency(inventoryStats?.totalValue || 0) },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExpenseReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Daily', value: formatCurrency(expenseStats?.daily || 0) },
          { label: 'Total', value: formatCurrency(expenseStats?.total || 0) },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      {expenseStats?.monthly && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Expenses by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseStats.monthly}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="total"
                  nameKey="_id"
                  label={entry => `${entry._id}: ${formatCurrency(entry.total)}`}
                >
                  {expenseStats.monthly.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#2563eb', '#eab308', '#16a34a', '#9333ea', '#f97316', '#6b7280'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 mt-1">Business analytics and insights</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reports.map(report => (
          <button
            key={report.key}
            onClick={() => setActiveReport(report.key)}
            className={`flex items-center gap-2 p-4 rounded-xl border transition-all text-left ${
              activeReport === report.key
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <report.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{report.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        {activeReport === 'sales' && renderSalesReport()}
        {activeReport === 'purchase' && renderPurchaseReport()}
        {activeReport === 'inventory' && renderInventoryReport()}
        {activeReport === 'expense' && renderExpenseReport()}
      </div>
    </div>
  );
}

export default ReportsPage;
