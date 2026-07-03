import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const adminClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token
adminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized globally
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth local storage
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('employeeId');
      
      // Dispatch authorization event to redirect to sign in
      window.dispatchEvent(new Event('auth-unauthorized'));
      
      return Promise.reject(new Error('Your session has expired. Please sign in again.'));
    }
    
    // Normalize backend validation/error messages
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
