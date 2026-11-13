import apiClient from './client.js';

export const saleApi = {
  getAll: (params) => apiClient.get('/sales', { params }),
  getById: (id) => apiClient.get(`/sales/${id}`),
  create: (data) => apiClient.post('/sales', data),
  refund: (id, data) => apiClient.post(`/sales/${id}/refund`, data),
  delete: (id) => apiClient.delete(`/sales/${id}`),
  getStats: () => apiClient.get('/sales/stats'),
};

export default saleApi;
