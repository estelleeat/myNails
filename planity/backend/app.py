# app.py - Backend Flask pour l'application de rendez-vous ongles
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, date, time
import re
from typing import Optional, List, Dict
from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()
db_user = os.getenv('DB_USER')
db_pass = os.getenv('DB_PASS')
db_name = os.getenv('DB_NAME')

if db_pass == "" or db_pass is None:
    uri = f"mysql://{db_user}@localhost/{db_name}"
else:
    uri = f"mysql://{db_user}:{db_pass}@localhost/{db_name}"

app.config['SQLALCHEMY_DATABASE_URI'] = uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)  # Permet les requêtes cross-origin depuis le frontend React

# Modèles de base de données
class Prothesiste(db.Model):
    __tablename__ = 'prothesistes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialite = db.Column(db.String(200), nullable=False)
    experience = db.Column(db.String(50), nullable=False)
    photo = db.Column(db.String(10), nullable=False)
    description = db.Column(db.Text)
    rating = db.Column(db.Float, default=0.0)
    disponibilite = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    appointments = db.relationship('Appointment', backref='prothesiste_obj', lazy=True)
    services = db.relationship('Service', secondary='prothesiste_services', backref='prothesistes')

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(10), nullable=False)
    prix_min = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ProthesisteService(db.Model):
    __tablename__ = 'prothesiste_services'
    
    id = db.Column(db.Integer, primary_key=True)
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    appointments = db.relationship('Appointment', backref='client_obj', lazy=True)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.Enum('en_attente', 'confirme', 'annule', 'termine'), default='confirme')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    service_obj = db.relationship('Service', backref='appointments')

# Fonctions utilitaires
def validate_phone(phone: str) -> bool:
    """Valide le format du numéro de téléphone français"""
    phone_clean = re.sub(r'[\s\-\+\(\)]', '', phone)
    return re.match(r'^(?:\+33|0)[1-9](?:[0-9]{8})$', phone_clean) is not None

def serialize_prothesiste(prothesiste: Prothesiste) -> Dict:
    """Sérialise un prothésiste avec ses services"""
    services_list = [service.name for service in prothesiste.services]
    return {
        'id': prothesiste.id,
        'name': prothesiste.name,
        'specialite': prothesiste.specialite,
        'experience': prothesiste.experience,
        'photo': prothesiste.photo,
        'description': prothesiste.description,
        'rating': prothesiste.rating,
        'disponibilite': prothesiste.disponibilite,
        'services': services_list
    }

def serialize_appointment(appointment: Appointment) -> Dict:
    """Sérialise un rendez-vous avec toutes les informations"""
    return {
        'id': appointment.id,
        'name': appointment.client_obj.name,
        'phone': appointment.client_obj.phone,
        'date': appointment.appointment_date.isoformat(),
        'time': appointment.appointment_time.strftime('%H:%M'),
        'service': appointment.service_obj.code,
        'status': 'confirmé' if appointment.status == 'confirme' else appointment.status,
        'prothesiste': serialize_prothesiste(appointment.prothesiste_obj)
    }

# Routes API
@app.route('/api/prothesistes', methods=['GET'])
def get_prothesistes():
    """Récupère la liste des prothésistes avec leurs services"""
    try:
        prothesistes = Prothesiste.query.all()
        return jsonify([serialize_prothesiste(p) for p in prothesistes])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services', methods=['GET'])
def get_services():
    """Récupère la liste des services"""
    try:
        services = Service.query.all()
        return jsonify([{
            'id': s.id,
            'code': s.code,
            'name': s.name,
            'icon': s.icon,
            'prix': f'À partir de {s.prix_min}€' if s.prix_min else 'Prix sur demande'
        } for s in services])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Récupère tous les rendez-vous"""
    try:
        appointments = Appointment.query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()
        return jsonify([serialize_appointment(apt) for apt in appointments])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Crée un nouveau rendez-vous"""
    try:
        data = request.json
        
        # Validation des données
        required_fields = ['name', 'phone', 'date', 'time', 'service', 'prothesisteId']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Le champ {field} est obligatoire'}), 400
        
        # Validation du téléphone
        if not validate_phone(data['phone']):
            return jsonify({'error': 'Format de téléphone invalide'}), 400
        
        # Validation de la date
        try:
            appointment_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            if appointment_date < date.today():
                return jsonify({'error': 'La date ne peut pas être dans le passé'}), 400
        except ValueError:
            return jsonify({'error': 'Format de date invalide'}), 400
        
        # Validation de l'heure
        try:
            appointment_time = datetime.strptime(data['time'], '%H:%M').time()
        except ValueError:
            return jsonify({'error': 'Format d\'heure invalide'}), 400
        
        # Vérification que la prothésiste existe
        prothesiste = Prothesiste.query.get(data['prothesisteId'])
        if not prothesiste:
            return jsonify({'error': 'Prothésiste non trouvée'}), 404
        
        # Vérification que le service existe
        service = Service.query.filter_by(code=data['service']).first()
        if not service:
            return jsonify({'error': 'Service non trouvé'}), 404
        
        # Vérification de la disponibilité (pas de double réservation)
        existing_appointment = Appointment.query.filter_by(
            prothesiste_id=data['prothesisteId'],
            appointment_date=appointment_date,
            appointment_time=appointment_time
        ).first()
        
        if existing_appointment:
            return jsonify({'error': 'Ce créneau est déjà réservé'}), 409
        
        # Créer ou récupérer le client
        client = Client.query.filter_by(phone=data['phone']).first()
        if not client:
            client = Client(
                name=data['name'].strip(),
                phone=data['phone'].strip()
            )
            db.session.add(client)
            db.session.flush()  # Pour obtenir l'ID
        else:
            # Mettre à jour le nom si différent
            if client.name != data['name'].strip():
                client.name = data['name'].strip()
        
        # Créer le rendez-vous
        appointment = Appointment(
            client_id=client.id,
            prothesiste_id=data['prothesisteId'],
            service_id=service.id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status='confirme',
            notes=data.get('notes', '')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Rendez-vous créé avec succès',
            'appointment': serialize_appointment(appointment)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la création: {str(e)}'}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Supprime un rendez-vous"""
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'error': 'Rendez-vous non trouvé'}), 404
        
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({'message': 'Rendez-vous supprimé avec succès'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la suppression: {str(e)}'}), 500

@app.route('/api/appointments/<int:appointment_id>/status', methods=['PATCH'])
def update_appointment_status(appointment_id):
    """Met à jour le statut d'un rendez-vous"""
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'error': 'Rendez-vous non trouvé'}), 404
        
        data = request.json
        new_status = data.get('status')
        
        valid_statuses = ['en_attente', 'confirme', 'annule', 'termine']
        if new_status not in valid_statuses:
            return jsonify({'error': 'Statut invalide'}), 400
        
        appointment.status = new_status
        db.session.commit()
        
        return jsonify({
            'message': 'Statut mis à jour avec succès',
            'appointment': serialize_appointment(appointment)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la mise à jour: {str(e)}'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Récupère les statistiques du salon"""
    try:
        total_appointments = Appointment.query.count()
        total_clients = Client.query.count()
        total_prothesistes = Prothesiste.query.count()
        
        # Rendez-vous à venir
        upcoming_appointments = Appointment.query.filter(
            Appointment.appointment_date >= date.today()
        ).count()
        
        return jsonify({
            'total_appointments': total_appointments,
            'total_clients': total_clients,
            'total_prothesistes': total_prothesistes,
            'upcoming_appointments': upcoming_appointments
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route de test
@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état de l'API"""
    return jsonify({
        'status': 'OK',
        'message': 'API Nails RDV is running',
        'timestamp': datetime.utcnow().isoformat()
    })

# Gestion des erreurs
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint non trouvé'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Erreur interne du serveur'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Créer les tables si elles n'existent pas
    
    app.run(debug=True, host='0.0.0.0', port=5000)