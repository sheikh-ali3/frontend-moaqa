import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://backend-moaqa-production.up.railway.app'
    : '/',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient; 