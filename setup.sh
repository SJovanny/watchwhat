#!/bin/bash

# Script de configuration rapide pour WatchWhat
# Usage: ./setup.sh

echo "🎬 Configuration de WatchWhat"
echo "================================"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Créer le fichier .env.local s'il n'existe pas
if [ ! -f .env.local ]; then
    echo ""
    echo "🔑 Configuration de l'API TMDB..."
    cp .env.local.example .env.local
    echo "✅ Fichier .env.local créé depuis l'exemple"
    echo ""
    echo "⚠️  IMPORTANT: Vous devez maintenant:"
    echo "   1. Créer un compte sur https://www.themoviedb.org/"
    echo "   2. Obtenir votre clé API"
    echo "   3. Modifier le fichier .env.local avec votre clé API"
    echo ""
    echo "   Éditez le fichier .env.local et remplacez 'your_tmdb_api_key_here' par votre vraie clé API"
else
    echo "✅ Fichier .env.local existe déjà"
fi

echo ""
echo "🚀 Configuration terminée !"
echo ""
echo "Pour démarrer l'application:"
echo "   npm run dev"
echo ""
echo "L'application sera accessible sur http://localhost:3000"
echo ""
echo "📖 Consultez QUICKSTART.md pour plus d'informations"
