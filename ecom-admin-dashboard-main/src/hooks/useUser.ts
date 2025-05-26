import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export const useUser = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  const isAuthenticated = !context.isLoading && !!context.user && !!context.accessToken;
  
  console.log('useUser state:', {
    user: !!context.user,
    token: !!context.accessToken,
    isLoading: context.isLoading,
    isRefreshing: context.isRefreshing,
    isAuthenticated
  });
  
  return {
    ...context,
    isAuthenticated
  };
};