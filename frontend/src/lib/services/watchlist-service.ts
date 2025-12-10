/**
 * Service de Watchlist - Gère les listes de visionnage (séries et films)
 * Principe SRP : Ce service ne gère que les watchlists
 */
import { supabase } from "../supabase";
import { Serie, Movie } from "@/types";

export interface WatchlistItem {
  id: string;
  serieId: number;
  serieName: string;
  serieData: Serie;
  addedAt: string;
}

export interface MovieWatchlistItem {
  id: string;
  movieId: number;
  movieName: string;
  movieData: Movie;
  addedAt: string;
}

export class WatchlistService {
  // ========== SÉRIES ==========

  /**
   * Ajouter une série à la watchlist
   */
  static async addSerie(serie: Serie): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("watchlist_items").insert({
        user_id: user.id,
        serie_id: serie.id,
        serie_name: serie.name,
        serie_data: serie,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de l'ajout à la watchlist:", error);
      return false;
    }
  }

  /**
   * Retirer une série de la watchlist
   */
  static async removeSerie(serieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("serie_id", serieId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de la watchlist:", error);
      return false;
    }
  }

  /**
   * Obtenir la watchlist des séries
   */
  static async getSeries(): Promise<WatchlistItem[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("watchlist_items")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return (
        data?.map((item) => ({
          id: item.id,
          serieId: item.serie_id,
          serieName: item.serie_name,
          serieData: item.serie_data,
          addedAt: item.added_at,
        })) || []
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la watchlist:", error);
      return [];
    }
  }

  /**
   * Vérifier si une série est dans la watchlist
   */
  static async isSerieInWatchlist(serieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("watchlist_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("serie_id", serieId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Erreur lors de la vérification de la watchlist:", error);
      return false;
    }
  }

  // ========== FILMS ==========

  /**
   * Ajouter un film à la watchlist
   */
  static async addMovie(movie: Movie): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("watchlist_movies").insert({
        user_id: user.id,
        movie_id: movie.id,
        movie_name: movie.title,
        movie_data: movie,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de l'ajout du film à la watchlist:", error);
      return false;
    }
  }

  /**
   * Retirer un film de la watchlist
   */
  static async removeMovie(movieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("watchlist_movies")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", movieId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du film de la watchlist:",
        error
      );
      return false;
    }
  }

  /**
   * Obtenir la watchlist des films
   */
  static async getMovies(): Promise<MovieWatchlistItem[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("watchlist_movies")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return (
        data?.map((item) => ({
          id: item.id,
          movieId: item.movie_id,
          movieName: item.movie_name,
          movieData: item.movie_data,
          addedAt: item.added_at,
        })) || []
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la watchlist films:",
        error
      );
      return [];
    }
  }

  /**
   * Vérifier si un film est dans la watchlist
   */
  static async isMovieInWatchlist(movieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("watchlist_movies")
        .select("id")
        .eq("user_id", user.id)
        .eq("movie_id", movieId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la watchlist film:",
        error
      );
      return false;
    }
  }

  // ========== UTILITAIRES ==========

  /**
   * Vider toute la watchlist (séries et films)
   */
  static async clearAll(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      await supabase
        .from("watchlist_items")
        .delete()
        .eq("user_id", user.id);

      await supabase
        .from("watchlist_movies")
        .delete()
        .eq("user_id", user.id);

      return true;
    } catch (error) {
      console.error("Erreur lors du nettoyage de la watchlist:", error);
      return false;
    }
  }
}
