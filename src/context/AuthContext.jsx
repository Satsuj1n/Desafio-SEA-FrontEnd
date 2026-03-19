import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    return token ? { token, role, username } : null;
  });

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    const userData = {
      token: data.token,
      role: data.role,
      username: credentials.username,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', credentials.username);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const value = useMemo(
    () => ({ user, login, logout, isAdmin }),
    [user, login, logout, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
