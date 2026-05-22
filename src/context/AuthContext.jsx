import { createContext, useContext, useState } from 'react';
import { authService, userService } from '../services';
import { storage } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ 
  name: "Bruno Silva", 
  role: "ADMIN", 
  email: "bruno@email.com" 
});

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    storage.set('accessToken', data.accessToken);
    storage.set('refreshToken', data.refreshToken);
    const u = { name: data.name, role: data.role, email };
    storage.set('user', u);
    setUser(u);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    storage.set('accessToken', data.accessToken);
    storage.set('refreshToken', data.refreshToken);
    const u = { name: data.name, role: data.role, email };
    storage.set('user', u);
    setUser(u);
    return data;
  };

  const logout = async () => {
    try { await authService.logout(storage.get('refreshToken')); } catch {}
    storage.del('accessToken');
    storage.del('refreshToken');
    storage.del('user');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await userService.me();
      const u = { ...user, name: data.name, email: data.email, role: data.role };
      storage.set('user', u);
      setUser(u);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);