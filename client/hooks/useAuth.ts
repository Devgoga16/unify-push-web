import { useState, useEffect } from 'react';

export interface AuthUser {
  username: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('unify_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (username: string) => {
    const userData: AuthUser = { username };
    localStorage.setItem('unify_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('unify_user');
    setUser(null);
  };

  const validateCredentials = (username: string, password: string): boolean => {
    return username === 'admin' && password === 'admin123';
  };

  return { user, isLoading, login, logout, validateCredentials };
};
