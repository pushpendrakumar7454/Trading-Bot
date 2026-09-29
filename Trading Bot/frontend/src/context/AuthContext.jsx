import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('trading_bot_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('trading_bot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, role = 'USER') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data.success) {
      localStorage.setItem('trading_bot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const demoLogin = async (role = 'USER') => {
    const res = await api.post('/auth/demo', { role });
    if (res.data.success) {
      localStorage.setItem('trading_bot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('trading_bot_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, ...res.data.user }));
    }
    return res.data;
  };

  const resetDemoAccount = async () => {
    const res = await api.post('/auth/reset-demo');
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        resetDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
