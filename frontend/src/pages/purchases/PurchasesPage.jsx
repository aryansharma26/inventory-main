import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Plus, Pencil, Trash2, X, Truck, CheckCircle, Package,
  Loader2, Calendar, DollarSign, Search, FileText
} from 'lucide-react';
import DataTable from '../../components/DataTable.jsx';
import {
  usePurchases, usePurchaseStats, useCreatePurchase,
  useReceivePurchase, useDeletePurchase
} from '../../hooks/usePurchases.js';
import { useActiveSuppliers } from '../../hooks/useSuppliers.js';
import { useActiveProducts } from '../../hooks/useProducts.js';
import { formatCurrency, formatDate, cn } from '../../utils/helpers.js';

function PurchaseModal({ isOpen, onClose, onSubmit }) {
  const { data: suppliers } = useActiveSuppliers();
  const { data: products } = useActiveProducts();
  const [items, setItems] = useState([{ product: '', quantity: 1, purchasePrice: 0, sellingPrice: 0, tax: 0, discount: 0 }]);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  const addItem = () => setItems([...items, { product: '', quantity: 1, purchasePrice: 0, sellingPrice: 0, tax: 0, discount: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    if (field === 'product') {
      const prod = products?.find(p => p._id === value);
      if (prod) {
        newItems[idx].purchasePrice = prod.purchasePrice || 0;
        newItems[idx].sellingPrice = prod.sellingPrice || 0;
      }
    }
    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0, totalTax = 0, totalDiscount = 0;
    items.forEach(item => {
      const itemTotal = item.quantity * item.purchasePrice;
      const tax = itemTotal * (item.tax || 0) / 100;
      const discount = itemTotal * (item.discount || 0) / 100;
      subtotal += itemTotal;
      totalTax += tax;
      totalDiscount += discount;
    });
    return { subtotal, totalTax, totalDiscount, total: subtotal + totalTax - totalDiscount };
  };

  const { subtotal, totalTax, totalDiscount, total } = calculateTotals();

  const handleSubmit = () => {
    const validItems = items.filter(i => i.product && i.quantity > 0);
    if (!supplier || validItems.length === 0) return;
    onSubmit({ supplier, items: validItems, notes });
    setItems([{ product: '', quantity: 1, purchasePrice: 0, sellingPrice: 0, tax: 0, discount: 0 }]);
    setSupplier('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Purchase Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier *</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select Supplier</option>
                {suppliers?.map(s => <option key={s._id} value={s._id}>{s.name} {s.company && `(${s.company})`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Items</h3>
              <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-7 gap-2 items-end p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Product</label>
                  <select value={item.product} onChange={e => updateItem(idx, 'product', e.target.value)} className="w-full px-2 py-1.5 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm">
                    <option value="">Select</option>
                    {products?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500">Qty</label><input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} className="w-full px-2 py-1.5 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm" /></div>
                <div><label className="text-xs text-gray-500">P.Price</label><input type="number" step="0.01" value={item.purchasePrice} onChange={e => updateItem(idx, 'purchasePrice', parseFloat(e.target.value))} className="w-full px-2 py-1.5 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm" /></div>
                <div><label className="text-xs text-gray-500">S.Price</label><input type="number" step="0.01" value={item.sellingPrice} onChange={e => updateItem(idx, 'sellingPrice', parseFloat(e.target.value))} className="w-full px-2 py-1.5 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm" /></div>
                <div><label className="text-xs text-gray-500">Tax%</label><input type="number" value={item.tax} onChange={e => updateItem(idx, 'tax', parseFloat(e.target.value))} className="w-full px-2 py-1.5 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm" /></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeItem(idx)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
            <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(totalTax)}</span></div>
            <div className="flex justify-between"><span>Discount:</span><span>-{formatCurrency(totalDiscount)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>{formatCurrency(total)}</span></div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={!supplier || items.filter(i => i.product).length === 0} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Create Purchase Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchasesPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePurchases({ search, status, page, limit: 20 });
  const { data: stats } = usePurchaseStats();
  const createPurchase = useCreatePurchase();
  const receivePurchase = useReceivePurchase();
  const deletePurchase = useDeletePurchase();

  const purchases = data?.docs || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalDocs || 0;

  const handleReceive = (id) => {
    if (confirm('Receive this purchase and add stock?')) receivePurchase.mutate(id);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this purchase order?')) deletePurchase.mutate(id);
  };

  const handleCreate = (formData) => {
    createPurchase.mutate(formData, { onSuccess: () => setModalOpen(false) });
  };

  const statusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      received: 'bg-green-100 text-green-700',
      partial: 'bg-blue-100 text-blue-700',
      returned: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colors[status] || 'bg-gray-100')}>{status}</span>;
  };

  const columns = [
    { key: 'invoiceNumber', title: 'Invoice #', render: (v) => <span className="font-mono font-medium">{v}</span> },
    { key: 'supplier', title: 'Supplier', render: (v) => v?.name || '-' },
    { key: 'items', title: 'Items', render: (v) => `${v?.length || 0} items` },
    { key: 'total', title: 'Total', render: (v) => formatCurrency(v) },
    { key: 'status', title: 'Status', render: (v) => statusBadge(v) },
    { key: 'createdAt', title: 'Date', render: (v) => formatDate(v) },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions', title: 'Actions', render: (v, row) => (
        <div className="flex items-center gap-1">
          {row.status === 'pending' && (
            <button onClick={() => handleReceive(row._id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Receive"><CheckCircle className="w-4 h-4" /></button>
          )}
          <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Manage stock purchases</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4" /> New Purchase
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats?.total || 0, icon: FileText },
          { label: 'Pending', value: stats?.pending || 0, icon: Calendar, color: 'yellow' },
          { label: 'Received', value: stats?.received || 0, icon: CheckCircle, color: 'green' },
          { label: 'Total Value', value: formatCurrency(stats?.totalAmount || 0), icon: DollarSign },
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
        data={purchases}
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
          { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'received', label: 'Received' }, { value: 'returned', label: 'Returned' }] },
        ]}
        onFilterChange={(key, value) => setStatus(value)}
      />

      <PurchaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}

export default PurchasesPage;
