import React, { useState, useEffect } from 'react';
import '../css/HomePage.css';

function HomePage({ onSelectProthesiste }) {
  const [prothesistes, setProthesistes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration de l'API
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProthesistes();
    fetchServices();
  }, []);

  const fetchProthesistes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesistes`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des prothésistes');
      }
      const data = await response.json();
      setProthesistes(data);
    } catch (err) {
      setError(err.message);
      // Fallback avec des données statiques en cas d'erreur
      setProthesistes([
        {
          id: 1,
          name: 'Sarah Martinez',
          specialite: 'Nail Art & French Manucure',
          experience: '5 ans d\'expérience',
          photo: '👩‍🎨',
          description: 'Spécialiste en nail art créatif et french manucure perfectionnée',
          services: ['Nail Art', 'French Manucure', 'Pose Gel', 'Manucure Classique'],
          rating: 4.9,
          disponibilite: 'Disponible aujourd\'hui'
        },
        {
          id: 2,
          name: 'Marie Dubois',
          specialite: 'Pose Gel & Extensions',
          experience: '7 ans d\'expérience',
          photo: '💅',
          description: 'Experte en pose gel et extensions d\'ongles pour des résultats durables',
          services: ['Pose Gel', 'Extensions', 'Réparation', 'Pédicure'],
          rating: 4.8,
          disponibilite: 'Disponible demain'
        },
        {
          id: 3,
          name: 'Emma Rousseau',
          specialite: 'Soins & Pédicure',
          experience: '4 ans d\'expérience',
          photo: '🦶',
          description: 'Spécialisée dans les soins complets des pieds et des mains',
          services: ['Pédicure', 'Soins des pieds', 'Manucure Classique', 'French'],
          rating: 4.7,
          disponibilite: 'Disponible cette semaine'
        }
      ]);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des services');
      }
      const data = await response.json();
      setServices(data);
    } catch (err) {
      // Fallback avec des données statiques
      setServices([
        { name: 'Manucure Classique', icon: '💅', prix: 'À partir de 25€' },
        { name: 'Pose Gel', icon: '✨', prix: 'À partir de 35€' },
        { name: 'Nail Art', icon: '🎨', prix: 'À partir de 40€' },
        { name: 'French Manucure', icon: '🤍', prix: 'À partir de 30€' },
        { name: 'Pédicure', icon: '🦶', prix: 'À partir de 35€' },
        { name: 'Extensions', icon: '💎', prix: 'À partir de 50€' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProthesiste = (prothesiste) => {
    onSelectProthesiste(prothesiste);
  };

  if (loading) {
    return (
      <div className="homepage">
        <div className="loading-container">
          <div className="loading-spinner">💅</div>
          <p>Chargement des prothésistes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Message d'erreur si problème avec l'API */}
      {error && (
        <div className="error-banner">
          <p>⚠️ Connexion à l'API limitée. Affichage des données de démonstration.</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">✨ Prenez rendez-vous avec nos expertes</h1>
          <p className="hero-subtitle">
            Choisissez votre prothésiste ongulaire et réservez en quelques clics
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Clientes satisfaites</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.8/5</span>
              <span className="stat-label">Note moyenne</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{prothesistes.length}</span>
              <span className="stat-label">Expertes diplômées</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2 className="section-title">🎯 Nos Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-price">{service.prix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prothésistes Section */}
      <section className="prothesistes-section">
        <h2 className="section-title">👩‍🎨 Choisissez votre prothésiste</h2>
        <p className="section-subtitle">
          Sélectionnez l'experte qui correspond à vos besoins
        </p>
        
        <div className="prothesistes-grid">
          {prothesistes.map((prothesiste) => (
            <div key={prothesiste.id} className="prothesiste-card">
              <div className="prothesiste-header">
                <div className="prothesiste-photo">{prothesiste.photo}</div>
                <div className="prothesiste-info">
                  <h3 className="prothesiste-name">{prothesiste.name}</h3>
                  <p className="prothesiste-specialite">{prothesiste.specialite}</p>
                  <p className="prothesiste-experience">{prothesiste.experience}</p>
                </div>
                <div className="prothesiste-rating">
                  <span className="rating-stars">⭐</span>
                  <span className="rating-value">{prothesiste.rating}</span>
                </div>
              </div>

              <p className="prothesiste-description">{prothesiste.description}</p>

              <div className="prothesiste-services">
                <h4>Services proposés:</h4>
                <div className="services-tags">
                  {prothesiste.services.map((service, index) => (
                    <span key={index} className="service-tag">{service}</span>
                  ))}
                </div>
              </div>

              <div className="prothesiste-disponibilite">
                <span className="disponibilite-icon">🕐</span>
                <span className="disponibilite-text">{prothesiste.disponibilite}</span>
              </div>

              <button
                className="select-prothesiste-btn"
                onClick={() => handleSelectProthesiste(prothesiste)}
              >
                Prendre rendez-vous avec {prothesiste.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-content">
          <h2 className="info-title">💡 Pourquoi choisir notre salon ?</h2>
          <div className="info-points">
            <div className="info-point">
              <span className="info-icon">✅</span>
              <div>
                <h4>Expertes certifiées</h4>
                <p>Toutes nos prothésistes sont diplômées et régulièrement formées aux dernières techniques</p>
              </div>
            </div>
            <div className="info-point">
              <span className="info-icon">🏆</span>
              <div>
                <h4>Produits de qualité</h4>
                <p>Nous utilisons uniquement des produits haut de gamme pour des résultats durables</p>
              </div>
            </div>
            <div className="info-point">
              <span className="info-icon">🕐</span>
              <div>
                <h4>Réservation flexible</h4>
                <p>Prenez rendez-vous 24h/24 et modifiez facilement vos créneaux</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;