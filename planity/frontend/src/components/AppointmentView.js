// AppointmentsView.js - Vue des rendez-vous pour prothésistes
import React, { useState } from 'react';

const AppointmentsView = ({ appointments, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': '#16a34a',
      'pending': '#d97706',
      'cancelled': '#dc2626',
      'completed': '#059669',
      'no_show': '#7c2d12'
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'confirmed': 'Confirmé',
      'pending': 'En attente',
      'cancelled': 'Annulé',
      'completed': 'Terminé',
      'no_show': 'Absent'
    };
    return labels[status] || status;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'upcoming') {
      return new Date(`${apt.date}T${apt.time}`) > new Date();
    }
    if (filter === 'today') {
      return apt.date === new Date().toISOString().split('T')[0];
    }
    if (filter === 'past') {
      return new Date(`${apt.date}T${apt.time}`) < new Date();
    }
    return true;
  }).filter(apt => {
    if (dateFilter) {
      return apt.date === dateFilter;
    }
    return true;
  });

  const groupedAppointments = filteredAppointments.reduce((groups, apt) => {
    const date = apt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {});

  if (appointments.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="empty-state">
          <h3>📅 Aucun rendez-vous</h3>
          <p>Vos futurs rendez-vous apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3>📅 Mes Rendez-vous ({appointments.length})</h3>
        <button 
          onClick={onRefresh}
          style={{
            background: '#f1f5f9',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Actualiser
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            background: 'white'
          }}
        >
          <option value="all">Tous</option>
          <option value="today">Aujourd'hui</option>
          <option value="upcoming">À venir</option>
          <option value="past">Passés</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            background: 'white'
          }}
        />
      </div>

      <div className="appointments-grid">
        {Object.entries(groupedAppointments)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, dayAppointments]) => (
            <div key={date} style={{ marginBottom: '2rem' }}>
              <h4 style={{ 
                color: '#ec4899', 
                marginBottom: '1rem',
                fontSize: '1.2rem',
                borderBottom: '2px solid #ffeef8',
                paddingBottom: '0.5rem'
              }}>
                {formatDate(date)}
              </h4>
              
              {dayAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-client">
                          {appointment.client_name}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          {appointment.client_phone}
                        </div>
                      </div>
                      <div 
                        className="appointment-status"
                        style={{ 
                          backgroundColor: `${getStatusColor(appointment.status)}15`,
                          color: getStatusColor(appointment.status),
                          border: `1px solid ${getStatusColor(appointment.status)}30`
                        }}
                      >
                        {getStatusLabel(appointment.status)}
                      </div>
                    </div>

                    <div className="appointment-details">
                      <div className="appointment-detail">
                        <span>🕐</span>
                        <span>{appointment.time} ({appointment.duration}min)</span>
                      </div>
                      <div className="appointment-detail">
                        <span>{appointment.service.icon}</span>
                        <span>{appointment.service.name}</span>
                      </div>
                      <div className="appointment-detail">
                        <span>💰</span>
                        <span>{appointment.price}€</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem', 
                        background: '#f8fafc', 
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: '#64748b'
                      }}>
                        📝 {appointment.notes}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
};

// AvailabilityView.js - Vue de gestion des disponibilités
import React, { useState, useEffect } from 'react';

const AvailabilityView = ({ availability, onSave }) => {
  const [availabilityData, setAvailabilityData] = useState({});

  const daysOfWeek = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
  ];

  useEffect(() => {
    // Initialiser les données avec les disponibilités existantes
    const data = {};
    daysOfWeek.forEach(day => {
      const existing = availability.find(a => a.day_of_week === day.key);
      data[day.key] = existing ? {
        is_available: existing.is_available,
        start_time: existing.start_time,
        end_time: existing.end_time
      } : {
        is_available: false,
        start_time: '09:00',
        end_time: '18:00'
      };
    });
    setAvailabilityData(data);
  }, [availability]);

  const handleAvailabilityChange = (day, field, value) => {
    setAvailabilityData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    const formattedData = Object.entries(availabilityData)
      .filter(([_, data]) => data.is_available)
      .map(([day, data]) => ({
        day_of_week: day,
        start_time: data.start_time,
        end_time: data.end_time,
        is_available: true
      }));
    
    onSave(formattedData);
  };

  return (
    <div className="dashboard-card">
      <h3>🕐 Mes Disponibilités</h3>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Définissez vos horaires de travail pour chaque jour de la semaine
      </p>

      <div className="availability-editor">
        {daysOfWeek.map(day => (
          <div 
            key={day.key} 
            className={`availability-day ${availabilityData[day.key]?.is_available ? 'active' : ''}`}
          >
            <div className="day-header">
              <span className="day-name">{day.label}</span>
              <button
                className={`availability-toggle ${availabilityData[day.key]?.is_available ? 'active' : ''}`}
                onClick={() => handleAvailabilityChange(day.key, 'is_available', !availabilityData[day.key]?.is_available)}
              >
                {availabilityData[day.key]?.is_available ? 'Disponible' : 'Fermé'}
              </button>
            </div>

            {availabilityData[day.key]?.is_available && (
              <div className="time-inputs">
                <div className="time-group">
                  <label>Heure d'ouverture</label>
                  <input
                    type="time"
                    value={availabilityData[day.key]?.start_time || '09:00'}
                    onChange={(e) => handleAvailabilityChange(day.key, 'start_time', e.target.value)}
                  />
                </div>
                <div className="time-group">
                  <label>Heure de fermeture</label>
                  <input
                    type="time"
                    value={availabilityData[day.key]?.end_time || '18:00'}
                    onChange={(e) => handleAvailabilityChange(day.key, 'end_time', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSave} className="save-button">
        💾 Sauvegarder les disponibilités
      </button>
    </div>
  );
};

// ServicesView.js - Vue de gestion des services
import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const ServicesView = ({ services, allServices, onRefresh }) => {
  const [servicesData, setServicesData] = useState({});
  const { getAuthHeaders } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  React.useEffect(() => {
    // Initialiser les données des services
    const data = {};
    allServices.forEach(service => {
      const existing = services.find(s => s.id === service.id);
      data[service.id] = existing ? {
        is_available: existing.is_available !== false,
        custom_price: existing.price,
        custom_duration: existing.duration
      } : {
        is_available: false,
        custom_price: service.price,
        custom_duration: service.duration
      };
    });
    setServicesData(data);
  }, [services, allServices]);

  const handleServiceChange = (serviceId, field, value) => {
    setServicesData(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: field === 'is_available' ? value : (value === '' ? null : parseFloat(value) || value)
      }
    }));
  };

  const handleSave = async () => {
    try {
      const formattedData = Object.entries(servicesData)
        .filter(([_, data]) => data.is_available)
        .map(([serviceId, data]) => ({
          service_id: parseInt(serviceId),
          custom_price: data.custom_price,
          custom_duration: data.custom_duration,
          is_available: data.is_available
        }));

      const response = await fetch(`${API_BASE_URL}/prothesiste/services`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ services: formattedData })
      });

      if (response.ok) {
        alert('✅ Services mis à jour avec succès');
        onRefresh();
      } else {
        const data = await response.json();
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const activeServicesCount = Object.values(servicesData).filter(s => s.is_available).length;

  return (
    <div className="dashboard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3>💅 Mes Services ({activeServicesCount})</h3>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Sélectionnez les services que vous proposez et personnalisez vos tarifs
          </p>
        </div>
      </div>

      <div className="services-grid">
        {allServices.map(service => (
          <div 
            key={service.id} 
            className={`service-item ${servicesData[service.id]?.is_available ? 'active' : ''}`}
          >
            <div className="service-header">
              <div className="service-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{service.icon}</span>
                  <div className="service-name">{service.name}</div>
                </div>
                {service.description && (
                  <div className="service-description">{service.description}</div>
                )}
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Prix de base: {service.price}€ • Durée: {service.duration}min
                </div>
              </div>
              <button
                className={`service-toggle ${servicesData[service.id]?.is_available ? 'active' : ''}`}
                onClick={() => handleServiceChange(service.id, 'is_available', !servicesData[service.id]?.is_available)}
              >
                {servicesData[service.id]?.is_available ? 'Actif' : 'Inactif'}
              </button>
            </div>

            {servicesData[service.id]?.is_available && (
              <div className="service-pricing">
                <div className="pricing-group">
                  <label>Votre prix (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={servicesData[service.id]?.custom_price || ''}
                    onChange={(e) => handleServiceChange(service.id, 'custom_price', e.target.value)}
                    placeholder={service.price}
                  />
                </div>
                <div className="pricing-group">
                  <label>Durée (min)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={servicesData[service.id]?.custom_duration || ''}
                    onChange={(e) => handleServiceChange(service.id, 'custom_duration', e.target.value)}
                    placeholder={service.duration}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSave} className="save-button">
        💾 Sauvegarder les services
      </button>
    </div>
  );
};

// ProfileView.js - Vue du profil prothésiste
const ProfileView = ({ prothesiste }) => {
  const averageRating = prothesiste?.rating || 0;
  const totalReviews = 0; // À implémenter selon vos besoins

  return (
    <div>
      <div className="dashboard-card">
        <h3>👤 Mon Profil</h3>
        
        <div className="profile-section">
          <h4 style={{ marginBottom: '1rem', color: '#333' }}>Informations personnelles</h4>
          <div className="profile-info">
            <div className="info-item">
              <div className="info-label">Nom</div>
              <div className="info-value">{prothesiste?.name}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{prothesiste?.email}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Téléphone</div>
              <div className="info-value">{prothesiste?.phone || 'Non renseigné'}</div>
            </div>
            