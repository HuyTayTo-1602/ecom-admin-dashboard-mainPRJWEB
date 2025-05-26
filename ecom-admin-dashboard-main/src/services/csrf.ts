import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

// Configuration constants - export for reuse
export const CSRF_COOKIE_NAME = 'csrf-token';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Token cache management
let csrfToken: string | null = null;
let lastFetchTime = 0;
let fetchPromise: Promise<string | null> | null = null;
let fetchLock = false;
const TOKEN_LIFETIME = 25 * 60 * 1000; // 25 minutes
const MIN_FETCH_INTERVAL = 1000; // 1 second minimum between fetch attempts

// Create an instance that doesn't use the interceptors to avoid circular dependency
const tokenClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for cookies
});

/**
 * Get the CSRF token, fetching a new one only if necessary
 * @param forceRefresh Force fetching a new token even if one exists
 * @returns Promise resolving to the CSRF token or null if unavailable
 */
export async function getCsrfToken(forceRefresh = false): Promise<string | null> {
  const now = Date.now();
  
  // If we're already fetching a token, return that promise to prevent duplicate requests
  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }

  // Check for token in cookie first (most secure approach)
  const cookieToken = Cookies.get(CSRF_COOKIE_NAME);
  if (cookieToken && !forceRefresh) {
    csrfToken = cookieToken;
    lastFetchTime = now;
    return cookieToken;
  }

  // Use cached token if it exists and isn't expired
  if (!forceRefresh && csrfToken && (now - lastFetchTime) < TOKEN_LIFETIME) {
    return csrfToken;
  }
  
  // Implement locking to prevent concurrent fetches
  if (fetchLock) {
    // Another fetch is in progress, wait for a small delay and check again
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
    return getCsrfToken(forceRefresh); // Recursive call with the same parameters
  }

  // Implement rate limiting to prevent server overload
  if (!forceRefresh && (now - lastFetchTime) < MIN_FETCH_INTERVAL) {
    console.debug('[CSRF] Rate limit exceeded, using existing token');
    return csrfToken;
  }

  // Set lock before fetching
  fetchLock = true;

  try {
    console.debug('[CSRF] Fetching new token');
    // Fixed: Removed async from Promise executor
    fetchPromise = new Promise<string | null>((resolve) => {
      tokenClient.get('/auth/csrf-token', {
        headers: { 'Cache-Control': 'no-cache' }
      })
      .then(response => {
        // Wait a moment for cookie to be set
        setTimeout(() => {
          // Check cookie first
          const newCookieToken = Cookies.get(CSRF_COOKIE_NAME);
          if (newCookieToken) {
            csrfToken = newCookieToken;
            lastFetchTime = now;
            console.debug('[CSRF] Token obtained from cookie');
            resolve(csrfToken);
            return;
          }
          
          // Fall back to response body
          if (response.data?.csrfToken) {
            csrfToken = response.data.csrfToken;
            lastFetchTime = now;
            console.debug('[CSRF] Token obtained from response body');
            resolve(csrfToken);
            return;
          }
          
          console.warn('[CSRF] No token found in cookie or response');
          resolve(null);
        }, 50); // Small delay to ensure cookie is set
      })
      .catch(error => {
        console.error('[CSRF] Fetch failed:', error instanceof Error ? error.message : String(error));
        resolve(null);
      });
    });
    
    return await fetchPromise;
  } finally {
    // Always release the lock and clear the promise when done
    fetchLock = false;
    setTimeout(() => { fetchPromise = null; }, 100);
  }
}

/**
 * Apply CSRF token protection to an axios instance
 * @param axiosInstance The axios instance to apply the interceptor to
 */
export function applyCsrfInterceptor(axiosInstance: AxiosInstance): void {
  // Request interceptor adds CSRF token to mutation requests
  axiosInstance.interceptors.request.use(async (config) => {
    // Only add token to state-changing requests
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const token = await getCsrfToken();
      if (token) {
        config.headers[CSRF_HEADER_NAME] = token;
      }
    }
    return config;
  });

  // Response interceptor handles CSRF validation errors
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // Handle CSRF validation failures - checking various status codes and messages
      if (error.response && 
          (error.response.status === 403 || error.response.status === 419) &&
          (!originalRequest._csrfRetry) &&
          (error.response.data?.message?.toLowerCase().includes('csrf') || 
           error.response.data?.message?.toLowerCase().includes('token'))) {
        
        console.warn('[CSRF] Validation failed, fetching new token');
        originalRequest._csrfRetry = true;
        
        try {
          // Force fetch a new token
          const newToken = await getCsrfToken(true);
          if (newToken) {
            originalRequest.headers[CSRF_HEADER_NAME] = newToken;
            return axiosInstance(originalRequest);
          }
        } catch (retryError) {
          console.error('[CSRF] Retry failed:', retryError);
        }
      }
      
      return Promise.reject(error);
    }
  );
}