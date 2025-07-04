import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://user-service:3001/api';

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      console.log('🔍 Fetching user profile with token:', token ? 'Present' : 'Missing');
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('👤 Profile response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Profile fetched successfully:', userData);
        setUser(userData);
      } else {
        console.error('❌ Failed to fetch profile:', response.status);
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with email:', email);
      
      const requestBody = { email, password };
      console.log('📤 Login request body:', { email, password: '[HIDDEN]' });

      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status}`;
        }
        console.error('❌ Login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        throw new Error('Invalid response from server');
      }

      console.log('✅ Login successful:', { ...data, token: '[HIDDEN]' });
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response: missing user or token');
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration:', { ...userData, password: '[HIDDEN]' });
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📥 Registration response status:', response.status);
      console.log('📥 Registration response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status}`;
        }
        console.error('❌ Registration failed:', errorMessage);
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        throw new Error('Invalid response from server');
      }

      console.log('✅ Registration successful:', { ...data, token: '[HIDDEN]' });
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response: missing user or token');
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('📝 Updating profile:', profileData);
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔒 Changing password for user');
      const response = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Password change error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out user');
      if (token) {
        await fetch(`${API_URL}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: user !== null,
    token,
    loading
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};