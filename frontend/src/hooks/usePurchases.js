import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchaseApi, inventoryApi } from '../api/purchaseInventoryApi.js';

// ===== Purchase Hooks =====
export const usePurchases = (params) => {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchaseApi.getAll(params).then(res => res.data.data),
  });
};

export const usePurchaseStats = () => {
  return useQuery({
    queryKey: ['purchaseStats'],
    queryFn: () => purchaseApi.getStats().then(res => res.data.data),
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseStats'] });
      toast.success('Purchase order created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create purchase'),
  });
};

export const useReceivePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseApi.receive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseStats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Stock received successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to receive purchase'),
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseStats'] });
      toast.success('Purchase deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete purchase'),
  });
};

// ===== Inventory Hooks =====
export const useInventory = (params) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryApi.getAll(params).then(res => res.data.data),
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['inventoryStats'],
    queryFn: () => inventoryApi.getStats().then(res => res.data.data),
  });
};

export const useStockHistory = (params) => {
  return useQuery({
    queryKey: ['stockHistory', params],
    queryFn: () => inventoryApi.getHistory(params).then(res => res.data.data),
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      toast.success('Stock adjusted successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to adjust stock'),
  });
};
