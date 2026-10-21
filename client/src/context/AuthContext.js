import React, { createContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

export const AuthContext = createContext();

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setUser(response.data.user);
    setToken(response.data.token);
    return response;
  };

  const register = async (credentials) => {
    const response = await registerUser(credentials);
    setUser(response.data.user);
    setToken(response.data.token);
    return response;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
