import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const tokens = localStorage.getItem('tokens');
    if (savedUser && tokens) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.data.success) {
        const { tokens, user: userData } = response.data.data;
        localStorage.setItem('tokens', JSON.stringify(tokens));
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const logout = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      if (tokens?.refresh) {
        await authService.logout(tokens.refresh);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const handleGoogleAuth = async (token) => {
    try {
      const response = await authService.googleAuth(token);
      if (response.data.success) {
        const { tokens, user: userData } = response.data.data;
        localStorage.setItem('tokens', JSON.stringify(tokens));
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google Auth failed.' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    handleGoogleAuth,
    isAdmin: user?.is_staff || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
