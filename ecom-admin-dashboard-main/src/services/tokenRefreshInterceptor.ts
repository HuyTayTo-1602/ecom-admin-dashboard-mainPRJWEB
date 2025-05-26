import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { refreshAccessToken as refreshToken } from '../services/authService';

// Define interface for extended request config with retry flag
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Type for the refresh token response
interface RefreshTokenResponse {
  accessToken: string;
  [key: string]: unknown;
}

// Flag to track if a refresh is in progress
let isRefreshing = false;

// Queue of requests waiting for token refresh
type RefreshSubscriber = (token: string) => void;
let refreshSubscribers: RefreshSubscriber[] = [];

// Function to process queue of waiting requests
const processQueue = (token: string): void => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Apply the token refresh interceptor to an axios instance
export const applyTokenRefreshInterceptor = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response, 
    (error: AxiosError): Promise<AxiosResponse> => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;
      
      // If the error is 401 with "Token expired" message and request hasn't been retried yet
      if (
        error.response?.status === 401 && 
        error.response.data && 
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        error.response.data.message === "Token expired" && 
        !originalRequest._retry
      ) {
        // Mark this request as retried to avoid infinite loops
        originalRequest._retry = true;
        
        // If a refresh is not currently in progress
        if (!isRefreshing) {
          isRefreshing = true;
          
          // Call token refresh endpoint
          return refreshToken()
            .then((response: RefreshTokenResponse) => {
              if (response && response.accessToken) {
                const newToken = response.accessToken;
                
                // Update the original request Authorization header
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                } else {
                  originalRequest.headers = {
                    'Authorization': `Bearer ${newToken}`
                  };
                }
                
                // Process all waiting requests
                processQueue(newToken);
                
                // Retry the original request
                return axios(originalRequest);
              } else {
                // If refresh failed, reject all waiting requests
                refreshSubscribers.forEach(callback => callback(''));
                refreshSubscribers = [];
                
                // Force logout or redirect to login here if needed
                window.location.href = '/login'; // Or dispatch a logout action
                return Promise.reject(error);
              }
            })
            .catch((refreshError: Error) => {
              // If refresh failed, reject all waiting requests
              refreshSubscribers.forEach(callback => callback(''));
              refreshSubscribers = [];
              
              // Force logout or redirect to login
              window.location.href = '/login'; // Or dispatch a logout action
              return Promise.reject(refreshError);
            })
            .finally(() => {
              isRefreshing = false;
            });
        } else {
          // If a refresh is already in progress, add this request to the queue
          return new Promise<AxiosResponse>((resolve, reject) => {
            refreshSubscribers.push((token: string) => {
              if (token) {
                // Update Authorization header with new token
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                } else {
                  originalRequest.headers = {
                    'Authorization': `Bearer ${token}`
                  };
                }
                // Retry the request with new token
                axios(originalRequest)
                  .then(response => resolve(response))
                  .catch(err => reject(err));
              } else {
                // If token refresh failed, reject the promise
                reject(error);
              }
            });
          });
        }
      }
      
      // If not a token expiration error, just reject as normal
      return Promise.reject(error);
    }
  );
};