import apiClient from './client.js';

export const supplierApi = {
  getAll: (params) => apiClient.get('/suppliers', { params }),
  getActive: () => apiClient.get('/suppliers/active'),
  getById: (id) => apiClient.get(`/suppliers/${id}`),
  create: (data) => apiClient.post('/suppliers', data),
  update: (id, data) => apiClient.patch(`/suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/suppliers/${id}`),
};

export const customerApi = {
  getAll: (params) => apiClient.get('/customers', { params }),
  getActive: () => apiClient.get('/customers/active'),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.patch(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
};

export default { supplierApi, customerApi };
