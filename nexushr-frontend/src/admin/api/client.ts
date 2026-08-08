import axios from 'axios';
import { BASE_URL, clearAuthSession } from '../../api/client';

export const adminClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor to handle 401 Unauthorized globally
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthSession();
      return Promise.reject(new Error('Your session has expired. Please sign in again.'));
    }
    
    // Normalize backend validation/error messages
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
