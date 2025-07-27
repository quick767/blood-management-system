import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from cookies
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get('token');
        const userData = Cookies.get('user');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Verify token is still valid
          try {
            const response = await authAPI.getProfile();
            setUser(response.data.user);
          } catch (error) {
            // Token is invalid, clear auth state
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;

      // Store in cookies
      Cookies.set('token', token, { expires: 7 }); // 7 days
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });

      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;

      // Store in cookies
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('user', JSON.stringify(newUser), { expires: 7 });

      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear cookies
    Cookies.remove('token');
    Cookies.remove('user');

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      // Update cookies
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
      setUser(updatedUser);
      
      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset link sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successful');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await authAPI.verifyEmail(token);
      toast.success('Email verified successfully');
      
      // Update user verification status
      if (user) {
        const updatedUser = { ...user, isVerified: true };
        setUser(updatedUser);
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Helper functions
  const isAdmin = () => user?.role === 'admin';
  const isDonor = () => user?.role === 'donor';
  const isRecipient = () => user?.role === 'recipient';
  const canDonate = () => user?.canDonate || false;

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isAdmin,
    isDonor,
    isRecipient,
    canDonate,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

