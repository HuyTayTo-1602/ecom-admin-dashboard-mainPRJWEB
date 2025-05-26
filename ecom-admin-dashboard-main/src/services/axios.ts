import axios from 'axios';
import { applyCsrfInterceptor, getCsrfToken } from './csrf';
import { applyTokenRefreshInterceptor } from './tokenRefreshInterceptor';

const API_URL = import.meta.env.VITE_API_URL

// Pre-fetch the CSRF token when the app loads
getCsrfToken();

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Apply CSRF protection
applyCsrfInterceptor(axiosInstance);

// Apply token refresh interceptor
applyTokenRefreshInterceptor(axiosInstance);

export default axiosInstance;