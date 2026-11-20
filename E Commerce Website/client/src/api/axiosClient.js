import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into authorization header
axiosClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Error parsing userInfo from localStorage', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
