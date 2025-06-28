// Types pour l'application WatchWhat

export interface Serie {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  media_type: 'tv';
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  video: boolean;
  media_type: 'movie';
}

export interface SerieDetails extends Serie {
  created_by: Person[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Episode | null;
  next_episode_to_air: Episode | null;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  credits?: Credits;
  videos?: VideoResponse;
  similar?: TMDBSearchResponse;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  job?: string;
  media_type: 'person';
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// Types pour les vidéos/trailers
export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

// Types pour les crédits
export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

// Types pour l'historique de visionnage
export interface WatchedSerie {
  id?: string;
  userId: string;
  serieId: number;
  serieData: Serie;
  watchedAt: Date;
  rating?: number;
  review?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Types pour les recommandations
export interface Recommendation {
  serie: Serie;
  score: number;
  reasons: string[];
}

// Types pour l'API TMDB
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBSearchResponse extends TMDBResponse<Serie> {}

export type SearchResult = Movie | Serie | Person;

export interface TMDBMultiSearchResponse extends TMDBResponse<SearchResult> {}

export interface TMDBDiscoverResponse extends TMDBResponse<Serie> {}

export interface Review {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface TMDBReviewsResponse extends TMDBResponse<Review> {}

// Types pour les données utilisateur
export interface UserPreferences {
  id?: string;
  userId: string;
  preferredLanguages: string[];
  favoriteGenres: number[];
  favoriteSeries: Serie[];
  notificationsEnabled: boolean;
  autoAddToWatchlist: boolean;
  showAdultContent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WatchlistItem {
  id?: string;
  userId: string;
  serieId: number;
  serieData: Serie;
  addedAt: Date;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserRating {
  id?: string;
  userId: string;
  serieId: number;
  rating: number;
  review?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
