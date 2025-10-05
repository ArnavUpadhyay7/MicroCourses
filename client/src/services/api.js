import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.mode == 'development' ? 'http://localhost:5000/api' : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
}); 

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
