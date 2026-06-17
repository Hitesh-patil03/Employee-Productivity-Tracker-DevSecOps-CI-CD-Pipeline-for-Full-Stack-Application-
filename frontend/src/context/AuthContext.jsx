import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──
  useEffect(() => {
    const token = localStorage.getItem('produx_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(({ data }) => {
        setUser(data.user);
        setEmployee(data.employee || null);
      })
      .catch(() => localStorage.removeItem('produx_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, role) => {
    const { data } = await authAPI.login({ email, password, role });
    localStorage.setItem('produx_token', data.token);
    setUser(data.user);
    setEmployee(data.employee || null);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('produx_token');
    setUser(null);
    setEmployee(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider value={{ user, employee, loading, login, logout, isAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
