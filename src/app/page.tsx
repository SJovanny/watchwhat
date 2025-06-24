"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, Star, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import SerieCard from '@/components/SerieCard';
import { Serie } from '@/types';
import { tmdbService, generateRecommendations } from '@/lib/tmdb';
import { storageService } from '@/lib/storage';
import { useNotify } from '@/components/NotificationProvider';

export default function Home() {
  const [popularSeries, setPopularSeries] = useState<Serie[]>([]);
  const [topRatedSeries, setTopRatedSeries] = useState<Serie[]>([]);
  const [recommendations, setRecommendations] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Vérifier si l'onboarding est nécessaire
        if (!storageService.isOnboardingComplete()) {
          setShowOnboarding(true);
        }

        // Charger les données de base
        const [popular, topRated] = await Promise.all([
          tmdbService.getPopularSeries(),
          tmdbService.getTopRatedSeries()
        ]);

        setPopularSeries(popular.results.slice(0, 12));
        setTopRatedSeries(topRated.results.slice(0, 12));

        // Générer des recommandations si l'utilisateur a des préférences
        const preferences = storageService.getUserPreferences();
        const watchedSeries = storageService.getWatchedSeries();

        if (preferences.favoriteGenres.length > 0 || watchedSeries.length > 0) {
          const recs = await generateRecommendations({
            favoriteGenres: preferences.favoriteGenres,
            favoriteActors: preferences.favoriteActors,
            watchedSeries: watchedSeries.map(w => w.serie.id),
            minRating: preferences.minRating
          });
          setRecommendations(recs);
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSerieSelect = useCallback((serie: Serie) => {
    // Naviguer vers la page de détail de la série
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const handleAddToWatched = useCallback((serie: Serie) => {
    storageService.addWatchedSerie(serie);
    notify.success(
      'Série ajoutée !',
      `"${serie.name}" a été ajoutée à votre liste des séries vues`,
      {
        label: 'Voir mes favoris',
        onClick: () => window.location.href = '/favorites'
      }
    );
  }, [notify]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Découvrez votre prochaine série
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Des recommandations personnalisées basées sur vos goûts
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                onSerieSelect={handleSerieSelect}
                placeholder="Rechercher une série..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommandations personnalisées */}
        {recommendations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recommandé pour vous
                </h2>
              </div>
              <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline">
                <span>Voir tout</span>
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendations.slice(0, 12).map((serie) => (
                <SerieCard
                  key={serie.id}
                  serie={serie}
                  onSerieClick={handleSerieSelect}
                  onAddToWatched={handleAddToWatched}
                />
              ))}
            </div>
          </section>
        )}

        {/* Séries populaires */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tendances
              </h2>
            </div>
            <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline">
              <span>Voir tout</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {popularSeries.map((serie) => (
              <SerieCard
                key={serie.id}
                serie={serie}
                onSerieClick={handleSerieSelect}
                onAddToWatched={handleAddToWatched}
              />
            ))}
          </div>
        </section>

        {/* Mieux notées */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Les mieux notées
              </h2>
            </div>
            <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline">
              <span>Voir tout</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {topRatedSeries.map((serie) => (
              <SerieCard
                key={serie.id}
                serie={serie}
                onSerieClick={handleSerieSelect}
                onAddToWatched={handleAddToWatched}
              />
            ))}
          </div>
        </section>

        {/* Call to action pour les nouveaux utilisateurs */}
        {showOnboarding && (
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Personnalisez vos recommandations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configurez vos préférences pour recevoir des suggestions encore plus précises
            </p>
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Commencer la configuration
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
