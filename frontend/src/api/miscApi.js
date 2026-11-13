import apiClient from './client.js';

export const expenseApi = {
  getAll: (params) => apiClient.get('/expenses', { params }),
  getStats: () => apiClient.get('/expenses/stats'),
  create: (data) => apiClient.post('/expenses', data),
  update: (id, data) => apiClient.patch(`/expenses/${id}`, data),
  delete: (id) => apiClient.delete(`/expenses/${id}`),
};

export const notificationApi = {
  getAll: () => apiClient.get('/notifications'),
};

export const settingsApi = {
  get: () => apiClient.get('/settings'),
  update: (data) => apiClient.patch('/settings', data),
};

export default { expenseApi, notificationApi, settingsApi };
