/**
 * Service d'historique de visionnage - Gère les contenus vus
 * Principe SRP : Ce service ne gère que l'historique des vues
 */
import { supabase } from "../supabase";
import { Serie, Movie } from "@/types";

export interface WatchedSerie {
  id: string;
  serieId: number;
  serieName: string;
  serieData: Serie;
  watchedAt: string;
  seasonsWatched: number[];
  episodesWatched: Record<string, number[]>;
}

export interface WatchedMovie {
  id: string;
  movieId: number;
  movieName: string;
  movieData: Movie;
  watchedAt: string;
}

export class WatchHistoryService {
  // ========== SÉRIES ==========

  /**
   * Marquer une série comme vue
   */
  static async markSerieAsWatched(
    serie: Serie,
    seasonNumber?: number,
    episodeNumbers?: number[]
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: existing } = await supabase
        .from("watched_series")
        .select("*")
        .eq("user_id", user.id)
        .eq("serie_id", serie.id)
        .maybeSingle();

      if (existing) {
        const seasonsWatched = existing.seasons_watched || [];
        const episodesWatched = existing.episodes_watched || {};

        if (seasonNumber !== undefined) {
          if (!seasonsWatched.includes(seasonNumber)) {
            seasonsWatched.push(seasonNumber);
          }
          if (episodeNumbers) {
            episodesWatched[seasonNumber.toString()] = episodeNumbers;
          }
        }

        const { error } = await supabase
          .from("watched_series")
          .update({
            seasons_watched: seasonsWatched,
            episodes_watched: episodesWatched,
            watched_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("serie_id", serie.id);

        if (error) throw error;
      } else {
        const seasonsWatched = seasonNumber !== undefined ? [seasonNumber] : [];
        const episodesWatched =
          seasonNumber !== undefined && episodeNumbers
            ? { [seasonNumber.toString()]: episodeNumbers }
            : {};

        const { error } = await supabase.from("watched_series").insert({
          user_id: user.id,
          serie_id: serie.id,
          serie_name: serie.name,
          serie_data: serie,
          seasons_watched: seasonsWatched,
          episodes_watched: episodesWatched,
        });

        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error("Erreur lors du marquage comme vu:", error);
      return false;
    }
  }

  /**
   * Obtenir les séries vues
   */
  static async getWatchedSeries(): Promise<WatchedSerie[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("watched_series")
        .select("*")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false });

      if (error) throw error;
      return (
        data?.map((serie) => ({
          id: serie.id,
          serieId: serie.serie_id,
          serieName: serie.serie_name,
          serieData: serie.serie_data,
          watchedAt: serie.watched_at,
          seasonsWatched: serie.seasons_watched || [],
          episodesWatched: serie.episodes_watched || {},
        })) || []
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des séries vues:", error);
      return [];
    }
  }

  /**
   * Vérifier si une série a été vue
   */
  static async isSerieWatched(serieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("watched_series")
        .select("id")
        .eq("user_id", user.id)
        .eq("serie_id", serieId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Erreur lors de la vérification si vu:", error);
      return false;
    }
  }

  /**
   * Supprimer une série de l'historique
   */
  static async removeWatchedSerie(serieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("watched_series")
        .delete()
        .eq("user_id", user.id)
        .eq("serie_id", serieId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de la série vue:", error);
      return false;
    }
  }

  // ========== FILMS ==========

  /**
   * Marquer un film comme vu
   */
  static async markMovieAsWatched(movie: Movie): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("watched_movies").insert({
        user_id: user.id,
        movie_id: movie.id,
        movie_name: movie.title,
        movie_data: movie,
      });

      if (error) {
        if (error.code === "23505") {
          const { error: updateError } = await supabase
            .from("watched_movies")
            .update({ watched_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("movie_id", movie.id);

          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error("Erreur lors du marquage du film comme vu:", error);
      return false;
    }
  }

  /**
   * Obtenir les films vus
   */
  static async getWatchedMovies(): Promise<WatchedMovie[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("watched_movies")
        .select("*")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false });

      if (error) throw error;
      return (
        data?.map((movie) => ({
          id: movie.id,
          movieId: movie.movie_id,
          movieName: movie.movie_name,
          movieData: movie.movie_data,
          watchedAt: movie.watched_at,
        })) || []
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des films vus:", error);
      return [];
    }
  }

  /**
   * Vérifier si un film a été vu
   */
  static async isMovieWatched(movieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("watched_movies")
        .select("id")
        .eq("user_id", user.id)
        .eq("movie_id", movieId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Erreur lors de la vérification si film vu:", error);
      return false;
    }
  }

  /**
   * Supprimer un film de l'historique
   */
  static async removeWatchedMovie(movieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("watched_movies")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", movieId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du film vu:", error);
      return false;
    }
  }

  // ========== UTILITAIRES ==========

  /**
   * Effacer l'historique des séries vues
   */
  static async clearSeriesHistory(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("watched_series")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'historique:", error);
      return false;
    }
  }

  /**
   * Effacer tout l'historique (séries et films)
   */
  static async clearAllHistory(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      await supabase
        .from("watched_series")
        .delete()
        .eq("user_id", user.id);

      await supabase
        .from("watched_movies")
        .delete()
        .eq("user_id", user.id);

      return true;
    } catch (error) {
      console.error("Erreur lors du nettoyage de l'historique:", error);
      return false;
    }
  }
}
