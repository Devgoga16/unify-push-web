import { useState, useEffect } from 'react';
import { LoginRequest, LoginResponse, User } from '@shared/api';
import { API_ENDPOINTS } from '@/config/api';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('unify_user');
    const storedToken = localStorage.getItem('unify_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoginLoading(true);
    
    try {
      const loginData: LoginRequest = { username, password };
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data: LoginResponse = await response.json();

      if (data.success && response.ok) {
        // Store user data and token
        localStorage.setItem('unify_user', JSON.stringify(data.user));
        localStorage.setItem('unify_token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoginLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('unify_user');
    localStorage.removeItem('unify_token');
    setUser(null);
  };

  const getToken = (): string | null => {
    return localStorage.getItem('unify_token');
  };

  // Mantener compatibilidad con código existente
  const validateCredentials = (username: string, password: string): boolean => {
    return username === 'admin' && password === 'admin123';
  };

  return { 
    user, 
    isLoading, 
    isLoginLoading,
    login, 
    logout, 
    getToken,
    validateCredentials 
  };
};
