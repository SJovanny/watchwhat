"use client";

import React, { useState } from 'react';
import { Search, TestTube, Globe, Film, Tv } from 'lucide-react';
import { tmdbService } from '@/lib/tmdb';

export default function SearchDebugger() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'series' | 'multilingual' | 'multi' | 'movies'>('multilingual');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      let response;
      switch (searchType) {
        case 'series':
          response = await tmdbService.searchSeries(query);
          break;
        case 'multilingual':
          response = await tmdbService.searchSeriesMultilingual(query);
          break;
        case 'multi':
          response = await tmdbService.searchMultiContent(query);
          break;
        case 'movies':
          response = await tmdbService.searchMovies(query);
          break;
      }
      setResults(response);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setResults({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'series': return <Tv className="h-4 w-4" />;
      case 'multilingual': return <Globe className="h-4 w-4" />;
      case 'multi': return <Search className="h-4 w-4" />;
      case 'movies': return <Film className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Débogage de la recherche TMDB
        </h3>
      </div>

      <div className="space-y-4">
        {/* Type de recherche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type de recherche
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: 'multilingual', label: 'Séries (Multilingue)' },
              { key: 'series', label: 'Séries (FR)' },
              { key: 'multi', label: 'Tout (Séries + Films)' },
              { key: 'movies', label: 'Films' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setSearchType(type.key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  searchType === type.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getTypeIcon(type.key)}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher une série ou un film..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>

        {/* Résultats */}
        {results && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Résultats ({results.total_results || 0} trouvés)
            </h4>
            
            {results.error ? (
              <div className="text-red-600 dark:text-red-400">
                Erreur: {results.error}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.results?.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <img
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder-poster.svg'}
                      alt={item.name || item.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {item.name || item.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Type: {item.media_type || (item.name ? 'tv' : 'movie')} | 
                        ID: {item.id} | 
                        Note: {item.vote_average?.toFixed(1) || 'N/A'}
                      </p>
                      {item.original_name && item.original_name !== item.name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Titre original: {item.original_name}
                        </p>
                      )}
                      {item.first_air_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Première diffusion: {item.first_air_date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
