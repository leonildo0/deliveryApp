import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Client requests
export const getRequests = () => api.get('/client/requests');
export const createRequest = (data) => api.post('/client/requests', data);
export const getRequest = (id) => api.get(`/client/requests/${id}`);
export const cancelRequest = (id) => api.post(`/client/requests/${id}/cancel`);
export const shareRequest = (id) => api.post(`/client/requests/${id}/share`);
export const getTracking = (id) => api.get(`/client/requests/${id}/tracking`);

export default api;
