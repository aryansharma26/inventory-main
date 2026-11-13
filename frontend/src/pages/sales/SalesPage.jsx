import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, X, Receipt, DollarSign, Calendar, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import DataTable from '../../components/DataTable.jsx';
import { useSales, useSaleStats, useDeleteSale, useRefundSale } from '../../hooks/useSales.js';
import { formatCurrency, formatDate, cn } from '../../utils/helpers.js';

function SalesPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [receiptSale, setReceiptSale] = useState(null);

  const { data, isLoading } = useSales({ search, status, page, limit: 20 });
  const { data: stats } = useSaleStats();
  const deleteSale = useDeleteSale();
  const refundSale = useRefundSale();

  const sales = data?.docs || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalDocs || 0;

  const handleDelete = (id) => {
    if (confirm('Delete this sale?')) deleteSale.mutate(id);
  };

  const handleRefund = (sale) => {
    if (confirm('Refund this sale?')) {
      const refundItems = sale.items.map(item => ({ product: item.product._id, quantity: item.quantity }));
      refundSale.mutate({ id: sale._id, data: { items: refundItems } });
    }
  };

  const statusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      partial: 'bg-blue-100 text-blue-700',
      refunded: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colors[status] || 'bg-gray-100')}>{status}</span>;
  };

  const paymentIcon = (method) => {
    const icons = { cash: 'Cash', card: 'Card', upi: 'UPI', split: 'Split' };
    return <span className="text-xs capitalize">{icons[method] || method}</span>;
  };

  const columns = [
    { key: 'invoiceNumber', title: 'Invoice #', render: (v) => <span className="font-mono font-medium">{v}</span> },
    { key: 'customer', title: 'Customer', render: (v) => v?.name || 'Walk-in' },
    { key: 'items', title: 'Items', render: (v) => `${v?.length || 0} items` },
    { key: 'total', title: 'Total', render: (v) => formatCurrency(v) },
    { key: 'paymentMethod', title: 'Payment', render: (v) => paymentIcon(v) },
    { key: 'status', title: 'Status', render: (v) => statusBadge(v) },
    { key: 'createdAt', title: 'Date', render: (v) => formatDate(v) },
  ];

  columns.push({
    key: 'actions', title: 'Actions', render: (v, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setReceiptSale(row)} className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600" title="View Receipt"><Receipt className="w-4 h-4" /></button>
        {row.status === 'completed' && (
          <button onClick={() => handleRefund(row)} className="p-1.5 hover:bg-yellow-50 rounded-lg text-yellow-600" title="Refund"><RotateCcw className="w-4 h-4" /></button>
        )}
        {isAdmin && (
          <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
        )}
      </div>
    )
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>
          <p className="text-gray-500 mt-1">View all sales transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: stats?.totalSales || 0, icon: Receipt },
          { label: 'Today', value: formatCurrency(stats?.todayRevenue || 0), icon: DollarSign, color: 'green' },
          { label: 'This Week', value: formatCurrency(stats?.weekRevenue || 0), icon: Calendar, color: 'blue' },
          { label: 'This Month', value: formatCurrency(stats?.monthRevenue || 0), icon: Calendar, color: 'primary' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color ? `text-${stat.color}-500` : 'text-primary-500'}`} />
            </div>
          </div>
        ))}
      </div>

      <DataTable
        data={sales}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search by invoice number..."
        onSearch={setSearch}
        sortable
        pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={20}
        onPageChange={setPage}
        filters={[
          { key: 'status', label: 'Status', options: [{ value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'refunded', label: 'Refunded' }] },
          { key: 'paymentMethod', label: 'Payment', options: [{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'upi', label: 'UPI' }, { value: 'split', label: 'Split' }] },
        ]}
        onFilterChange={(key, value) => key === 'status' ? setStatus(value) : null}
      />

      {/* Receipt Modal */}
      {receiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Receipt</h3>
              <button onClick={() => setReceiptSale(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">InventoryPro</h2>
              <p className="text-sm text-gray-500">{receiptSale.invoiceNumber}</p>
              <p className="text-xs text-gray-400">{new Date(receiptSale.createdAt).toLocaleString()}</p>
            </div>
            <div className="py-4 space-y-2">
              {receiptSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(receiptSale.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(receiptSale.totalTax)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(receiptSale.total)}</span></div>
              <div className="flex justify-between text-sm text-gray-500"><span>Payment</span><span className="capitalize">{receiptSale.paymentMethod}</span></div>
            </div>
            <button onClick={() => window.print()} className="w-full mt-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
              <Receipt className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesPage;
