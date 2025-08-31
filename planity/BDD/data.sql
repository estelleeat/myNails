-- Insertion de plus de prothésistes pour une démonstration complète
INSERT INTO prothesistes (name, specialite, experience, photo, description, rating, disponibilite) VALUES
('Léa Moreau', 'Extensions & Nail Art', '6 ans d\'expérience', '💎', 'Créatrice de looks uniques avec des extensions sur-mesure et du nail art sophistiqué', 4.9, 'Disponible aujourd\'hui'),
('Camille Blanc', 'French & Soins naturels', '3 ans d\'expérience', '🌸', 'Spécialisée dans les manucures naturelles et les french élégantes pour un look raffiné', 4.6, 'Disponible demain'),
('Jade Laurent', 'Gel & Réparation', '8 ans d\'expérience', '✨', 'Experte en pose gel longue durée et réparation d\'ongles abîmés', 4.8, 'Disponible cette semaine'),
('Nina Petit', 'Nail Art créatif', '4 ans d\'expérience', '🎨', 'Artiste spécialisée dans les créations originales et les motifs personnalisés', 4.7, 'Disponible aujourd\'hui'),
('Sophie Martin', 'Pédicure & Soins pieds', '9 ans d\'expérience', '🦶', 'Spécialiste des soins complets des pieds avec techniques de relaxation', 4.9, 'Disponible demain'),
('Chloé Bernard', 'Extensions & French', '5 ans d\'expérience', '💅', 'Maîtrise parfaite des extensions et des french manucures classiques et modernes', 4.8, 'Disponible cette semaine'),
('Manon Dubois', 'Gel & Nail Art', '7 ans d\'expérience', '🌟', 'Combinaison parfaite entre technique gel et créativité artistique', 4.9, 'Disponible aujourd\'hui'),
('Océane Roux', 'Soins & Manucure', '2 ans d\'expérience', '🌺', 'Jeune talent spécialisée dans les soins nourrissants et les manucures délicates', 4.5, 'Disponible demain');

-- Liaisons supplémentaires prothésiste-services
-- Léa Moreau (id: 4)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(4, (SELECT id FROM services WHERE code = 'extensions')),
(4, (SELECT id FROM services WHERE code = 'design')),
(4, (SELECT id FROM services WHERE code = 'gel'));

-- Camille Blanc (id: 5)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(5, (SELECT id FROM services WHERE code = 'french')),
(5, (SELECT id FROM services WHERE code = 'manicure'));

-- Jade Laurent (id: 6)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(6, (SELECT id FROM services WHERE code = 'gel')),
(6, (SELECT id FROM services WHERE code = 'manicure')),
(6, (SELECT id FROM services WHERE code = 'extensions'));

-- Nina Petit (id: 7)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(7, (SELECT id FROM services WHERE code = 'design')),
(7, (SELECT id FROM services WHERE code = 'gel')),
(7, (SELECT id FROM services WHERE code = 'french'));

-- Sophie Martin (id: 8)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(8, (SELECT id FROM services WHERE code = 'pedicure')),
(8, (SELECT id FROM services WHERE code = 'manicure'));

-- Chloé Bernard (id: 9)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(9, (SELECT id FROM services WHERE code = 'extensions')),
(9, (SELECT id FROM services WHERE code = 'french')),
(9, (SELECT id FROM services WHERE code = 'gel'));

-- Manon Dubois (id: 10)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(10, (SELECT id FROM services WHERE code = 'gel')),
(10, (SELECT id FROM services WHERE code = 'design')),
(10, (SELECT id FROM services WHERE code = 'manicure'));

-- Océane Roux (id: 11)
INSERT INTO prothesiste_services (prothesiste_id, service_id) VALUES
(11, (SELECT id FROM services WHERE code = 'manicure')),
(11, (SELECT id FROM services WHERE code = 'french'));

-- Quelques clients et rendez-vous pour la démonstration
INSERT INTO clients (name, phone, email) VALUES
('Marie Durand', '0123456789', 'marie.durand@email.com'),
('Julie Martin', '0987654321', 'julie.martin@email.com'),
('Sophie Leblanc', '0147852369', 'sophie.leblanc@email.com');

INSERT INTO appointments (client_id, prothesiste_id, service_id, appointment_date, appointment_time, status) VALUES
(1, 1, 1, '2025-09-15', '10:00:00', 'confirme'),
(2, 2, 3, '2025-09-16', '14:30:00', 'confirme'),
(3, 3, 2, '2025-09-17', '16:00:00', 'en_attente');

-- Insertion des services de base
INSERT INTO services (code, name, description, icon, duration, price, category) VALUES
('manicure_classic', 'Manucure Classique', 'Soin complet des ongles avec vernis classique', '💅', 45, 25.00, 'manicure'),
('manicure_semi', 'Manucure Semi-Permanent', 'Manucure avec vernis semi-permanent longue tenue', '✨', 60, 35.00, 'manicure'),
('pedicure_classic', 'Pédicure Classique', 'Soin complet des pieds avec vernis', '🦶', 60, 35.00, 'pedicure'),
('pedicure_semi', 'Pédicure Semi-Permanent', 'Pédicure avec vernis semi-permanent', '🦶', 75, 45.00, 'pedicure'),
('nail_art', 'Nail Art Simple', 'Décoration artistique des ongles', '🎨', 30, 15.00, 'art'),
('nail_art_complex', 'Nail Art Complexe', 'Création artistique élaborée', '🎨', 60, 35.00, 'art'),
('french_manicure', 'French Manucure', 'Manucure française classique', '🤍', 50, 30.00, 'manicure'),
('extensions', 'Pose d\'Extensions', 'Pose d\'extensions en gel ou résine', '💎', 90, 55.00, 'extensions'),
('repair', 'Réparation d\'Ongle', 'Réparation d\'ongle cassé', '🔧', 20, 10.00, 'repair');

-- Insertion de prothésistes de test (mot de passe: password123)
-- Hash bcrypt pour 'password123': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyuqQKJ5u4vLK2
INSERT INTO prothesistes (email, password_hash, name, specialite, experience, photo, description, phone, address) VALUES
('sarah@nailsrdv.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyuqQKJ5u4vLK2', 'Sarah Martinez', 'Nail Art & French Manucure', '5 ans d\'expérience', '👩‍🎨', 'Spécialiste en nail art créatif et french manucure perfectionnée', '01.23.45.67.89', '123 Rue de la Beauté, Paris'),
('marie@nailsrdv.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyuqQKJ5u4vLK2', 'Marie Dubois', 'Pose Gel & Extensions', '7 ans d\'expérience', '💅', 'Experte en pose gel et extensions d\'ongles pour des résultats durables', '01.23.45.67.90', '456 Avenue des Ongles, Paris'),
('emma@nailsrdv.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyuqQKJ5u4vLK2', 'Emma Rousseau', 'Soins & Pédicure', '4 ans d\'expérience', '🦶', 'Spécialisée dans les soins complets des pieds et des mains', '01.23.45.67.91', '789 Place du Bien-être, Paris');

-- Configuration des disponibilités pour Sarah (Lundi-Vendredi 9h-18h)
INSERT INTO prothesiste_availability (prothesiste_id, day_of_week, start_time, end_time) VALUES
(1, 'monday', '09:00:00', '18:00:00'),
(1, 'tuesday', '09:00:00', '18:00:00'),
(1, 'wednesday', '09:00:00', '18:00:00'),
(1, 'thursday', '09:00:00', '18:00:00'),
(1, 'friday', '09:00:00', '18:00:00');

-- Configuration des disponibilités pour Marie (Mardi-Samedi 10h-19h)
INSERT INTO prothesiste_availability (prothesiste_id, day_of_week, start_time, end_time) VALUES
(2, 'tuesday', '10:00:00', '19:00:00'),
(2, 'wednesday', '10:00:00', '19:00:00'),
(2, 'thursday', '10:00:00', '19:00:00'),
(2, 'friday', '10:00:00', '19:00:00'),
(2, 'saturday', '10:00:00', '19:00:00');

-- Configuration des disponibilités pour Emma (Lundi-Samedi 8h30-17h30)
INSERT INTO prothesiste_availability (prothesiste_id, day_of_week, start_time, end_time) VALUES
(3, 'monday', '08:30:00', '17:30:00'),
(3, 'tuesday', '08:30:00', '17:30:00'),
(3, 'wednesday', '08:30:00', '17:30:00'),
(3, 'thursday', '08:30:00', '17:30:00'),
(3, 'friday', '08:30:00', '17:30:00'),
(3, 'saturday', '08:30:00', '17:30:00');

-- Services proposés par Sarah
INSERT INTO prothesiste_services (prothesiste_id, service_id, custom_price, custom_duration) VALUES
(1, 1, 28.00, 50),  -- Manucure classique
(1, 2, 38.00, 65),  -- Manucure semi-permanent
(1, 5, 18.00, 35),  -- Nail art simple
(1, 6, 40.00, 70),  -- Nail art complexe
(1, 7, 32.00, 55);  -- French manucure

-- Services proposés par Marie
INSERT INTO prothesiste_services (prothesiste_id, service_id, custom_price, custom_duration) VALUES
(2, 2, 35.00, 60),  -- Manucure semi-permanent
(2, 4, 48.00, 80),  -- Pédicure semi-permanent
(2, 8, 60.00, 95),  -- Extensions
(2, 9, 12.00, 25);  -- Réparation

-- Services proposés par Emma
INSERT INTO prothesiste_services (prothesiste_id, service_id, custom_price, custom_duration) VALUES
(3, 1, 25.00, 45),  -- Manucure classique
(3, 3, 35.00, 60),  -- Pédicure classique
(3, 4, 45.00, 75),  -- Pédicure semi-permanent
(3, 7, 30.00, 50);  -- French manucure
