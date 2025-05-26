import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../services/axios';
import { useUser } from './useUser';

interface UserData {
  _id: string;
  name: string;
  email?: string;
}

export function useUserData(userId: string | undefined) {
  const { accessToken } = useUser();

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const response = await axiosInstance.get(`/user/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data as UserData;
    },
    enabled: !!userId && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}