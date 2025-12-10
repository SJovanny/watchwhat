/**
 * Service de préférences - Gère les préférences utilisateur
 * Principe SRP : Ce service ne gère que les préférences
 */
import { supabase } from "../supabase";
import { UserPreferences } from "@/types";

export class PreferencesService {
  /**
   * Mettre à jour les préférences
   */
  static async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Mapper les champs camelCase vers snake_case
      if (preferences.language !== undefined)
        updateData.language = preferences.language;
      if (preferences.country !== undefined)
        updateData.country = preferences.country;
      if (preferences.includeAdult !== undefined)
        updateData.include_adult = preferences.includeAdult;
      if (preferences.favoriteGenres !== undefined)
        updateData.favorite_genres = preferences.favoriteGenres;
      if (preferences.dislikedGenres !== undefined)
        updateData.disliked_genres = preferences.dislikedGenres;
      if (preferences.favoriteActors !== undefined)
        updateData.favorite_actors = preferences.favoriteActors;
      if (preferences.minRating !== undefined)
        updateData.min_rating = preferences.minRating;
      if (preferences.maxRating !== undefined)
        updateData.max_rating = preferences.maxRating;
      if (preferences.releaseYearFrom !== undefined)
        updateData.release_year_from = preferences.releaseYearFrom;
      if (preferences.releaseYearTo !== undefined)
        updateData.release_year_to = preferences.releaseYearTo;
      if (preferences.theme !== undefined) updateData.theme = preferences.theme;
      if (preferences.defaultView !== undefined)
        updateData.default_view = preferences.defaultView;
      if (preferences.itemsPerPage !== undefined)
        updateData.items_per_page = preferences.itemsPerPage;
      if (preferences.autoplay !== undefined)
        updateData.autoplay = preferences.autoplay;
      if (preferences.showSpoilers !== undefined)
        updateData.show_spoilers = preferences.showSpoilers;
      if (preferences.notifications !== undefined)
        updateData.notifications = preferences.notifications;

      const { error } = await supabase
        .from("user_preferences")
        .upsert(updateData, {
          onConflict: "user_id",
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des préférences:", error);
      return false;
    }
  }

  /**
   * Obtenir les préférences utilisateur
   */
  static async getPreferences(): Promise<UserPreferences | null> {
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

      if (!data) {
        const defaultPrefs = this.getDefaultPreferences(user.id);
        await this.updatePreferences(defaultPrefs);
        return defaultPrefs;
      }

      // Mapper les champs snake_case vers camelCase
      return {
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
        // Champs legacy
        preferredLanguages: [data.language || "fr-FR"],
        favoriteSeries: [],
        notificationsEnabled: true,
        autoAddToWatchlist: false,
        showAdultContent: data.include_adult || false,
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des préférences:", error);
      return null;
    }
  }

  /**
   * Obtenir les préférences par défaut
   */
  static getDefaultPreferences(userId: string): UserPreferences {
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
}
