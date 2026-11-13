import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, X, Tag, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DataTable from '../../components/DataTable.jsx';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useProducts.js';
import { formatDate } from '../../utils/helpers.js';
import { createCategorySchema } from '../../utils/validationSchemas.js';

function CategoryModal({ isOpen, onClose, category, onSubmit }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: category || { name: '', description: '' }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    if (!category) { reset(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">{category ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input {...register('name')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoriesPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCategories({ search, page, limit: 20 });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data?.docs || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalDocs || 0;

  const handleDelete = (id) => {
    if (confirm('Delete this category?')) deleteCategory.mutate(id);
  };

  const handleSubmit = (formData) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory._id, data: formData }, { onSuccess: () => { setModalOpen(false); setEditingCategory(null); } });
    } else {
      createCategory.mutate(formData, { onSuccess: () => { setModalOpen(false); setEditingCategory(null); } });
    }
  };

  const columns = [
    { key: 'name', title: 'Name', sortable: true, render: (v) => (
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary-600" />
        <span className="font-medium">{v}</span>
      </div>
    )},
    { key: 'description', title: 'Description', render: (v) => v || '-' },
    { key: 'isActive', title: 'Status', render: (v) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {v ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'createdAt', title: 'Created', render: (v) => formatDate(v) },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions', title: 'Actions', render: (v, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditingCategory(row); setModalOpen(true); }} className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500 mt-1">Organize your products</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingCategory(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      <DataTable
        data={categories}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search categories..."
        onSearch={setSearch}
        sortable
        pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={20}
        onPageChange={setPage}
      />

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCategory(null); }}
        category={editingCategory}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default CategoriesPage;
