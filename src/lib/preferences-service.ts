import { prisma } from './prisma';
import { UserPreferences } from '@prisma/client';

export interface UserPreferencesData {
  // Préférences de genres
  favoriteGenres: number[];
  dislikedGenres: number[];
  favoriteActors: number[];
  
  // Préférences de notation
  minRating: number;
  maxRating: number;
  
  // Préférences de langue et région
  preferredLanguages: string[];
  includeSubtitled: boolean;
  includeOriginal: boolean;
  
  // Préférences de contenu
  includeAdult: boolean;
  includeAnimation: boolean;
  includeDocumentary: boolean;
  
  // Préférences temporelles
  releaseYearFrom?: number;
  releaseYearTo?: number;
  includeCurrent: boolean;
  includeUpcoming: boolean;
  
  // Préférences d'affichage
  defaultView: 'grid' | 'list' | 'cards';
  itemsPerPage: number;
  autoPlay: boolean;
  
  // Préférences de notifications
  emailNotifications: boolean;
  newReleases: boolean;
  recommendations: boolean;
  watchlistUpdates: boolean;
}

export interface CreateUserData {
  id: string; // UUID de Supabase
  email: string;
  name?: string;
  avatar?: string;
}

class PreferencesService {
  
  // Créer un utilisateur
  async createUser(userData: CreateUserData) {
    try {
      const user = await prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
        },
        include: {
          preferences: true
        }
      });
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Obtenir un utilisateur par ID
  async getUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
          watchlist: true,
          watchedSeries: true,
          ratings: true
        }
      });
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Obtenir les préférences utilisateur
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });
      
      return preferences;
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }

  // Créer ou mettre à jour les préférences utilisateur
  async updateUserPreferences(userId: string, preferencesData: Partial<UserPreferencesData>): Promise<UserPreferences> {
    try {
      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          ...preferencesData,
          updatedAt: new Date()
        },
        create: {
          userId,
          ...this.getDefaultPreferences(),
          ...preferencesData
        }
      });
      
      return preferences;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  // Obtenir les préférences par défaut
  private getDefaultPreferences(): UserPreferencesData {
    return {
      favoriteGenres: [],
      dislikedGenres: [],
      favoriteActors: [],
      minRating: 6.0,
      maxRating: 10.0,
      preferredLanguages: ['fr-FR'],
      includeSubtitled: true,
      includeOriginal: true,
      includeAdult: false,
      includeAnimation: true,
      includeDocumentary: true,
      releaseYearFrom: 2000,
      releaseYearTo: new Date().getFullYear() + 1,
      includeCurrent: true,
      includeUpcoming: false,
      defaultView: 'grid',
      itemsPerPage: 20,
      autoPlay: false,
      emailNotifications: true,
      newReleases: true,
      recommendations: true,
      watchlistUpdates: true
    };
  }

  // Ajouter un élément à la watchlist
  async addToWatchlist(userId: string, serieId: number, serieName: string, serieData: any) {
    try {
      const watchlistItem = await prisma.watchlistItem.create({
        data: {
          userId,
          serieId,
          serieName,
          serieData: serieData as any
        }
      });
      
      return watchlistItem;
    } catch (error) {
      // Si l'élément existe déjà, l'ignorer silencieusement
      if (error.code === 'P2002') {
        return null;
      }
      console.error('Erreur lors de l\'ajout à la watchlist:', error);
      throw error;
    }
  }

  // Supprimer de la watchlist
  async removeFromWatchlist(userId: string, serieId: number) {
    try {
      await prisma.watchlistItem.delete({
        where: {
          userId_serieId: {
            userId,
            serieId
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la watchlist:', error);
      return false;
    }
  }

  // Obtenir la watchlist
  async getWatchlist(userId: string) {
    try {
      const watchlist = await prisma.watchlistItem.findMany({
        where: { userId },
        orderBy: { addedAt: 'desc' }
      });
      
      return watchlist;
    } catch (error) {
      console.error('Erreur lors de la récupération de la watchlist:', error);
      throw error;
    }
  }

  // Marquer comme regardé
  async markAsWatched(userId: string, serieId: number, serieName: string, serieData: any, seasonsWatched: number[] = [], episodesWatched: Record<string, number[]> = {}) {
    try {
      const watchedSerie = await prisma.watchedSerie.upsert({
        where: {
          userId_serieId: {
            userId,
            serieId
          }
        },
        update: {
          seasonsWatched,
          episodesWatched: episodesWatched as any,
          watchedAt: new Date()
        },
        create: {
          userId,
          serieId,
          serieName,
          serieData: serieData as any,
          seasonsWatched,
          episodesWatched: episodesWatched as any
        }
      });
      
      return watchedSerie;
    } catch (error) {
      console.error('Erreur lors du marquage comme regardé:', error);
      throw error;
    }
  }

  // Obtenir l'historique de visionnage
  async getWatchedHistory(userId: string) {
    try {
      const watchedSeries = await prisma.watchedSerie.findMany({
        where: { userId },
        orderBy: { watchedAt: 'desc' }
      });
      
      return watchedSeries;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  // Ajouter/Mettre à jour une note
  async addRating(userId: string, serieId: number, rating: number, review?: string) {
    try {
      const ratingRecord = await prisma.rating.upsert({
        where: {
          userId_serieId: {
            userId,
            serieId
          }
        },
        update: {
          rating,
          review,
          updatedAt: new Date()
        },
        create: {
          userId,
          serieId,
          rating,
          review
        }
      });
      
      return ratingRecord;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
      throw error;
    }
  }

  // Obtenir les notes utilisateur
  async getUserRatings(userId: string) {
    try {
      const ratings = await prisma.rating.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });
      
      return ratings;
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      throw error;
    }
  }

  // Obtenir les statistiques utilisateur
  async getUserStats(userId: string) {
    try {
      const [watchlistCount, watchedCount, ratingsCount, avgRating] = await Promise.all([
        prisma.watchlistItem.count({ where: { userId } }),
        prisma.watchedSerie.count({ where: { userId } }),
        prisma.rating.count({ where: { userId } }),
        prisma.rating.aggregate({
          where: { userId },
          _avg: { rating: true }
        })
      ]);
      
      return {
        watchlistCount,
        watchedCount,
        ratingsCount,
        averageRating: avgRating._avg.rating || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export const preferencesService = new PreferencesService();
