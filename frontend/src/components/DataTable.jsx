import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { cn } from '../utils/helpers.js';

function DataTable({
  data,
  columns,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  filters = [],
  onFilterChange,
  sortable = true,
  sortColumn,
  sortDirection,
  onSort,
  selectable = false,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  pagination = true,
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  emptyMessage = 'No data found',
  actions,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      const timeout = setTimeout(() => onSearch(value), 300);
      return () => clearTimeout(timeout);
    }
  };

  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;
    if (onSort) {
      const newDirection =
        sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column.key, newDirection);
    }
  };

  const renderSortIcon = (column) => {
    if (!sortable || !column.sortable) return null;
    if (sortColumn !== column.key) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary-600" />
    );
  };

  const allSelected = data?.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
        {searchable && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
              showFilters
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Filters panel */}
      {showFilters && filters.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {filter.label}
              </label>
              <select
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400',
                    sortable && column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600'
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row._id || index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row._id)}
                        onChange={(e) => onSelectRow?.(row._id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            Showing {data?.length || 0} of {totalItems || 0} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-3 py-1 bg-primary-50 text-primary-600 rounded-lg font-medium">
              {page}
            </span>
            <span className="text-sm text-gray-500">of {totalPages}</span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
          {onLimitChange && (
            <select
              value={limit}
              onChange={(e) => onLimitChange?.(parseInt(e.target.value))}
              className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
