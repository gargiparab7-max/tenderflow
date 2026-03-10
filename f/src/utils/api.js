import axios from 'axios';
import { clearAuthData } from './auth';

// Default to /api for production or environment variable if set
export const API_URL = process.env.REACT_APP_API_URL || '/api';

const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token
apiInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 responses
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired; clear local auth
      clearAuthData();
      // Dispatch custom event to trigger logout in useAuth hook
      window.dispatchEvent(new Event('authExpired'));
    }
    return Promise.reject(error);
  }
);

export const api = {
  post: async (url, data, config = {}) => {
    try {
      return await apiInstance.post(url, data, config);
    } catch (error) {
      throw error;
    }
  },
  get: async (url, config) => {
    try {
      return await apiInstance.get(url, config);
    } catch (error) {
      throw error;
    }
  },
  put: async (url, data, config = {}) => {
    try {
      return await apiInstance.put(url, data, config);
    } catch (error) {
      throw error;
    }
  },
  delete: async (url, config = {}) => {
    try {
      return await apiInstance.delete(url, config);
    } catch (error) {
      throw error;
    }
  }
};
