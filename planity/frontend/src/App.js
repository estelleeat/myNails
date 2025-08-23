import React, { useState } from 'react';
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

  const handleSelectProthesiste = (prothesiste) => {
    setSelectedProthesiste(prothesiste);
    setCurrentView('appointment');
  };

  const handleAddAppointment = (appointment) => {
    setAppointments(prev => [...prev, appointment]);
    setCurrentView('list'); // Rediriger vers la liste après la réservation
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProthesiste(null);
  };

  const handleDeleteAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
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
            {currentView === 'list' && appointments.length > 0 && (
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