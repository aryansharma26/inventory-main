import { useState } from 'react';
import {
  Package, AlertTriangle, CheckCircle, TrendingUp, ArrowUpDown,
  Pencil, History, Loader2, X, Search, Warehouse
} from 'lucide-react';
import DataTable from '../../components/DataTable.jsx';
import {
  useInventory, useInventoryStats, useStockHistory, useAdjustStock
} from '../../hooks/usePurchases.js';
import { formatCurrency, formatDate, cn } from '../../utils/helpers.js';

function StockAdjustModal({ isOpen, onClose, product, onSubmit }) {
  const [quantity, setQuantity] = useState(product?.quantity || 0);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit({ productId: product._id, quantity: parseInt(quantity), reason, type: 'adjustment' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Adjust Stock</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Product</p>
            <p className="font-medium">{product?.name}</p>
            <p className="text-xs text-gray-400">SKU: {product?.sku}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Quantity</label>
            <input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Why are you adjusting stock?" className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Adjust</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock');
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [page, setPage] = useState(1);
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);

  const { data, isLoading } = useInventory({ search, stockStatus, page, limit: 20 });
  const { data: stats } = useInventoryStats();
  const { data: historyData, isLoading: historyLoading } = useStockHistory({ page: historyPage, limit: 20 });
  const adjustStock = useAdjustStock();

  const products = data?.docs || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalDocs || 0;

  const history = historyData?.docs || [];
  const historyTotalPages = historyData?.totalPages || 1;
  const historyTotalItems = historyData?.totalDocs || 0;

  const handleAdjust = (formData) => {
    adjustStock.mutate(formData);
  };

  const stockBadge = (product) => {
    if (product.quantity === 0) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>;
    if (product.quantity <= product.minStockAlert) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Low Stock</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>;
  };

  const stockColumns = [
    { key: 'name', title: 'Product', render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {row.image?.url ? <img src={row.image.url} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" />}
        </div>
        <div>
          <p className="font-medium">{v}</p>
          <p className="text-xs text-gray-500">{row.sku}</p>
        </div>
      </div>
    )},
    { key: 'category', title: 'Category', render: (v) => v?.name || '-' },
    { key: 'quantity', title: 'Stock', render: (v, row) => (
      <div className="flex items-center gap-2">
        <span className={cn('font-mono font-bold', v === 0 ? 'text-red-600' : v <= row.minStockAlert ? 'text-yellow-600' : 'text-green-600')}>{v}</span>
        {stockBadge(row)}
      </div>
    )},
    { key: 'minStockAlert', title: 'Min Alert', render: (v) => <span className="text-sm text-gray-500">{v}</span> },
    { key: 'purchasePrice', title: 'Purchase Price', render: (v) => formatCurrency(v) },
    { key: 'sellingPrice', title: 'Selling Price', render: (v) => formatCurrency(v) },
    { key: 'status', title: 'Status', render: (v) => (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', v === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>{v}</span>
    )},
    { key: 'actions', title: 'Actions', render: (v, row) => (
      <button onClick={() => { setSelectedProduct(row); setAdjustModal(true); }} className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600"><Pencil className="w-4 h-4" /></button>
    )},
  ];

  const historyColumns = [
    { key: 'product', title: 'Product', render: (v) => v?.name || '-' },
    { key: 'type', title: 'Type', render: (v) => (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize',
        v === 'purchase' ? 'bg-green-100 text-green-700' :
        v === 'sale' ? 'bg-blue-100 text-blue-700' :
        v === 'adjustment' ? 'bg-yellow-100 text-yellow-700' :
        v === 'return' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
      )}>{v}</span>
    )},
    { key: 'quantity', title: 'Qty', render: (v) => (
      <span className={cn('font-mono font-bold', v >= 0 ? 'text-green-600' : 'text-red-600')}>{v > 0 ? `+${v}` : v}</span>
    )},
    { key: 'previousStock', title: 'Previous', render: (v) => v },
    { key: 'newStock', title: 'New', render: (v) => <span className="font-bold">{v}</span> },
    { key: 'reason', title: 'Reason', render: (v) => v || '-' },
    { key: 'createdAt', title: 'Date', render: (v) => formatDate(v) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-gray-500 mt-1">Track and manage stock levels</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'blue' },
          { label: 'Total Stock', value: stats?.totalStock || 0, icon: Warehouse, color: 'green' },
          { label: 'Low Stock', value: stats?.lowStock || 0, icon: AlertTriangle, color: 'yellow' },
          { label: 'Stock Value', value: formatCurrency(stats?.totalValue || 0), icon: TrendingUp, color: 'primary' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button onClick={() => setActiveTab('stock')} className={cn('px-6 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'stock' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            Stock Levels
          </button>
          <button onClick={() => setActiveTab('history')} className={cn('px-6 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'history' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            Stock History
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <DataTable
          data={products}
          columns={stockColumns}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search products..."
          onSearch={setSearch}
          sortable
          pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={20}
          onPageChange={setPage}
          filters={[
            { key: 'stockStatus', label: 'Stock Status', options: [{ value: 'in-stock', label: 'In Stock' }, { value: 'low-stock', label: 'Low Stock' }, { value: 'out-of-stock', label: 'Out of Stock' }] },
          ]}
          onFilterChange={(key, value) => setStockStatus(value)}
        />
      )}

      {activeTab === 'history' && (
        <DataTable
          data={history}
          columns={historyColumns}
          isLoading={historyLoading}
          pagination
          page={historyPage}
          totalPages={historyTotalPages}
          totalItems={historyTotalItems}
          limit={20}
          onPageChange={setHistoryPage}
        />
      )}

      <StockAdjustModal
        isOpen={adjustModal}
        onClose={() => { setAdjustModal(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onSubmit={handleAdjust}
      />
    </div>
  );
}

export default InventoryPage;
