import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Star } from 'lucide-react';
import { TMDBGenre } from '@/types';
import { tmdbService } from '@/lib/tmdb';

interface FilterOptions {
  genres: number[];
  minRating: number;
  year?: number;
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'first_air_date.desc';
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export default function FilterBar({ onFiltersChange, className = '' }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    minRating: 0,
    sortBy: 'popularity.desc'
  });

  // Charger les genres au montage
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresList = await tmdbService.getGenres();
        setGenres(genresList);
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    };

    loadGenres();
  }, []);

  // Notifier les changements de filtres
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleGenreToggle = (genreId: number) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
  };

  const handleYearChange = (year: string) => {
    setFilters(prev => ({
      ...prev,
      year: year ? parseInt(year) : undefined
    }));
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      minRating: 0,
      sortBy: 'popularity.desc'
    });
  };

  const hasActiveFilters = filters.genres.length > 0 || filters.minRating > 0 || filters.year;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de filtre */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Filter size={20} />
        <span>Filtres</span>
        {hasActiveFilters && (
          <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
            {filters.genres.length + (filters.minRating > 0 ? 1 : 0) + (filters.year ? 1 : 0)}
          </span>
        )}
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Panel de filtres */}
      {isOpen && (
        <div className="absolute z-40 top-full mt-2 left-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtres</h3>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Effacer tout
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tri */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trier par
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="popularity.desc">Popularité (décroissante)</option>
              <option value="vote_average.desc">Note (décroissante)</option>
              <option value="first_air_date.desc">Date de sortie (récente)</option>
            </select>
          </div>

          {/* Note minimale */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note minimale: {filters.minRating}/10
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center space-x-1 text-sm text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span>{filters.minRating}</span>
              </div>
            </div>
          </div>

          {/* Année */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Toutes les années</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Genres ({filters.genres.length} sélectionné{filters.genres.length !== 1 ? 's' : ''})
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {genres.map(genre => (
                <label key={genre.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.genres.includes(genre.id)}
                    onChange={() => handleGenreToggle(genre.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {genre.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
