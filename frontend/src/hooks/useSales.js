import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import saleApi from '../api/saleApi.js';

export const useSales = (params) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleApi.getAll(params).then(res => res.data.data),
  });
};

export const useSaleStats = () => {
  return useQuery({
    queryKey: ['saleStats'],
    queryFn: () => saleApi.getStats().then(res => res.data.data),
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['saleStats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Sale completed successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to complete sale'),
  });
};

export const useRefundSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => saleApi.refund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['saleStats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Sale refunded successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to refund sale'),
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['saleStats'] });
      toast.success('Sale deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete sale'),
  });
};
