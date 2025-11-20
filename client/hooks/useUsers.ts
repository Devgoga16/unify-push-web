import { useState } from 'react';
import { UsersListResponse, UserResponse, UserRequest, UserWithTimestamps } from '@shared/api';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '@/config/api';

export const useUsers = () => {
  const [users, setUsers] = useState<UserWithTimestamps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        headers: getAuthHeaders()
      });

      const data: UsersListResponse = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: UserRequest): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      const data: UserResponse = await response.json();

      if (data.success) {
        await fetchUsers(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to create user' };
      }
    } catch (err) {
      console.error('Create user error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const updateUser = async (id: string, userData: Partial<UserRequest>): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_BY_ID(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      const data: UserResponse = await response.json();

      if (data.success) {
        await fetchUsers(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to update user' };
      }
    } catch (err) {
      console.error('Update user error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_BY_ID(id), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data: UserResponse = await response.json();

      if (data.success) {
        await fetchUsers(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to delete user' };
      }
    } catch (err) {
      console.error('Delete user error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};