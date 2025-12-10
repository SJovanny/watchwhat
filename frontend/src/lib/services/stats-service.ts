/**
 * Service de statistiques - Gère les statistiques utilisateur
 * Principe SRP : Ce service ne gère que les statistiques
 */
import { supabase } from "../supabase";

export interface UserStats {
  watchlistCount: number;
  watchedCount: number;
  ratingsCount: number;
  averageRating: number;
}

export class StatsService {
  /**
   * Obtenir les statistiques de l'utilisateur
   */
  static async getUserStats(): Promise<UserStats | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const [
        seriesWatchlist,
        moviesWatchlist,
        watchedSeries,
        watchedMovies,
        ratings,
      ] = await Promise.all([
        supabase
          .from("watchlist_items")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("watchlist_movies")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("watched_series")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("watched_movies")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase.from("ratings").select("rating").eq("user_id", user.id),
      ]);

      const watchlistCount =
        (seriesWatchlist.count || 0) + (moviesWatchlist.count || 0);
      const watchedCount =
        (watchedSeries.count || 0) + (watchedMovies.count || 0);
      const ratingsCount = ratings.data?.length || 0;

      let averageRating = 0;
      if (ratings.data && ratings.data.length > 0) {
        const sum = ratings.data.reduce((acc, r) => acc + r.rating, 0);
        averageRating = Math.round((sum / ratings.data.length) * 10) / 10;
      }

      return {
        watchlistCount,
        watchedCount,
        ratingsCount,
        averageRating,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      return null;
    }
  }
}
