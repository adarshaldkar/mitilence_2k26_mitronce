import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, signup as apiSignup, googleAuth as apiGoogleAuth, getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if token exists and fetch user
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await getMe();
          setUser(data.user || data);
        } catch (err) {
          console.error('Auth init failed:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    const token = data.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    const userData = data.user || data;
    setUser(userData);
    return userData;
  }, []);

  const signup = useCallback(async (userData) => {
    const data = await apiSignup(userData);
    const token = data.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    const newUser = data.user || data;
    setUser(newUser);
    return newUser;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const data = await apiGoogleAuth(credential);
    const token = data.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    const userData = data.user || data;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
