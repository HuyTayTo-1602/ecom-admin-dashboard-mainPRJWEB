import React, { createContext, useCallback } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
} from '@tanstack/react-query';
import { 
  loginUser, 
  logoutUser, 
  refreshAccessToken as refreshToken,
} from '../services/authService';
import type { User, JWTPayload } from '../types/auth.types';
import { jwtDecode } from 'jwt-decode';

// Auth query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  token: () => [...authKeys.all, 'token'] as const,
  csrfToken: () => [...authKeys.all, 'csrf'] as const,
};

// Define the refresh token response type
type RefreshTokenResponse = {
  accessToken: string;
  user?: User;
};

type UserContextType = {
  user: User | null;
  accessToken: string | null | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<RefreshTokenResponse>;
  isLoading: boolean;
  isRefreshing: boolean;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Get access token from storage on initial load
  const getStoredToken = () => localStorage.getItem('accessToken');

  // Access token query
  const { 
    data: accessToken,
    isLoading: isLoadingToken 
  } = useQuery({
    queryKey: authKeys.token(),
    queryFn: () => {
      const token = getStoredToken();
      return token;
    },
    staleTime: Infinity, // Token doesn't get stale until explicitly invalidated
  });

  const user = accessToken ? jwtDecode<JWTPayload>(accessToken).user : null;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      loginUser(email, password),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      
      // Update queries
      queryClient.setQueryData(authKeys.token(), data.accessToken);
      queryClient.setQueryData(authKeys.user(), data.user);
      
      // Invalidate queries to refetch if needed
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });

  // Refresh token mutation
  const refreshMutation = useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        queryClient.setQueryData(authKeys.token(), data.accessToken);
        
        if (data.user) {
          queryClient.setQueryData(authKeys.user(), data.user);
        }
      }
    },
    onError: () => {
      // If refresh fails, clear everything
      handleLogout();
    }
  });

  // Logout mutation  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getStoredToken();
      if (!token) {
        console.warn('No token to logout with');
        return;
      }
      try {
        return await logoutUser(token);
      } catch (error) {
        console.error('Logout API failed:', error);
        // We'll still clear local state in onSettled
      }
    },
    onSettled: () => {
      // Always clean up, even if the API call fails
      handleLogout();
    }
  });
  
  // Shared logout cleanup logic
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    queryClient.setQueryData(authKeys.token(), null);
    queryClient.setQueryData(authKeys.user(), null);
    queryClient.invalidateQueries({ queryKey: authKeys.all });
  }, [queryClient]);

  // Login function
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Refresh token function  
  const refreshAccessToken = useCallback(async () => {
    try {
      console.log('Refreshing token...');
      const response = await refreshToken();
      
      if (!response || !response.accessToken) {
        console.log('No valid token received from refresh');
        throw new Error('No valid token received');
      }
      
      localStorage.setItem('accessToken', response.accessToken);
      queryClient.setQueryData(authKeys.token(), response.accessToken);
      
      // Don't trigger additional user fetches here
      // Let the regular query system handle that
      
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clean up on failure
      localStorage.removeItem('accessToken');
      queryClient.setQueryData(authKeys.token(), null);
      queryClient.setQueryData(authKeys.user(), null);
      throw error;
    }
  }, [queryClient]);

  // Loading state
  const isLoading = isLoadingToken;
  const isRefreshing = refreshMutation.isPending;

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        accessToken, 
        login, 
        logout, 
        refreshAccessToken,
        isLoading,
        isRefreshing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};