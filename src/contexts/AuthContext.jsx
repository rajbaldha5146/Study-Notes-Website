import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure api defaults
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            // Invalid token
            logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        // Store token
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      
      return { 
        success: false, 
        message,
        needsVerification: error.response?.data?.needsVerification 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password 
      });
      
      if (response.data.success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(userData);
        
        // Don't show toast here - let the component handle the UI
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      // Don't show toast here - let the component handle the UI
      return { success: false, message };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        toast.success('Verification email sent! Please check your inbox.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(message);
      return { success: false, message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        toast.success('Password reset link sent to your email!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        password 
      });
      
      if (response.data.success) {
        toast.success('Password reset successful! You can now log in.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};