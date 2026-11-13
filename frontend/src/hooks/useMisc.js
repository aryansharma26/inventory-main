import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { expenseApi, notificationApi, settingsApi } from '../api/miscApi.js';

export const useExpenses = (params) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseApi.getAll(params).then(res => res.data.data),
  });
};

export const useExpenseStats = () => {
  return useQuery({
    queryKey: ['expenseStats'],
    queryFn: () => expenseApi.getStats().then(res => res.data.data),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats'] });
      toast.success('Expense recorded');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record expense'),
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats'] });
      toast.success('Expense deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete expense'),
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then(res => res.data.data),
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then(res => res.data.data),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update settings'),
  });
};
