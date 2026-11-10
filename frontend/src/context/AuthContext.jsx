import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { storage } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,          setUser]          = useState(() => storage.get('brainfy_user'));
  const [token,         setToken]         = useState(() => localStorage.getItem('brainfy_token'));
  const [loading,       setLoading]       = useState(true);
  const [initializing,  setInitializing]  = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('brainfy_token');
      if (!storedToken) {
        setInitializing(false);
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.getMe();
        const userData = data.user || data.data || data;
        setUser(userData);
        storage.set('brainfy_user', userData);
      } catch {
        // Invalid token – clear everything
        localStorage.removeItem('brainfy_token');
        storage.remove('brainfy_user');
        setUser(null);
        setToken(null);
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    const receivedToken = data.token || data.data?.token;
    const userData      = data.user  || data.data?.user || data.data;
    if (receivedToken) {
      localStorage.setItem('brainfy_token', receivedToken);
      setToken(receivedToken);
    }
    if (userData) {
      storage.set('brainfy_user', userData);
      setUser(userData);
    }
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    const receivedToken = data.token || data.data?.token;
    const userData      = data.user  || data.data?.user || data.data;
    if (receivedToken) {
      localStorage.setItem('brainfy_token', receivedToken);
      setToken(receivedToken);
    }
    if (userData) {
      storage.set('brainfy_user', userData);
      setUser(userData);
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem('brainfy_token');
      storage.remove('brainfy_user');
      setUser(null);
      setToken(null);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      storage.set('brainfy_user', updated);
      return updated;
    });
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initializing,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;

