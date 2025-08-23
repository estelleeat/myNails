import React, { useState } from 'react';
import '../css/AppointmentForm.css';

function AppointmentForm({ onAddAppointment, selectedProthesiste, onBack }) {
  // Vérifier si une prothésiste est sélectionnée
  if (!selectedProthesiste) {
    return (
      <div className="appointment-form-container">
        <div className="no-prothesiste">
          <h2>Aucune prothésiste sélectionnée</h2>
          <p>Veuillez retourner à l'accueil pour choisir une prothésiste.</p>
          <button className="back-button" onClick={onBack}>
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    service: 'manicure'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const services = [
    { value: 'manicure', label: '💅 Manucure Classique' },
    { value: 'pedicure', label: '🦶 Pédicure' },
    { value: 'gel', label: '✨ Pose Gel' },
    { value: 'design', label: '🎨 Nail Art' },
    { value: 'french', label: '🤍 French Manucure' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est obligatoire';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format de téléphone invalide';
    }
    
    if (!formData.date) {
      newErrors.date = 'La date est obligatoire';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'La date ne peut pas être dans le passé';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'L\'heure est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulation d'un délai d'envoi
    setTimeout(() => {
      onAddAppointment({ 
        ...formData, 
        id: Date.now(),
        status: 'confirmé',
        prothesiste: selectedProthesiste
      });
      
      setFormData({
        name: '',
        phone: '',
        date: '',
        time: '',
        service: 'manicure'
      });
      setErrors({});
      setIsSubmitting(false);
      
      // Message de succès
      alert(`🎉 Rendez-vous confirmé avec ${selectedProthesiste.name} !`);
    }, 1000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="appointment-form-container">
      <div className="form-header">
        <button className="back-button" onClick={onBack}>
          ← Changer de prothésiste
        </button>
        
        <div className="selected-prothesiste">
          <div className="prothesiste-photo-small">{selectedProthesiste.photo}</div>
          <div className="prothesiste-details">
            <h3>{selectedProthesiste.name}</h3>
            <p>{selectedProthesiste.specialite}</p>
            <div className="prothesiste-rating-small">
              <span>⭐ {selectedProthesiste.rating}</span>
              <span className="disponibilite-badge">🕐 {selectedProthesiste.disponibilite}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="form-title">✨ Réserver avec {selectedProthesiste.name.split(' ')[0]}</h2>

      <div className="appointment-form">
        <div className="form-group">
          <label className="form-label">Nom complet *</label>
          <input
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Entrez votre nom"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Téléphone *</label>
          <input
            type="tel"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="06 12 34 56 78"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Service désiré</label>
          <select
            className="form-select"
            value={formData.service}
            onChange={(e) => handleChange('service', e.target.value)}
          >
            {services.map(service => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
          <div className="services-info">
            <p>Services proposés par {selectedProthesiste.name.split(' ')[0]} :</p>
            <div className="available-services">
              {selectedProthesiste.services.map((service, index) => (
                <span key={index} className="service-badge">{service}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className={`form-input ${errors.date ? 'error' : ''}`}
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Heure *</label>
            <input
              type="time"
              className={`form-input ${errors.time ? 'error' : ''}`}
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              min="09:00"
              max="18:00"
            />
            {errors.time && <span className="error-message">{errors.time}</span>}
          </div>
        </div>

        <button
          className={`form-button ${isSubmitting ? 'submitting' : ''}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '⏳ Réservation en cours...' : `💅 Réserver avec ${selectedProthesiste.name.split(' ')[0]}`}
        </button>
      </div>

      <p className="form-help">
        📞 Besoin d'aide ? Appelez-nous au 01 23 45 67 89
      </p>
    </div>
  );
}

export default AppointmentForm;