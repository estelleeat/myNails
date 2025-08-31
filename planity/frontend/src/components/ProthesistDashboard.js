import React, { useState, useEffect } from 'react';

// Hook simulé pour l'authentification
const useAuth = () => {
  const [prothesiste, setProthesiste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement depuis l'API
    setTimeout(() => {
      setProthesiste({
        id: 1,
        name: 'Sarah Martinez',
        email: 'sarah@nailsrdv.fr',
        specialite: 'Nail Art & French Manucure',
        photo: '👩‍🎨',
        phone: '01.23.45.67.89',
        address: '123 Rue de la Beauté, Paris',
        rating: 4.9
      });
      setLoading(false);
    }, 1000);
  }, []);

  return {
    prothesiste,
    loading,
    getAuthHeaders: () => ({ 'Authorization': 'Bearer fake-token' }),
    logout: () => alert('Déconnexion simulée')
  };
};

// Composant principal du dashboard
const ProthesisteDashboard = ({ onBack }) => {
  const { prothesiste, loading, getAuthHeaders, logout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [data, setData] = useState({
    appointments: [],
    stats: {
      todayAppointments: 0,
      weekRevenue: 0,
      totalClients: 0,
      averageRating: 0,
      nextAppointment: null
    }
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (prothesiste) {
      fetchDashboardData();
    }
  }, [prothesiste]);

  const fetchDashboardData = async () => {
    try {
      // Récupération des rendez-vous
      const appointmentsResponse = await fetch(`${API_BASE_URL}/prothesiste/appointments`, {
        headers: getAuthHeaders()
      });
      
      if (appointmentsResponse.ok) {
        const appointments = await appointmentsResponse.json();
        setData(prev => ({ ...prev, appointments }));
      }

      // Récupération des statistiques
      const statsResponse = await fetch(`${API_BASE_URL}/prothesiste/stats`, {
        headers: getAuthHeaders()
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setData(prev => ({ ...prev, stats }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Données de fallback pour la démonstration
      setData({
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
            status: 'confirmed',
            notes: 'Première visite'
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
          },
          {
            id: 3,
            client_name: 'Sophie Leblanc',
            client_phone: '06 11 22 33 44',
            date: '2025-09-02',
            time: '09:00',
            duration: 75,
            service: { name: 'French Manucure', icon: '🤍' },
            price: 32,
            status: 'pending'
          }
        ],
        stats: {
          todayAppointments: 2,
          weekRevenue: 520,
          totalClients: 45,
          averageRating: 4.8,
          nextAppointment: '10:00'
        }
      });
    }
  };

  const menuItems = [
    { key: 'overview', label: 'Tableau de bord', icon: '📊', count: null },
    { key: 'appointments', label: 'Rendez-vous', icon: '📅', count: data.appointments.length },
    { key: 'availability', label: 'Disponibilités', icon: '🕐', count: null },
    { key: 'services', label: 'Mes Services', icon: '⭐', count: null },
    { key: 'clients', label: 'Mes Clientes', icon: '👥', count: data.stats.totalClients },
    { key: 'profile', label: 'Mon Profil', icon: '⚙️', count: null }
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #ec4899',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Chargement de votre espace professionnel...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        width: sidebarCollapsed ? '64px' : '256px',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}>
        {/* Header sidebar */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {!sidebarCollapsed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '32px' }}>{prothesiste?.photo}</div>
                <div>
                  <h2 style={{
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {prothesiste?.name}
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {prothesiste?.specialite}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{
                display: 'inline-block',
                transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                fontSize: '20px'
              }}>
                ←
              </span>
            </button>
          </div>
        </div>

        {/* Menu navigation */}
        <nav style={{ marginTop: '16px' }}>
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: currentView === item.key ? '#fdf2f8' : 'transparent',
                color: currentView === item.key ? '#ec4899' : '#6b7280',
                borderRight: currentView === item.key ? '2px solid #ec4899' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.key) {
                  e.target.style.backgroundColor = '#fdf2f8';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.key) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px', marginRight: '12px' }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.count !== null && (
                    <span style={{
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '9999px'
                    }}>
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              color: '#6b7280',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fef2f2';
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🚪</span>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top bar */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  color: '#6b7280',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ec4899';
                  e.target.style.backgroundColor = '#fdf2f8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '20px' }}>←</span>
                <span>Retour à l'accueil</span>
              </button>
              
              <div style={{
                height: '24px',
                width: '1px',
                backgroundColor: '#d1d5db'
              }}></div>
              
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  {currentView === 'overview' ? '👋 Bonjour Sarah !' : getViewTitle(currentView)}
                </h1>
                <p style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px'
                }}>
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button style={{
                position: 'relative',
                padding: '8px',
                color: '#9ca3af',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '24px'
              }}>
                🔔
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  display: 'block',
                  height: '8px',
                  width: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f87171'
                }}></span>
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <span style={{ color: '#fbbf24' }}>⭐</span>
                <span style={{ fontWeight: '500' }}>{prothesiste?.rating}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {currentView === 'overview' && <OverviewView data={data} />}
          {currentView === 'appointments' && <AppointmentsView appointments={data.appointments} />}
          {currentView === 'availability' && <AvailabilityView />}
          {currentView === 'services' && <ServicesView />}
          {currentView === 'clients' && <ClientsView />}
          {currentView === 'profile' && <ProfileView prothesiste={prothesiste} />}
        </main>
      </div>
    </div>
  );
};

const getViewTitle = (view) => {
  const titles = {
    appointments: '📅 Mes Rendez-vous',
    availability: '🕐 Mes Disponibilités',
    services: '💅 Mes Services',
    clients: '👥 Mes Clientes',
    profile: '👤 Mon Profil'
  };
  return titles[view] || 'Dashboard';
};

// Vue d'ensemble
const OverviewView = ({ data }) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAppointments = data.appointments.filter(apt => apt.date === todayDate);
  const upcomingAppointments = data.appointments
    .filter(apt => new Date(`${apt.date}T${apt.time}`) > new Date())
    .slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px'
      }}>
        <StatCard
          title="RDV Aujourd'hui"
          value={todayAppointments.length}
          icon="📅"
          color="#3b82f6"
          trend="+2 depuis hier"
        />
        <StatCard
          title="Revenus Semaine"
          value={`${data.stats.weekRevenue}€`}
          icon="💰"
          color="#10b981"
          trend="+12% vs semaine dernière"
        />
        <StatCard
          title="Clientes Fidèles"
          value={data.stats.totalClients}
          icon="👥"
          color="#8b5cf6"
          trend="+3 ce mois"
        />
        <StatCard
          title="Note Moyenne"
          value={data.stats.averageRating}
          icon="⭐"
          color="#f59e0b"
          trend="⭐ Excellent"
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* Prochains rendez-vous */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>
              🔮 Prochains rendez-vous
            </h3>
            <button style={{
              color: '#ec4899',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}>
              Voir tout
            </button>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingAppointments.map(apt => (
                <div key={apt.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '32px' }}>{apt.service.icon}</div>
                    <div>
                      <div style={{
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {apt.client_name}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {apt.service.name}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: '500',
                      color: '#111827'
                    }}>
                      {apt.time}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {apt.price}€
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{
              color: '#6b7280',
              textAlign: 'center',
              padding: '32px 0'
            }}>
              Aucun rendez-vous à venir
            </p>
          )}
        </div>

        {/* Actions rapides */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 16px 0'
          }}>
            ⚡ Actions rapides
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickActionButton
              icon="🚫"
              title="Bloquer un créneau"
              description="Marquer une indisponibilité"
            />
            <QuickActionButton
              icon="💅"
              title="Ajouter un service"
              description="Nouveau service à votre catalogue"
            />
            <QuickActionButton
              icon="📊"
              title="Voir les statistiques"
              description="Analyse de vos performances"
            />
            <QuickActionButton
              icon="💬"
              title="Messages clients"
              description="2 nouveaux messages"
              badge="2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 4px 0'
        }}>
          {title}
        </p>
        <p style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          margin: 0
        }}>
          {value}
        </p>
        {trend && (
          <p style={{
            fontSize: '12px',
            color: '#059669',
            margin: '4px 0 0 0'
          }}>
            {trend}
          </p>
        )}
      </div>
      <div style={{
        backgroundColor: color,
        padding: '12px',
        borderRadius: '8px',
        fontSize: '24px'
      }}>
        {icon}
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ icon, title, description, badge }) => (
  <button style={{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s ease'
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#fdf2f8'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
  >
    <span style={{ fontSize: '32px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{
        fontWeight: '500',
        color: '#111827'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#6b7280'
      }}>
        {description}
      </div>
    </div>
    {badge && (
      <span style={{
        backgroundColor: '#ec4899',
        color: 'white',
        fontSize: '12px',
        padding: '2px 8px',
        borderRadius: '9999px'
      }}>
        {badge}
      </span>
    )}
  </button>
);

// Autres vues (simplifiées pour l'exemple)
const AppointmentsView = ({ appointments }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px'
  }}>
    <h2 style={{
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 16px 0'
    }}>
      Gestion des rendez-vous
    </h2>
    {appointments.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {appointments.map(apt => (
          <div key={apt.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontWeight: '500', margin: '0 0 4px 0' }}>
                  {apt.client_name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {apt.service.name} - {apt.date} à {apt.time}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>
                  {apt.price}€
                </p>
                <span style={{
                  padding: '2px 8px',
                  fontSize: '12px',
                  borderRadius: '9999px',
                  backgroundColor: apt.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                  color: apt.status === 'confirmed' ? '#065f46' : '#92400e'
                }}>
                  {apt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p style={{
        textAlign: 'center',
        color: '#6b7280',
        padding: '32px 0'
      }}>
        Aucun rendez-vous prévu
      </p>
    )}
  </div>
);

const AvailabilityView = () => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px'
  }}>
    <h2 style={{
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 16px 0'
    }}>
      Gestion des disponibilités
    </h2>
    <p style={{ color: '#6b7280' }}>
      Interface de gestion des horaires et indisponibilités
    </p>
  </div>
);

const ServicesView = () => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px'
  }}>
    <h2 style={{
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 16px 0'
    }}>
      Mes services
    </h2>
    <p style={{ color: '#6b7280' }}>
      Gestion de votre catalogue de services
    </p>
  </div>
);

const ClientsView = () => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px'
  }}>
    <h2 style={{
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 16px 0'
    }}>
      Mes clientes
    </h2>
    <p style={{ color: '#6b7280' }}>
      Liste et historique de vos clientes
    </p>
  </div>
);

const ProfileView = ({ prothesiste }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px'
  }}>
    <h2 style={{
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 16px 0'
    }}>
      Mon profil
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ fontSize: '64px' }}>{prothesiste?.photo}</div>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            margin: 0
          }}>
            {prothesiste?.name}
          </h3>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            {prothesiste?.specialite}
          </p>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Email
          </label>
          <p style={{
            color: '#111827',
            margin: 0
          }}>
            {prothesiste?.email}
          </p>
        </div>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Téléphone
          </label>
          <p style={{
            color: '#111827',
            margin: 0
          }}>
            {prothesiste?.phone}
          </p>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Adresse
          </label>
          <p style={{
            color: '#111827',
            margin: 0
          }}>
            {prothesiste?.address}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Export du composant principal avec une prop onBack
export default function DashboardWrapper() {
  const [showDashboard, setShowDashboard] = useState(true);

  if (!showDashboard) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 16px 0'
          }}>
            ✨ Accueil NailSpace
          </h1>
          <button
            onClick={() => setShowDashboard(true)}
            style={{
              backgroundColor: '#ec4899',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#be185d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ec4899'}
          >
            Accéder à mon espace pro
          </button>
        </div>
      </div>
    );
  }

  return <ProthesisteDashboard onBack={() => setShowDashboard(false)} />;
}