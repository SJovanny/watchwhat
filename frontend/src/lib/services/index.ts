/**
 * Module de services - Point d'entrée centralisé
 * Exporte tous les services spécialisés pour une utilisation facile
 */

export { AuthService, type UserData } from "./auth-service";
export {
  WatchlistService,
  type WatchlistItem,
  type MovieWatchlistItem,
} from "./watchlist-service";
export {
  WatchHistoryService,
  type WatchedSerie,
  type WatchedMovie,
} from "./watch-history-service";
export { RatingsService, type Rating } from "./ratings-service";
export { PreferencesService } from "./preferences-service";
export { StatsService, type UserStats } from "./stats-service";
