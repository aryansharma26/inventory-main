import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi, categoryApi, brandApi } from '../api/productApi.js';

// ===== Product Hooks =====
export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getAll(params).then(res => res.data.data),
  });
};

export const useProductStats = () => {
  return useQuery({
    queryKey: ['productStats'],
    queryFn: () => productApi.getStats().then(res => res.data.data),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
      toast.success('Product created successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product'),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product'),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
      toast.success('Product deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete product'),
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
      toast.success('Products deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete products'),
  });
};

// ===== Category Hooks =====
export const useCategories = (params) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getAll(params).then(res => res.data.data),
  });
};

export const useActiveCategories = () => {
  return useQuery({
    queryKey: ['activeCategories'],
    queryFn: () => categoryApi.getActive().then(res => res.data.data),
  });
};

export const useActiveProducts = () => {
  return useQuery({
    queryKey: ['activeProducts'],
    queryFn: () => productApi.getAll({ status: 'active', limit: 1000 }).then(res => res.data.data),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['activeCategories'] });
      toast.success('Category created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create category'),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['activeCategories'] });
      toast.success('Category updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update category'),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['activeCategories'] });
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete category'),
  });
};

// ===== Brand Hooks =====
export const useBrands = (params) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandApi.getAll(params).then(res => res.data.data),
  });
};

export const useActiveBrands = () => {
  return useQuery({
    queryKey: ['activeBrands'],
    queryFn: () => brandApi.getActive().then(res => res.data.data),
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['activeBrands'] });
      toast.success('Brand created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create brand'),
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => brandApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['activeBrands'] });
      toast.success('Brand updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update brand'),
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['activeBrands'] });
      toast.success('Brand deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete brand'),
  });
};
