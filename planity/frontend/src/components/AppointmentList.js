import React, { useState } from 'react';
import '../css/AppointmentList.css';

function AppointmentList({ appointments, onDeleteAppointment }) {
  const [filter, setFilter] = useState('all');

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

  const filteredAppointments = appointments.filter(appointment => {
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

  if (appointments.length === 0) {
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
            Tous ({appointments.length})
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            À venir ({appointments.filter(apt => isUpcoming(apt.date, apt.time)).length})
          </button>
          <button
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Passés ({appointments.filter(apt => !isUpcoming(apt.date, apt.time)).length})
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
                  
                  {onDeleteAppointment && upcoming && (
                    <button
                      className="delete-btn"
                      onClick={() => onDeleteAppointment(appointment.id)}
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