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

// Deliverer
export const getProfile = () => api.get('/deliverer/profile');
export const createMoto = (data) => api.post('/deliverer/moto', data);
export const updateMoto = (data) => api.put('/deliverer/moto', data);
export const updateStatus = (status) => api.post('/deliverer/status', { status });
export const updateLocation = (latitude, longitude) => api.post('/deliverer/location', { latitude, longitude });
export const getAvailableRequests = () => api.get('/deliverer/available-requests');
export const acceptRequest = (id) => api.post(`/deliverer/requests/${id}/accept`);
export const getCurrentDelivery = () => api.get('/deliverer/deliveries/current');
export const checkinDelivery = (id, code) => api.post(`/deliverer/deliveries/${id}/checkin`, { checkin_code: code });
export const completeDelivery = (id, code) => api.post(`/deliverer/deliveries/${id}/complete`, { checkout_code: code });
export const cancelDelivery = (id) => api.post(`/deliverer/deliveries/${id}/cancel`);

export default api;
