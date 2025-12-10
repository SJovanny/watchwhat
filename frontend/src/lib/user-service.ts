/**
 * UserService - Façade rétrocompatible
 *
 * Ce fichier maintient la rétrocompatibilité avec le code existant
 * tout en déléguant vers les services spécialisés.
 *
 * ARCHITECTURE REFACTORISÉE (SRP):
 * - AuthService: Authentification
 * - WatchlistService: Gestion des watchlists
 * - WatchHistoryService: Historique de visionnage
 * - RatingsService: Notes et avis
 * - PreferencesService: Préférences utilisateur
 * - StatsService: Statistiques
 *
 * Les imports directs des services sont recommandés pour du nouveau code:
 * import { AuthService } from '@/lib/services';
 */

import { Serie, Movie, UserPreferences } from "@/types";
import { AuthService, UserData } from "./services/auth-service";
import { WatchlistService, WatchlistItem } from "./services/watchlist-service";
import {
  WatchHistoryService,
  WatchedSerie,
} from "./services/watch-history-service";
import { RatingsService, Rating } from "./services/ratings-service";
import { PreferencesService } from "./services/preferences-service";
import { StatsService } from "./services/stats-service";

// Re-export des types pour rétrocompatibilité
export type { UserData, WatchlistItem, WatchedSerie, Rating };

// Re-export des interfaces legacy
export interface UserPreferencesLegacy {
  favoriteGenres: number[];
  favoriteActors: number[];
  minRating: number;
  preferredLanguage: string;
}

/**
 * Façade UserService - Maintient l'API existante
 * Délègue toutes les opérations vers les services spécialisés
 */
export class UserService {
  // ==================== AUTH ====================
  static getCurrentUser = AuthService.getCurrentUser;
  static upsertUserProfile = AuthService.upsertUserProfile;
  static checkEmailExists = AuthService.checkEmailExists;
  static syncUserAfterLogin = AuthService.syncUserAfterLogin;
  static signInWithGoogle = AuthService.signInWithGoogle;
  static signInWithEmail = AuthService.signInWithEmail;
  static signUpWithEmail = AuthService.signUpWithEmail;
  static signOut = AuthService.signOut;
  static onAuthStateChange = AuthService.onAuthStateChange;

  // ==================== WATCHLIST SÉRIES ====================
  static async addToWatchlist(serie: Serie): Promise<boolean> {
    return WatchlistService.addSerie(serie);
  }

  static async removeFromWatchlist(serieId: number): Promise<boolean> {
    return WatchlistService.removeSerie(serieId);
  }

  static async getWatchlist(): Promise<WatchlistItem[]> {
    return WatchlistService.getSeries();
  }

  static async isInWatchlist(serieId: number): Promise<boolean> {
    return WatchlistService.isSerieInWatchlist(serieId);
  }

  // ==================== WATCHLIST FILMS ====================
  static async addMovieToWatchlist(movie: Movie): Promise<boolean> {
    return WatchlistService.addMovie(movie);
  }

  static async removeMovieFromWatchlist(movieId: number): Promise<boolean> {
    return WatchlistService.removeMovie(movieId);
  }

  static async getMoviesWatchlist(): Promise<any[]> {
    return WatchlistService.getMovies();
  }

  static async isMovieInWatchlist(movieId: number): Promise<boolean> {
    return WatchlistService.isMovieInWatchlist(movieId);
  }

  static async clearWatchlist(): Promise<boolean> {
    return WatchlistService.clearAll();
  }

  // ==================== HISTORIQUE SÉRIES ====================
  static async markAsWatched(
    serie: Serie,
    seasonNumber?: number,
    episodeNumbers?: number[]
  ): Promise<boolean> {
    return WatchHistoryService.markSerieAsWatched(
      serie,
      seasonNumber,
      episodeNumbers
    );
  }

  static async getWatchedSeries(): Promise<WatchedSerie[]> {
    return WatchHistoryService.getWatchedSeries();
  }

  static async isWatched(serieId: number): Promise<boolean> {
    return WatchHistoryService.isSerieWatched(serieId);
  }

  static async clearWatchedHistory(): Promise<boolean> {
    return WatchHistoryService.clearSeriesHistory();
  }

  static async removeWatchedSerie(serieId: number): Promise<boolean> {
    return WatchHistoryService.removeWatchedSerie(serieId);
  }

  // ==================== HISTORIQUE FILMS ====================
  static async markMovieAsWatched(movie: Movie): Promise<boolean> {
    return WatchHistoryService.markMovieAsWatched(movie);
  }

  static async getWatchedMovies(): Promise<any[]> {
    return WatchHistoryService.getWatchedMovies();
  }

  static async isMovieWatched(movieId: number): Promise<boolean> {
    return WatchHistoryService.isMovieWatched(movieId);
  }

  static async removeWatchedMovie(movieId: number): Promise<boolean> {
    return WatchHistoryService.removeWatchedMovie(movieId);
  }

  static async clearAllWatchedHistory(): Promise<boolean> {
    return WatchHistoryService.clearAllHistory();
  }

  // ==================== RATINGS ====================
  static async rateSerie(
    serieId: number,
    rating: number,
    review?: string
  ): Promise<boolean> {
    return RatingsService.rateSerie(serieId, rating, review);
  }

  static async getUserRating(serieId: number): Promise<Rating | null> {
    return RatingsService.getUserRating(serieId);
  }

  static async getUserRatings(): Promise<Rating[]> {
    return RatingsService.getUserRatings();
  }

  // ==================== PREFERENCES ====================
  static async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    return PreferencesService.updatePreferences(preferences);
  }

  static async getPreferences(): Promise<UserPreferences | null> {
    return PreferencesService.getPreferences();
  }

  static getDefaultPreferences(userId: string): UserPreferences {
    return PreferencesService.getDefaultPreferences(userId);
  }

  // ==================== STATS ====================
  static async getUserStats() {
    return StatsService.getUserStats();
  }
}
