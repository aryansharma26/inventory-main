import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, X, Truck, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DataTable from '../../components/DataTable.jsx';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../../hooks/useSuppliers.js';
import { formatCurrency, formatDate } from '../../utils/helpers.js';
import { createSupplierSchema } from '../../utils/validationSchemas.js';

function SupplierModal({ isOpen, onClose, supplier, onSubmit }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: supplier || { name: '', company: '', phone: '', email: '', gstNumber: '', address: { street: '', city: '', state: '', zipCode: '' } }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    if (!supplier) { reset(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input {...register('name')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input {...register('company')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input {...register('phone')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">GST/VAT Number</label>
              <input {...register('gstNumber')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input {...register('address.street')} placeholder="Street" className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-2" />
              <div className="grid grid-cols-3 gap-2">
                <input {...register('address.city')} placeholder="City" className="px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                <input {...register('address.state')} placeholder="State" className="px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                <input {...register('address.zipCode')} placeholder="Zip" className="px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {supplier ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuppliersPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSuppliers({ search, page, limit: 20 });
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const suppliers = data?.docs || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalDocs || 0;

  const handleDelete = (id) => {
    if (confirm('Delete this supplier?')) deleteSupplier.mutate(id);
  };

  const handleSubmit = (formData) => {
    if (editingSupplier) {
      updateSupplier.mutate({ id: editingSupplier._id, data: formData }, { onSuccess: () => { setModalOpen(false); setEditingSupplier(null); } });
    } else {
      createSupplier.mutate(formData, { onSuccess: () => { setModalOpen(false); setEditingSupplier(null); } });
    }
  };

  const columns = [
    { key: 'name', title: 'Name', sortable: true, render: (v, row) => (
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary-600" />
        <div>
          <p className="font-medium">{v}</p>
          {row.company && <p className="text-xs text-gray-500">{row.company}</p>}
        </div>
      </div>
    )},
    { key: 'phone', title: 'Contact', render: (v, row) => (
      <div className="text-sm">
        <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {v}</div>
        {row.email && <div className="flex items-center gap-1 text-gray-500"><Mail className="w-3 h-3" /> {row.email}</div>}
      </div>
    )},
    { key: 'address', title: 'Address', render: (v) => v?.city ? `${v.city}, ${v.state || ''}` : '-' },
    { key: 'totalPurchases', title: 'Total Purchases', render: (v) => formatCurrency(v || 0) },
    { key: 'pendingAmount', title: 'Pending', render: (v) => (
      <span className={v > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{formatCurrency(v || 0)}</span>
    )},
    { key: 'isActive', title: 'Status', render: (v) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{v ? 'Active' : 'Inactive'}</span>
    )},
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions', title: 'Actions', render: (v, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditingSupplier(row); setModalOpen(true); }} className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
          <p className="text-gray-500 mt-1">Manage your suppliers</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingSupplier(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        )}
      </div>
      <DataTable
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search suppliers..."
        onSearch={setSearch}
        sortable
        pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={20}
        onPageChange={setPage}
      />
      <SupplierModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSupplier(null); }}
        supplier={editingSupplier}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default SuppliersPage;
