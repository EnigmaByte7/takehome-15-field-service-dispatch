import { createContext, useContext, useState } from 'react';
import { login as loginApi } from '../api/auth';
import { getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const res = await loginApi(email, password);
    setToken(res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function isLoggedIn() {
  return !!getToken();
}