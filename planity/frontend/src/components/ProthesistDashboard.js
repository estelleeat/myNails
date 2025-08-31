import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/ProthesistDashboard.css';

// Composant principal du dashboard
const ProthesisteDashboard = () => {
  const navigate = useNavigate();
  const { prothesiste, getAuthHeaders, logout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [data, setData] = useState({
    appointments: [],
    availability: [],
    services: [],
    allServices: [],
    stats: {
      todayAppointments: 0,
      weekRevenue: 0,
      totalClients: 0,
      averageRating: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (prothesiste) {
      fetchAllData();
    }
  }, [prothesiste]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchAvailability(),
        fetchServices(),
        fetchAllServices(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/appointments`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const appointments = await response.json();
        setData(prev => ({ ...prev, appointments }));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Données de démonstration
      setData(prev => ({
        ...prev,
        appointments: [
          {
            id: 1,
            client_name: 'Marie Dupont',
            client_phone: '06 12 34 56 78',
            date: '2025-09-01',
            time: '10:00',
            duration: 60,
            service: { name: 'Manucure Gel', icon: '💅' },
            price: 35,
            status: 'confirmed'
          },
          {
            id: 2,
            client_name: 'Julie Martin',
            client_phone: '06 98 76 54 32',
            date: '2025-09-01',
            time: '14:30',
            duration: 90,
            service: { name: 'Nail Art', icon: '🎨' },
            price: 45,
            status: 'confirmed'
          }
        ]
      }));
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/availability`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const availability = await response.json();
        setData(prev => ({ ...prev, availability }));
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setData(prev => ({
        ...prev,
        availability: [
          { day_of_week: 'monday', start_time: '09:00', end_time: '18:00', is_available: true },
          { day_of_week: 'tuesday', start_time: '09:00', end_time: '18:00', is_available: true },
          { day_of_week: 'wednesday', start_time: '09:00', end_time: '18:00', is_available: true },
          { day_of_week: 'thursday', start_time: '09:00', end_time: '18:00', is_available: true },
          { day_of_week: 'friday', start_time: '09:00', end_time: '18:00', is_available: true }
        ]
      }));
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/services`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const services = await response.json();
        setData(prev => ({ ...prev, services }));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setData(prev => ({
        ...prev,
        services: [
          { id: 1, name: 'Manucure Classique', icon: '💅', price: 25, duration: 45, is_available: true },
          { id: 2, name: 'Pose Gel', icon: '✨', price: 35, duration: 60, is_available: true },
          { id: 5, name: 'Nail Art', icon: '🎨', price: 40, duration: 90, is_available: true }
        ]
      }));
    }
  };

  const fetchAllServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (response.ok) {
        const allServices = await response.json();
        setData(prev => ({ ...prev, allServices }));
      }
    } catch (error) {
      console.error('Error fetching all services:', error);
      setData(prev => ({
        ...prev,
        allServices: [
          { id: 1, code: 'manicure_classic', name: 'Manucure Classique', icon: '💅', duration: 45, price: 25, category: 'manicure' },
          { id: 2, code: 'manicure_semi', name: 'Manucure Semi-Permanent', icon: '✨', duration: 60, price: 35, category: 'manicure' },
          { id: 3, code: 'pedicure_classic', name: 'Pédicure Classique', icon: '🦶', duration: 60, price: 35, category: 'pedicure' },
          { id: 4, code: 'pedicure_semi', name: 'Pédicure Semi-Permanent', icon: '🦶', duration: 75, price: 45, category: 'pedicure' },
          { id: 5, code: 'nail_art', name: 'Nail Art Simple', icon: '🎨', duration: 30, price: 15, category: 'art' },
          { id: 6, code: 'nail_art_complex', name: 'Nail Art Complexe', icon: '🎨', duration: 60, price: 35, category: 'art' },
          { id: 7, code: 'french_manicure', name: 'French Manucure', icon: '🤍', duration: 50, price: 30, category: 'manicure' },
          { id: 8, code: 'extensions', name: 'Pose d\'Extensions', icon: '💎', duration: 90, price: 55, category: 'extensions' },
          { id: 9, code: 'repair', name: 'Réparation d\'Ongle', icon: '🔧', duration: 20, price: 10, category: 'repair' }
        ]
      }));
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/stats`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const stats = await response.json();
        setData(prev => ({ ...prev, stats }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setData(prev => ({
        ...prev,
        stats: {
          todayAppointments: 3,
          weekRevenue: 420,
          totalClients: 45,
          averageRating: 4.8
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner">💅</div>
          <p>Chargement de votre espace professionnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <button className="nav-btn" onClick={() => navigate('/')}>
        ← Retour
      </button>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="user-avatar">{prothesiste?.photo || '👩‍🎨'}</div>
          <div className="user-info">
            <h1>Bonjour {prothesiste?.name}! 👋</h1>
            <p>{prothesiste?.specialite}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="notification-btn">🔔 <span className="badge">2</span></button>
          <button className="logout-btn" onClick={logout}>
            🚪 Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        {[
          { key: 'overview', label: '📊 Tableau de bord', count: null },
          { key: 'appointments', label: '📅 Rendez-vous', count: data.appointments.length },
          { key: 'availability', label: '🕐 Disponibilités', count: null },
          { key: 'services', label: '💅 Mes Services', count: data.services.length },
          { key: 'clients', label: '👥 Mes Clientes', count: data.stats.totalClients },
          { key: 'profile', label: '👤 Mon Profil', count: null }
        ].map(nav => (
          <button
            key={nav.key}
            className={`nav-btn ${currentView === nav.key ? 'active' : ''}`}
            onClick={() => setCurrentView(nav.key)}
          >
            {nav.label}
            {nav.count !== null && <span className="nav-count">({nav.count})</span>}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="dashboard-content">
        {currentView === 'overview' && <OverviewView data={data} />}
        {currentView === 'appointments' && <AppointmentsView appointments={data.appointments} onRefresh={fetchAppointments} />}
        {currentView === 'availability' && <AvailabilityView availability={data.availability} onSave={fetchAvailability} />}
        {currentView === 'services' && <ServicesView services={data.services} allServices={data.allServices} onRefresh={fetchServices} />}
        {currentView === 'clients' && <ClientsView appointments={data.appointments} />}
        {currentView === 'profile' && <ProfileView prothesiste={prothesiste} onRefresh={() => {}} />}
      </main>
    </div>
  );
};

// Vue d'ensemble - Dashboard principal
const OverviewView = ({ data }) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAppointments = data.appointments.filter(apt => apt.date === todayDate);
  const upcomingAppointments = data.appointments.filter(apt => new Date(`${apt.date}T${apt.time}`) > new Date()).slice(0, 3);

  return (
    <div className="overview-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{todayAppointments.length}</h3>
            <p>RDV aujourd'hui</p>
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{data.stats.weekRevenue}€</h3>
            <p>Revenus cette semaine</p>
          </div>
        </div>
        
        <div className="stat-card clients">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{data.stats.totalClients}</h3>
            <p>Clientes fidèles</p>
          </div>
        </div>
        
        <div className="stat-card rating">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{data.stats.averageRating}</h3>
            <p>Note moyenne</p>
          </div>
        </div>
      </div>

      <div className="overview-content">
        {/* Prochains RDV */}
        <div className="overview-section">
          <h3>🔮 Prochains rendez-vous</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="upcoming-appointments">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="appointment-preview">
                  <div className="apt-time">
                    <span className="date">{new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="time">{apt.time}</span>
                  </div>
                  <div className="apt-details">
                    <div className="client-name">{apt.client_name}</div>
                    <div className="service">{apt.service.icon} {apt.service.name}</div>
                  </div>
                  <div className="apt-price">{apt.price}€</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucun rendez-vous à venir</p>
          )}
        </div>

        {/* Services les plus populaires */}
        <div className="overview-section">
          <h3>🏆 Mes services populaires</h3>
          <div className="popular-services">
            {data.services.slice(0, 3).map(service => (
              <div key={service.id} className="service-preview">
                <span className="service-icon">{service.icon}</span>
                <span className="service-name">{service.name}</span>
                <span className="service-price">{service.price}€</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="overview-section">
          <h3>⚡ Actions rapides</h3>
          <div className="quick-actions">
            <button className="quick-btn">📝 Bloquer un créneau</button>
            <button className="quick-btn">💅 Ajouter un service</button>
            <button className="quick-btn">📊 Voir mes statistiques</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vue des rendez-vous
const AppointmentsView = ({ appointments, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
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

  return (
    <div className="appointments-view">
      <div className="view-header">
        <h2>📅 Mes Rendez-vous ({appointments.length})</h2>
        <button onClick={onRefresh} className="refresh-btn">🔄 Actualiser</button>
      </div>

      {/* Filtres */}
      <div className="appointments-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="all">Tous les RDV</option>
          <option value="today">Aujourd'hui</option>
          <option value="upcoming">À venir</option>
          <option value="past">Passés</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="date-filter"
        />
      </div>

      {/* Liste des rendez-vous */}
      <div className="appointments-list">
        {Object.entries(groupedAppointments)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, dayAppointments]) => (
            <div key={date} className="appointments-day">
              <h3 className="day-header">{formatDate(date)}</h3>
              
              {dayAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-main">
                      <div className="appointment-time">
                        <span className="time">{appointment.time}</span>
                        <span className="duration">({appointment.duration}min)</span>
                      </div>
                      
                      <div className="appointment-details">
                        <div className="client-info">
                          <h4>{appointment.client_name}</h4>
                          <p>{appointment.client_phone}</p>
                        </div>
                        
                        <div className="service-info">
                          <span className="service-icon">{appointment.service.icon}</span>
                          <span className="service-name">{appointment.service.name}</span>
                        </div>
                      </div>
                      
                      <div className="appointment-meta">
                        <div className="price">{appointment.price}€</div>
                        <div 
                          className="status"
                          style={{ 
                            backgroundColor: `${getStatusColor(appointment.status)}15`,
                            color: getStatusColor(appointment.status)
                          }}
                        >
                          {appointment.status === 'confirmed' ? 'Confirmé' : appointment.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="appointment-actions">
                      <button className="action-btn">✏️ Modifier</button>
                      <button className="action-btn danger">❌ Annuler</button>
                      <button className="action-btn">✅ Marquer terminé</button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="no-appointments">
          <div className="no-data-icon">📅</div>
          <h3>Aucun rendez-vous</h3>
          <p>Vos rendez-vous apparaîtront ici</p>
        </div>
      )}
    </div>
  );
};

const AvailabilityView = ({ availability, onSave }) => <div>Disponibilités</div>;
const ServicesView = ({ services, allServices, onRefresh }) => <div>Services</div>;
const ClientsView = ({ appointments }) => <div>Clients</div>;
const ProfileView = ({ prothesiste, onRefresh }) => <div>Profil</div>;

export default ProthesisteDashboard;