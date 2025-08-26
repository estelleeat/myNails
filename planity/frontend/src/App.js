import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'appointment', 'list'
  const [selectedProthesiste, setSelectedProthesiste] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Configuration de l'API
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Charger les rendez-vous au démarrage
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      // Continuer avec un tableau vide si l'API n'est pas disponible
    }
  };

  const handleSelectProthesiste = (prothesiste) => {
    setSelectedProthesiste(prothesiste);
    setCurrentView('appointment');
  };

  const handleAddAppointment = (appointment) => {
    // Ajouter le nouveau rendez-vous à la liste locale
    setAppointments(prev => [...prev, appointment]);
    // Déclencher un refresh pour recharger depuis l'API
    setRefreshTrigger(prev => prev + 1);
    // Rediriger vers la liste après la réservation
    setCurrentView('list');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProthesiste(null);
  };

  const handleDeleteAppointment = (appointmentId) => {
    // Supprimer de la liste locale
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    // Déclencher un refresh
    setRefreshTrigger(prev => prev + 1);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage 
            onSelectProthesiste={handleSelectProthesiste}
          />
        );
      case 'appointment':
        return (
          <AppointmentForm
            selectedProthesiste={selectedProthesiste}
            onAddAppointment={handleAddAppointment}
            onBack={handleBackToHome}
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
          <HomePage 
            onSelectProthesiste={handleSelectProthesiste}
          />
        );
    }
  };

  return (
    <div className="App">
      <Header />
      
      {/* Navigation */}
      {currentView !== 'home' && (
        <div className="navigation">
          <div className="nav-container">
            <button
              className={`nav-button ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              🏠 Accueil
            </button>
            <button
              className={`nav-button ${currentView === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentView('list')}
            >
              📋 Mes rendez-vous ({appointments.length})
            </button>
            {currentView === 'list' && (
              <button
                className="nav-button new-appointment"
                onClick={() => setCurrentView('home')}
              >
                ➕ Nouveau rendez-vous
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {renderCurrentView()}
      </main>

      <Footer />
    </div>
  );
}

export default App;