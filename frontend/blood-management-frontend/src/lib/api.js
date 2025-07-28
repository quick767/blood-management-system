import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getDonors: (params) => api.get('/users/donors', { params }),
  getDashboard: (id) => api.get(`/users/${id}/dashboard`),
  getUserStats: () => api.get('/users/stats/overview'),
};

// Donations API
export const donationsAPI = {
  create: (donationData) => api.post('/donations', donationData),
  createDonation: (donationData) => api.post('/donations', donationData),
  getDonations: (params) => api.get('/donations', { params }),
  getDonation: (id) => api.get(`/donations/${id}`),
  getByDonor: (donorId, params) => api.get(`/donations/donor/${donorId}?${params}`),
  updateDonation: (id, donationData) => api.put(`/donations/${id}`, donationData),
  deleteDonation: (id) => api.delete(`/donations/${id}`),
  approveDonation: (id) => api.post(`/donations/${id}/approve`),
  getDonationStats: () => api.get('/donations/stats/overview'),
  getPendingCount: () => api.get('/donations/pending/count'),
};

// Blood Requests API
export const requestsAPI = {
  create: (requestData) => api.post('/requests', requestData),
  createRequest: (requestData) => api.post('/requests', requestData),
  getRequests: (params) => api.get('/requests', { params }),
  getRequest: (id) => api.get(`/requests/${id}`),
  getByRequester: (requesterId, params) => api.get(`/requests/requester/${requesterId}?${params}`),
  updateRequest: (id, requestData) => api.put(`/requests/${id}`, requestData),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  fulfillRequest: (id, fulfillmentData) => api.post(`/requests/${id}/fulfill`, fulfillmentData),
  getRequestStats: () => api.get('/requests/stats/overview'),
  getPendingCount: () => api.get('/requests/pending/count'),
};

// Blood Stock API
export const stockAPI = {
  getStock: (params) => api.get('/stock', { params }),
  getStockByBloodGroup: (bloodGroup, params) => api.get(`/stock/${bloodGroup}`, { params }),
  updateStock: (bloodGroup, stockData) => api.put(`/stock/${bloodGroup}`, stockData),
  removeExpiredUnits: (bloodGroup, data) => api.post(`/stock/${bloodGroup}/remove-expired`, data),
  getActiveAlerts: () => api.get('/stock/alerts/active'),
  acknowledgeAlert: (alertId) => api.post(`/stock/alerts/${alertId}/acknowledge`),
  sendLowStockAlerts: () => api.post('/stock/send-low-stock-alerts'),
  getStockStats: () => api.get('/stock/stats/overview'),
  initializeStock: () => api.post('/stock/initialize'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getSummaryReport: (params) => api.get('/admin/reports/summary', { params }),
  getSystemHealth: () => api.get('/admin/system/health'),
};

export default api;

