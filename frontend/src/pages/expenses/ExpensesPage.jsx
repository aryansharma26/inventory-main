import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, X, DollarSign, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useExpenses, useExpenseStats, useCreateExpense, useDeleteExpense } from '../../hooks/useMisc.js';
import { formatCurrency, formatDate } from '../../utils/helpers.js';
import DataTable from '../../components/DataTable.jsx';

const expenseCategories = [
  { value: 'rent', label: 'Rent', color: 'blue' },
  { value: 'electricity', label: 'Electricity', color: 'yellow' },
  { value: 'salary', label: 'Salary', color: 'green' },
  { value: 'internet', label: 'Internet', color: 'purple' },
  { value: 'transport', label: 'Transport', color: 'orange' },
  { value: 'miscellaneous', label: 'Miscellaneous', color: 'gray' },
];

function ExpenseModal({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm({
    defaultValues: { category: 'rent', amount: 0, description: '', date: new Date().toISOString().split('T')[0] }
  });

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, amount: parseFloat(data.amount) });
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select {...register('category')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
              {expenseCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input type="number" step="0.01" {...register('amount')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" {...register('date')} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpensesPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useExpenses({ search, category, page, limit: 20 });
  const { data: stats } = useExpenseStats();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const expenses = data?.docs || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalDocs || 0;

  const handleDelete = (id) => {
    if (confirm('Delete this expense?')) deleteExpense.mutate(id);
  };

  const handleSubmit = (formData) => {
    createExpense.mutate(formData, { onSuccess: () => setModalOpen(false) });
  };

  const categoryColors = {
    rent: 'bg-blue-100 text-blue-700',
    electricity: 'bg-yellow-100 text-yellow-700',
    salary: 'bg-green-100 text-green-700',
    internet: 'bg-purple-100 text-purple-700',
    transport: 'bg-orange-100 text-orange-700',
    miscellaneous: 'bg-gray-100 text-gray-700',
  };

  const columns = [
    { key: 'category', title: 'Category', render: (v) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${categoryColors[v] || 'bg-gray-100'}`}>{v}</span>
    )},
    { key: 'description', title: 'Description', render: (v) => v || '-' },
    { key: 'amount', title: 'Amount', render: (v) => formatCurrency(v) },
    { key: 'date', title: 'Date', render: (v) => formatDate(v) },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions', title: 'Actions', render: (v, row) => (
        <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
      )
    });
  }

  const categoryData = stats?.monthly || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-500 mt-1">Track your business expenses</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.daily || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.total || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold mb-3">By Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryData.map(item => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm capitalize">{item._id}</span>
                <span className="font-bold">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable
        data={expenses}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search expenses..."
        onSearch={setSearch}
        sortable
        pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={20}
        onPageChange={setPage}
        filters={[
          { key: 'category', label: 'Category', options: expenseCategories.map(c => ({ value: c.value, label: c.label })) },
        ]}
        onFilterChange={(key, value) => setCategory(value)}
      />

      <ExpenseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}

export default ExpensesPage;
