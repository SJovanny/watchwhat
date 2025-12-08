import axios from 'axios';
import { UserPreferences } from '@/types';

const TMDB_BASE_URL_V4 = 'https://api.themoviedb.org/4';
const TMDB_BASE_URL_V3 = 'https://api.themoviedb.org/3';

// Types spécifiques à TMDBv4
export interface TMDBv4Account {
  id: number;
  name: string;
  username: string;
  include_adult: boolean;
  iso_639_1: string;
  iso_3166_1: string;
  avatar?: {
    gravatar?: {
      hash: string;
    };
    tmdb?: {
      avatar_path: string;
    };
  };
}

export interface TMDBv4RequestToken {
  success: boolean;
  status_code: number;
  status_message: string;
  request_token: string;
}

export interface TMDBv4AccessToken {
  success: boolean;
  status_code: number;
  status_message: string;
  access_token: string;
  account_id: string;
}

export interface TMDBv4List {
  id: number;
  name: string;
  description: string;
  favorite_count: number;
  item_count: number;
  iso_639_1: string;
  list_type: string;
  poster_path: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Configuration de l'API TMDB v4
const tmdbV4Api = axios.create({
  baseURL: TMDB_BASE_URL_V4,
  headers: {
    'Content-Type': 'application/json',
  }
});

const tmdbV3Api = axios.create({
  baseURL: TMDB_BASE_URL_V3,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN}`
  },
  params: {
    language: 'fr-FR'
  }
});

// Service TMDBv4 pour l'authentification et les préférences utilisateur
export const tmdbV4Service = {
  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const accessToken = localStorage.getItem('tmdb_access_token');
    return !!accessToken;
  },

  // Créer un request token
  async createRequestToken(): Promise<TMDBv4RequestToken> {
    try {
      const response = await tmdbV4Api.post('/auth/request_token', {
        redirect_to: `${window.location.origin}/auth/callback`
      }, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du request token:', error);
      throw error;
    }
  },

  // Créer un access token à partir d'un request token
  async createAccessToken(requestToken: string): Promise<TMDBv4AccessToken> {
    try {
      const response = await tmdbV4Api.post('/auth/access_token', {
        request_token: requestToken
      }, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN}`
        }
      });

      if (response.data.success) {
        localStorage.setItem('tmdb_access_token', response.data.access_token);
        localStorage.setItem('tmdb_account_id', response.data.account_id);
      }

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'access token:', error);
      throw error;
    }
  },

  // Obtenir les informations du compte
  async getAccount(): Promise<TMDBv4Account> {
    try {
      const accessToken = localStorage.getItem('tmdb_access_token');
      if (!accessToken) {
        throw new Error('Aucun token d\'accès trouvé');
      }

      const response = await tmdbV4Api.get('/account', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error);
      throw error;
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tmdb_access_token');
        localStorage.removeItem('tmdb_account_id');
        localStorage.removeItem('user_preferences');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Obtenir les préférences utilisateur (depuis localStorage pour le moment)
  getUserPreferences(): UserPreferences | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const stored = localStorage.getItem('user_preferences');
      if (!stored) {
        // Retourner les préférences par défaut si aucune n'est stockée
        const defaultPreferences: UserPreferences = {
          userId: 'anonymous',
          preferredLanguages: ['fr'],
          favoriteGenres: [],
          dislikedGenres: [],
          favoriteActors: [],
          favoriteSeries: [],
          notificationsEnabled: true,
          autoAddToWatchlist: false,
          showAdultContent: false,
          language: 'fr-FR',
          country: 'FR',
          includeAdult: false,
          minRating: 0,
          maxRating: 10,
          releaseYearFrom: undefined,
          releaseYearTo: undefined,
          theme: 'dark',
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
        
        // Sauvegarder les préférences par défaut
        this.saveUserPreferences(defaultPreferences);
        return defaultPreferences;
      }
      
      const preferences = JSON.parse(stored);
      
      // Valeurs par défaut si certaines propriétés manquent
      return {
        userId: preferences.userId || 'anonymous',
        preferredLanguages: preferences.preferredLanguages || ['fr'],
        favoriteGenres: preferences.favoriteGenres || [],
        dislikedGenres: preferences.dislikedGenres || [],
        favoriteActors: preferences.favoriteActors || [],
        favoriteSeries: preferences.favoriteSeries || [],
        notificationsEnabled: preferences.notificationsEnabled ?? true,
        autoAddToWatchlist: preferences.autoAddToWatchlist ?? false,
        showAdultContent: preferences.showAdultContent ?? false,
        language: preferences.language || 'fr-FR',
        country: preferences.country || 'FR',
        includeAdult: preferences.includeAdult ?? false,
        minRating: preferences.minRating ?? 0,
        maxRating: preferences.maxRating ?? 10,
        releaseYearFrom: preferences.releaseYearFrom,
        releaseYearTo: preferences.releaseYearTo,
        theme: preferences.theme || 'dark',
        defaultView: preferences.defaultView || 'grid',
        itemsPerPage: preferences.itemsPerPage || 20,
        autoplay: preferences.autoplay ?? false,
        showSpoilers: preferences.showSpoilers ?? false,
        notifications: preferences.notifications || {
          newReleases: true,
          recommendations: true,
          watchlistUpdates: true
        },
        ...preferences
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      return null;
    }
  },

  // Sauvegarder les préférences utilisateur
  saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      if (typeof window === 'undefined') return;
      
      const existing = this.getUserPreferences() || {
        userId: 'anonymous',
        preferredLanguages: ['fr'],
        favoriteGenres: [],
        dislikedGenres: [],
        favoriteActors: [],
        favoriteSeries: [],
        notificationsEnabled: true,
        autoAddToWatchlist: false,
        showAdultContent: false,
        language: 'fr-FR',
        country: 'FR',
        includeAdult: false,
        minRating: 0,
        maxRating: 10,
        releaseYearFrom: undefined,
        releaseYearTo: undefined,
        theme: 'dark',
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
      
      const updated = {
        ...existing,
        ...preferences,
        updatedAt: new Date()
      };
      
      localStorage.setItem('user_preferences', JSON.stringify(updated));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
    }
  },

  // Obtenir les recommandations de films (nécessite une authentification)
  async getMovieRecommendations(page: number = 1): Promise<any> {
    try {
      const accessToken = localStorage.getItem('tmdb_access_token');
      if (!accessToken) {
        // Fallback vers l'API v3 si pas d'authentification
        return tmdbV3Api.get('/movie/popular', { params: { page } });
      }

      const response = await tmdbV4Api.get('/account/recommendations/movies', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: { page }
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations de films:', error);
      // Fallback vers l'API v3
      const fallback = await tmdbV3Api.get('/movie/popular', { params: { page } });
      return fallback.data;
    }
  },

  // Obtenir les recommandations de séries TV (nécessite une authentification)
  async getTVRecommendations(page: number = 1): Promise<any> {
    try {
      const accessToken = localStorage.getItem('tmdb_access_token');
      if (!accessToken) {
        // Fallback vers l'API v3 si pas d'authentification
        return tmdbV3Api.get('/tv/popular', { params: { page } });
      }

      const response = await tmdbV4Api.get('/account/recommendations/tv', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: { page }
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations de séries:', error);
      // Fallback vers l'API v3
      const fallback = await tmdbV3Api.get('/tv/popular', { params: { page } });
      return fallback.data;
    }
  },

  // Obtenir les listes de l'utilisateur
  async getUserLists(): Promise<TMDBv4List[]> {
    try {
      const accessToken = localStorage.getItem('tmdb_access_token');
      const accountId = localStorage.getItem('tmdb_account_id');
      
      if (!accessToken || !accountId) {
        throw new Error('Authentification requise');
      }

      const response = await tmdbV4Api.get(`/account/${accountId}/lists`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des listes:', error);
      return [];
    }
  },

  // Créer une nouvelle liste
  async createList(name: string, description: string = ''): Promise<TMDBv4List | null> {
    try {
      const accessToken = localStorage.getItem('tmdb_access_token');
      
      if (!accessToken) {
        throw new Error('Authentification requise');
      }

      const response = await tmdbV4Api.post('/list', {
        name,
        description,
        iso_639_1: 'fr',
        public: false
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error);
      return null;
    }
  },

  // Ajouter un élément à une liste
  async addToList(listId: number, mediaId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('tmdb_access_token');
      
      if (!accessToken) {
        throw new Error('Authentification requise');
      }

      await tmdbV4Api.post(`/list/${listId}/items`, {
        items: [{
          media_id: mediaId,
          media_type: mediaType
        }]
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste:', error);
      return false;
    }
  },

  // Retirer un élément d'une liste
  async removeFromList(listId: number, mediaId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('tmdb_access_token');
      
      if (!accessToken) {
        throw new Error('Authentification requise');
      }

      await tmdbV4Api.delete(`/list/${listId}/items`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        data: {
          items: [{
            media_id: mediaId,
            media_type: mediaType
          }]
        }
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
      return false;
    }
  }
};

// Export des types pour réutilisation
export type { UserPreferences };
