import { useQuery } from '@tanstack/react-query';
import dashboardApi from '../api/dashboardApi.js';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardApi.getStats().then(res => res.data.data),
  });
};

export default useDashboardStats;
