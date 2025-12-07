"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Film, Tv } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import SerieCard from '@/components/SerieCard';
import { Serie, SearchResult, Movie } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import { storageService } from '@/lib/storage';
import { useNotify } from '@/components/NotificationProvider';
import { formatDateToYear, formatRating } from '@/lib/utils';

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'tv' | 'movie'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
  const notify = useNotify();

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery, 1, true);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [results, mediaFilter, sortBy]);

  const performSearch = async (searchQuery: string, page = 1, reset = false) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await tmdbService.searchMulti(searchQuery.trim(), page);
      const filteredResults = response.results.filter(
        (r) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path
      );

      if (reset) {
        setResults(filteredResults);
        setCurrentPage(1);
      } else {
        setResults(prev => [...prev, ...filteredResults]);
        setCurrentPage(page);
      }
      
      setHasMore(page < response.total_pages);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      notify.error('Erreur', 'Impossible d\'effectuer la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results] as (Movie | Serie)[];

    // Filtrer par type de média
    if (mediaFilter !== 'all') {
      filtered = filtered.filter(item => item.media_type === mediaFilter) as (Movie | Serie)[];
    }

    // Trier les résultats
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b as any).vote_average - (a as any).vote_average);
        break;
      case 'date':
        filtered.sort((a, b) => {
          const dateA = a.media_type === 'tv' ? (a as Serie).first_air_date : (a as Movie).release_date;
          const dateB = b.media_type === 'tv' ? (b as Serie).first_air_date : (b as Movie).release_date;
          return new Date(dateB || '').getTime() - new Date(dateA || '').getTime();
        });
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b as any).popularity - (a as any).popularity);
        break;
    }

    setFilteredResults(filtered);
  };

  const handleSearchSubmit = useCallback((newQuery: string) => {
    setQuery(newQuery);
    const url = new URL(window.location.href);
    url.searchParams.set('q', newQuery);
    window.history.pushState({}, '', url.toString());
    performSearch(newQuery, 1, true);
  }, []);

  const handleResultSelect = useCallback((result: SearchResult) => {
    if (result.media_type === 'tv') {
      window.location.href = `/serie/${result.id}`;
    } else if (result.media_type === 'movie') {
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

  const handleSerieClick = useCallback((serie: Serie) => {
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const handleAddToWatched = useCallback((serie: Serie) => {
    storageService.addWatchedSerie(serie);
    notify.success(
      'Série ajoutée !',
      `"${serie.name}" a été ajoutée à votre liste des séries vues`
    );
  }, [notify]);

  const loadMore = () => {
    if (!isLoading && hasMore && query) {
      performSearch(query, currentPage + 1, false);
    }
  };

  const getTitle = (result: SearchResult) => {
    return result.media_type === 'tv' ? (result as Serie).name : (result as Movie).title;
  };

  const getDate = (result: SearchResult) => {
    return result.media_type === 'tv' ? (result as Serie).first_air_date : (result as Movie).release_date;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Résultats de recherche
          </h1>
          {query && (
            <p className="text-gray-600 dark:text-gray-400">
              Résultats pour "{query}" ({filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''})
            </p>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
          <SearchBar 
            onResultSelect={handleResultSelect}
            onSearchSubmit={handleSearchSubmit}
            placeholder="Rechercher un film, une série..."
            maxResults={20}
          />
        </div>

        {/* Filtres et contrôles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Filtre par type */}
            <div className="flex gap-2">
              <button
                onClick={() => setMediaFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mediaFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setMediaFilter('tv')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  mediaFilter === 'tv'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Tv className="h-4 w-4" />
                Séries
              </button>
              <button
                onClick={() => setMediaFilter('movie')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  mediaFilter === 'movie'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Film className="h-4 w-4" />
                Films
              </button>
            </div>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">Plus populaires</option>
              <option value="rating">Mieux notés</option>
              <option value="date">Plus récents</option>
            </select>
          </div>

          {/* Mode d'affichage */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Résultats */}
        {filteredResults.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                {filteredResults.map((result) => {
                  if (result.media_type === 'tv') {
                    return (
                      <SerieCard
                        key={result.id}
                        serie={result as Serie}
                        onSerieClick={handleSerieClick}
                      />
                    );
                  } else {
                    // Pour les films, on affiche un card personnalisé
                    const movie = result as Movie;
                    return (
                      <div
                        key={movie.id}
                        onClick={() => handleResultSelect(movie)}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      >
                        <div className="relative aspect-[2/3]">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                            <Film className="h-3 w-3" />
                            Film
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                            {movie.title}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                            {movie.release_date ? formatDateToYear(movie.release_date) : 'N/A'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-yellow-500 text-xs">
                              <span>★ {formatRating(movie.vote_average)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <img
                        src={`https://image.tmdb.org/t/p/w154${(result as any).poster_path}`}
                        alt={getTitle(result)}
                        className="w-20 h-28 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                              {getTitle(result)}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                result.media_type === 'tv' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              }`}>
                                {result.media_type === 'tv' ? 'Série' : 'Film'}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                {getDate(result) ? formatDateToYear(getDate(result)!) : 'N/A'}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                              {(result as any).overview || 'Aucun résumé disponible.'}
                            </p>
                          </div>
                          <div className="flex items-center text-yellow-500 text-sm">
                            <span>★ {formatRating((result as any).vote_average)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Bouton charger plus */}
        {hasMore && !isLoading && filteredResults.length > 0 && (
          <div className="text-center mb-8">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Charger plus de résultats
            </button>
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Recherche en cours...</p>
          </div>
        )}

        {/* Aucun résultat */}
        {!isLoading && filteredResults.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez avec des termes différents ou modifiez vos filtres
            </p>
          </div>
        )}

        {/* État initial */}
        {!query && !isLoading && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Recherchez des films et séries
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Utilisez la barre de recherche ci-dessus pour commencer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8 pt-20 flex justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
