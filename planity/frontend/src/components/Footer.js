import React from 'react';
import '../css/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-sections">
          <div className="footer-section">
            <h3 className="footer-title">💅 Nails Rendez-vous</h3>
            <p className="footer-description">
              Votre salon de beauté spécialisé dans les soins des ongles. 
              Des prestations de qualité dans une ambiance relaxante.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">📞 Contact</h4>
            <div className="footer-contact">
              <div className="contact-item">📱 01 23 45 67 89</div>
              <div className="contact-item">✉️ contact@nailsrdv.fr</div>
              <div className="contact-item">📍 123 Rue de la Beauté, Paris</div>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">⏰ Horaires</h4>
            <div className="footer-hours">
              <div className="hours-item">Lundi - Vendredi: 9h - 19h</div>
              <div className="hours-item">Samedi: 9h - 17h</div>
              <div className="hours-item">Dimanche: Fermé</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Nails Rendez-vous. Tous droits réservés. 
            <span className="footer-separator">|</span>
            Fait avec 💖 pour votre beauté
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;