import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Attach JWT token to every request ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('produx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Global error handler ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('produx_token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { error: 'Network error. Please try again.' });
  }
);

// ── Auth ──
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Employees ──
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getOne: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  remove: (id) => api.delete(`/employees/${id}`),
  getCredentials: (id) => api.get(`/employees/${id}/credentials`),
  resetPassword: (id) => api.post(`/employees/${id}/reset-password`),
};

// ── Tasks ──
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
  startTimer: (id) => api.post(`/tasks/${id}/timer/start`),
  stopTimer: (id) => api.post(`/tasks/${id}/timer/stop`),
  markDone: (id) => api.post(`/tasks/${id}/done`),
};

// ── Analytics ──
export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getDepartments: () => api.get('/analytics/departments'),
  getTopPerformers: () => api.get('/analytics/top-performers'),
};

export default api;
