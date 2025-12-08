'use client'

import React, { useState, useEffect } from 'react';
import { Film, Star, ChevronRight, Calendar } from 'lucide-react';
import { Movie } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import MovieCard from './MovieCard';
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";

interface PopularMoviesProps {
  className?: string;
}

export default function PopularMovies({ className = '' }: PopularMoviesProps) {
  const { t } = useLanguage();
  const { preferences } = usePreferences();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPopularMovies();
  }, [preferences]);

  const loadPopularMovies = async () => {
    try {
      setIsLoading(true);
      const region = tmdbService.getRegion();
      console.log(`[PopularMovies] Chargement des films pour la région: ${region}`);
      
      let results: Movie[] = [];

      if (preferences) {
        // Obtenir des résultats filtrés si les préférences existent
        const response = await tmdbService.discoverMovies({
          sort_by: 'popularity.desc',
          page: 1,
          watch_region: preferences.country,
          without_genres: preferences.dislikedGenres.length > 0 ? preferences.dislikedGenres.join(',') : undefined,
          vote_average_gte: preferences.minRating > 0 ? preferences.minRating : undefined,
          vote_count_gte: 50,
        });
        results = (response.results || []) as Movie[];
      } else {
        // Fallback avec filtrage par région
        const response = await tmdbService.getPopularMoviesByRegion(1);
        results = response.results;
      }

      setMovies(results.slice(0, 12)); // Afficher 12 films
    } catch (error) {
      console.error('Erreur lors du chargement des films populaires:', error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    window.location.href = `/movie/${movie.id}`;
  };

  const handleViewAll = () => {
    window.location.href = '/movies';
  };

  if (isLoading) {
    return (
      <section className={className}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Film className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.home.popularMovies}
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Film className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.home.popularMovies}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({movies.length} films)
          </span>
        </div>
        <button 
          onClick={handleViewAll}
          className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>{t.home.viewAll}</span>
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onMovieClick={handleMovieSelect}
          />
        ))}
      </div>
    </section>
  );
}
