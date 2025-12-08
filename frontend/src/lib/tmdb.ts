import axios from "axios";
import {
  Serie,
  SerieDetails,
  TMDBSearchResponse,
  TMDBDiscoverResponse,
  TMDBGenre,
  TMDBMovieResponse,
  Movie,
  Person,
  VideoResponse,
  Credits,
  TMDBReviewsResponse,
  TMDBMultiSearchResponse,
  WatchProvider,
  CertificationsResponse,
  Language,
  KeywordSearchResponse,
} from "@/types";


const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Configuration de l'API TMDB
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN}`,
  },
  params: {
    language: "fr-FR",
  },
});

// Fonctions utilitaires pour les images
export const getImageUrl = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"
): string => {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "w1280"
): string => {
  if (!path) return "/placeholder-backdrop.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// API Functions
export const tmdbService = {
  // Rechercher des séries, films, personnes
  async searchMulti(
    query: string,
    page: number = 1
  ): Promise<TMDBMultiSearchResponse> {
    const response = await tmdbApi.get("/search/multi", {
      params: { query, page },
    });
    return response.data;
  },

  // TRENDING ENDPOINTS (ALL CONTENT)
  // Obtenir le contenu tendance (films, séries, personnes)
  async getTrendingAll(
    timeWindow: "day" | "week" = "day",
    page: number = 1
  ): Promise<TMDBMultiSearchResponse> {
    const response = await tmdbApi.get(`/trending/all/${timeWindow}`, {
      params: { page },
    });

    // Trier les résultats par popularité décroissante pour assurer l'ordre
    if (response.data && response.data.results) {
      response.data.results.sort(
        (a: any, b: any) => b.popularity - a.popularity
      );
    }

    return response.data;
  },

  // Découvrir du contenu avec des filtres (films et séries)
  async discoverAll(
    params: {
      page?: number;
      with_genres?: string;
      without_genres?: string;
      year?: number;
      vote_average_gte?: number;
      vote_average_lte?: number;
      with_original_language?: string;
      sort_by?: string;
      media_type?: "movie" | "tv";
    } = {}
  ): Promise<any> {
    const { media_type = "movie", ...otherParams } = params;

    const endpoint = media_type === "tv" ? "/discover/tv" : "/discover/movie";
    const dateParam = media_type === "tv" ? "first_air_date_year" : "year";

    const response = await tmdbApi.get(endpoint, {
      params: {
        page: 1,
        sort_by: "popularity.desc",
        [dateParam]: params.year,
        ...otherParams,
      },
    });

    // Ajouter le media_type aux résultats pour la cohérence
    if (response.data && response.data.results) {
      response.data.results = response.data.results.map((item: any) => ({
        ...item,
        media_type,
      }));
    }

    return response.data;
  },

  // Obtenir les détails d'une série
  async getSerieDetails(serieId: number): Promise<SerieDetails> {
    const response = await tmdbApi.get(`/tv/${serieId}`, {
      params: {
        append_to_response: "credits,similar,recommendations,videos",
      },
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

  // Obtenir les avis sur une série
  async getSerieReviews(
    serieId: number,
    page: number = 1
  ): Promise<TMDBReviewsResponse> {
    const response = await tmdbApi.get(`/tv/${serieId}/reviews`, {
      params: { page },
    });
    return response.data;
  },

  // Obtenir les séries tendance
  async getTrendingSeries(
    timeWindow: "day" | "week" = "day",
    page: number = 1
  ): Promise<TMDBSearchResponse> {
    // Utilisation directe de l'endpoint trending de TMDB pour des résultats plus précis
    const response = await tmdbApi.get(`/trending/tv/${timeWindow}`, {
      params: { page },
    });

    // Trier les résultats par popularité décroissante pour assurer l'ordre
    if (response.data && response.data.results) {
      response.data.results.sort(
        (a: any, b: any) => b.popularity - a.popularity
      );
    }

    return response.data;
  },

  // Obtenir les séries populaires
  async getPopularSeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get("/tv/popular", {
      params: { page },
    });
    return response.data;
  },

  // Obtenir les séries les mieux notées
  async getTopRatedSeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get("/tv/top_rated", {
      params: {
        page,
        "vote_count.gte": 500,
      },
    });
    return response.data;
  },

  // Obtenir les séries en cours de diffusion
  async getOnTheAirSeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get("/tv/on_the_air", {
      params: { page },
    });
    return response.data;
  },

  // Obtenir les séries qui diffusent aujourd'hui
  async getAiringTodaySeries(page: number = 1): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get("/tv/airing_today", {
      params: { page },
    });
    return response.data;
  },

  // Obtenir les genres
  async getGenres(): Promise<TMDBGenre[]> {
    const response = await tmdbApi.get("/genre/tv/list");
    return response.data.genres;
  },

  // Obtenir les genres de films
  async getMovieGenres(): Promise<TMDBGenre[]> {
    const response = await tmdbApi.get("/genre/movie/list");
    return response.data.genres;
  },

  // Obtenir des séries similaires
  async getSimilarSeries(
    serieId: number,
    page: number = 1
  ): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get(`/tv/${serieId}/similar`, {
      params: { page },
    });
    return response.data;
  },

  // Obtenir les recommandations basées sur une série
  async getRecommendations(
    serieId: number,
    page: number = 1
  ): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get(`/tv/${serieId}/recommendations`, {
      params: { page },
    });
    return response.data;
  },

  // Rechercher des personnes (acteurs, réalisateurs)
  async searchPeople(
    query: string,
    page: number = 1
  ): Promise<{ results: Person[] }> {
    const response = await tmdbApi.get("/search/person", {
      params: { query, page },
    });
    return response.data;
  },

  // Obtenir les séries d'une personne
  async getPersonTVCredits(personId: number): Promise<{ cast: Serie[] }> {
    const response = await tmdbApi.get(`/person/${personId}/tv_credits`);
    return response.data;
  },

  // Rechercher des séries
  async searchSeries(
    query: string,
    page: number = 1
  ): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get("/search/tv", {
      params: { query, page },
    });
    return response.data;
  },

  // Rechercher des films
  async searchMovies(
    query: string,
    page: number = 1
  ): Promise<TMDBMovieResponse> {
    const response = await tmdbApi.get("/search/movie", {
      params: { query, page },
    });
    return response.data;
  },

  // Rechercher des séries avec support multilingue
  async searchSeriesMultilingual(
    query: string,
    page: number = 1
  ): Promise<TMDBSearchResponse> {
    const response = await tmdbApi.get("/search/tv", {
      params: {
        query,
        page,
        include_adult: false,
      },
    });
    return response.data;
  },

  // Rechercher du contenu multiple (films, séries, personnes)
  async searchMultiContent(
    query: string,
    page: number = 1
  ): Promise<TMDBMultiSearchResponse> {
    const response = await tmdbApi.get("/search/multi", {
      params: { query, page },
    });
    return response.data;
  },

  // MOVIES ENDPOINTS
  // Obtenir les films à venir
  async getUpcomingMovies(page: number = 1): Promise<TMDBMovieResponse> {
    const response = await tmdbApi.get("/movie/upcoming", {
      params: { page },
    });
    return response.data;
  },

  // Obtenir les détails d'un film
  async getMovieDetails(
    movieId: number
  ): Promise<
    Movie & {
      videos?: VideoResponse;
      credits?: Credits;
      similar?: TMDBMovieResponse;
    }
  > {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: "credits,similar,recommendations,videos",
      },
    });
    return response.data;
  },

  // Obtenir les vidéos d'un film (trailers, teasers, etc.)
  async getMovieVideos(movieId: number): Promise<VideoResponse> {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    return response.data;
  },

  // Obtenir les films populaires
  async getPopularMovies(page: number = 1): Promise<TMDBMovieResponse> {
    const response = await tmdbApi.get("/movie/popular", {
      params: { page },
    });
    return response.data;
  },

  // Obtenir les films les mieux notés
  async getTopRatedMovies(page: number = 1): Promise<TMDBMovieResponse> {
    const response = await tmdbApi.get("/movie/top_rated", {
      params: {
        page,
        "vote_count.gte": 500,
      },
    });
    return response.data;
  },

  // Obtenir les films en cours de diffusion dans les cinémas
  async getNowPlayingMovies(page: number = 1): Promise<TMDBMovieResponse> {
    const response = await tmdbApi.get("/movie/now_playing", {
      params: { page },
    });
    return response.data;
  },

  // Découvrir des séries avec des filtres
  async discoverSeries(
    params: {
      page?: number;
      with_genres?: string;
      without_genres?: string;
      first_air_date_year?: number;
      vote_average_gte?: number;
      vote_average_lte?: number;
      with_original_language?: string;
      sort_by?: string;
    } = {}
  ): Promise<TMDBDiscoverResponse> {
    const response = await tmdbApi.get("/discover/tv", {
      params: {
        page: 1,
        sort_by: "popularity.desc",
        ...params,
      },
    });
    return response.data;
  },

  // Mettre à jour la langue de l'API
  setLanguage(language: string) {
    tmdbApi.defaults.params.language = language;
  },

  // Obtenir les films similaires
  async getSimilarMovies(
    movieId: number,
    page: number = 1
  ): Promise<TMDBMovieResponse> {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`, {
      params: { page },
    });
    return response.data;
  },

  // ===== NOUVEAUX ENDPOINTS POUR LES FILTRES =====

  // Obtenir les services de streaming disponibles
  async getWatchProviders(
    mediaType: "movie" | "tv",
    region: string = "FR"
  ): Promise<WatchProvider[]> {
    const response = await tmdbApi.get(`/watch/providers/${mediaType}`, {
      params: { watch_region: region },
    });
    return response.data.results || [];
  },

  // Obtenir les certifications (classifications d'âge)
  async getCertifications(
    mediaType: "movie" | "tv"
  ): Promise<CertificationsResponse> {
    const response = await tmdbApi.get(`/certification/${mediaType}/list`);
    return response.data;
  },

  // Obtenir la liste des langues
  async getLanguages(): Promise<Language[]> {
    const response = await tmdbApi.get("/configuration/languages");
    return response.data;
  },

  // Rechercher des mots-clés
  async searchKeywords(query: string): Promise<KeywordSearchResponse> {
    const response = await tmdbApi.get("/search/keyword", {
      params: { query },
    });
    return response.data;
  },

  // Découvrir des films avec filtres avancés
  async discoverMovies(
    params: {
      page?: number;
      with_genres?: string;
      without_genres?: string;
      year?: number;
      primary_release_date_gte?: string;
      primary_release_date_lte?: string;
      vote_average_gte?: number;
      vote_average_lte?: number;
      vote_count_gte?: number;
      with_original_language?: string;
      with_runtime_gte?: number;
      with_runtime_lte?: number;
      with_watch_providers?: string;
      watch_region?: string;
      with_watch_monetization_types?: string;
      certification?: string;
      certification_country?: string;
      with_keywords?: string;
      sort_by?: string;
    } = {}
  ): Promise<TMDBMovieResponse> {
    // Transformer les noms de paramètres pour utiliser la notation avec points de TMDB
    const apiParams: Record<string, any> = {
      page: params.page || 1,
      sort_by: params.sort_by || "popularity.desc",
    };

    // Mapper les paramètres avec underscores vers la notation avec points
    if (params.with_genres) apiParams.with_genres = params.with_genres;
    if (params.without_genres) apiParams.without_genres = params.without_genres;
    if (params.year) apiParams.year = params.year;
    if (params.primary_release_date_gte) apiParams["primary_release_date.gte"] = params.primary_release_date_gte;
    if (params.primary_release_date_lte) apiParams["primary_release_date.lte"] = params.primary_release_date_lte;
    if (params.vote_average_gte) apiParams["vote_average.gte"] = params.vote_average_gte;
    if (params.vote_average_lte) apiParams["vote_average.lte"] = params.vote_average_lte;
    if (params.vote_count_gte) apiParams["vote_count.gte"] = params.vote_count_gte;
    if (params.with_original_language) apiParams.with_original_language = params.with_original_language;
    if (params.with_runtime_gte) apiParams["with_runtime.gte"] = params.with_runtime_gte;
    if (params.with_runtime_lte) apiParams["with_runtime.lte"] = params.with_runtime_lte;
    if (params.with_watch_providers) apiParams.with_watch_providers = params.with_watch_providers;
    if (params.watch_region) apiParams.watch_region = params.watch_region;
    if (params.with_watch_monetization_types) apiParams.with_watch_monetization_types = params.with_watch_monetization_types;
    if (params.certification) apiParams.certification = params.certification;
    if (params.certification_country) apiParams.certification_country = params.certification_country;
    if (params.with_keywords) apiParams.with_keywords = params.with_keywords;

    const response = await tmdbApi.get("/discover/movie", {
      params: apiParams,
    });
    return response.data;
  },

  // Découvrir des séries avec filtres avancés (mise à jour)
  async discoverSeriesAdvanced(
    params: {
      page?: number;
      with_genres?: string;
      without_genres?: string;
      first_air_date_year?: number;
      first_air_date_gte?: string;
      first_air_date_lte?: string;
      vote_average_gte?: number;
      vote_average_lte?: number;
      vote_count_gte?: number;
      with_original_language?: string;
      with_runtime_gte?: number;
      with_runtime_lte?: number;
      with_watch_providers?: string;
      watch_region?: string;
      with_watch_monetization_types?: string;
      with_keywords?: string;
      sort_by?: string;
    } = {}
  ): Promise<TMDBDiscoverResponse> {
    // Transformer les noms de paramètres pour utiliser la notation avec points de TMDB
    const apiParams: Record<string, any> = {
      page: params.page || 1,
      sort_by: params.sort_by || "popularity.desc",
    };

    // Mapper les paramètres avec underscores vers la notation avec points
    if (params.with_genres) apiParams.with_genres = params.with_genres;
    if (params.without_genres) apiParams.without_genres = params.without_genres;
    if (params.first_air_date_year) apiParams.first_air_date_year = params.first_air_date_year;
    if (params.first_air_date_gte) apiParams["first_air_date.gte"] = params.first_air_date_gte;
    if (params.first_air_date_lte) apiParams["first_air_date.lte"] = params.first_air_date_lte;
    if (params.vote_average_gte) apiParams["vote_average.gte"] = params.vote_average_gte;
    if (params.vote_average_lte) apiParams["vote_average.lte"] = params.vote_average_lte;
    if (params.vote_count_gte) apiParams["vote_count.gte"] = params.vote_count_gte;
    if (params.with_original_language) apiParams.with_original_language = params.with_original_language;
    if (params.with_runtime_gte) apiParams["with_runtime.gte"] = params.with_runtime_gte;
    if (params.with_runtime_lte) apiParams["with_runtime.lte"] = params.with_runtime_lte;
    if (params.with_watch_providers) apiParams.with_watch_providers = params.with_watch_providers;
    if (params.watch_region) apiParams.watch_region = params.watch_region;
    if (params.with_watch_monetization_types) apiParams.with_watch_monetization_types = params.with_watch_monetization_types;
    if (params.with_keywords) apiParams.with_keywords = params.with_keywords;

    const response = await tmdbApi.get("/discover/tv", {
      params: apiParams,
    });
    return response.data;
  },
};
