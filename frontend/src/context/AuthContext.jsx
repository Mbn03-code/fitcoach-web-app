import { createContext, useContext, useMemo, useState } from 'react';
import { clearAuth, getToken, getUser, saveAuth } from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  function login(accessToken, userData) {
    saveAuth(accessToken, userData);
    setToken(accessToken);
    setUser(userData);
  }

  function logout() {
    clearAuth();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
