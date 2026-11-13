import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, ShoppingCart, Users, Package, AlertTriangle,
  DollarSign, Receipt, Truck, CreditCard, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboard.js';
import { formatCurrency, formatNumber } from '../../utils/helpers.js';
import DataTable from '../../components/DataTable.jsx';

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    primary: 'bg-primary-50 text-primary-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const [timeRange, setTimeRange] = useState('today');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const monthlyData = stats?.monthlySales?.map(item => ({
    month: item._id?.slice(5) || item._id,
    revenue: item.revenue || 0,
    profit: item.profit || 0,
  })) || [];

  const salesData = stats?.todaySales || { count: 0, revenue: 0 };
  const weekData = stats?.weekSales || { count: 0, revenue: 0 };
  const monthData = stats?.monthSales || { count: 0, revenue: 0 };
  const yearData = stats?.yearSales || { count: 0, revenue: 0 };

  const stockPieData = [
    { name: 'In Stock', value: (stats?.totalProducts || 0) - (stats?.lowStock || 0) - (stats?.outOfStock || 0), color: '#22c55e' },
    { name: 'Low Stock', value: stats?.lowStock || 0, color: '#eab308' },
    { name: 'Out of Stock', value: stats?.outOfStock || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const bestSellingColumns = [
    { key: 'name', title: 'Product', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'totalSold', title: 'Sold', render: (v) => formatNumber(v) },
    { key: 'revenue', title: 'Revenue', render: (v) => formatCurrency(v) },
  ];

  const recentSalesColumns = [
    { key: 'invoiceNumber', title: 'Invoice', render: (v) => <span className="font-mono text-sm">{v}</span> },
    { key: 'customer', title: 'Customer', render: (v) => v?.name || 'Walk-in' },
    { key: 'total', title: 'Amount', render: (v) => formatCurrency(v) },
    { key: 'status', title: 'Status', render: (v) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${v === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{v}</span>
    )},
    { key: 'createdAt', title: 'Time', render: (v) => new Date(v).toLocaleTimeString() },
  ];

  const topCustomerColumns = [
    { key: 'name', title: 'Customer', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'totalSpending', title: 'Total Spent', render: (v) => formatCurrency(v) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your business</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`${timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}'s Sales`}
          value={formatCurrency(
            timeRange === 'today' ? salesData.revenue :
            timeRange === 'week' ? weekData.revenue :
            timeRange === 'month' ? monthData.revenue :
            yearData.revenue
          )}
          subtitle={`${
            timeRange === 'today' ? salesData.count :
            timeRange === 'week' ? weekData.count :
            timeRange === 'month' ? monthData.count :
            yearData.count
          } orders`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Total Products"
          value={formatNumber(stats?.totalProducts || 0)}
          subtitle={`${stats?.lowStock || 0} low stock`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Customers"
          value={formatNumber(stats?.totalCustomers || 0)}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Pending Purchases"
          value={formatNumber(stats?.pendingPurchases || 0)}
          subtitle={formatCurrency(stats?.pendingPayments || 0)}
          icon={Truck}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Revenue & Profit Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#16a34a" fill="#16a34a" fillOpacity={0.1} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Stock Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stockPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          <DataTable
            data={stats?.recentSales || []}
            columns={recentSalesColumns}
            pagination={false}
            emptyMessage="No recent sales"
          />
        </div>

        {/* Best Selling */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Best Selling Products</h3>
          <DataTable
            data={stats?.bestSelling || []}
            columns={bestSellingColumns}
            pagination={false}
            emptyMessage="No sales data yet"
          />
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4">Top Customers</h3>
        <DataTable
          data={stats?.topCustomers || []}
          columns={topCustomerColumns}
          pagination={false}
          emptyMessage="No customer data yet"
        />
      </div>
    </div>
  );
}

export default DashboardPage;
