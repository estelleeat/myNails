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

// LoginForm.js - Composant de connexion
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import '../css/AuthForms.css';

const LoginForm = ({ userType = 'user', onSwitchToRegister, onSwitchUserType }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, userType);

    if (result.success) {
      // La redirection sera gérée par le composant parent
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>
            {userType === 'prothesiste' ? '👩‍🎨 Connexion Prothésiste' : '💅 Connexion Client'}
          </h2>
          <p>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? '⏳ Connexion...' : '🔑 Se connecter'}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToRegister}
          >
            Pas encore de compte ? S'inscrire
          </button>
          
          <button
            type="button"
            className="link-button"
            onClick={onSwitchUserType}
          >
            {userType === 'prothesiste' ? 
              'Se connecter en tant que client' : 
              'Se connecter en tant que prothésiste'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// RegisterForm.js - Composant d'inscription
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import '../css/AuthForms.css';

const RegisterForm = ({ userType = 'user', onSwitchToLogin, onSwitchUserType }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: userType === 'user' ? '' : undefined,
    last_name: userType === 'user' ? '' : undefined,
    phone: '',
    name: userType === 'prothesiste' ? '' : undefined,
    specialite: userType === 'prothesiste' ? '' : undefined,
    experience: userType === 'prothesiste' ? '' : undefined,
    description: userType === 'prothesiste' ? '' : undefined,
    address: userType === 'prothesiste' ? '' : undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    // Préparer les données
    const userData = { ...formData };
    delete userData.confirmPassword;

    const result = await register(userData, userType);

    if (result.success) {
      // La redirection sera gérée par le composant parent
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form register-form">
        <div className="auth-header">
          <h2>
            {userType === 'prothesiste' ? '👩‍🎨 Inscription Prothésiste' : '💅 Inscription Client'}
          </h2>
          <p>Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          {userType === 'user' ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div className="form-group">
                <label>Spécialité *</label>
                <input
                  type="text"
                  value={formData.specialite}
                  onChange={(e) => handleChange('specialite', e.target.value)}
                  placeholder="Ex: Nail Art & French Manucure"
                  required
                />
              </div>

              <div className="form-group">
                <label>Expérience *</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  placeholder="Ex: 5 ans d'expérience"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Décrivez votre expertise et vos spécialités..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Votre adresse professionnelle"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mot de passe *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Au moins 6 caractères"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Répétez votre mot de passe"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? '⏳ Inscription...' : '✨ Créer mon compte'}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToLogin}
          >
            Déjà un compte ? Se connecter
          </button>
          
          <button
            type="button"
            className="link-button"
            onClick={onSwitchUserType}
          >
            {userType === 'prothesiste' ? 
              'S\'inscrire en tant que client' : 
              'S\'inscrire en tant que prothésiste'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// AuthModal.js - Modal d'authentification
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import '../css/AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login' ou 'register'
  const [userType, setUserType] = useState('user'); // 'user' ou 'prothesiste'

  if (!isOpen) return null;

  const handleSwitchToRegister = () => setCurrentView('register');
  const handleSwitchToLogin = () => setCurrentView('login');
  const handleSwitchUserType = () => {
    setUserType(userType === 'user' ? 'prothesiste' : 'user');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>
        
        {currentView === 'login' ? (
          <LoginForm
            userType={userType}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchUserType={handleSwitchUserType}
          />
        ) : (
          <RegisterForm
            userType={userType}
            onSwitchToLogin={handleSwitchToLogin}
            onSwitchUserType={handleSwitchUserType}
          />
        )}
      </div>
    </div>
  );
};

// ProthesisteDashboard.js - Tableau de bord prothésiste
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import '../css/ProthesisteDashboard.css';

const ProthesisteDashboard = () => {
  const { prothesiste, getAuthHeaders, logout } = useAuth();
  const [currentView, setCurrentView] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAppointments(),
      fetchAvailability(),
      fetchServices(),
      fetchAllServices()
    ]);
    setLoading(false);
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/appointments`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/availability`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/services`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchAllServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (response.ok) {
        const data = await response.json();
        setAllServices(data);
      }
    } catch (error) {
      console.error('Error fetching all services:', error);
    }
  };

  const saveAvailability = async (availabilityData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/availability`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ availability: availabilityData })
      });

      if (response.ok) {
        alert('✅ Disponibilités mises à jour avec succès');
        fetchAvailability();
      } else {
        const data = await response.json();
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner">💅</div>
          <p>Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-user-info">
          <div className="user-avatar">{prothesiste?.photo || '👩‍🎨'}</div>
          <div>
            <h1>Bonjour {prothesiste?.name}!</h1>
            <p>{prothesiste?.specialite}</p>
          </div>
        </div>
        <button className="logout-button" onClick={logout}>
          🚪 Déconnexion
        </button>
      </div>

      <div className="dashboard-navigation">
        <button
          className={`nav-tab ${currentView === 'appointments' ? 'active' : ''}`}
          onClick={() => setCurrentView('appointments')}
        >
          📅 Mes Rendez-vous ({appointments.length})
        </button>
        <button
          className={`nav-tab ${currentView === 'availability' ? 'active' : ''}`}
          onClick={() => setCurrentView('availability')}
        >
          🕐 Mes Disponibilités
        </button>
        <button
          className={`nav-tab ${currentView === 'services' ? 'active' : ''}`}
          onClick={() => setCurrentView('services')}
        >
          💅 Mes Services ({services.length})
        </button>
        <button
          className={`nav-tab ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          👤 Mon Profil
        </button>
      </div>

      <div className="dashboard-content">
        {currentView === 'appointments' && (
          <AppointmentsView appointments={appointments} onRefresh={fetchAppointments} />
        )}
        {currentView === 'availability' && (
          <AvailabilityView availability={availability} onSave={saveAvailability} />
        )}
        {currentView === 'services' && (
          <ServicesView services={services} allServices={allServices} onRefresh={fetchServices} />
        )}
        {currentView === 'profile' && (
          <ProfileView prothesiste={prothesiste} onRefresh={() => {}} />
        )}
      </div>
    </div>
  );
};

export { AuthProvider, useAuth, LoginForm, RegisterForm, AuthModal, ProthesisteDashboard };