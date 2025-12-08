import { UserPreferences, WatchedSerie, Serie } from '@/types';

// Clés de stockage localStorage
const STORAGE_KEYS = {
  USER_PREFERENCES: 'watchwhat_user_preferences',
  WATCHED_SERIES: 'watchwhat_watched_series',
  FAVORITE_SERIES: 'watchwhat_favorite_series',
  USER_ONBOARDING: 'watchwhat_onboarding_complete'
};

// Préférences par défaut
const DEFAULT_PREFERENCES: UserPreferences = {
  userId: '',
  favoriteGenres: [],
  dislikedGenres: [],
  favoriteActors: [],
  favoriteSeries: [],
  preferredLanguages: ['fr', 'en'],
  notificationsEnabled: true,
  autoAddToWatchlist: false,
  showAdultContent: false,
  language: 'fr-FR',
  country: 'FR',
  includeAdult: false,
  minRating: 0,
  maxRating: 10,
  theme: 'auto',
  defaultView: 'grid',
  itemsPerPage: 20,
  autoplay: false,
  showSpoilers: false,
  notifications: {
    newReleases: true,
    recommendations: true,
    watchlistUpdates: true
  }
};

// Service de stockage local
export const storageService = {
  // Sauvegarder les préférences utilisateur
  saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
    }
  },

  // Récupérer les préférences utilisateur
  getUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (!stored) return DEFAULT_PREFERENCES;
      
      const preferences = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...preferences };
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  // Sauvegarder une série comme vue
  addWatchedSerie(serie: Serie, rating?: number, review?: string): void {
    try {
      const watchedSeries = this.getWatchedSeries();
      const watchedSerie: WatchedSerie = {
        userId: '',
        serieId: serie.id,
        serieData: serie,
        watchedAt: new Date(),
        rating,
        review
      };

      // Vérifier si la série n'est pas déjà dans la liste
      const existingIndex = watchedSeries.findIndex(w => w.serieData.id === serie.id);
      if (existingIndex >= 0) {
        watchedSeries[existingIndex] = watchedSerie;
      } else {
        watchedSeries.push(watchedSerie);
      }

      localStorage.setItem(STORAGE_KEYS.WATCHED_SERIES, JSON.stringify(watchedSeries));
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la série vue:', error);
    }
  },

  // Récupérer les séries vues
  getWatchedSeries(): WatchedSerie[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATCHED_SERIES);
      if (!stored) return [];
      
      const watchedSeries = JSON.parse(stored);
      // Convertir les dates string en objets Date
      return watchedSeries.map((w: WatchedSerie & { watchedAt: string }) => ({
        ...w,
        watchedAt: new Date(w.watchedAt)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des séries vues:', error);
      return [];
    }
  },

  // Supprimer une série de la liste des vues
  removeWatchedSerie(serieId: number): void {
    try {
      const watchedSeries = this.getWatchedSeries();
      const filtered = watchedSeries.filter(w => w.serieData.id !== serieId);
      localStorage.setItem(STORAGE_KEYS.WATCHED_SERIES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erreur lors de la suppression de la série vue:', error);
    }
  },

  // Ajouter une série aux favoris
  addFavoriteSerie(serie: Serie): void {
    try {
      const favorites = this.getFavoriteSeries();
      if (!favorites.find(s => s.id === serie.id)) {
        favorites.push(serie);
        localStorage.setItem(STORAGE_KEYS.FAVORITE_SERIES, JSON.stringify(favorites));
        
        // Aussi l'ajouter aux préférences
        const preferences = this.getUserPreferences();
        if (!preferences.favoriteSeries.find((s: Serie) => s.id === serie.id)) {
          preferences.favoriteSeries.push(serie);
          this.saveUserPreferences(preferences);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
    }
  },

  // Récupérer les séries favorites
  getFavoriteSeries(): Serie[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITE_SERIES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      return [];
    }
  },

  // Supprimer une série des favoris
  removeFavoriteSerie(serieId: number): void {
    try {
      const favorites = this.getFavoriteSeries();
      const filtered = favorites.filter(s => s.id !== serieId);
      localStorage.setItem(STORAGE_KEYS.FAVORITE_SERIES, JSON.stringify(filtered));

      // Aussi la supprimer des préférences
      const preferences = this.getUserPreferences();
      preferences.favoriteSeries = preferences.favoriteSeries.filter((s: Serie) => s.id !== serieId);
      this.saveUserPreferences(preferences);
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
    }
  },

  // Vérifier si l'onboarding est terminé
  isOnboardingComplete(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_ONBOARDING) === 'true';
    } catch {
      return false;
    }
  },

  // Marquer l'onboarding comme terminé
  completeOnboarding(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ONBOARDING, 'true');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'onboarding:', error);
    }
  },

  // Réinitialiser toutes les données
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données:', error);
    }
  },

  // Exporter les données utilisateur
  exportUserData(): string {
    try {
      const data = {
        preferences: this.getUserPreferences(),
        watchedSeries: this.getWatchedSeries(),
        favoriteSeries: this.getFavoriteSeries(),
        onboardingComplete: this.isOnboardingComplete()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      return '';
    }
  },

  // Importer les données utilisateur
  importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.preferences) {
        this.saveUserPreferences(data.preferences);
      }
      
      if (data.watchedSeries) {
        localStorage.setItem(STORAGE_KEYS.WATCHED_SERIES, JSON.stringify(data.watchedSeries));
      }
      
      if (data.favoriteSeries) {
        localStorage.setItem(STORAGE_KEYS.FAVORITE_SERIES, JSON.stringify(data.favoriteSeries));
      }
      
      if (data.onboardingComplete) {
        this.completeOnboarding();
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      return false;
    }
  }
};

// Hook personnalisé pour utiliser les préférences avec React
export const useUserPreferences = () => {
  const getPreferences = () => storageService.getUserPreferences();
  const savePreferences = (preferences: UserPreferences) => storageService.saveUserPreferences(preferences);
  
  return { getPreferences, savePreferences };
};

// Hook pour les séries vues
export const useWatchedSeries = () => {
  const getWatchedSeries = () => storageService.getWatchedSeries();
  const addWatchedSerie = (serie: Serie, rating?: number, review?: string) => 
    storageService.addWatchedSerie(serie, rating, review);
  const removeWatchedSerie = (serieId: number) => storageService.removeWatchedSerie(serieId);
  
  return { getWatchedSeries, addWatchedSerie, removeWatchedSerie };
};

// Hook pour les favoris
export const useFavoriteSeries = () => {
  const getFavoriteSeries = () => storageService.getFavoriteSeries();
  const addFavoriteSerie = (serie: Serie) => storageService.addFavoriteSerie(serie);
  const removeFavoriteSerie = (serieId: number) => storageService.removeFavoriteSerie(serieId);
  const isFavorite = (serieId: number) => getFavoriteSeries().some(s => s.id === serieId);
  
  return { getFavoriteSeries, addFavoriteSerie, removeFavoriteSerie, isFavorite };
};
