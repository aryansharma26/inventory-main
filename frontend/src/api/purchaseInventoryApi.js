import apiClient from './client.js';

export const purchaseApi = {
  getAll: (params) => apiClient.get('/purchases', { params }),
  getById: (id) => apiClient.get(`/purchases/${id}`),
  create: (data) => apiClient.post('/purchases', data),
  receive: (id) => apiClient.post(`/purchases/${id}/receive`),
  return: (id, data) => apiClient.post(`/purchases/${id}/return`, data),
  delete: (id) => apiClient.delete(`/purchases/${id}`),
  getStats: () => apiClient.get('/purchases/stats'),
};

export const inventoryApi = {
  getAll: (params) => apiClient.get('/inventory', { params }),
  adjustStock: (data) => apiClient.post('/inventory', data),
  getHistory: (params) => apiClient.get('/inventory/history', { params }),
  getStats: () => apiClient.get('/inventory/stats'),
};

export default { purchaseApi, inventoryApi };
