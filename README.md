# WatchWhat 🎬

**WatchWhat** est une application web de recommandations de séries TV personnalisées basée sur Next.js et TypeScript. Elle utilise l'API TMDB pour récupérer les informations sur les séries et offre des recommandations personnalisées selon les goûts et l'historique de l'utilisateur.

## ✨ Fonctionnalités

- 🔍 **Recherche avancée** de séries TV
- 🎯 **Recommandations personnalisées** basées sur vos préférences
- ❤️ **Gestion des favoris** et de l'historique de visionnage
- 🎨 **Interface moderne et responsive** avec mode sombre
- 📱 **PWA-ready** pour une expérience mobile optimale
- 🎭 **Filtrage par genres**, notes, années, etc.
- 📊 **Statistiques personnelles** sur votre activité de visionnage
- 🔄 **Synchronisation locale** avec localStorage

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+ et npm
- Clé API TMDB (gratuite)

### 1. Cloner le projet

```bash
git clone <your-repo-url>
cd watchwhat
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'API TMDB

1. Créez un compte sur [TMDB](https://www.themoviedb.org/)
2. Allez dans **Paramètres > API** pour obtenir votre clé API
3. Copiez le fichier `.env.local.example` vers `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Modifiez `.env.local` avec votre clé API:

```env
NEXT_PUBLIC_TMDB_API_KEY=votre_cle_api_ici
```

### 4. Lancer l'application

```bash
# Mode développement
npm run dev

# Build de production
npm run build
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🎬 Aperçu de l'application

Une fois lancée, vous pourrez :
- **Naviguer** entre les différentes sections via la barre de navigation
- **Rechercher** des séries avec la barre de recherche globale
- **Explorer** les séries populaires et les mieux notées sur la page d'accueil
- **Filtrer** et découvrir de nouvelles séries dans la section "Découvrir"
- **Gérer** vos favoris et votre historique dans la section "Favoris"
- **Consulter** vos statistiques dans votre profil

### 🐛 Résolution des problèmes de dates

L'application gère maintenant correctement :
- ✅ **Dates invalides** qui affichaient `NaN`
- ✅ **Images manquantes** avec des placeholders automatiques
- ✅ **Notes mal formatées** avec validation
- ✅ **Gestion d'erreurs** robuste pour toutes les données TMDB

## 📁 Architecture du Projet

```
watchwhat/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── layout.tsx         # Layout principal
│   │   └── globals.css        # Styles globaux
│   ├── components/            # Composants React réutilisables
│   │   ├── SerieCard.tsx      # Carte d'affichage des séries
│   │   ├── SearchBar.tsx      # Barre de recherche avec autocomplétion
│   │   ├── FilterBar.tsx      # Filtres avancés
│   │   └── Navbar.tsx         # Navigation principale
│   ├── lib/                   # Utilitaires et services
│   │   ├── tmdb.ts           # Service API TMDB
│   │   └── storage.ts        # Gestion du stockage local
│   └── types/                 # Définitions TypeScript
│       └── index.ts          # Types de l'application
├── public/                    # Assets statiques
├── .env.example              # Variables d'environnement exemple
└── README.md                 # Documentation
```

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes

### API et Données
- **TMDB API** - Base de données de films/séries
- **Axios** - Client HTTP
- **localStorage** - Stockage local des préférences

### Développement
- **ESLint** - Linting du code
- **Prettier** - Formatage automatique
- **Vercel** - Déploiement recommandé

## 🎯 Utilisation

### Première utilisation

1. **Recherchez vos séries favorites** via la barre de recherche
2. **Ajoutez-les à vos favoris** ou marquez-les comme vues
3. **Configurez vos préférences** de genres et acteurs favoris
4. **Recevez des recommandations personnalisées** sur la page d'accueil

### Fonctionnalités principales

#### Recherche et Découverte
- Utilisez la barre de recherche pour trouver des séries
- Explorez les catégories: Populaires, Mieux notées, Tendances
- Filtrez par genre, note, année de sortie

#### Gestion Personnelle
- Ajoutez des séries à vos favoris (❤️)
- Marquez des séries comme vues (✓)
- Notez et commentez vos séries

#### Recommandations
- L'algorithme apprend de vos préférences
- Exclut automatiquement les séries déjà vues
- Mise à jour en temps réel selon vos actions

## 🎨 Personnalisation

### Thèmes
L'application supporte le mode sombre automatiquement selon les préférences système.

### Responsive Design
Interface optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)

## 🚀 Déploiement

### Vercel (Recommandé)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/watchwhat)

1. Connectez votre repository GitHub à Vercel
2. Ajoutez votre `NEXT_PUBLIC_TMDB_API_KEY` dans les variables d'environnement
3. Déployez !

### Autres plateformes

- **Netlify**: Compatible avec build statique
- **AWS Amplify**: Support Next.js complet
- **Railway/Render**: Pour des besoins spécifiques

### Variables d'environnement pour la production

```env
NEXT_PUBLIC_TMDB_API_KEY=your_production_api_key
```

## 🔧 Développement

### Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer la version de production
npm start

# Linting
npm run lint

# Correction automatique du linting
npm run lint:fix
```

### Structure des composants

Chaque composant suit cette structure :
```tsx
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface ComponentProps {
  // props definition
}

// 3. Composant
export default function Component({ props }: ComponentProps) {
  // 4. State et hooks
  // 5. Fonctions utilitaires
  // 6. Rendu JSX
  return (
    // JSX content
  );
}
```

### Ajout de nouvelles fonctionnalités

1. **Créez les types** dans `src/types/index.ts`
2. **Ajoutez les services API** dans `src/lib/tmdb.ts`
3. **Créez les composants** dans `src/components/`
4. **Ajoutez les pages** dans `src/app/`

## 📝 API TMDB

### Endpoints utilisés

- `GET /tv/popular` - Séries populaires
- `GET /tv/top_rated` - Séries les mieux notées
- `GET /search/tv` - Recherche de séries
- `GET /discover/tv` - Découverte avec filtres
- `GET /tv/{id}` - Détails d'une série
- `GET /genre/tv/list` - Liste des genres

### Limites et quotas

- **1000 requêtes par jour** (gratuit)
- **40 requêtes par 10 secondes**
- Upgrade possible vers un plan payant

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Utilisez TypeScript pour tous les nouveaux fichiers
- Suivez les conventions ESLint configurées
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez les nouvelles APIs

## 🐛 Problèmes Connus

### Problèmes courants

1. **Erreur API TMDB**: Vérifiez votre clé API dans `.env.local`
2. **Images manquantes**: Les URLs d'images peuvent parfois être indisponibles
3. **Performance**: Les listes longues peuvent être lentes (pagination à implémenter)

### Solutions

- Utilisez le mode développement pour le debugging
- Consultez la console pour les erreurs détaillées
- Vérifiez les network tabs pour les requêtes API

## 📊 Roadmap

### Version 1.0 (Actuelle)
- ✅ Interface de base
- ✅ Recherche et découverte
- ✅ Gestion des favoris
- ✅ Recommandations basiques

### Version 1.1 (Prochaine)
- 🔄 Authentification utilisateur
- 🔄 Synchronisation cloud
- 🔄 Partage de listes
- 🔄 Notifications

### Version 2.0 (Future)
- 📱 Application mobile (React Native)
- 🎥 Support des films
- 🤖 IA avancée pour recommandations
- 👥 Fonctionnalités sociales

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [TMDB](https://www.themoviedb.org/) pour leur excellente API
- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le design system
- [Lucide](https://lucide.dev/) pour les icônes

---

**WatchWhat** - Trouvez votre prochaine série favorite ! 🎬✨
