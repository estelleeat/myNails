import React, { useState, useEffect } from 'react';
import '../css/AppointmentList.css';

function AppointmentList({ appointments, onDeleteAppointment, refreshTrigger }) {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [allAppointments, setAllAppointments] = useState(appointments || []);

  // Configuration de l'API
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Charger les rendez-vous depuis l'API si nécessaire
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setAllAppointments(appointments);
    } else {
      fetchAppointments();
    }
  }, [appointments, refreshTrigger]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des rendez-vous');
      }
      const data = await response.json();
      setAllAppointments(data);
    } catch (error) {
      console.error('Erreur:', error);
      // Garder les appointments passés en props si l'API ne fonctionne pas
      setAllAppointments(appointments || []);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getServiceEmoji = (service) => {
    const emojis = {
      'manicure': '💅',
      'pedicure': '🦶',
      'gel': '✨',
      'design': '🎨',
      'french': '🤍'
    };
    return emojis[service] || '💅';
  };

  const getServiceName = (service) => {
    const names = {
      'manicure': 'Manucure Classique',
      'pedicure': 'Pédicure',
      'gel': 'Pose Gel',
      'design': 'Nail Art',
      'french': 'French Manucure'
    };
    return names[service] || 'Service';
  };

  const isUpcoming = (dateString, timeString) => {
    const appointmentDate = new Date(`${dateString}T${timeString}`);
    return appointmentDate > new Date();
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Mettre à jour l'état local
      setAllAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // Appeler le callback parent si fourni
      if (onDeleteAppointment) {
        onDeleteAppointment(appointmentId);
      }

      alert('✅ Rendez-vous annulé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'annulation du rendez-vous');
    }
  };

  const filteredAppointments = allAppointments.filter(appointment => {
    if (filter === 'upcoming') {
      return isUpcoming(appointment.date, appointment.time);
    }
    if (filter === 'past') {
      return !isUpcoming(appointment.date, appointment.time);
    }
    return true; // 'all'
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  if (loading) {
    return (
      <div className="appointment-list-container">
        <div className="loading-container">
          <div className="loading-spinner">💅</div>
          <p>Chargement de vos rendez-vous...</p>
        </div>
      </div>
    );
  }

  if (allAppointments.length === 0) {
    return (
      <div className="appointment-list-container">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3 className="empty-title">Aucun rendez-vous prévu</h3>
          <p className="empty-message">
            Réservez votre premier rendez-vous pour commencer !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-list-container">
      <div className="list-header">
        <h2 className="list-title">📋 Vos rendez-vous</h2>
        
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous ({allAppointments.length})
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            À venir ({allAppointments.filter(apt => isUpcoming(apt.date, apt.time)).length})
          </button>
          <button
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Passés ({allAppointments.filter(apt => !isUpcoming(apt.date, apt.time)).length})
          </button>
        </div>
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="no-appointments">
          <p>Aucun rendez-vous dans cette catégorie</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {sortedAppointments.map((appointment, index) => {
            const upcoming = isUpcoming(appointment.date, appointment.time);
            
            return (
              <div
                key={appointment.id || index}
                className={`appointment-card ${upcoming ? 'upcoming' : 'past'}`}
              >
                <div className="card-header">
                  <div className="service-info">
                    <span className="service-emoji">
                      {getServiceEmoji(appointment.service)}
                    </span>
                    <h3 className="client-name">{appointment.name}</h3>
                  </div>
                  
                  {upcoming && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      title="Annuler le rendez-vous"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div>
                      <span className="detail-label">Date:</span>
                      <div className="detail-value">{formatDate(appointment.date)}</div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <div>
                      <span className="detail-label">Heure:</span>
                      <div className="detail-value">{appointment.time}</div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">💅</span>
                    <div>
                      <span className="detail-label">Service:</span>
                      <div className="detail-value">{getServiceName(appointment.service)}</div>
                    </div>
                  </div>

                  {appointment.phone && (
                    <div className="detail-item">
                      <span className="detail-icon">📱</span>
                      <div>
                        <span className="detail-label">Téléphone:</span>
                        <div className="detail-value">{appointment.phone}</div>
                      </div>
                    </div>
                  )}

                  {appointment.prothesiste && (
                    <div className="detail-item">
                      <span className="detail-icon">👩‍🎨</span>
                      <div>
                        <span className="detail-label">Prothésiste:</span>
                        <div className="detail-value">{appointment.prothesiste.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`appointment-status ${appointment.status === 'confirmé' ? 'confirmed' : 'pending'}`}>
                  {appointment.status === 'confirmé' ? '✅ Confirmé' : '⏳ En attente'}
                </div>

                {!upcoming && (
                  <div className="past-indicator">
                    🕐 Rendez-vous passé
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AppointmentList;