"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import SerieCard from '@/components/SerieCard';
import { Serie, SearchResult } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import { storageService } from '@/lib/storage';
import { useNotify } from '@/components/NotificationProvider';

export default function DiscoverPage() {
  const [filteredSeries, setFilteredSeries] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await tmdbService.discoverSeries({ page });
      
      if (page === 1) {
        setFilteredSeries(response.results);
      } else {
        setFilteredSeries(prev => [...prev, ...response.results]);
      }
      
      setHasMore(page < response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur lors du chargement des séries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = useCallback(async (filters: {
    genres?: number[];
    year?: number;
    rating?: number;
    sortBy?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await tmdbService.discoverSeries({
        with_genres: filters.genres?.join(','),
        vote_average_gte: filters.rating,
        first_air_date_year: filters.year,
        sort_by: filters.sortBy,
        page: 1
      });
      
      setFilteredSeries(response.results);
      setCurrentPage(1);
      setHasMore(response.total_pages > 1);
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }, []);

  const handleResultSelect = useCallback((result: SearchResult) => {
    if (result.media_type === 'tv') {
      // Naviguer vers la page de détail de la série
      window.location.href = `/serie/${result.id}`;
    } else if (result.media_type === 'movie') {
      // Pour les films, on pourrait créer une page dédiée ou rediriger vers TMDB
      notify.info(
        'Fonctionnalité bientôt disponible',
        'Les pages de détails pour les films seront bientôt disponibles !',
        {
          label: 'Voir sur TMDB',
          onClick: () => window.open(`https://www.themoviedb.org/movie/${result.id}`, '_blank')
        }
      );
    }
  }, [notify]);

  const handleSerieSelect = useCallback((serie: Serie) => {
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

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadSeries(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Découvrir des séries
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explorez notre vaste catalogue de séries TV
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              onResultSelect={handleResultSelect}
              onSearchSubmit={handleSearchSubmit}
              placeholder="Rechercher un film, une série..."
              maxResults={8}
            />
          </div>
          <div>
            <FilterBar onFiltersChange={handleFiltersChange} />
          </div>
        </div>

        {/* Grille de séries */}
        {filteredSeries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {filteredSeries.map((serie) => (
              <SerieCard
                key={serie.id}
                serie={serie}
                onSerieClick={handleSerieSelect}
              />
            ))}
          </div>
        )}

        {/* Bouton charger plus */}
        {hasMore && !isLoading && (
          <div className="text-center">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Charger plus de séries
            </button>
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des séries...</p>
          </div>
        )}

        {/* Aucun résultat */}
        {!isLoading && filteredSeries.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune série trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
