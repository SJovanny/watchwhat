'use client'

import { Movie, Serie } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import { tmdbV4Service } from '@/lib/tmdb-v4';

// Types pour l'historique et les recommandations
export interface WatchedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  genres: number[];
  rating: number;
  watchedAt: string;
  userRating?: number; // Note donnée par l'utilisateur (1-10)
  completion?: number; // Pourcentage de visionnage (0-100)
}

export interface WatchlistItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  genres: number[];
  addedAt: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  favoriteGenres: { [genreId: number]: number }; // Genre ID -> Score de préférence
  dislikedGenres: number[];
  preferredRatingRange: { min: number; max: number };
  preferredYearRange: { from?: number; to?: number };
  watchingHabits: {
    averageSessionTime: number; // en minutes
    preferredWatchingTime: 'morning' | 'afternoon' | 'evening' | 'night';
    bingWatcher: boolean; // Regarde plusieurs épisodes/films d'affilée
  };
  contentPreferences: {
    movieToTvRatio: number; // 0-1, 0 = que des séries, 1 = que des films
    preferredLanguages: string[];
    includeAdult: boolean;
  };
}

export interface RecommendationScore {
  content: Movie | Serie;
  score: number;
  reasons: string[];
}

class IntelligentRecommendationService {
  
  // Sauvegarder un élément regardé
  addToWatchedHistory(item: Movie | Serie, userRating?: number, completion: number = 100): void {
    if (typeof window === 'undefined') return;

    const watchedItem: WatchedItem = {
      id: item.id,
      type: 'title' in item ? 'movie' : 'tv',
      title: 'title' in item ? item.title : item.name,
      genres: item.genre_ids || [],
      rating: item.vote_average,
      watchedAt: new Date().toISOString(),
      userRating,
      completion
    };

    const history = this.getWatchedHistory();
    // Éviter les doublons
    const existingIndex = history.findIndex(h => h.id === item.id && h.type === watchedItem.type);
    if (existingIndex >= 0) {
      history[existingIndex] = watchedItem; // Mettre à jour
    } else {
      history.push(watchedItem);
    }

    // Garder seulement les 500 derniers éléments
    if (history.length > 500) {
      history.splice(0, history.length - 500);
    }

    localStorage.setItem('watched_history', JSON.stringify(history));
    this.updateUserProfile();
  }

  // Ajouter à la watchlist
  addToWatchlist(item: Movie | Serie, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    if (typeof window === 'undefined') return;

    const watchlistItem: WatchlistItem = {
      id: item.id,
      type: 'title' in item ? 'movie' : 'tv',
      title: 'title' in item ? item.title : item.name,
      genres: item.genre_ids || [],
      addedAt: new Date().toISOString(),
      priority
    };

    const watchlist = this.getWatchlist();
    // Éviter les doublons
    if (!watchlist.find(w => w.id === item.id && w.type === watchlistItem.type)) {
      watchlist.push(watchlistItem);
      localStorage.setItem('user_watchlist', JSON.stringify(watchlist));
    }
  }

  // Supprimer de la watchlist
  removeFromWatchlist(id: number, type: 'movie' | 'tv'): void {
    if (typeof window === 'undefined') return;

    const watchlist = this.getWatchlist();
    const filtered = watchlist.filter(item => !(item.id === id && item.type === type));
    localStorage.setItem('user_watchlist', JSON.stringify(filtered));
  }

  // Récupérer l'historique
  getWatchedHistory(): WatchedItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('watched_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Récupérer la watchlist
  getWatchlist(): WatchlistItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('user_watchlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Analyser et mettre à jour le profil utilisateur
  private updateUserProfile(): void {
    const history = this.getWatchedHistory();
    if (history.length === 0) return;

    const profile: UserProfile = {
      favoriteGenres: {},
      dislikedGenres: [],
      preferredRatingRange: { min: 0, max: 10 },
      preferredYearRange: {},
      watchingHabits: {
        averageSessionTime: 120,
        preferredWatchingTime: 'evening',
        bingWatcher: false
      },
      contentPreferences: {
        movieToTvRatio: 0.5,
        preferredLanguages: ['fr', 'en'],
        includeAdult: false
      }
    };

    // Analyser les genres favoris
    const genreScores: { [key: number]: { total: number; count: number; ratings: number[] } } = {};
    
    history.forEach(item => {
      item.genres.forEach(genreId => {
        if (!genreScores[genreId]) {
          genreScores[genreId] = { total: 0, count: 0, ratings: [] };
        }
        
        // Score basé sur la note utilisateur si disponible, sinon note TMDB
        const score = item.userRating || (item.rating / 2); // Normaliser sur 5
        genreScores[genreId].total += score;
        genreScores[genreId].count++;
        genreScores[genreId].ratings.push(score);
      });
    });

    // Calculer les scores moyens des genres
    Object.keys(genreScores).forEach(genreIdStr => {
      const genreId = parseInt(genreIdStr);
      const data = genreScores[genreId];
      const averageScore = data.total / data.count;
      
      if (averageScore >= 3.5) { // Score élevé
        profile.favoriteGenres[genreId] = averageScore;
      } else if (averageScore < 2.5) { // Score faible
        profile.dislikedGenres.push(genreId);
      }
    });

    // Analyser les préférences de rating
    const ratings = history.map(item => item.rating).filter(r => r > 0);
    if (ratings.length > 0) {
      profile.preferredRatingRange.min = Math.max(0, Math.min(...ratings) - 1);
      profile.preferredRatingRange.max = Math.min(10, Math.max(...ratings) + 0.5);
    }

    // Analyser le ratio films/séries
    const movieCount = history.filter(item => item.type === 'movie').length;
    const tvCount = history.filter(item => item.type === 'tv').length;
    if (movieCount + tvCount > 0) {
      profile.contentPreferences.movieToTvRatio = movieCount / (movieCount + tvCount);
    }

    // Détecter le binge watching
    const watchDates = history.map(item => new Date(item.watchedAt)).sort();
    let bingeSessions = 0;
    for (let i = 1; i < watchDates.length; i++) {
      const timeDiff = watchDates[i].getTime() - watchDates[i-1].getTime();
      if (timeDiff < 4 * 60 * 60 * 1000) { // Moins de 4h entre deux visionnages
        bingeSessions++;
      }
    }
    profile.watchingHabits.bingWatcher = bingeSessions / history.length > 0.3;

    localStorage.setItem('user_profile', JSON.stringify(profile));
  }

  // Récupérer le profil utilisateur
  getUserProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Générer des recommandations intelligentes
  async generateSmartRecommendations(limit: number = 20): Promise<RecommendationScore[]> {
    try {
      const profile = this.getUserProfile();
      const watchedHistory = this.getWatchedHistory();
      const watchlist = this.getWatchlist();
      
      if (!profile && watchedHistory.length === 0) {
        // Fallback vers du contenu populaire
        return this.getFallbackRecommendations(limit);
      }

      const recommendations: RecommendationScore[] = [];
      
      // 1. Recommandations basées sur les genres favoris
      if (profile?.favoriteGenres) {
        const genreBasedRecs = await this.getGenreBasedRecommendations(profile.favoriteGenres, limit / 2);
        recommendations.push(...genreBasedRecs);
      }

      // 2. Recommandations basées sur des contenus similaires
      const similarRecs = await this.getSimilarContentRecommendations(watchedHistory, limit / 4);
      recommendations.push(...similarRecs);

      // 3. Recommandations tendance filtrées
      const trendingRecs = await this.getFilteredTrendingRecommendations(profile, limit / 4);
      recommendations.push(...trendingRecs);

      // 4. Utiliser les recommandations TMDB v4 si connecté
      if (tmdbV4Service.isAuthenticated()) {
        try {
          const tmdbRecs = await this.getTMDBRecommendations(limit / 4);
          recommendations.push(...tmdbRecs);
        } catch (error) {
          console.warn('Erreur recommandations TMDB v4:', error);
        }
      }

      // Filtrer les doublons et le contenu déjà vu
      const watchedIds = new Set(watchedHistory.map(item => `${item.id}-${item.type}`));
      const watchlistIds = new Set(watchlist.map(item => `${item.id}-${item.type}`));
      
      const uniqueRecs = recommendations.filter((rec, index, arr) => {
        const contentId = `${rec.content.id}-${'title' in rec.content ? 'movie' : 'tv'}`;
        
        // Éviter les doublons
        const isFirstOccurrence = arr.findIndex(r => 
          `${r.content.id}-${'title' in r.content ? 'movie' : 'tv'}` === contentId
        ) === index;
        
        return isFirstOccurrence && 
               !watchedIds.has(contentId) && 
               !watchlistIds.has(contentId);
      });

      // Trier par score et prendre les meilleurs
      return uniqueRecs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Erreur génération recommandations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  private async getGenreBasedRecommendations(favoriteGenres: { [key: number]: number }, limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    
    // Prendre les 3 genres avec les meilleurs scores
    const topGenres = Object.entries(favoriteGenres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genreId]) => parseInt(genreId));

    for (const genreId of topGenres) {
      try {
        // Alterner entre films et séries
        const [movies, series] = await Promise.all([
          tmdbService.discoverAll({ 
            media_type: 'movie',
            with_genres: genreId.toString(),
            sort_by: 'vote_average.desc',
            page: 1
          }),
          tmdbService.discoverSeries({
            with_genres: genreId.toString(),
            sort_by: 'vote_average.desc',
            page: 1
          })
        ]);

        // Ajouter les films
        movies.results?.slice(0, 2).forEach((movie: Movie) => {
          recommendations.push({
            content: movie,
            score: favoriteGenres[genreId] * 10 + (movie.vote_average || 0),
            reasons: [`Genre favori: ${this.getGenreName(genreId)}`, `Note: ${movie.vote_average?.toFixed(1)}/10`]
          });
        });

        // Ajouter les séries
        series.results?.slice(0, 2).forEach((serie: Serie) => {
          recommendations.push({
            content: serie,
            score: favoriteGenres[genreId] * 10 + (serie.vote_average || 0),
            reasons: [`Genre favori: ${this.getGenreName(genreId)}`, `Note: ${serie.vote_average?.toFixed(1)}/10`]
          });
        });

      } catch (error) {
        console.warn(`Erreur pour le genre ${genreId}:`, error);
      }
    }

    return recommendations.slice(0, limit);
  }

  private async getSimilarContentRecommendations(watchedHistory: WatchedItem[], limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    
    // Prendre les 3 contenus les mieux notés par l'utilisateur
    const topWatched = watchedHistory
      .filter(item => item.userRating && item.userRating >= 4)
      .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
      .slice(0, 3);

    for (const watchedItem of topWatched) {
      try {
        const similar = watchedItem.type === 'movie'
          ? await tmdbService.getSimilarMovies(watchedItem.id)
          : await tmdbService.getSimilarSeries(watchedItem.id);

        similar.results?.slice(0, 2).forEach((content: Movie | Serie) => {
          recommendations.push({
            content,
            score: (watchedItem.userRating || 5) * 10 + (content.vote_average || 0),
            reasons: [
              `Similaire à "${watchedItem.title}"`,
              `Vous avez adoré (${watchedItem.userRating}/5)`
            ]
          });
        });

      } catch (error) {
        console.warn(`Erreur similaires pour ${watchedItem.title}:`, error);
      }
    }

    return recommendations.slice(0, limit);
  }

  private async getFilteredTrendingRecommendations(profile: UserProfile | null, limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    
    try {
      const trending = await tmdbService.getTrendingAll('week');
      
      trending.results?.slice(0, limit * 2).forEach((content: any) => {
        let score = content.popularity || 0;
        const reasons: string[] = ['Tendance cette semaine'];

        // Bonus si le genre correspond aux préférences
        if (profile?.favoriteGenres && content.genre_ids) {
          const genreBonus = content.genre_ids.reduce((bonus: number, genreId: number) => {
            return bonus + (profile.favoriteGenres[genreId] || 0);
          }, 0);
          score += genreBonus * 5;
          
          if (genreBonus > 0) {
            reasons.push('Correspond à vos genres favoris');
          }
        }

        // Filtrer par note si définie
        if (profile?.preferredRatingRange) {
          const rating = content.vote_average || 0;
          if (rating >= profile.preferredRatingRange.min && rating <= profile.preferredRatingRange.max) {
            score += 10;
            reasons.push('Note dans votre fourchette préférée');
          }
        }

        recommendations.push({
          content,
          score,
          reasons
        });
      });

    } catch (error) {
      console.warn('Erreur trending:', error);
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getTMDBRecommendations(limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    
    try {
      const [movieRecs, tvRecs] = await Promise.all([
        tmdbV4Service.getMovieRecommendations(1),
        tmdbV4Service.getTVRecommendations(1)
      ]);

      // Films recommandés
      movieRecs.results?.slice(0, limit / 2).forEach((movie: Movie) => {
        recommendations.push({
          content: movie,
          score: 100 + (movie.vote_average || 0), // Score élevé pour TMDB
          reasons: ['Recommandé par TMDB', 'Basé sur votre historique']
        });
      });

      // Séries recommandées
      tvRecs.results?.slice(0, limit / 2).forEach((serie: Serie) => {
        recommendations.push({
          content: serie,
          score: 100 + (serie.vote_average || 0), // Score élevé pour TMDB
          reasons: ['Recommandé par TMDB', 'Basé sur votre historique']
        });
      });

    } catch (error) {
      console.warn('Erreur recommandations TMDB:', error);
    }

    return recommendations;
  }

  private async getFallbackRecommendations(limit: number): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    
    try {
      const [popularMovies, popularSeries, trending] = await Promise.all([
        tmdbService.getPopularMovies(1),
        tmdbService.getPopularSeries(1),
        tmdbService.getTrendingAll('day')
      ]);

      // Mélanger différents types de contenu populaire
      const allContent = [
        ...popularMovies.results.slice(0, Math.ceil(limit / 3)),
        ...popularSeries.results.slice(0, Math.ceil(limit / 3)),
        ...trending.results.slice(0, Math.ceil(limit / 3))
      ];

      allContent.forEach((content: any) => {
        // Filtrer seulement les films et séries (pas les personnes)
        if (content.media_type === 'person') return;
        
        recommendations.push({
          content: content as Movie | Serie,
          score: (content.vote_average || 0) + (content.popularity || 0) / 100,
          reasons: ['Populaire actuellement', 'Bien noté par la communauté']
        });
      });

    } catch (error) {
      console.error('Erreur fallback recommendations:', error);
    }

    return recommendations.slice(0, limit);
  }

  private getGenreName(genreId: number): string {
    const genreMap: { [key: number]: string } = {
      28: 'Action', 12: 'Aventure', 16: 'Animation', 35: 'Comédie',
      80: 'Crime', 99: 'Documentaire', 18: 'Drame', 10751: 'Familial',
      14: 'Fantastique', 36: 'Histoire', 27: 'Horreur', 10402: 'Musique',
      9648: 'Mystère', 10749: 'Romance', 878: 'Science-Fiction',
      10770: 'Téléfilm', 53: 'Thriller', 10752: 'Guerre', 37: 'Western',
      10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
      10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
      10767: 'Talk', 10768: 'War & Politics'
    };
    return genreMap[genreId] || 'Inconnu';
  }

  // Nettoyer les données
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('watched_history');
    localStorage.removeItem('user_watchlist');
    localStorage.removeItem('user_profile');
  }

  // Statistiques utilisateur
  getUserStats() {
    const history = this.getWatchedHistory();
    const watchlist = this.getWatchlist();
    const profile = this.getUserProfile();

    const movieCount = history.filter(item => item.type === 'movie').length;
    const tvCount = history.filter(item => item.type === 'tv').length;

    const totalWatchTime = history.reduce((total, item) => {
      // Estimation: film = 120min, série = 45min par épisode
      const estimatedTime = item.type === 'movie' ? 120 : 45;
      return total + (estimatedTime * (item.completion || 100) / 100);
    }, 0);

    return {
      totalWatched: history.length,
      moviesWatched: movieCount,
      tvShowsWatched: tvCount,
      watchlistSize: watchlist.length,
      totalWatchTimeMinutes: Math.round(totalWatchTime),
      favoriteGenres: profile?.favoriteGenres || {},
      bingWatcher: profile?.watchingHabits.bingWatcher || false
    };
  }
}

export const intelligentRecommendationService = new IntelligentRecommendationService();
export default intelligentRecommendationService;
