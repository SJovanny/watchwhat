'use client'

import React, { useState, useEffect } from 'react';
import { Star, Sparkles, TrendingUp, Filter, Eye, Heart, Zap } from 'lucide-react';
import { Movie, Serie } from '@/types';
import { tmdbService, getImageUrl } from '@/lib/tmdb';
import { tmdbV4Service } from '@/lib/tmdb-v4';
import { useUserPreferences, useAuth } from '@/hooks/usePreferences';
import { intelligentRecommendationService } from '@/lib/intelligent-recommendations';

interface RecommendationCardProps {
  item: Movie | Serie;
  index: number;
  reasons?: string[];
}

function RecommendationCard({ item, index, reasons }: RecommendationCardProps) {
  const title = 'title' in item ? item.title : item.name;
  const date = 'title' in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : '';
  const isMovie = 'title' in item;

  return (
    <div
      className="group cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
        {/* Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {item.poster_path ? (
            <>
              <img
                src={getImageUrl(item.poster_path, 'w500')}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Star className="h-12 w-12 text-gray-600" />
            </div>
          )}
          
          {/* Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl px-2 py-1 flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
              <span className="text-white font-bold text-xs">
                {item.vote_average.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Type indicator */}
          <div className="absolute top-3 left-3">
            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
              isMovie 
                ? 'bg-blue-500/80 text-blue-100' 
                : 'bg-purple-500/80 text-purple-100'
            }`}>
              {isMovie ? 'FILM' : 'SÉRIE'}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
            {title}
          </h3>
          
          {year && (
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span>{year}</span>
              {reasons && reasons.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium" title={reasons.join(', ')}>
                    IA
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PersonalizedRecommendationsProps {
  className?: string;
}

export default function PersonalizedRecommendations({ className = '' }: PersonalizedRecommendationsProps) {
  const { preferences } = useUserPreferences();
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<(Movie | Serie)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [recommendationReasons, setRecommendationReasons] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadPersonalizedRecommendations();
  }, [preferences, isAuthenticated]);

  const loadPersonalizedRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Utiliser notre service de recommandations intelligentes
      const intelligentRecs = await intelligentRecommendationService.generateSmartRecommendations(20);
      
      if (intelligentRecs.length > 0) {
        const content = intelligentRecs.map((rec: any) => rec.content);
        const reasons: Record<string, string[]> = {};
        
        // Déduplication basée sur ID et type
        const uniqueContent = content.filter((item: Movie | Serie, index: number, array: (Movie | Serie)[]) => {
          const itemType = 'title' in item ? 'movie' : 'tv';
          const itemUniqueId = `${item.id}-${itemType}`;
          
          return array.findIndex(other => {
            const otherType = 'title' in other ? 'movie' : 'tv';
            const otherUniqueId = `${other.id}-${otherType}`;
            return otherUniqueId === itemUniqueId;
          }) === index;
        });
        
        intelligentRecs.forEach((rec: any) => {
          const key = `${rec.content.id}-${'title' in rec.content ? 'movie' : 'tv'}`;
          reasons[key] = rec.reasons;
        });
        
        setRecommendations(uniqueContent);
        setRecommendationReasons(reasons);
      } else {
        // Fallback avec du contenu populaire si aucune recommandation intelligente
        await loadFallbackRecommendations();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
      await loadFallbackRecommendations();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackRecommendations = async () => {
    try {
      const [popularMovies, popularSeries] = await Promise.all([
        tmdbService.getPopularMovies(1),
        tmdbService.getPopularSeries(1)
      ]);
      
      const allRecommendations = [
        ...popularMovies.results.slice(0, 10),
        ...popularSeries.results.slice(0, 10)
      ];

      // Déduplication
      const uniqueRecommendations = allRecommendations.filter((item, index, array) => {
        const itemType = 'title' in item ? 'movie' : 'tv';
        const itemUniqueId = `${item.id}-${itemType}`;
        
        return array.findIndex(other => {
          const otherType = 'title' in other ? 'movie' : 'tv';
          const otherUniqueId = `${other.id}-${otherType}`;
          return otherUniqueId === itemUniqueId;
        }) === index;
      });

      // Mélanger et limiter
      const shuffled = uniqueRecommendations
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

      setRecommendations(shuffled);
    } catch (error) {
      console.error('Erreur lors du chargement du contenu populaire:', error);
    }
  };

  const filteredRecommendations = recommendations.filter(item => {
    if (activeFilter === 'movies') return 'title' in item;
    if (activeFilter === 'tv') return 'name' in item;
    return true;
  });

  if (isLoading) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-xl">
          <div className="relative z-10 p-8 min-h-[500px] flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-white text-3xl font-bold mb-3">
                Génération des Recommandations
              </h3>
              <p className="text-white/80 text-xl">
                Analyse de vos préférences en cours...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900/90 via-slate-900/90 to-zinc-900/90 backdrop-blur-xl">
          <div className="relative z-10 p-8 min-h-[400px] flex flex-col justify-center items-center text-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="h-12 w-12 text-white/50" />
            </div>
            <h3 className="text-white text-3xl font-bold mb-4">
              Aucune Recommandation
            </h3>
            <p className="text-white/70 text-xl max-w-md">
              Configurez vos préférences pour recevoir des recommandations personnalisées.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className="relative rounded-3xl overflow-hidden">
        {/* Arrière-plan avec effets */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
          
          {/* Orbes animées */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-r from-pink-400/25 to-purple-400/25 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-20 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-float-slow"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20 backdrop-blur-sm"></div>

        <div className="relative z-10 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-xl">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                </div>
                
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent leading-tight">
                    {isAuthenticated ? 'Recommandations Personnalisées' : 'Recommandations Pour Vous'}
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span className="text-white/90 text-sm font-semibold">
                      {isAuthenticated ? 'Basées sur votre historique TMDB' : 'Basées sur vos préférences'}
                    </span>
                    {preferences?.favoriteGenres.length && (
                      <div className="px-2 py-1 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full border border-emerald-400/30">
                        <span className="text-emerald-300 text-xs font-bold">
                          {preferences.favoriteGenres.length} genres sélectionnés
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="hidden lg:flex items-center space-x-2">
                {[
                  { id: 'all', label: 'Tout', icon: Eye },
                  { id: 'movies', label: 'Films', icon: Star },
                  { id: 'tv', label: 'Séries', icon: Zap }
                ].map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        activeFilter === filter.id
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="max-w-3xl">
              <p className="text-lg text-white/90 leading-relaxed font-light">
                {isAuthenticated ? (
                  <>
                    Découvrez des contenus sélectionnés spécialement pour vous grâce à l'IA de TMDB.{' '}
                    <span className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Ces recommandations évoluent avec vos goûts.
                    </span>
                  </>
                ) : (
                  <>
                    Découvrez des contenus adaptés à vos préférences.{' '}
                    <span className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Connectez-vous pour des recommandations encore plus précises.
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Grid de contenu */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredRecommendations.map((item, index) => {
              // Créer une clé unique en combinant l'ID, le type et l'index
              const key = `${item.id}-${'title' in item ? 'movie' : 'tv'}-${index}`;
              const reasonKey = `${item.id}-${'title' in item ? 'movie' : 'tv'}`;
              return (
                <RecommendationCard
                  key={key}
                  item={item}
                  index={index}
                  reasons={recommendationReasons[reasonKey]}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <Heart className="h-5 w-5 text-emerald-400 animate-pulse" />
              <span className="text-white font-medium">
                {filteredRecommendations.length} recommandations personnalisées
              </span>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm">Mis à jour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
