'use client'

import React, { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import AllTrendingCarousel from './AllTrendingCarousel';
import SectionHeader from './SectionHeader';
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";

interface PopularMoviesProps {
  className?: string;
}

export default function PopularMovies({ className = '' }: PopularMoviesProps) {
  const { t } = useLanguage();
  const { preferences, isLoading: isPrefsLoading } = usePreferences();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attendre que les préférences soient chargées
    if (!isPrefsLoading) {
      loadPopularMovies();
    }
  }, [preferences, isPrefsLoading]);

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

      setMovies(results.slice(0, 20));
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

  return (
    <section className={className} aria-labelledby="row-popular-movies">
      <SectionHeader
        title={<span id="row-popular-movies">{t.home.popularMovies}</span>}
        meta={isLoading ? undefined : `${movies.length} films`}
        action={{ label: t.home.viewAll, href: '/movies' }}
      />
      {isLoading ? (
        <div className="flex gap-3 overflow-hidden sm:gap-4" aria-hidden>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-[140px] flex-shrink-0 sm:w-[160px] md:w-[176px] lg:w-[192px]">
              <div className="skeleton aspect-[2/3]" />
              <div className="skeleton mt-3 h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? null : (
        <AllTrendingCarousel
          content={movies.map((m) => ({ ...m, media_type: 'movie' as const }))}
          onContentClick={(item) => handleMovieSelect(item as unknown as Movie)}
        />
      )}
    </section>
  );
}
