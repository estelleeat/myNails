// AuthContext.js - Context pour gérer l'authentification
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [prothesiste, setProthesiste] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType'));
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Vérifier le token au chargement
  useEffect(() => {
    if (token && userType) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (userType === 'user') {
          setUser(data.user);
        } else if (userType === 'prothesiste') {
          setProthesiste(data.prothesiste);
        }
      } else {
        // Token invalide
        logout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, type = 'user') => {
    try {
      const endpoint = type === 'prothesiste' ? '/auth/prothesiste/login' : '/auth/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUserType(type);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', type);

        if (type === 'user') {
          setUser(data.user);
        } else {
          setProthesiste(data.prothesiste);
        }

        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (userData, type = 'user') => {
    try {
      const endpoint = type === 'prothesiste' ? '/auth/prothesiste/register' : '/auth/register';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUserType(type);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', type);

        if (type === 'user') {
          setUser(data.user);
        } else {
          setProthesiste(data.prothesiste);
        }

        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Erreur d\'inscription' };
    }
  };

  const logout = () => {
    setUser(null);
    setProthesiste(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
  };

  const isAuthenticated = () => {
    return !!(token && (user || prothesiste));
  };

  const isProthesiste = () => {
    return userType === 'prothesiste' && !!prothesiste;
  };

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    prothesiste,
    token,
    userType,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isProthesiste,
    getAuthHeaders,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;