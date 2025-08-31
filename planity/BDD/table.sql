-- Base de données pour l'application de rendez-vous ongles
CREATE DATABASE nails_rdv;
USE nails_rdv;

-- Table des prothésistes
CREATE TABLE prothesistes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    specialite VARCHAR(200) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    photo VARCHAR(10) NOT NULL, -- emoji ou URL
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    disponibilite VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des services
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL, -- emoji
    prix_min DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison prothésiste-services (Many-to-Many)
CREATE TABLE prothesiste_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prothesiste_id INT,
    service_id INT,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_prothesiste_service (prothesiste_id, service_id)
);

-- Table des clients
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des rendez-vous
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT,
    prothesiste_id INT,
    service_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('en_attente', 'confirme', 'annule', 'termine') DEFAULT 'confirme',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_prothesiste_date (prothesiste_id, appointment_date)
);

-- Insertion des services
INSERT INTO services (code, name, icon, prix_min) VALUES
('manicure', 'Manucure Classique', '💅', 25.00),
('pedicure', 'Pédicure', '🦶', 35.00),
('gel', 'Pose Gel', '✨', 35.00),
('design', 'Nail Art', '🎨', 40.00),
('french', 'French Manucure', '🤍', 30.00),
('extensions', 'Extensions', '💎', 50.00);

-- Insertion des prothésistes
INSERT INTO prothesistes (name, specialite, experience, photo, description, rating, disponibilite) VALUES
('Sarah Martinez', 'Nail Art & French Manucure', '5 ans d\'expérience', '👩‍🎨', 'Spécialiste en nail art créatif et french manucure perfectionnée', 4.9, 'Disponible aujourd\'hui'),
('Marie Dubois', 'Pose Gel & Extensions', '7 ans d\'expérience', '💅', 'Experte en pose gel et extensions d\'ongles pour des résultats durables', 4.8, 'Disponible demain'),
('Emma Rousseau', 'Soins & Pédicure', '4 ans d\'expérience', '🦶', 'Spécialisée dans les soins complets des pieds et des mains', 4.7, 'Disponible cette semaine');

-- Liaison prothésiste-services pour Sarah Martinez
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(1, (SELECT id FROM services WHERE code = 'design')),    -- Nail Art
(1, (SELECT id FROM services WHERE code = 'french')),    -- French Manucure
(1, (SELECT id FROM services WHERE code = 'gel')),       -- Pose Gel
(1, (SELECT id FROM services WHERE code = 'manicure'));  -- Manucure Classique

-- Liaison prothésiste-services pour Marie Dubois
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(2, (SELECT id FROM services WHERE code = 'gel')),       -- Pose Gel
(2, (SELECT id FROM services WHERE code = 'extensions')), -- Extensions
(2, (SELECT id FROM services WHERE code = 'pedicure'));  -- Pédicure

-- Liaison prothésiste-services pour Emma Rousseau
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(3, (SELECT id FROM services WHERE code = 'pedicure')),  -- Pédicure
(3, (SELECT id FROM services WHERE code = 'manicure')), -- Manucure Classique
(3, (SELECT id FROM services WHERE code = 'french'));   -- French

-- Vues utiles
CREATE VIEW appointments_view AS
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.notes,
    a.created_at,
    c.name as client_name,
    c.phone as client_phone,
    p.name as prothesiste_name,
    p.photo as prothesiste_photo,
    s.name as service_name,
    s.code as service_code,
    s.icon as service_icon
FROM appointments a
JOIN clients c ON a.client_id = c.id
JOIN prothesistes p ON a.prothesiste_id = p.id
JOIN services s ON a.service_id = s.id;

CREATE VIEW prothesistes_with_services AS
SELECT 
    p.id,
    p.name,
    p.specialite,
    p.experience,
    p.photo,
    p.description,
    p.rating,
    p.disponibilite,
    GROUP_CONCAT(s.name SEPARATOR ', ') as services
FROM prothesistes p
LEFT JOIN prothesiste_services ps ON p.id = ps.prothesiste_id
LEFT JOIN services s ON ps.service_id = s.id
GROUP BY p.id;

-- Base de données mise à jour avec système d'authentification
CREATE DATABASE nails_rdv;
USE nails_rdv;

-- Table des utilisateurs (clients)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    reset_token VARCHAR(100),
    reset_token_expires DATETIME
);

-- Table des prothésistes (mise à jour avec authentification)
CREATE TABLE prothesistes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    specialite VARCHAR(200) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    photo VARCHAR(255) DEFAULT '👩‍🎨', -- peut être une URL ou emoji
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100)
);

-- Table des disponibilités des prothésistes
CREATE TABLE prothesiste_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prothesiste_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_prothesiste_day (prothesiste_id, day_of_week)
);

-- Table des congés/indisponibilités
CREATE TABLE prothesiste_unavailable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prothesiste_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(200),
    is_full_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    INDEX idx_prothesiste_date (prothesiste_id, date)
);

-- Table des services (mise à jour)
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) NOT NULL,
    duration INT NOT NULL DEFAULT 60, -- durée en minutes
    price DECIMAL(6,2) NOT NULL,
    category VARCHAR(50) DEFAULT 'manicure',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des services proposés par chaque prothésiste (avec prix personnalisé)
CREATE TABLE prothesiste_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prothesiste_id INT NOT NULL,
    service_id INT NOT NULL,
    custom_price DECIMAL(6,2), -- prix personnalisé par la prothésiste
    custom_duration INT, -- durée personnalisée
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_prothesiste_service (prothesiste_id, service_id)
);

-- Table des clients (simplifiée, liée aux users)
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des rendez-vous (mise à jour)
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT, -- lié au compte utilisateur
    client_id INT, -- pour les rdv sans compte
    prothesiste_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 60, -- durée en minutes
    price DECIMAL(6,2), -- prix final du service
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_prothesiste_date (prothesiste_id, appointment_date),
    INDEX idx_user_appointments (user_id)
);

-- Table des sessions utilisateur (pour la gestion des tokens)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    prothesiste_id INT,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_type ENUM('user', 'prothesiste') NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at)
);

-- Table des avis clients
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    user_id INT,
    prothesiste_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (prothesiste_id) REFERENCES prothesistes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_appointment_review (appointment_id)
);

-- Vues utiles
CREATE VIEW appointments_detailed AS
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    a.price,
    a.status,
    a.notes,
    a.created_at,
    COALESCE(u.first_name, c.name) as client_name,
    COALESCE(u.phone, c.phone) as client_phone,
    COALESCE(u.email, c.email) as client_email,
    p.name as prothesiste_name,
    p.photo as prothesiste_photo,
    p.email as prothesiste_email,
    s.name as service_name,
    s.code as service_code,
    s.icon as service_icon
FROM appointments a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN clients c ON a.client_id = c.id
JOIN prothesistes p ON a.prothesiste_id = p.id
JOIN services s ON a.service_id = s.id;

CREATE VIEW prothesistes_with_services AS
SELECT 
    p.id,
    p.name,
    p.email,
    p.specialite,
    p.experience,
    p.photo,
    p.description,
    p.rating,
    p.phone,
    p.address,
    p.is_active,
    GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') as services_names,
    COUNT(DISTINCT ps.service_id) as services_count
FROM prothesistes p
LEFT JOIN prothesiste_services ps ON p.id = ps.prothesiste_id AND ps.is_available = TRUE
LEFT JOIN services s ON ps.service_id = s.id AND s.is_active = TRUE
WHERE p.is_active = TRUE
GROUP BY p.id;

-- Index pour optimiser les performances
CREATE INDEX idx_appointments_prothesiste_date ON appointments(prothesiste_id, appointment_date, appointment_time);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_prothesiste_availability ON prothesiste_availability(prothesiste_id, day_of_week);
CREATE INDEX idx_reviews_prothesiste ON reviews(prothesiste_id, rating);