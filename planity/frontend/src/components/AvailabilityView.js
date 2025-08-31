// AvailabilityView.js - Gestion des disponibilités
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AvailabilityView = ({ availability, onSave }) => {
  const [availabilityData, setAvailabilityData] = useState({});
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: '',
    is_full_day: false
  });
  const { getAuthHeaders } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const daysOfWeek = [
    { key: 'monday', label: 'Lundi', icon: '📅' },
    { key: 'tuesday', label: 'Mardi', icon: '📅' },
    { key: 'wednesday', label: 'Mercredi', icon: '📅' },
    { key: 'thursday', label: 'Jeudi', icon: '📅' },
    { key: 'friday', label: 'Vendredi', icon: '📅' },
    { key: 'saturday', label: 'Samedi', icon: '🎯' },
    { key: 'sunday', label: 'Dimanche', icon: '🏖️' }
  ];

  useEffect(() => {
    initializeAvailability();
    fetchBlockedSlots();
  }, [availability]);

  const initializeAvailability = () => {
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
  };

  const fetchBlockedSlots = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/blocked-slots`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setBlockedSlots(data);
      }
    } catch (error) {
      console.error('Error fetching blocked slots:', error);
      // Données de démonstration
      setBlockedSlots([
        {
          id: 1,
          date: '2025-09-05',
          start_time: '12:00',
          end_time: '14:00',
          reason: 'Pause déjeuner',
          is_full_day: false
        }
      ]);
    }
  };

  const handleAvailabilityChange = (day, field, value) => {
    setAvailabilityData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveAvailability = async () => {
    try {
      const formattedData = Object.entries(availabilityData)
        .filter(([_, data]) => data.is_available)
        .map(([day, data]) => ({
          day_of_week: day,
          start_time: data.start_time,
          end_time: data.end_time,
          is_available: true
        }));

      const response = await fetch(`${API_BASE_URL}/prothesiste/availability`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ availability: formattedData })
      });

      if (response.ok) {
        alert('✅ Disponibilités mises à jour avec succès');
        onSave();
      } else {
        const data = await response.json();
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const handleAddBlockedSlot = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/blocked-slots`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      });

      if (response.ok) {
        setShowAddBlock(false);
        setNewBlock({
          date: '',
          start_time: '',
          end_time: '',
          reason: '',
          is_full_day: false
        });
        fetchBlockedSlots();
        alert('✅ Créneau bloqué avec succès');
      } else {
        const data = await response.json();
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors du blocage');
    }
  };

  const handleDeleteBlockedSlot = async (slotId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce blocage ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/prothesiste/blocked-slots/${slotId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        fetchBlockedSlots();
        alert('✅ Blocage supprimé');
      }
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  return (
    <div className="availability-view">
      <div className="view-header">
        <h2>🕐 Mes Disponibilités</h2>
        <p>Définissez vos horaires de travail et gérez vos indisponibilités</p>
      </div>

      {/* Disponibilités hebdomadaires */}
      <div className="section">
        <h3>📅 Horaires de travail hebdomadaires</h3>
        <div className="availability-grid">
          {daysOfWeek.map(day => (
            <div key={day.key} className={`availability-day ${availabilityData[day.key]?.is_available ? 'available' : 'unavailable'}`}>
              <div className="day-header">
                <div className="day-info">
                  <span className="day-icon">{day.icon}</span>
                  <span className="day-name">{day.label}</span>
                </div>
                <button
                  className={`availability-toggle ${availabilityData[day.key]?.is_available ? 'active' : ''}`}
                  onClick={() => handleAvailabilityChange(day.key, 'is_available', !availabilityData[day.key]?.is_available)}
                >
                  {availabilityData[day.key]?.is_available ? 'Ouvert' : 'Fermé'}
                </button>
              </div>

              {availabilityData[day.key]?.is_available && (
                <div className="time-inputs">
                  <div className="time-group">
                    <label>Ouverture</label>
                    <input
                      type="time"
                      value={availabilityData[day.key]?.start_time || '09:00'}
                      onChange={(e) => handleAvailabilityChange(day.key, 'start_time', e.target.value)}
                    />
                  </div>
                  <div className="time-group">
                    <label>Fermeture</label>
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

        <button onClick={handleSaveAvailability} className="save-btn primary">
          💾 Sauvegarder les horaires
        </button>
      </div>

      {/* Créneaux bloqués */}
      <div className="section">
        <div className="section-header">
          <h3>🚫 Créneaux bloqués / Congés</h3>
          <button
            onClick={() => setShowAddBlock(true)}
            className="add-btn"
          >
            ➕ Bloquer un créneau
          </button>
        </div>

        <div className="blocked-slots">
          {blockedSlots.length > 0 ? (
            blockedSlots.map(slot => (
              <div key={slot.id} className="blocked-slot">
                <div className="slot-info">
                  <div className="slot-date">
                    📅 {new Date(slot.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="slot-time">
                    {slot.is_full_day ? 
                      '⏰ Journée complète' : 
                      `⏰ ${slot.start_time} - ${slot.end_time}`
                    }
                  </div>
                  <div className="slot-reason">
                    {slot.reason && (
                      <span>📝 {slot.reason}</span>
                    )}
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteBlockedSlot(slot.id)}
                  title="Supprimer ce créneau bloqué"
                >
                  ❌
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Aucun créneau bloqué pour l’instant.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de créneau bloqué */}
      {showAddBlock && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>➕ Bloquer un créneau</h4>
            <div className="modal-content">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newBlock.date}
                  onChange={e => setNewBlock({ ...newBlock, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newBlock.is_full_day}
                    onChange={e => setNewBlock({ ...newBlock, is_full_day: e.target.checked })}
                  />
                  Journée complète
                </label>
              </div>
              {!newBlock.is_full_day && (
                <div className="form-group time-range">
                  <div>
                    <label>Début</label>
                    <input
                      type="time"
                      value={newBlock.start_time}
                      onChange={e => setNewBlock({ ...newBlock, start_time: e.target.value })}
                      required={!newBlock.is_full_day}
                    />
                  </div>
                  <div>
                    <label>Fin</label>
                    <input
                      type="time"
                      value={newBlock.end_time}
                      onChange={e => setNewBlock({ ...newBlock, end_time: e.target.value })}
                      required={!newBlock.is_full_day}
                    />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Raison (optionnel)</label>
                <input
                  type="text"
                  value={newBlock.reason}
                  onChange={e => setNewBlock({ ...newBlock, reason: e.target.value })}
                  placeholder="Ex: Congés, pause, RDV perso..."
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="save-btn"
                onClick={handleAddBlockedSlot}
                disabled={!newBlock.date || (!newBlock.is_full_day && (!newBlock.start_time || !newBlock.end_time))}
              >
                Bloquer
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowAddBlock(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityView;