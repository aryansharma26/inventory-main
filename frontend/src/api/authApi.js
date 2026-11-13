import apiClient from './client.js';

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (token) => apiClient.post('/auth/refresh-token', { refreshToken: token }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.patch('/auth/profile', data),
  getAllUsers: () => apiClient.get('/auth/all'),
  toggleUserStatus: (id) => apiClient.patch(`/auth/${id}/toggle-status`),
};

export default authApi;
