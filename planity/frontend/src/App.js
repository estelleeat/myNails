import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Link } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext'; // <-- Ajoute ceci
import LandingPage from './components/LandingPage';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import ProthesisteDashboard from './components/ProthesistDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'appointment', 'list'
  const [selectedProthesiste, setSelectedProthesiste] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState(null);

  // Configuration de l'API
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Charger les rendez-vous au démarrage si utilisateur connecté
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Pas de redirection automatique, l'utilisateur reste sur la landing page
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setSelectedProthesiste(null);
    setAppointments([]);
  };

  const handleSelectProthesiste = (prothesiste) => {
    setSelectedProthesiste(prothesiste);
    setCurrentView('appointment');
  };

  const handleAddAppointment = (appointment) => {
    setAppointments(prev => [...prev, appointment]);
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('list');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedProthesiste(null);
  };

  const handleDeleteAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    setRefreshTrigger(prev => prev + 1);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage 
            onSelectProthesiste={handleSelectProthesiste}
            onLogin={handleLogin}
            user={user}
          />
        );
      case 'appointment':
        return (
          <AppointmentForm
            selectedProthesiste={selectedProthesiste}
            onAddAppointment={handleAddAppointment}
            onBack={handleBackToLanding}
          />
        );
      case 'list':
        return (
          <AppointmentList
            appointments={appointments}
            onDeleteAppointment={handleDeleteAppointment}
            refreshTrigger={refreshTrigger}
          />
        );
      default:
        return (
          <LandingPage 
            onSelectProthesiste={handleSelectProthesiste}
            onLogin={handleLogin}
            user={user}
          />
        );
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider> {/* <-- Ajoute ce wrapper */}
        <div className="App">
          {/* Navigation toujours affichée */}
          <nav className="app-nav">
            <div className="nav-content">
              <button
                className="nav-btn brand-btn"
                onClick={() => setCurrentView('landing')}
              >
                ✨ NailSpace
              </button>
              <div className="nav-actions">
                {user && (
                  <>
                    <button
                      className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
                      onClick={() => setCurrentView('list')}
                    >
                      Mes RDV ({appointments.length})
                    </button>
                    <span className="user-info">👋 {user.name}</span>
                    <button 
                      className="nav-btn logout-btn"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </>
                )}
                {/* Affiche toujours le bouton Dashboard Prothésiste */}
                <Link to="/pro-dashboard" className="nav-btn">
                  Dashboard Prothésiste
                </Link>
              </div>
            </div>
          </nav>
          {/* Main Content */}
          <main className="app-main">
            <Routes>
              <Route path="/" element={renderCurrentView()} />
              <Route path="/pro-dashboard" element={<ProthesisteDashboard />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;