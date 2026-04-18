import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        if (tokens?.refresh) {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh,
          });
          const newTokens = { ...tokens, access: res.data.access };
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          api.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (data) => api.post('/auth/signup/', data),
  verifyOtp: (data) => api.post('/auth/verify-otp/', data),
  resendOtp: (data) => api.post('/auth/resend-otp/', data),
  login: (data) => api.post('/auth/login/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  forgotPasswordVerifyOtp: (data) => api.post('/auth/forgot-password-verify-otp/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  googleAuth: (token) => api.post('/auth/google/', { token }),
};

export const expenseService = {
  getExpenses: () => api.get('/expenses/'),
  createExpense: (data) => api.post('/expenses/', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}/`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}/`),
  getDashboardSummary: () => api.get('/dashboard-summary/'),
  getCategories: () => api.get('/categories/'),
};

export default api;
