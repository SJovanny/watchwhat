"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tv } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import UnifiedFilterBar, { FilterState } from '@/components/UnifiedFilterBar';
import SerieCard from '@/components/SerieCard';
import { Serie, SearchResult } from '@/types';
import { tmdbService } from '@/lib/tmdb';


export default function DiscoverPage() {
  const [filteredSeries, setFilteredSeries] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null);

  // Charger les séries avec les filtres
  const loadSeries = useCallback(async (page: number = 1, filters?: FilterState) => {
    try {
      setIsLoading(true);
      
      // Construire les paramètres de l'API
      const params: Record<string, any> = {
        page,
      };

      if (filters) {
        // Tri
        if (filters.sortBy) {
          params.sort_by = filters.sortBy;
        }

        // Genres
        if (filters.genres.length > 0) {
          params.with_genres = filters.genres.join(',');
        }

        // Services de streaming
        if (filters.watchProviders.length > 0) {
          params.with_watch_providers = filters.watchProviders.join('|');
          params.watch_region = filters.watchRegion || 'FR';
        }

        // Types de monétisation
        if (filters.monetizationTypes.length > 0) {
          params.with_watch_monetization_types = filters.monetizationTypes.join('|');
        }

        // Dates de diffusion
        if (filters.releaseDateFrom) {
          params.first_air_date_gte = filters.releaseDateFrom;
        }
        if (filters.releaseDateTo) {
          params.first_air_date_lte = filters.releaseDateTo;
        }

        // Langue
        if (filters.originalLanguage) {
          params.with_original_language = filters.originalLanguage;
        }

        // Score
        if (filters.voteAverageMin > 0) {
          params.vote_average_gte = filters.voteAverageMin;
        }
        if (filters.voteAverageMax < 10) {
          params.vote_average_lte = filters.voteAverageMax;
        }

        // Nombre de votes
        if (filters.voteCountMin > 0) {
          params.vote_count_gte = filters.voteCountMin;
        }

        // Durée
        if (filters.runtimeMin > 0) {
          params.with_runtime_gte = filters.runtimeMin;
        }
        if (filters.runtimeMax < 400) {
          params.with_runtime_lte = filters.runtimeMax;
        }

        // Mots-clés
        if (filters.keywords.length > 0) {
          params.with_keywords = filters.keywords.map(k => k.id).join(',');
        }
      }

      const response = await tmdbService.discoverSeriesAdvanced(params);
      setFilteredSeries(response.results);
      setTotalPages(Math.min(response.total_pages, 500));
    } catch (error) {
      console.error('Erreur lors du chargement des séries:', error);
      setFilteredSeries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les séries au montage
  useEffect(() => {
    loadSeries(1);
  }, [loadSeries]);

  // Gérer les changements de filtres
  const handleFiltersChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
    loadSeries(1, filters);
  }, [loadSeries]);

  const handleSearchSubmit = useCallback((query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }, []);

  const handleResultSelect = useCallback((result: SearchResult) => {
    if (result.media_type === 'tv') {
      window.location.href = `/serie/${result.id}`;
    } else if (result.media_type === 'movie') {
      window.location.href = `/movie/${result.id}`;
    }
  }, []);

  const handleSerieSelect = useCallback((serie: Serie) => {
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadSeries(page, currentFilters || undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Tv className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Découvrir des séries
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Explorez notre vaste catalogue de séries TV
              </p>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              onResultSelect={handleResultSelect}
              onSearchSubmit={handleSearchSubmit}
              placeholder="Rechercher une série..."
              maxResults={8}
            />
          </div>
          <div>
            <UnifiedFilterBar 
              mediaType="tv"
              onFiltersChange={handleFiltersChange} 
            />
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

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        currentPage === page
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse"
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {!isLoading && filteredSeries.length === 0 && (
          <div className="text-center py-12">
            <Tv className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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

