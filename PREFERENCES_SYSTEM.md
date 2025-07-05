# Système de Préférences Utilisateur - WatchWhat

## 🎯 Vue d'ensemble

Nous avons intégré un système complet de préférences utilisateur utilisant l'API v4 de TMDB pour offrir une expérience personnalisée et des recommandations intelligentes.

## 🚀 Fonctionnalités Implémentées

### 1. Service TMDB v4 (`src/lib/tmdb-v4.ts`)
- **Authentification complète** avec l'API v4 de TMDB
- **Gestion des tokens** d'accès et de session
- **API d'utilisateur** : compte, favoris, watchlist, notes
- **Gestion des listes** personnalisées
- **Recommandations** basées sur l'historique utilisateur
- **Stockage sécurisé** des préférences locales

### 2. Interface de Préférences (`src/components/UserPreferences.tsx`)
- **Design moderne** avec glassmorphism et animations
- **5 onglets de configuration** :
  - **Général** : Langue, pays, contenu adulte
  - **Contenu** : Genres favoris/détestés, plage de notes, années
  - **Affichage** : Thème, vue par défaut, nombre d'éléments
  - **Notifications** : Nouvelles sorties, recommandations, watchlist
  - **Compte** : Connexion TMDB, informations utilisateur

### 3. Authentification TMDB (`src/app/auth/page.tsx`)
- **Page de connexion** élégante et informative
- **Flux d'authentification** sécurisé avec TMDB
- **Gestion des callbacks** et des erreurs
- **Interface responsive** avec explications des avantages

### 4. Recommandations Personnalisées (`src/components/PersonalizedRecommendations.tsx`)
- **IA de recommandations** utilisant l'API v4 si connecté
- **Algorithme local** basé sur les préférences si non connecté
- **Filtrage intelligent** par genres favoris/détestés
- **Interface adaptative** avec cartes personnalisées
- **Mélange équilibré** films/séries

### 5. Hooks Personnalisés (`src/hooks/usePreferences.ts`)
- `useUserPreferences()` : Gestion des préférences locales
- `useAuth()` : État d'authentification TMDB v4
- **Synchronisation automatique** des données
- **Gestion des erreurs** et du cache

## 🔧 Utilisation

### Configuration des Préférences
```typescript
// Accès direct au service
import { tmdbV4Service } from '@/lib/tmdb-v4';

// Sauvegarder des préférences
tmdbV4Service.saveUserPreferences({
  favoriteGenres: [28, 35, 18], // Action, Comédie, Drame
  minRating: 7.0,
  theme: 'dark'
});

// Récupérer les préférences
const preferences = tmdbV4Service.getUserPreferences();
```

### Utilisation des Hooks
```typescript
import { useUserPreferences, useAuth } from '@/hooks/usePreferences';

function MyComponent() {
  const { preferences, updatePreferences } = useUserPreferences();
  const { isAuthenticated, account } = useAuth();
  
  // Mettre à jour les préférences
  const handleGenreToggle = (genreId: number) => {
    updatePreferences({
      favoriteGenres: [...preferences.favoriteGenres, genreId]
    });
  };
}
```

### Recommandations Personnalisées
```typescript
// Automatiquement intégré dans la page d'accueil
// Utilise l'API v4 si connecté, sinon préférences locales
<PersonalizedRecommendations className="mb-12" />
```

## 🎨 Design & UX

### Éléments Visuels
- **Glassmorphism** avec effets de flou et transparence
- **Animations fluides** avec delays échelonnés
- **Gradients dynamiques** et orbes flottantes
- **Indicateurs visuels** pour l'état des préférences
- **Responsive design** optimisé mobile/desktop

### Navigation
- **Onglets intuitifs** avec icônes descriptives
- **Sauvegarde automatique** avec feedback visuel
- **États de chargement** elegants et informatifs
- **Gestion d'erreurs** avec messages clairs

## 🔐 Sécurité & Confidentialité

### Authentification
- **OAuth 2.0** via TMDB (aucun mot de passe stocké)
- **Tokens sécurisés** avec expiration automatique
- **Déconnexion propre** avec nettoyage des données
- **Validation côté client** et serveur

### Données
- **Chiffrement** des tokens en localStorage
- **Préférences locales** pour les utilisateurs non connectés
- **Synchronisation optionnelle** avec TMDB
- **Respect du RGPD** et politiques de confidentialité

## 📱 Pages & Routes

- `/settings` - Interface de configuration complète
- `/auth` - Authentification TMDB avec callback
- `/` - Page d'accueil avec recommandations intégrées

## 🌟 Avantages

### Pour les utilisateurs connectés TMDB
- **Synchronisation** avec listes existantes
- **Recommandations IA** basées sur l'historique
- **Accès aux favoris** et watchlist
- **Notifications** personnalisées

### Pour tous les utilisateurs
- **Configuration locale** complète
- **Recommandations** basées sur les préférences
- **Interface moderne** et responsive
- **Performance optimisée** avec mise en cache

## 🚀 Prochaines Étapes

1. **Tests A/B** sur les algorithmes de recommandation
2. **Intégration** avec les autres composants (filtres, recherche)
3. **Analytics** sur l'utilisation des préférences
4. **Notifications push** pour les nouvelles sorties
5. **Import/Export** des préférences

---

Le système est maintenant opérationnel et prêt à offrir une expérience personnalisée à tous les utilisateurs de WatchWhat ! 🎬✨
