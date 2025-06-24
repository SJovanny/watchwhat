import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Serie } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import { formatDateToYear, formatRating } from '@/lib/utils';

interface SearchBarProps {
  onSerieSelect: (serie: Serie) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSerieSelect, 
  placeholder = "Rechercher une série...",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fermer la recherche quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await tmdbService.searchSeries(query.trim());
        setResults(response.results.slice(0, 8)); // Limiter à 8 résultats
        setIsOpen(true);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSerieSelect = (serie: Serie) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSerieSelect(serie);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : query ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Résultats de recherche */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </div>
            
            <div className="space-y-2 mt-2">
              {results.map((serie) => (
                <div
                  key={serie.id}
                  onClick={() => handleSerieSelect(serie)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w92${serie.poster_path}`}
                    alt={serie.name}
                    className="w-12 h-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {serie.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateToYear(serie.first_air_date)}
                    </p>
                    {serie.overview && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-1">
                        {serie.overview}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-yellow-500">
                    <Search className="h-4 w-4" />
                    <span>{formatRating(serie.vote_average)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {isOpen && !isLoading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucune série trouvée pour "{query}"</p>
            <p className="text-sm mt-1">Essayez avec un autre terme de recherche</p>
          </div>
        </div>
      )}
    </div>
  );
}
