import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supplierApi, customerApi } from '../api/supplierCustomerApi.js';

// ===== Supplier Hooks =====
export const useSuppliers = (params) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierApi.getAll(params).then(res => res.data.data),
  });
};

export const useActiveSuppliers = () => {
  return useQuery({
    queryKey: ['activeSuppliers'],
    queryFn: () => supplierApi.getActive().then(res => res.data.data),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['activeSuppliers'] });
      toast.success('Supplier created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create supplier'),
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => supplierApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['activeSuppliers'] });
      toast.success('Supplier updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update supplier'),
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['activeSuppliers'] });
      toast.success('Supplier deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete supplier'),
  });
};

// ===== Customer Hooks =====
export const useCustomers = (params) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.getAll(params).then(res => res.data.data),
  });
};

export const useActiveCustomers = () => {
  return useQuery({
    queryKey: ['activeCustomers'],
    queryFn: () => customerApi.getActive().then(res => res.data.data),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['activeCustomers'] });
      toast.success('Customer created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create customer'),
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['activeCustomers'] });
      toast.success('Customer updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update customer'),
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['activeCustomers'] });
      toast.success('Customer deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete customer'),
  });
};
