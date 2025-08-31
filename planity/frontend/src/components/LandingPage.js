import React, { useState, useEffect } from 'react';
import '../css/LandingPage.css';

function LandingPage({ onSelectProthesiste, onLogin, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [prothesistes, setProthesistes] = useState([]);
  const [filteredProthesistes, setFilteredProthesistes] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProthesistes();
  }, []);

  useEffect(() => {
    filterProthesistes();
  }, [searchTerm, prothesistes]);

  const fetchProthesistes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesistes`);
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      setProthesistes(data);
    } catch (err) {
      // Données de fallback étendues
      setProthesistes([
        {
          id: 1,
          name: 'Sarah Martinez',
          specialite: 'Nail Art & French Manucure',
          experience: '5 ans',
          photo: '👩‍🎨',
          rating: 4.9,
          disponibilite: 'Disponible aujourd\'hui',
          services: ['Nail Art', 'French Manucure', 'Pose Gel']
        },
        {
          id: 2,
          name: 'Marie Dubois',
          specialite: 'Pose Gel & Extensions',
          experience: '7 ans',
          photo: '💅',
          rating: 4.8,
          disponibilite: 'Disponible demain',
          services: ['Pose Gel', 'Extensions', 'Pédicure']
        },
        {
          id: 3,
          name: 'Emma Rousseau',
          specialite: 'Soins & Pédicure',
          experience: '4 ans',
          photo: '🦶',
          rating: 4.7,
          disponibilite: 'Disponible cette semaine',
          services: ['Pédicure', 'Manucure Classique']
        },
        {
          id: 4,
          name: 'Léa Moreau',
          specialite: 'Extensions & Nail Art',
          experience: '6 ans',
          photo: '💎',
          rating: 4.9,
          disponibilite: 'Disponible aujourd\'hui',
          services: ['Extensions', 'Nail Art', 'Pose Gel']
        },
        {
          id: 5,
          name: 'Camille Blanc',
          specialite: 'French & Soins naturels',
          experience: '3 ans',
          photo: '🌸',
          rating: 4.6,
          disponibilite: 'Disponible demain',
          services: ['French Manucure', 'Manucure Classique']
        },
        {
          id: 6,
          name: 'Jade Laurent',
          specialite: 'Gel & Réparation',
          experience: '8 ans',
          photo: '✨',
          rating: 4.8,
          disponibilite: 'Disponible cette semaine',
          services: ['Pose Gel', 'Extensions']
        }
      ]);
    }
    setLoading(false);
  };

  const filterProthesistes = () => {
    if (!searchTerm.trim()) {
      setFilteredProthesistes(prothesistes);
      return;
    }

    const filtered = prothesistes.filter(prothesiste =>
      prothesiste.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prothesiste.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prothesiste.services?.some(service => 
        service.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredProthesistes(filtered);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulation de connexion
    if (loginForm.email && loginForm.password) {
      onLogin({ email: loginForm.email, name: 'Utilisateur' });
      setShowLogin(false);
      setLoginForm({ email: '', password: '' });
    }
  };

  if (loading) {
    return (
      <div className="landing-container">
        <div className="loading-state">
          <div className="loading-spinner">💅</div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      {/* Header avec connexion */}
      <header className="landing-header">
        <div className="header-content">
          <h1 className="brand-title">✨ NailSpace</h1>
          {!user ? (
            <button 
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              Se connecter
            </button>
          ) : (
            <div className="user-welcome">
              <span className="welcome-text">👋 Bonjour {user.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Hero section */}
      <section className="hero">
        <div className="hero-content">
          <h2 className="hero-title">Trouvez votre prothésiste ongulaire</h2>
          <p className="hero-subtitle">Des expertes passionnées pour sublimer vos ongles</p>
          
          {/* Barre de recherche */}
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Rechercher par nom, spécialité ou service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>
        </div>
      </section>

      {/* Résultats de recherche */}
      <section className="results">
        <div className="results-header">
          <h3 className="results-title">
            {searchTerm ? 
              `${filteredProthesistes.length} résultat${filteredProthesistes.length > 1 ? 's' : ''} pour "${searchTerm}"` :
              `${prothesistes.length} prothésistes disponibles`
            }
          </h3>
        </div>

        <div className="prothesistes-grid">
          {filteredProthesistes.map(prothesiste => (
            <div key={prothesiste.id} className="prothesiste-card">
              <div className="card-header">
                <div className="avatar">{prothesiste.photo}</div>
                <div className="rating">⭐ {prothesiste.rating}</div>
              </div>
              
              <h4 className="prothesiste-name">{prothesiste.name}</h4>
              <p className="specialite">{prothesiste.specialite}</p>
              <p className="experience">{prothesiste.experience}</p>
              
              <div className="services">
                {prothesiste.services?.slice(0, 2).map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
                ))}
                {prothesiste.services?.length > 2 && (
                  <span className="service-tag more">+{prothesiste.services.length - 2}</span>
                )}
              </div>
              
              <div className="disponibilite">
                <span className="status-dot"></span>
                {prothesiste.disponibilite}
              </div>
              
              <button 
                className="book-btn"
                onClick={() => onSelectProthesiste(prothesiste)}
              >
                Réserver
              </button>
            </div>
          ))}
        </div>

        {filteredProthesistes.length === 0 && searchTerm && (
          <div className="no-results">
            <p>Aucune prothésiste ne correspond à votre recherche</p>
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              Voir toutes les prothésistes
            </button>
          </div>
        )}
      </section>

      {/* Modal de connexion */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Se connecter</h3>
              <button 
                className="close-btn"
                onClick={() => setShowLogin(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({...prev, password: e.target.value}))}
                  required
                />
              </div>
              
              <button type="submit" className="submit-btn">
                Se connecter
              </button>
            </form>
            
            <p className="signup-link">
              Pas encore de compte ? <a href="#signup">S'inscrire</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;