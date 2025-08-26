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