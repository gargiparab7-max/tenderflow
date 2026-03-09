import { useState, useEffect } from 'react';
import { getAuthData, clearAuthData, isTokenExpired } from '../utils/auth';

/**
 * Custom hook to manage auth state globally across the app.
 * Provides user, token, and ensures auto-logout on token expiry or 401 errors.
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    // Load auth data on mount
    const { token, user } = getAuthData();

    // Check if token is expired
    if (token && isTokenExpired(token)) {
      clearAuthData();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
      });
    } else if (token && user) {
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
        loading: false,
      });
    } else {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
      });
    }
  }, []);

  const logout = () => {
    clearAuthData();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });
  };

  return {
    ...authState,
    logout,
    refreshProfile: async () => {
      try {
        const { api } = await import('../utils/api');
        const { setAuthData, getAuthData } = await import('../utils/auth');
        const response = await api.get('/profile');
        const { token } = getAuthData();
        setAuthData(token, response.data);
        setAuthState(prev => ({
          ...prev,
          user: response.data,
          isAdmin: response.data.role === 'admin'
        }));
        return response.data;
      } catch (error) {
        console.error('Failed to refresh profile:', error);
        return null;
      }
    }
  };
};
