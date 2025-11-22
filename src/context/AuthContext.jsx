'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post(`${API_URL}/api/auth/register`, { username, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = async () => {
    try {
      if (user?.token) {
        await axios.put(`${API_URL}/api/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      
      // Clear chat messages from localStorage
      localStorage.removeItem('chatMessages');
      
      // Clear cached messages
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('messages-')) {
          localStorage.removeItem(key);
        }
      });
      
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
