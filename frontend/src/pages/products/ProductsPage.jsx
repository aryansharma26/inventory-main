import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Plus, Pencil, Trash2, Copy, Image as ImageIcon, X,
  Package, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DataTable from '../../components/DataTable.jsx';
import {
  useProducts, useProductStats, useCreateProduct,
  useUpdateProduct, useDeleteProduct, useBulkDeleteProducts
} from '../../hooks/useProducts.js';
import { useActiveCategories } from '../../hooks/useProducts.js';
import { useActiveBrands } from '../../hooks/useProducts.js';
import { formatCurrency, formatDate, cn } from '../../utils/helpers.js';
import { createProductSchema } from '../../utils/validationSchemas.js';

function ProductModal({ isOpen, onClose, product, onSubmit }) {
  const { data: categories } = useActiveCategories();
  const { data: brands } = useActiveBrands();
  const [imagePreview, setImagePreview] = useState(product?.image?.url || null);

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, reset
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: product || {
      name: '', sku: '', barcode: '', category: '', brand: '', unit: 'piece',
      purchasePrice: 0, sellingPrice: 0, mrp: 0, tax: 0, discount: 0,
      quantity: 0, minStockAlert: 10, description: '', status: 'active'
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = (data) => {
    const formData = { ...data };
    if (imagePreview && imagePreview.startsWith('blob:')) {
      const fileInput = document.getElementById('productImage');
      if (fileInput?.files[0]) formData.image = fileInput.files[0];
    }
    onSubmit(formData);
    if (!product) { reset(); setImagePreview(null); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input id="productImage" type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input {...register('name')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU (Auto-generated if empty)</label>
              <input {...register('sku')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select {...register('category')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select Category</option>
                {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select {...register('brand')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select Brand</option>
                {brands?.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select {...register('unit')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                {['piece','kg','g','l','ml','box','pack','set','pair','meter','foot'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <input {...register('barcode')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Purchase Price *</label>
              <input type="number" step="0.01" {...register('purchasePrice', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
              {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Selling Price *</label>
              <input type="number" step="0.01" {...register('sellingPrice', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
              {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">MRP</label>
              <input type="number" step="0.01" {...register('mrp', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tax (%)</label>
              <input type="number" step="0.01" {...register('tax', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input type="number" {...register('quantity', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min Stock Alert</label>
              <input type="number" {...register('minStockAlert', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {product ? 'Update' : 'Create'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductsPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', brand: '', status: '', stockStatus: '' });
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useProducts({
    search, ...filters, sortBy: sortColumn, sortOrder: sortDirection, page, limit
  });
  const { data: stats } = useProductStats();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProducts();

  const products = data?.docs || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalDocs || 0;

  const handleSort = useCallback((col, dir) => { setSortColumn(col); setSortDirection(dir); }, []);
  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? products.map(p => p._id) : []);
  };
  const handleSelectRow = (id, checked) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} products?`)) {
      bulkDelete.mutate(selectedIds, { onSuccess: () => setSelectedIds([]) });
    }
  };

  const handleSubmit = (formData) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct._id, data: formData }, { onSuccess: () => { setModalOpen(false); setEditingProduct(null); } });
    } else {
      createProduct.mutate(formData, { onSuccess: () => { setModalOpen(false); setEditingProduct(null); } });
    }
  };

  const stockStatusBadge = (product) => {
    if (product.quantity === 0) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>;
    if (product.quantity <= product.minStockAlert) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Low Stock</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>;
  };

  const columns = [
    { key: 'name', title: 'Product', sortable: true, render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {row.image?.url ? <img src={row.image.url} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" />}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{v}</p>
          <p className="text-xs text-gray-500">{row.sku}</p>
        </div>
      </div>
    )},
    { key: 'category', title: 'Category', render: (v) => v?.name || '-' },
    { key: 'brand', title: 'Brand', render: (v) => v?.name || '-' },
    { key: 'sellingPrice', title: 'Price', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'quantity', title: 'Stock', sortable: true, render: (v, row) => (
      <div className="flex items-center gap-2">
        {v} {stockStatusBadge(row)}
      </div>
    )},
    { key: 'status', title: 'Status', render: (v) => (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium',
        v === 'active' ? 'bg-green-100 text-green-700' : v === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
      )}>{v}</span>
    )},
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions', title: 'Actions', render: (v, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditingProduct(row); setModalOpen(true); }} className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingProduct(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats?.total || 0, icon: Package, color: 'blue' },
          { label: 'Active', value: stats?.active || 0, icon: CheckCircle, color: 'green' },
          { label: 'Low Stock', value: stats?.lowStock || 0, icon: AlertTriangle, color: 'yellow' },
          { label: 'Out of Stock', value: stats?.outOfStock || 0, icon: AlertTriangle, color: 'red' },
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">{selectedIds.length} selected</span>
          <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}

      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search by name, SKU, or barcode..."
        onSearch={setSearch}
        sortable
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectable={isAdmin}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        filters={[
          { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'discontinued', label: 'Discontinued' }] },
          { key: 'stockStatus', label: 'Stock', options: [{ value: 'in-stock', label: 'In Stock' }, { value: 'low-stock', label: 'Low Stock' }, { value: 'out-of-stock', label: 'Out of Stock' }] },
        ]}
        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
      />

      <ProductModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ProductsPage;
