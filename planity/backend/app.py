# app.py - Backend Flask avec système d'authentification complet
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime, date, time, timedelta
import secrets
import re
from typing import Optional, List, Dict
from functools import wraps
import jwt
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/nails_rdv'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)

# Modèles de base de données
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100))
    reset_token = db.Column(db.String(100))
    reset_token_expires = db.Column(db.DateTime)
    
    # Relations
    appointments = db.relationship('Appointment', backref='user_obj', lazy=True)
    reviews = db.relationship('Review', backref='user_obj', lazy=True)

class Prothesiste(db.Model):
    __tablename__ = 'prothesistes'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    specialite = db.Column(db.String(200), nullable=False)
    experience = db.Column(db.String(50), nullable=False)
    photo = db.Column(db.String(255), default='👩‍🎨')
    description = db.Column(db.Text)
    rating = db.Column(db.Float, default=0.0)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100))
    
    # Relations
    appointments = db.relationship('Appointment', backref='prothesiste_obj', lazy=True)
    services = db.relationship('Service', secondary='prothesiste_services', backref='prothesistes')
    availability = db.relationship('ProthesisteAvailability', backref='prothesiste_obj', lazy=True)
    unavailable_periods = db.relationship('ProthesisteUnavailable', backref='prothesiste_obj', lazy=True)
    reviews = db.relationship('Review', backref='prothesiste_obj', lazy=True)

class ProthesisteAvailability(db.Model):
    __tablename__ = 'prothesiste_availability'
    
    id = db.Column(db.Integer, primary_key=True)
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'), nullable=False)
    day_of_week = db.Column(db.Enum('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProthesisteUnavailable(db.Model):
    __tablename__ = 'prothesiste_unavailable'
    
    id = db.Column(db.Integer, primary_key=True)
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    reason = db.Column(db.String(200))
    is_full_day = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(10), nullable=False)
    duration = db.Column(db.Integer, default=60)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), default='manicure')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class ProthesisteService(db.Model):
    __tablename__ = 'prothesiste_services'
    
    id = db.Column(db.Integer, primary_key=True)
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    custom_price = db.Column(db.Float)
    custom_duration = db.Column(db.Integer)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    duration = db.Column(db.Integer, default=60)
    price = db.Column(db.Float)
    status = db.Column(db.Enum('pending', 'confirmed', 'cancelled', 'completed', 'no_show'), default='confirmed')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    service_obj = db.relationship('Service', backref='appointments')

class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'))
    session_token = db.Column(db.String(255), unique=True, nullable=False)
    user_type = db.Column(db.Enum('user', 'prothesiste'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    prothesiste_id = db.Column(db.Integer, db.ForeignKey('prothesistes.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Fonctions utilitaires
def validate_email(email: str) -> bool:
    """Valide le format de l'email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    """Valide le format du numéro de téléphone français"""
    if not phone:
        return True  # Téléphone optionnel
    phone_clean = re.sub(r'[\s\-\+\(\).]', '', phone)
    return re.match(r'^(?:\+33|0)[1-9](?:[0-9]{8})$', phone_clean) is not None

def generate_token() -> str:
    """Génère un token sécurisé"""
    return secrets.token_urlsafe(32)

def create_jwt_token(user_id: int, user_type: str) -> str:
    """Crée un JWT token"""
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token: str) -> Optional[Dict]:
    """Vérifie un JWT token"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Décorateurs pour l'authentification
def token_required(user_types=['user', 'prothesiste']):
    """Décorateur pour vérifier l'authentification"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'error': 'Token manquant'}), 401
            
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = verify_jwt_token(token)
            if not payload:
                return jsonify({'error': 'Token invalide ou expiré'}), 401
            
            if payload['user_type'] not in user_types:
                return jsonify({'error': 'Accès non autorisé'}), 403
            
            # Ajouter les informations utilisateur à la requête
            request.current_user = payload
            return f(*args, **kwargs)
        return decorated
    return decorator

# Fonctions de sérialisation
def serialize_user(user: User) -> Dict:
    """Sérialise un utilisateur"""
    return {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
        'email_verified': user.email_verified,
        'created_at': user.created_at.isoformat()
    }

def serialize_prothesiste(prothesiste: Prothesiste, include_sensitive=False) -> Dict:
    """Sérialise un prothésiste"""
    data = {
        'id': prothesiste.id,
        'name': prothesiste.name,
        'specialite': prothesiste.specialite,
        'experience': prothesiste.experience,
        'photo': prothesiste.photo,
        'description': prothesiste.description,
        'rating': prothesiste.rating,
        'phone': prothesiste.phone,
        'address': prothesiste.address,
        'is_verified': prothesiste.is_verified
    }
    
    if include_sensitive:
        data.update({
            'email': prothesiste.email,
            'is_active': prothesiste.is_active,
            'created_at': prothesiste.created_at.isoformat()
        })
    
    return data

def serialize_service(service: Service, custom_price=None, custom_duration=None) -> Dict:
    """Sérialise un service"""
    return {
        'id': service.id,
        'code': service.code,
        'name': service.name,
        'description': service.description,
        'icon': service.icon,
        'duration': custom_duration or service.duration,
        'price': custom_price or service.price,
        'category': service.category
    }

def serialize_appointment(appointment: Appointment) -> Dict:
    """Sérialise un rendez-vous"""
    client_name = None
    client_phone = None
    client_email = None
    
    if appointment.user_obj:
        client_name = f"{appointment.user_obj.first_name} {appointment.user_obj.last_name}"
        client_phone = appointment.user_obj.phone
        client_email = appointment.user_obj.email
    elif appointment.client_id:
        client = Client.query.get(appointment.client_id)
        if client:
            client_name = client.name
            client_phone = client.phone
            client_email = client.email
    
    return {
        'id': appointment.id,
        'client_name': client_name,
        'client_phone': client_phone,
        'client_email': client_email,
        'date': appointment.appointment_date.isoformat(),
        'time': appointment.appointment_time.strftime('%H:%M'),
        'duration': appointment.duration,
        'price': appointment.price,
        'service': serialize_service(appointment.service_obj),
        'prothesiste': serialize_prothesiste(appointment.prothesiste_obj),
        'status': appointment.status,
        'notes': appointment.notes,
        'created_at': appointment.created_at.isoformat()
    }

# Routes d'authentification
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """Inscription d'un utilisateur"""
    try:
        data = request.json
        
        # Validation des données
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Le champ {field} est obligatoire'}), 400
        
        # Validation de l'email
        if not validate_email(data['email']):
            return jsonify({'error': 'Format d\'email invalide'}), 400
        
        # Validation du téléphone si fourni
        if data.get('phone') and not validate_phone(data['phone']):
            return jsonify({'error': 'Format de téléphone invalide'}), 400
        
        # Validation du mot de passe
        if len(data['password']) < 6:
            return jsonify({'error': 'Le mot de passe doit contenir au moins 6 caractères'}), 400
        
        # Vérifier si l'utilisateur existe déjà
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Cet email est déjà utilisé'}), 409
        
        # Créer l'utilisateur
        user = User(
            email=data['email'].lower(),
            password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            phone=data.get('phone', '').strip() if data.get('phone') else None,
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date() if data.get('date_of_birth') else None,
            verification_token=generate_token()
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Créer le token JWT
        token = create_jwt_token(user.id, 'user')
        
        return jsonify({
            'message': 'Compte créé avec succès',
            'user': serialize_user(user),
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de l\'inscription: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """Connexion d'un utilisateur"""
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        # Chercher l'utilisateur
        user = User.query.filter_by(email=data['email'].lower()).first()
        
        if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Compte désactivé'}), 401
        
        # Créer le token JWT
        token = create_jwt_token(user.id, 'user')
        
        return jsonify({
            'message': 'Connexion réussie',
            'user': serialize_user(user),
            'token': token
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la connexion: {str(e)}'}), 500

@app.route('/api/auth/prothesiste/register', methods=['POST'])
def register_prothesiste():
    """Inscription d'une prothésiste"""
    try:
        data = request.json
        
        # Validation des données
        required_fields = ['email', 'password', 'name', 'specialite', 'experience']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Le champ {field} est obligatoire'}), 400
        
        # Validation de l'email
        if not validate_email(data['email']):
            return jsonify({'error': 'Format d\'email invalide'}), 400
        
        # Validation du téléphone si fourni
        if data.get('phone') and not validate_phone(data['phone']):
            return jsonify({'error': 'Format de téléphone invalide'}), 400
        
        # Validation du mot de passe
        if len(data['password']) < 6:
            return jsonify({'error': 'Le mot de passe doit contenir au moins 6 caractères'}), 400
        
        # Vérifier si la prothésiste existe déjà
        if Prothesiste.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Cet email est déjà utilisé'}), 409
        
        # Créer la prothésiste
        prothesiste = Prothesiste(
            email=data['email'].lower(),
            password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
            name=data['name'].strip(),
            specialite=data['specialite'].strip(),
            experience=data['experience'].strip(),
            photo=data.get('photo', '👩‍🎨'),
            description=data.get('description', '').strip(),
            phone=data.get('phone', '').strip() if data.get('phone') else None,
            address=data.get('address', '').strip(),
            verification_token=generate_token()
        )
        
        db.session.add(prothesiste)
        db.session.commit()
        
        # Créer le token JWT
        token = create_jwt_token(prothesiste.id, 'prothesiste')
        
        return jsonify({
            'message': 'Compte prothésiste créé avec succès',
            'prothesiste': serialize_prothesiste(prothesiste, include_sensitive=True),
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de l\'inscription: {str(e)}'}), 500

@app.route('/api/auth/prothesiste/login', methods=['POST'])
def login_prothesiste():
    """Connexion d'une prothésiste"""
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        # Chercher la prothésiste
        prothesiste = Prothesiste.query.filter_by(email=data['email'].lower()).first()
        
        if not prothesiste or not bcrypt.check_password_hash(prothesiste.password_hash, data['password']):
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        if not prothesiste.is_active:
            return jsonify({'error': 'Compte désactivé'}), 401
        
        # Créer le token JWT
        token = create_jwt_token(prothesiste.id, 'prothesiste')
        
        return jsonify({
            'message': 'Connexion réussie',
            'prothesiste': serialize_prothesiste(prothesiste, include_sensitive=True),
            'token': token
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la connexion: {str(e)}'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@token_required()
def get_profile():
    """Récupère le profil de l'utilisateur connecté"""
    try:
        user_type = request.current_user['user_type']
        user_id = request.current_user['user_id']
        
        if user_type == 'user':
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'Utilisateur non trouvé'}), 404
            return jsonify({'user': serialize_user(user)})
        
        elif user_type == 'prothesiste':
            prothesiste = Prothesiste.query.get(user_id)
            if not prothesiste:
                return jsonify({'error': 'Prothésiste non trouvée'}), 404
            return jsonify({'prothesiste': serialize_prothesiste(prothesiste, include_sensitive=True)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes pour les prothésistes (gestion des disponibilités)
@app.route('/api/prothesiste/availability', methods=['GET'])
@token_required(user_types=['prothesiste'])
def get_prothesiste_availability():
    """Récupère les disponibilités de la prothésiste"""
    try:
        prothesiste_id = request.current_user['user_id']
        
        availability = ProthesisteAvailability.query.filter_by(
            prothesiste_id=prothesiste_id
        ).all()
        
        result = []
        for avail in availability:
            result.append({
                'id': avail.id,
                'day_of_week': avail.day_of_week,
                'start_time': avail.start_time.strftime('%H:%M'),
                'end_time': avail.end_time.strftime('%H:%M'),
                'is_available': avail.is_available
            })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/prothesiste/availability', methods=['POST'])
@token_required(user_types=['prothesiste'])
def set_prothesiste_availability():
    """Définit les disponibilités de la prothésiste"""
    try:
        prothesiste_id = request.current_user['user_id']
        data = request.json
        
        # Supprimer les anciennes disponibilités
        ProthesisteAvailability.query.filter_by(prothesiste_id=prothesiste_id).delete()
        
        # Ajouter les nouvelles disponibilités
        for day_data in data.get('availability', []):
            if day_data.get('is_available', False):
                availability = ProthesisteAvailability(
                    prothesiste_id=prothesiste_id,
                    day_of_week=day_data['day_of_week'],
                    start_time=datetime.strptime(day_data['start_time'], '%H:%M').time(),
                    end_time=datetime.strptime(day_data['end_time'], '%H:%M').time(),
                    is_available=True
                )
                db.session.add(availability)
        
        db.session.commit()
        
        return jsonify({'message': 'Disponibilités mises à jour avec succès'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/prothesiste/services', methods=['GET'])
@token_required(user_types=['prothesiste'])
def get_prothesiste_services():
    """Récupère les services proposés par la prothésiste"""
    try:
        prothesiste_id = request.current_user['user_id']
        
        prothesiste_services = db.session.query(
            ProthesisteService, Service
        ).join(Service).filter(
            ProthesisteService.prothesiste_id == prothesiste_id,
            ProthesisteService.is_available == True
        ).all()
        
        result = []
        for ps, service in prothesiste_services:
            service_data = serialize_service(service, ps.custom_price, ps.custom_duration)
            service_data['prothesiste_service_id'] = ps.id
            service_data['is_available'] = ps.is_available
            result.append(service_data)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/prothesiste/services', methods=['POST'])
@token_required(user_types=['prothesiste'])
def update_prothesiste_services():
    """Met à jour les services proposés par la prothésiste"""
    try:
        prothesiste_id = request.current_user['user_id']
        data = request.json
        
        for service_data in data.get('services', []):
            service_id = service_data['service_id']
            
            # Chercher ou créer la liaison prothésiste-service
            ps = ProthesisteService.query.filter_by(
                prothesiste_id=prothesiste_id,
                service_id=service_id
            ).first()
            
            if not ps:
                ps = ProthesisteService(
                    prothesiste_id=prothesiste_id,
                    service_id=service_id
                )
                db.session.add(ps)
            
            ps.custom_price = service_data.get('custom_price')
            ps.custom_duration = service_data.get('custom_duration')
            ps.is_available = service_data.get('is_available', True)
        
        db.session.commit()
        
        return jsonify({'message': 'Services mis à jour avec succès'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/prothesiste/appointments', methods=['GET'])
@token_required(user_types=['prothesiste'])
def get_prothesiste_appointments():
    """Récupère les rendez-vous de la prothésiste"""
    try:
        prothesiste_id = request.current_user['user_id']
        
        # Paramètres de filtre optionnels
        date_from = request.args.get('from')
        date_to = request.args.get('to')
        status = request.args.get('status')
        
        query = Appointment.query.filter_by(prothesiste_id=prothesiste_id)
        
        if date_from:
            query = query.filter(Appointment.appointment_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        
        if date_to:
            query = query.filter(Appointment.appointment_date <= datetime.strptime(date_to, '%Y-%m-%d').date())
        
        if status:
            query = query.filter(Appointment.status == status)
        
        appointments = query.order_by(
            Appointment.appointment_date, 
            Appointment.appointment_time
        ).all()
        
        return jsonify([serialize_appointment(apt) for apt in appointments])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes publiques existantes (mises à jour)
@app.route('/api/prothesistes', methods=['GET'])
def get_prothesistes():
    """Récupère la liste des prothésistes actives avec leurs services"""
    try:
        prothesistes = Prothesiste.query.filter_by(is_active=True, is_verified=True).all()
        
        result = []
        for p in prothesistes:
            prothesiste_data = serialize_prothesiste(p)
            
            # Ajouter les services avec prix personnalisés
            services = db.session.query(
                ProthesisteService, Service
            ).join(Service).filter(
                ProthesisteService.prothesiste_id == p.id,
                ProthesisteService.is_available == True,
                Service.is_active == True
            ).all()
            
            prothesiste_data['services'] = []
            for ps, service in services:
                service_data = serialize_service(service, ps.custom_price, ps.custom_duration)
                prothesiste_data['services'].append(service_data)
            
            # Calculer la disponibilité
            prothesiste_data['disponibilite'] = get_availability_status(p.id)
            
            result.append(prothesiste_data)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_availability_status(prothesiste_id: int) -> str:
    """Calcule le statut de disponibilité d'une prothésiste"""
    # Logique simplifiée - à améliorer selon vos besoins
    today = date.today()
    weekday = today.strftime('%A').lower()
    
    # Mapper les jours français vers anglais
    day_map = {
        'monday': 'lundi', 'tuesday': 'mardi', 'wednesday': 'mercredi',
        'thursday': 'jeudi', 'friday': 'vendredi', 'saturday': 'samedi', 'sunday': 'dimanche'
    }
    
    availability = ProthesisteAvailability.query.filter_by(
        prothesiste_id=prothesiste_id,
        day_of_week=weekday,
        is_available=True
    ).first()
    
    if availability:
        return "Disponible aujourd'hui"
    else:
        return "Disponible cette semaine"

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Crée un nouveau rendez-vous (version mise à jour)"""
    try:
        data = request.json
        
        # Validation des données
        required_fields = ['prothesisteId', 'serviceId', 'date', 'time']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Le champ {field} est obligatoire'}), 400
        
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
        
        # Vérifier que la prothésiste et le service existent
        prothesiste = Prothesiste.query.get(data['prothesisteId'])
        if not prothesiste:
            return jsonify({'error': 'Prothésiste non trouvée'}), 404
        
        service = Service.query.get(data['serviceId'])
        if not service:
            return jsonify({'error': 'Service non trouvé'}), 404
        
        # Obtenir les détails du service pour cette prothésiste
        ps = ProthesisteService.query.filter_by(
            prothesiste_id=data['prothesisteId'],
            service_id=data['serviceId'],
            is_available=True
        ).first()
        
        if not ps:
            return jsonify({'error': 'Ce service n\'est pas disponible pour cette prothésiste'}), 400
        
        # Vérifier la disponibilité
        existing = Appointment.query.filter_by(
            prothesiste_id=data['prothesisteId'],
            appointment_date=appointment_date,
            appointment_time=appointment_time
        ).first()
        
        if existing:
            return jsonify({'error': 'Ce créneau est déjà réservé'}), 409
        
        user_id = None
        client_id = None
        
        # Vérifier si l'utilisateur est connecté
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token[7:]
            payload = verify_jwt_token(token)
            if payload and payload['user_type'] == 'user':
                user_id = payload['user_id']
        
        # Si pas d'utilisateur connecté, créer un client temporaire
        if not user_id:
            if not data.get('name') or not data.get('phone'):
                return jsonify({'error': 'Nom et téléphone requis pour les réservations sans compte'}), 400
            
            if not validate_phone(data['phone']):
                return jsonify({'error': 'Format de téléphone invalide'}), 400
            
            # Créer ou récupérer le client
            client = Client.query.filter_by(phone=data['phone']).first()
            if not client:
                client = Client(
                    name=data['name'].strip(),
                    phone=data['phone'].strip(),
                    email=data.get('email', '').strip() if data.get('email') else None
                )
                db.session.add(client)
                db.session.flush()
            client_id = client.id
        
        # Créer le rendez-vous
        appointment = Appointment(
            user_id=user_id,
            client_id=client_id,
            prothesiste_id=data['prothesisteId'],
            service_id=data['serviceId'],
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            duration=ps.custom_duration or service.duration,
            price=ps.custom_price or service.price,
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

# Routes existantes mises à jour
@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Récupère les rendez-vous (version mise à jour)"""
    try:
        # Vérifier si l'utilisateur est connecté
        user_appointments_only = False
        user_id = None
        
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token[7:]
            payload = verify_jwt_token(token)
            if payload and payload['user_type'] == 'user':
                user_id = payload['user_id']
                user_appointments_only = True
        
        if user_appointments_only:
            appointments = Appointment.query.filter_by(user_id=user_id).order_by(
                Appointment.appointment_date, Appointment.appointment_time
            ).all()
        else:
            appointments = Appointment.query.order_by(
                Appointment.appointment_date, Appointment.appointment_time
            ).all()
        
        return jsonify([serialize_appointment(apt) for apt in appointments])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services', methods=['GET'])
def get_services():
    """Récupère la liste des services actifs"""
    try:
        services = Service.query.filter_by(is_active=True).all()
        return jsonify([serialize_service(s) for s in services])
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
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)