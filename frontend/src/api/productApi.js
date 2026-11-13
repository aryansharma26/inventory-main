import apiClient from './client.js';

export const productApi = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === 'image' && data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === 'image' && data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return apiClient.patch(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => apiClient.delete(`/products/${id}`),
  bulkDelete: (ids) => apiClient.post('/products/bulk-delete', { ids }),
  duplicate: (id) => apiClient.post(`/products/${id}/duplicate`),
  getStats: () => apiClient.get('/products/stats'),
  getLowStock: () => apiClient.get('/products/low-stock'),
};

export const categoryApi = {
  getAll: (params) => apiClient.get('/categories', { params }),
  getActive: () => apiClient.get('/categories/active'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.patch(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

export const brandApi = {
  getAll: (params) => apiClient.get('/brands', { params }),
  getActive: () => apiClient.get('/brands/active'),
  getById: (id) => apiClient.get(`/brands/${id}`),
  create: (data) => apiClient.post('/brands', data),
  update: (id, data) => apiClient.patch(`/brands/${id}`, data),
  delete: (id) => apiClient.delete(`/brands/${id}`),
};

export default { productApi, categoryApi, brandApi };
