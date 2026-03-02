import axios from 'axios'

const API_URL = 'http://localhost:8000/api/v1'

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const api = {
  // Auth
  login: (email, password) => instance.post('/auth/login', { email, password }),
  logout: () => instance.post('/auth/logout'),
  getProfile: () => instance.get('/auth/me'),

  // Root endpoints
  getStats: () => instance.get('/root/stats'),
  getUsers: (page = 1) => instance.get(`/root/users?page=${page}`),
  getDeliveries: (page = 1) => instance.get(`/root/deliveries?page=${page}`),
  getLogs: (page = 1) => instance.get(`/root/logs?page=${page}`),
  getStatusHistory: (page = 1) => instance.get(`/root/status-history?page=${page}`),
}

export default api
