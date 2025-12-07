import { supabase } from '@/lib/supabase';

export interface UserPreferences {
  id: string;
  userId: string;
  favoriteGenres: number[];
  dislikedGenres: number[];
  favoriteActors: number[];
  minRating: number;
  maxRating: number;
  preferredLanguage: string;
  includeAdult: boolean;
  releaseYearFrom?: number;
  releaseYearTo?: number;
  notificationSettings: {
    newRecommendations: boolean;
    weeklyDigest: boolean;
    newEpisodes: boolean;
  };
  displaySettings: {
    compactView: boolean;
    showRatings: boolean;
    showGenres: boolean;
    autoPlay: boolean;
  };
}

export interface WatchlistItem {
  id: string;
  userId: string;
  serieId: number;
  serieName: string;
  serieData: any;
  addedAt: string;
}

export interface WatchedItem {
  id: string;
  userId: string;
  serieId: number;
  serieName: string;
  serieData: any;
  watchedAt: string;
  seasonsWatched: number[];
  episodesWatched: Record<string, number[]>;
}

export interface UserRating {
  id: string;
  userId: string;
  serieId: number;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

class SupabaseUserService {
  
  // Préférences utilisateur
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      return null;
    }
  }

  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          userId,
          ...preferences
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      throw error;
    }
  }

  // Watchlist
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('*')
        .eq('userId', userId)
        .order('addedAt', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la watchlist:', error);
      return [];
    }
  }

  async addToWatchlist(userId: string, serie: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('watchlist_items')
        .insert({
          userId,
          serieId: serie.id,
          serieName: 'title' in serie ? serie.title : serie.name,
          serieData: serie
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(userId: string, serieId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('userId', userId)
        .eq('serieId', serieId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la watchlist:', error);
      throw error;
    }
  }

  async isInWatchlist(userId: string, serieId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('id')
        .eq('userId', userId)
        .eq('serieId', serieId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Erreur lors de la vérification de la watchlist:', error);
      return false;
    }
  }

  // Historique de visionnage
  async getWatchedHistory(userId: string): Promise<WatchedItem[]> {
    try {
      const { data, error } = await supabase
        .from('watched_series')
        .select('*')
        .eq('userId', userId)
        .order('watchedAt', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  async addToWatchedHistory(userId: string, serie: any, seasonWatched?: number, episodeWatched?: number): Promise<void> {
    try {
      // Vérifier si la série existe déjà dans l'historique
      const { data: existing } = await supabase
        .from('watched_series')
        .select('*')
        .eq('userId', userId)
        .eq('serieId', serie.id)
        .single();

      if (existing) {
        // Mettre à jour l'existant
        let seasonsWatched = existing.seasonsWatched || [];
        let episodesWatched = existing.episodesWatched || {};

        if (seasonWatched && !seasonsWatched.includes(seasonWatched)) {
          seasonsWatched.push(seasonWatched);
        }

        if (seasonWatched && episodeWatched) {
          const seasonKey = seasonWatched.toString();
          if (!episodesWatched[seasonKey]) {
            episodesWatched[seasonKey] = [];
          }
          if (!episodesWatched[seasonKey].includes(episodeWatched)) {
            episodesWatched[seasonKey].push(episodeWatched);
          }
        }

        const { error } = await supabase
          .from('watched_series')
          .update({
            watchedAt: new Date().toISOString(),
            seasonsWatched,
            episodesWatched
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer un nouvel enregistrement
        const { error } = await supabase
          .from('watched_series')
          .insert({
            userId,
            serieId: serie.id,
            serieName: 'title' in serie ? serie.title : serie.name,
            serieData: serie,
            seasonsWatched: seasonWatched ? [seasonWatched] : [],
            episodesWatched: seasonWatched && episodeWatched ? { [seasonWatched]: [episodeWatched] } : {}
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
      throw error;
    }
  }

  // Ratings
  async getUserRatings(userId: string): Promise<UserRating[]> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('userId', userId)
        .order('updatedAt', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des ratings:', error);
      return [];
    }
  }

  async rateContent(userId: string, serieId: number, rating: number, review?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          userId,
          serieId,
          rating,
          review,
          updatedAt: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rating:', error);
      throw error;
    }
  }

  async getUserRating(userId: string, serieId: number): Promise<UserRating | null> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('userId', userId)
        .eq('serieId', serieId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du rating:', error);
      return null;
    }
  }

  // Statistiques utilisateur
  async getUserStats(userId: string) {
    try {
      const [watchlist, watched, ratings] = await Promise.all([
        this.getWatchlist(userId),
        this.getWatchedHistory(userId),
        this.getUserRatings(userId)
      ]);

      const totalEpisodesWatched = watched.reduce((total, item) => {
        const episodes = Object.values(item.episodesWatched || {}).flat();
        return total + episodes.length;
      }, 0);

      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        watchlistCount: watchlist.length,
        watchedCount: watched.length,
        totalEpisodesWatched,
        ratingsCount: ratings.length,
        averageRating: Math.round(averageRating * 10) / 10
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return null;
    }
  }
}

export const supabaseUserService = new SupabaseUserService();
