import axios from 'axios';

const API = axios.create({
  baseURL: 'https://lily-s-lab.onrender.com/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ll_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ll_token');
      localStorage.removeItem('ll_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => API.get(`/auth/verify-email/${token}`),
};

// Products
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  getCategoryStats: () => API.get('/products/categories/stats'),
  create: (data) => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/products/${id}`),
  deleteImage: (productId, imageId) => API.delete(`/products/${productId}/images/${imageId}`),
};

// Orders
export const ordersAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my-orders', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get('/orders/admin/all', { params }),
  updateStatus: (id, data) => API.patch(`/orders/${id}/status`, data),
  getStats: () => API.get('/orders/admin/stats'),
};



// Payments
export const paymentsAPI = {
  createRazorpayOrder: (orderId) => API.post('/payments/create-order', { orderId }),
  verifyPayment: (data) => API.post('/payments/verify', data),
  getKey: () => API.get('/payments/razorpay-key'),
};

// Reviews
export const reviewsAPI = {
  create: (productId, data) => API.post(`/reviews/${productId}`, data),
  getProductReviews: (productId, params) => API.get(`/reviews/${productId}`, { params }),
  delete: (id) => API.delete(`/reviews/${id}`),
};

// Users
export const usersAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  addAddress: (data) => API.post('/users/addresses', data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
  changePassword: (data) => API.put('/users/change-password', data),
};

// Wishlist
export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  toggle: (productId) => API.post(`/wishlist/${productId}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getCustomers: (params) => API.get('/admin/customers', { params }),
  toggleUserStatus: (id) => API.patch(`/admin/customers/${id}/toggle`),
  getInventory: () => API.get('/admin/inventory'),
  updateStock: (id, stock) => API.patch(`/admin/inventory/${id}`, { stock }),
};

export default API;