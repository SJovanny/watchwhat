import { supabase } from "./supabase";
import { Serie } from "@/types";

export interface UserData {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

export interface WatchlistItem {
  id: string;
  serieId: number;
  serieName: string;
  serieData: Serie;
  addedAt: string;
}

export interface WatchedSerie {
  id: string;
  serieId: number;
  serieName: string;
  serieData: Serie;
  watchedAt: string;
  seasonsWatched: number[];
  episodesWatched: Record<string, number[]>;
}

export interface UserPreferences {
  favoriteGenres: number[];
  favoriteActors: number[];
  minRating: number;
  preferredLanguage: string;
}

export interface Rating {
  id: string;
  serieId: number;
  rating: number;
  review?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  // Obtenir l'utilisateur connecté
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      return (
        userData || {
          id: user.id,
          email: user.email!,
          firstName:
            user.user_metadata?.given_name ||
            user.user_metadata?.name?.split(" ")[0] ||
            null,
          lastName:
            user.user_metadata?.family_name ||
            user.user_metadata?.name?.split(" ")[1] ||
            null,
          avatar: user.user_metadata?.avatar_url || null,
        }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  }

  // Créer ou mettre à jour le profil utilisateur
  static async upsertUserProfile(userData: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<boolean> {
    try {
      // Vérifier d'abord si l'utilisateur existe
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id, firstName, lastName, avatar")
        .eq("id", userData.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingUser) {
        // Mettre à jour seulement si l'utilisateur existe déjà
        const { error } = await supabase
          .from("users")
          .update({
            email: userData.email,
            firstName: userData.firstName || existingUser.firstName,
            lastName: userData.lastName || existingUser.lastName,
            avatar: userData.avatar || existingUser.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userData.id);

        if (error) throw error;
      }
      // Si l'utilisateur n'existe pas, le trigger le créera automatiquement

      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return false;
    }
  }

  // Vérifier si un email existe déjà
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Vérifier dans public.users d'abord
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        return true;
      }

      // Si pas dans public.users, on ne peut pas vérifier auth.users directement
      // On laisse Supabase gérer l'erreur lors de l'inscription
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  }

  // Synchroniser l'utilisateur dans public.users après connexion
  static async syncUserAfterLogin(userId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== userId) return;

      // Vérifier si l'utilisateur existe dans public.users
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      // Si l'utilisateur n'existe pas, le créer
      if (!existingUser) {
        await this.upsertUserProfile({
          id: user.id,
          email: user.email!,
          firstName:
            user.user_metadata?.given_name ||
            user.user_metadata?.name?.split(" ")[0],
          lastName:
            user.user_metadata?.family_name ||
            user.user_metadata?.name?.split(" ")[1],
          avatar: user.user_metadata?.avatar_url,
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la synchronisation de l'utilisateur:",
        error
      );
    }
  }

  // Authentification
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Erreur de connexion:", error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  static async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Erreur de connexion:", error);
      return { success: false, error };
    }

    // Synchroniser l'utilisateur dans public.users si nécessaire
    if (data.user) {
      await this.syncUserAfterLogin(data.user.id);
    }

    return { success: true, data };
  }

  static async signUpWithEmail(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          given_name: firstName,
          family_name: lastName,
          name:
            firstName && lastName
              ? `${firstName} ${lastName}`
              : firstName || "",
        },
      },
    });

    if (error) {
      console.error("Erreur d'inscription:", error);

      // Vérifier si c'est une erreur de compte déjà existant
      if (
        error.message.includes("already registered") ||
        error.message.includes("already exists") ||
        error.message.includes("User already registered")
      ) {
        return {
          success: false,
          error: {
            message:
              "Un compte avec cet email existe déjà. Veuillez vous connecter.",
            code: "email_exists",
            originalError: error,
          },
        };
      }

      return { success: false, error };
    }

    return { success: true, data };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur de déconnexion:", error);
      return { success: false, error };
    }
    return { success: true };
  }

  // Gestion de la watchlist
  static async addToWatchlist(serie: Serie): Promise<boolean> {
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

  static async removeFromWatchlist(serieId: number): Promise<boolean> {
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

  static async getWatchlist(): Promise<WatchlistItem[]> {
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

  static async isInWatchlist(serieId: number): Promise<boolean> {
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

  // Gestion des séries vues
  static async markAsWatched(
    serie: Serie,
    seasonNumber?: number,
    episodeNumbers?: number[]
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Vérifier si la série existe déjà
      const { data: existing } = await supabase
        .from("watched_series")
        .select("*")
        .eq("user_id", user.id)
        .eq("serie_id", serie.id)
        .maybeSingle();

      if (existing) {
        // Mettre à jour
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
        // Créer nouvelle entrée
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

  static async clearWatchedHistory(): Promise<boolean> {
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

  static async isWatched(serieId: number): Promise<boolean> {
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

  // Gestion des préférences complètes
  static async updatePreferences(
    preferences: Partial<import("@/types").UserPreferences>
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Préparer les données pour Supabase (snake_case)
      const updateData: any = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Mapper les champs camelCase vers snake_case
      if (preferences.language !== undefined) updateData.language = preferences.language;
      if (preferences.country !== undefined) updateData.country = preferences.country;
      if (preferences.includeAdult !== undefined) updateData.include_adult = preferences.includeAdult;
      if (preferences.favoriteGenres !== undefined) updateData.favorite_genres = preferences.favoriteGenres;
      if (preferences.dislikedGenres !== undefined) updateData.disliked_genres = preferences.dislikedGenres;
      if (preferences.favoriteActors !== undefined) updateData.favorite_actors = preferences.favoriteActors;
      if (preferences.minRating !== undefined) updateData.min_rating = preferences.minRating;
      if (preferences.maxRating !== undefined) updateData.max_rating = preferences.maxRating;
      if (preferences.releaseYearFrom !== undefined) updateData.release_year_from = preferences.releaseYearFrom;
      if (preferences.releaseYearTo !== undefined) updateData.release_year_to = preferences.releaseYearTo;
      if (preferences.theme !== undefined) updateData.theme = preferences.theme;
      if (preferences.defaultView !== undefined) updateData.default_view = preferences.defaultView;
      if (preferences.itemsPerPage !== undefined) updateData.items_per_page = preferences.itemsPerPage;
      if (preferences.autoplay !== undefined) updateData.autoplay = preferences.autoplay;
      if (preferences.showSpoilers !== undefined) updateData.show_spoilers = preferences.showSpoilers;
      if (preferences.notifications !== undefined) updateData.notifications = preferences.notifications;

      console.log('[UserService] Tentative upsert avec:', updateData);
      
      const { data, error } = await supabase.from("user_preferences").upsert(updateData, {
        onConflict: 'user_id'
      });

      if (error) {
        console.error('[UserService] Erreur Supabase détaillée:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        throw error;
      }
      console.log('[UserService] Préférences sauvegardées en BDD:', data);
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des préférences:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2)
      });
      return false;
    }
  }

  static async getPreferences(): Promise<import("@/types").UserPreferences | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la récupération des préférences:", error);
        return null;
      }

      // Si pas de préférences, créer les valeurs par défaut
      if (!data) {
        console.log('[UserService] Aucune préférence trouvée, création des valeurs par défaut');
        const defaultPrefs = this.getDefaultPreferences(user.id);
        await this.updatePreferences(defaultPrefs);
        return defaultPrefs;
      }

      // Mapper les champs snake_case vers camelCase
      const prefs: import("@/types").UserPreferences = {
        id: data.id,
        userId: data.user_id,
        language: data.language || "fr-FR",
        country: data.country || "FR",
        includeAdult: data.include_adult || false,
        favoriteGenres: data.favorite_genres || [],
        dislikedGenres: data.disliked_genres || [],
        favoriteActors: data.favorite_actors || [],
        minRating: data.min_rating || 0,
        maxRating: data.max_rating || 10,
        releaseYearFrom: data.release_year_from,
        releaseYearTo: data.release_year_to,
        theme: data.theme || "auto",
        defaultView: data.default_view || "grid",
        itemsPerPage: data.items_per_page || 20,
        autoplay: data.autoplay ?? true,
        showSpoilers: data.show_spoilers || false,
        notifications: data.notifications || {
          newReleases: true,
          recommendations: true,
          watchlistUpdates: true,
        },
        // Champs legacy pour compatibilité
        preferredLanguages: [data.language || "fr-FR"],
        favoriteSeries: [],
        notificationsEnabled: true,
        autoAddToWatchlist: false,
        showAdultContent: data.include_adult || false,
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      };

      console.log('[UserService] Préférences chargées depuis BDD:', prefs);
      return prefs;
    } catch (error) {
      console.error("Erreur lors de la récupération des préférences:", error);
      return null;
    }
  }

  static getDefaultPreferences(userId: string): import("@/types").UserPreferences {
    return {
      userId,
      language: "fr-FR",
      country: "FR",
      includeAdult: false,
      favoriteGenres: [],
      dislikedGenres: [],
      favoriteActors: [],
      minRating: 0,
      maxRating: 10,
      theme: "auto",
      defaultView: "grid",
      itemsPerPage: 20,
      autoplay: true,
      showSpoilers: false,
      notifications: {
        newReleases: true,
        recommendations: true,
        watchlistUpdates: true,
      },
      // Champs legacy
      preferredLanguages: ["fr-FR"],
      favoriteSeries: [],
      notificationsEnabled: true,
      autoAddToWatchlist: false,
      showAdultContent: false,
    };
  }

  // Gestion des notes
  static async rateSerie(
    serieId: number,
    rating: number,
    review?: string
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("ratings").upsert({
        user_id: user.id,
        serie_id: serieId,
        rating,
        review,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la notation:", error);
      return false;
    }
  }

  static async getUserRating(serieId: number): Promise<Rating | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("user_id", user.id)
        .eq("serie_id", serieId)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        serieId: data.serie_id,
        rating: data.rating,
        review: data.review,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la note:", error);
      return null;
    }
  }

  static async getUserRatings(): Promise<Rating[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (
        data?.map((rating) => ({
          id: rating.id,
          serieId: rating.serie_id,
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.created_at,
          updatedAt: rating.updated_at,
        })) || []
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des notes:", error);
      return [];
    }
  }

  // ============= GESTION DES FILMS =============

  // Gestion de la watchlist films
  static async addMovieToWatchlist(movie: any): Promise<boolean> {
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

  static async removeMovieFromWatchlist(movieId: number): Promise<boolean> {
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

  // Gestion des films vus
  static async markMovieAsWatched(movie: any): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Le trigger PostgreSQL supprimera automatiquement de la watchlist
      const { error } = await supabase.from("watched_movies").insert({
        user_id: user.id,
        movie_id: movie.id,
        movie_name: movie.title,
        movie_data: movie,
      });

      if (error) {
        // Si le film existe déjà, mettre à jour la date
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

  static async getWatchedMovies(): Promise<any[]> {
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

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }

  // ============= MÉTHODES SUPPLÉMENTAIRES =============

  // Obtenir la watchlist des films
  static async getMoviesWatchlist(): Promise<any[]> {
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
      console.error("Erreur lors de la récupération de la watchlist films:", error);
      return [];
    }
  }

  // Supprimer une série de l'historique des vues
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

  // Supprimer un film de l'historique des vues
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

  // Vider toute la watchlist (séries et films)
  static async clearWatchlist(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Supprimer watchlist séries
      await supabase
        .from("watchlist_items")
        .delete()
        .eq("user_id", user.id);

      // Supprimer watchlist films
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

  // Vider tout l'historique des vues (séries et films)
  static async clearAllWatchedHistory(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Supprimer séries vues
      await supabase
        .from("watched_series")
        .delete()
        .eq("user_id", user.id);

      // Supprimer films vus
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

  // Obtenir les statistiques de l'utilisateur
  static async getUserStats(): Promise<{
    watchlistCount: number;
    watchedCount: number;
    ratingsCount: number;
    averageRating: number;
  } | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // Récupérer toutes les données en parallèle
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
        supabase
          .from("ratings")
          .select("rating")
          .eq("user_id", user.id),
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
