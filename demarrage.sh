#!/bin/bash

# Arrêter le script si une commande échoue
set -e

# Démarrer le backend
echo "🚀 Lancement du backend..."
cd planity/backend
poetry install > /dev/null 2>&1  # installe si nécessaire, sortie masquée
poetry run python app.py &
BACKEND_PID=$!

# Démarrer le frontend
echo "🌐 Lancement du frontend..."
cd ../frontend
npm install > /dev/null 2>&1  # installe si nécessaire, sortie masquée
npm start &
FRONTEND_PID=$!

# Attendre que les processus se terminent
wait $BACKEND_PID $FRONTEND_PID
