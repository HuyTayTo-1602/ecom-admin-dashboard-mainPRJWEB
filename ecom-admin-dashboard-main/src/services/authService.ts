import axios, { AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { JWTPayload, User } from '../types/auth.types'; // Import User type
import { getCsrfToken, CSRF_HEADER_NAME, CSRF_COOKIE_NAME } from './csrf';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Auth service response types
 */
export interface AuthResponse {
  accessToken: string;
  user?: User; // Use the imported User type
  [key: string]: unknown;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user?: User; // Use the imported User type
  [key: string]: unknown;
}

/**
 * Create a separate axios instance for authentication operations
 * This avoids using the interceptors that might cause infinite loops
 */
const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies
});

/**
 * Fetch a fresh CSRF token
 * @param force Force refresh even if a token exists
 */
export function fetchCsrfToken(force = true): Promise<string | null> {
  return getCsrfToken(force);
}

/**
 * Login user with email/password
 * @param email User email
 * @param password User password
 * @returns Promise with auth response
 */
export function loginUser(email: string, password: string): Promise<AuthResponse> {
  // Use Promise chain pattern instead of async/await
  return fetchCsrfToken(true)
    .then((csrfToken) => {
      if (!csrfToken) {
        throw new Error("Failed to obtain CSRF token for authentication");
      }
      
      return authClient.post<AuthResponse>(
        '/auth/admin/sign-in',
        { email, password },
        {
          headers: {
            [CSRF_HEADER_NAME]: csrfToken,
          },
        }
      );
    })
    .then((response: AxiosResponse<AuthResponse>) => {
      if (!response.data || !response.data.accessToken) {
        throw new Error("Invalid response from authentication server");
      }
      
      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
    });
}

/**
 * Logout user
 * @param accessToken Current access token
 */
export function logoutUser(accessToken: string): Promise<void> {
  if (!accessToken) {
    console.warn("No access token provided for logout");
    return Promise.resolve();
  }
  
  // Use Promise chain pattern
  return getCsrfToken(true)
    .then((csrfToken) => {
      return authClient.post(
        '/auth/sign-out', 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            [CSRF_HEADER_NAME]: csrfToken || '',
          }
        }
      );
    })
    .then(() => {
      localStorage.removeItem('accessToken');
    })
    .catch((error: unknown) => {
      console.error("Logout failed:", error);
      // Still remove the token locally even if API fails
      localStorage.removeItem('accessToken');
      throw error;
    });
}

/**
 * Refresh access token
 * @returns Promise with refresh response
 */
export function refreshAccessToken(): Promise<RefreshTokenResponse> {
  // Get CSRF token from cookie for refresh request
  const csrfToken = Cookies.get(CSRF_COOKIE_NAME);
  
  // Use Promise chain pattern instead of async/await
  return authClient.post<RefreshTokenResponse>(
    '/auth/admin/refresh-token', 
    {}, 
    {
      headers: {
        ...(csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
      },
      withCredentials: true,
    }
  )
  .then((response: AxiosResponse<RefreshTokenResponse>) => {
    if (!response.data || !response.data.accessToken) {
      throw new Error("Invalid refresh token response");
    }
    
    // Store the new token
    localStorage.setItem('accessToken', response.data.accessToken);
    
    // Add decoded user data if not included in response
    if (!response.data.user && response.data.accessToken) {
      try {
        const decodedToken = jwtDecode<JWTPayload>(response.data.accessToken);
        return {
          ...response.data,
          user: decodedToken.user // This will now correctly match the expected type
        };
      } catch (error) {
        console.warn("Could not decode JWT token:", error);
      }
    }
    
    return response.data;
  })
  .catch((error: unknown) => {
    console.error("Token refresh failed:", error);
    // Clean up on failure
    localStorage.removeItem('accessToken');
    throw error;
  });
}

/**
 * Get current access token from storage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('accessToken');
}