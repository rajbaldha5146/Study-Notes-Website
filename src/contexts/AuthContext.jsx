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
        
        toast.success('Login successful! Redirecting...', {
          duration: 1500,
          position: 'top-center',
          style: {
            background: "#065f46",
            color: "#d1fae5",
            border: "1px solid #10b981",
            fontSize: "16px",
            fontWeight: "600",
            padding: "16px",
          },
        });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message, {
        duration: 5000, // Show error toast for 5 seconds
        position: 'top-center',
        style: {
          background: "#7f1d1d",
          color: "#fecaca",
          border: "1px solid #ef4444",
          fontSize: "16px",
          fontWeight: "600",
          padding: "16px",
        },
      });
      
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
        const { token: newToken, user: userData } = response.data.data;
        
        // Store token and user data immediately
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        toast.success('Registration successful! You are now logged in.', {
          duration: 2000,
          position: 'top-center',
          style: {
            background: "#065f46",
            color: "#d1fae5",
            border: "1px solid #10b981",
            fontSize: "16px",
            fontWeight: "600",
            padding: "16px",
          },
        });
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: "#7f1d1d",
          color: "#fecaca",
          border: "1px solid #ef4444",
          fontSize: "16px",
          fontWeight: "600",
          padding: "16px",
        },
      });
      return { success: false, message };
    }
  };

  // Email verification methods removed - users are auto-verified



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

    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};