import axios from 'axios';
import { 
  Serie, 
  SerieDetails, 
  TMDBSearchResponse, 
  TMDBDiscoverResponse, 
  TMDBGenre,
  Person,
  VideoResponse,
  Credits
} from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Configuration de l'API TMDB
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    language: 'fr-FR'
  }
});

// Fonctions utilitaires pour les images
export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-poster.svg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!path) return '/placeholder-backdrop.svg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// API Functions
export const tmdbService = {
  // Rechercher des séries
  async searchSeries(query: string, page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get('/search/tv', {
      params: { query, page }
    });
    return response.data;
  },

  // Découvrir des séries avec des filtres
  async discoverSeries(params: {
    page?: number;
    with_genres?: string;
    without_genres?: string;
    first_air_date_year?: number;
    vote_average_gte?: number;
    vote_average_lte?: number;
    with_original_language?: string;
    sort_by?: string;
  } = {}): Promise<TMDBDiscoverResponse> {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        page: 1,
        sort_by: 'popularity.desc',
        ...params
      }
    });
    return response.data;
  },

  // Obtenir les détails d'une série
  async getSerieDetails(serieId: number): Promise<SerieDetails> {
    const response = await tmdbApi.get(`/tv/${serieId}`, {
      params: {
        append_to_response: 'credits,similar,recommendations,videos'
      }
    });
    return response.data;
  },

  // Obtenir les vidéos d'une série (trailers, teasers, etc.)
  async getSerieVideos(serieId: number): Promise<VideoResponse> {
    const response = await tmdbApi.get(`/tv/${serieId}/videos`);
    return response.data;
  },

  // Obtenir les crédits d'une série (cast et crew)
  async getSerieCredits(serieId: number): Promise<Credits> {
    const response = await tmdbApi.get(`/tv/${serieId}/credits`);
    return response.data;
  },

  // Obtenir les séries populaires
  async getPopularSeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get('/tv/popular', {
      params: { page }
    });
    return response.data;
  },

  // Obtenir les séries les mieux notées
  async getTopRatedSeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get('/tv/top_rated', {
      params: { page }
    });
    return response.data;
  },

  // Obtenir les séries en cours de diffusion
  async getOnTheAirSeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get('/tv/on_the_air', {
      params: { page }
    });
    return response.data;
  },

  // Obtenir les séries qui diffusent aujourd'hui
  async getAiringTodaySeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get('/tv/airing_today', {
      params: { page }
    });
    return response.data;
  },

  // Obtenir les genres
  async getGenres(): Promise<TMDBGenre[]> {
    const response = await tmdbApi.get('/genre/tv/list');
    return response.data.genres;
  },

  // Obtenir des séries similaires
  async getSimilarSeries(serieId: number, page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get(`/tv/${serieId}/similar`, {
      params: { page }
    });
    return response.data;
  },

  // Obtenir les recommandations basées sur une série
  async getRecommendations(serieId: number, page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get(`/tv/${serieId}/recommendations`, {
      params: { page }
    });
    return response.data;
  },

  // Rechercher des personnes (acteurs, réalisateurs)
  async searchPeople(query: string, page: number = 1): Promise<{ results: Person[] }> {
    const response = await tmdbApi.get('/search/person', {
      params: { query, page }
    });
    return response.data;
  },

  // Obtenir les séries d'une personne
  async getPersonTVCredits(personId: number): Promise<{ cast: Serie[] }> {
    const response = await tmdbApi.get(`/person/${personId}/tv_credits`);
    return response.data;
  }
};

// Fonction pour générer des recommandations personnalisées
export const generateRecommendations = async (
  preferences: {
    favoriteGenres: number[];
    favoriteActors: Person[];
    watchedSeries: number[];
    minRating?: number;
  }
): Promise<Serie[]> => {
  try {
    const genreIds = preferences.favoriteGenres.join(',');
    
    const response = await tmdbService.discoverSeries({
      with_genres: genreIds,
      vote_average_gte: preferences.minRating || 7,
      sort_by: 'vote_average.desc',
      page: 1
    });

    // Filtrer les séries déjà vues
    const filteredResults = response.results.filter(
      serie => !preferences.watchedSeries.includes(serie.id)
    );

    return filteredResults.slice(0, 20);
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    return [];
  }
};
