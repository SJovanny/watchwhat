'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Filter, X, ChevronDown, Star, Calendar, Clock, 
  Tv, Search as SearchIcon, Tag, Globe, Award, Play
} from 'lucide-react';
import { TMDBGenre, WatchProvider, Language, Keyword } from '@/types';
import { tmdbService } from '@/lib/tmdb';

// Import des sous-composants
import {
  FilterSection,
  ProviderFilter,
  GenreFilter,
  VoteFilter,
  KeywordFilter,
} from './filters';

// Types pour les filtres
export interface FilterState {
  sortBy: string;
  watchProviders: number[];
  watchRegion: string;
  monetizationTypes: ('flatrate' | 'free' | 'rent' | 'buy')[];
  releaseDateFrom: string;
  releaseDateTo: string;
  genres: number[];
  certification: string;
  originalLanguage: string;
  voteAverageMin: number;
  voteAverageMax: number;
  voteCountMin: number;
  runtimeMin: number;
  runtimeMax: number;
  keywords: Keyword[];
}

interface UnifiedFilterBarProps {
  mediaType: 'movie' | 'tv';
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const MONETIZATION_OPTIONS = [
  { value: 'flatrate', label: 'Streaming', icon: Play },
  { value: 'free', label: 'Gratuit', icon: Tv },
  { value: 'rent', label: 'Location', icon: Clock },
  { value: 'buy', label: 'Achat', icon: Award },
] as const;

const SORT_OPTIONS_MOVIE = [
  { value: 'popularity.desc', label: 'Popularité (décroissante)' },
  { value: 'popularity.asc', label: 'Popularité (croissante)' },
  { value: 'vote_average.desc', label: 'Note (décroissante)' },
  { value: 'vote_average.asc', label: 'Note (croissante)' },
  { value: 'primary_release_date.desc', label: 'Date de sortie (récente)' },
  { value: 'primary_release_date.asc', label: 'Date de sortie (ancienne)' },
  { value: 'revenue.desc', label: 'Revenus (décroissant)' },
  { value: 'title.asc', label: 'Titre (A-Z)' },
  { value: 'title.desc', label: 'Titre (Z-A)' },
];

const SORT_OPTIONS_TV = [
  { value: 'popularity.desc', label: 'Popularité (décroissante)' },
  { value: 'popularity.asc', label: 'Popularité (croissante)' },
  { value: 'vote_average.desc', label: 'Note (décroissante)' },
  { value: 'vote_average.asc', label: 'Note (croissante)' },
  { value: 'first_air_date.desc', label: 'Date de diffusion (récente)' },
  { value: 'first_air_date.asc', label: 'Date de diffusion (ancienne)' },
  { value: 'name.asc', label: 'Titre (A-Z)' },
  { value: 'name.desc', label: 'Titre (Z-A)' },
];

const FR_CERTIFICATIONS = [
  { value: '', label: 'Toutes' },
  { value: 'U', label: 'U (Tous publics)' },
  { value: '10', label: '10+' },
  { value: '12', label: '12+' },
  { value: '16', label: '16+' },
  { value: '18', label: '18+' },
];

const POPULAR_PROVIDERS_FR = [
  { id: 8, name: 'Netflix' },
  { id: 337, name: 'Disney Plus' },
  { id: 119, name: 'Amazon Prime Video' },
  { id: 2, name: 'Apple TV' },
  { id: 350, name: 'Apple TV Plus' },
  { id: 283, name: 'Crunchyroll' },
  { id: 381, name: 'Canal+' },
  { id: 3, name: 'Google Play Movies' },
  { id: 234, name: 'Canal VOD' },
  { id: 1899, name: 'M6+' },
  { id: 61, name: 'Orange VOD' },
  { id: 236, name: 'Arte' },
  { id: 192, name: 'YouTube' },
  { id: 188, name: 'YouTube Premium' },
  { id: 138, name: 'FILMO' },
  { id: 59, name: 'Bbox VOD' },
];

const DEFAULT_FILTERS: FilterState = {
  sortBy: 'popularity.desc',
  watchProviders: [],
  watchRegion: 'FR',
  monetizationTypes: [],
  releaseDateFrom: '',
  releaseDateTo: '',
  genres: [],
  certification: '',
  originalLanguage: '',
  voteAverageMin: 0,
  voteAverageMax: 10,
  voteCountMin: 0,
  runtimeMin: 0,
  runtimeMax: 400,
  keywords: [],
};

export default function UnifiedFilterBar({ 
  mediaType, 
  onFiltersChange, 
  className = '' 
}: UnifiedFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sort: true,
    providers: false,
    availability: false,
    dates: false,
    genres: true,
    certification: false,
    language: false,
    vote: false,
    runtime: false,
    keywords: false,
  });
  
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [keywordResults, setKeywordResults] = useState<Keyword[]>([]);
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const genresFn = mediaType === 'movie' 
          ? tmdbService.getMovieGenres 
          : tmdbService.getGenres;
        const genresList = await genresFn();
        setGenres(genresList);

        const providersList = await tmdbService.getWatchProviders(mediaType, 'FR');
        setProviders(providersList);

        const languagesList = await tmdbService.getLanguages();
        const sortedLanguages = languagesList.sort((a, b) => {
          if (a.iso_639_1 === 'fr') return -1;
          if (b.iso_639_1 === 'fr') return 1;
          if (a.iso_639_1 === 'en') return -1;
          if (b.iso_639_1 === 'en') return 1;
          return a.english_name.localeCompare(b.english_name);
        });
        setLanguages(sortedLanguages);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadInitialData();
  }, [mediaType]);

  // Notifier les changements de filtres (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      onFiltersChange(filters);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, onFiltersChange]);

  // Recherche de mots-clés
  const handleKeywordSearch = useCallback(async (query: string) => {
    setKeywordSearch(query);
    
    if (!query.trim()) {
      setKeywordResults([]);
      return;
    }

    setIsSearchingKeywords(true);
    try {
      const results = await tmdbService.searchKeywords(query);
      setKeywordResults(results.results.slice(0, 10));
    } catch (error) {
      console.error('Erreur recherche mots-clés:', error);
    } finally {
      setIsSearchingKeywords(false);
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenreToggle = (genreId: number) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const handleProviderToggle = (providerId: number) => {
    setFilters(prev => ({
      ...prev,
      watchProviders: prev.watchProviders.includes(providerId)
        ? prev.watchProviders.filter(id => id !== providerId)
        : [...prev.watchProviders, providerId]
    }));
  };

  const handleMonetizationToggle = (type: 'flatrate' | 'free' | 'rent' | 'buy') => {
    setFilters(prev => ({
      ...prev,
      monetizationTypes: prev.monetizationTypes.includes(type)
        ? prev.monetizationTypes.filter(t => t !== type)
        : [...prev.monetizationTypes, type]
    }));
  };

  const handleKeywordAdd = (keyword: Keyword) => {
    if (!filters.keywords.find(k => k.id === keyword.id)) {
      setFilters(prev => ({ ...prev, keywords: [...prev.keywords, keyword] }));
    }
    setKeywordSearch('');
    setKeywordResults([]);
  };

  const handleKeywordRemove = (keywordId: number) => {
    setFilters(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k.id !== keywordId)
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setKeywordSearch('');
    setKeywordResults([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.watchProviders.length > 0) count++;
    if (filters.monetizationTypes.length > 0) count++;
    if (filters.releaseDateFrom || filters.releaseDateTo) count++;
    if (filters.certification) count++;
    if (filters.originalLanguage) count++;
    if (filters.voteAverageMin > 0 || filters.voteAverageMax < 10) count++;
    if (filters.voteCountMin > 0) count++;
    if (filters.runtimeMin > 0 || filters.runtimeMax < 400) count++;
    if (filters.keywords.length > 0) count++;
    if (filters.sortBy !== 'popularity.desc') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const sortOptions = mediaType === 'movie' ? SORT_OPTIONS_MOVIE : SORT_OPTIONS_TV;

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de filtre */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
          activeFiltersCount > 0
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg shadow-blue-500/25'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Filter size={18} />
        <span className="font-medium">Filtres</span>
        {activeFiltersCount > 0 && (
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-semibold">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Panel de filtres */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          
          <div className="absolute z-40 top-full mt-2 left-0 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Filtres {mediaType === 'movie' ? 'Films' : 'Séries'}
              </h3>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Réinitialiser
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-0">
              {/* Tri */}
              <FilterSection
                id="sort"
                title="Trier par"
                icon={Filter}
                isExpanded={expandedSections.sort}
                onToggle={() => toggleSection('sort')}
              >
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FilterSection>

              {/* Services de streaming */}
              <FilterSection
                id="providers"
                title="Où regarder"
                icon={Tv}
                isExpanded={expandedSections.providers}
                onToggle={() => toggleSection('providers')}
              >
                <ProviderFilter
                  selectedProviders={filters.watchProviders}
                  onToggle={handleProviderToggle}
                  providers={providers}
                  popularProviders={POPULAR_PROVIDERS_FR}
                />
              </FilterSection>

              {/* Disponibilités */}
              <FilterSection
                id="availability"
                title="Disponibilités"
                icon={Play}
                isExpanded={expandedSections.availability}
                onToggle={() => toggleSection('availability')}
              >
                <div className="flex flex-wrap gap-2">
                  {MONETIZATION_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const isSelected = filters.monetizationTypes.includes(option.value);
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleMonetizationToggle(option.value)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              {/* Dates de sortie */}
              <FilterSection
                id="dates"
                title="Dates de sortie"
                icon={Calendar}
                isExpanded={expandedSections.dates}
                onToggle={() => toggleSection('dates')}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">De</label>
                    <input
                      type="date"
                      value={filters.releaseDateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, releaseDateFrom: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">À</label>
                    <input
                      type="date"
                      value={filters.releaseDateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, releaseDateTo: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Genres */}
              <FilterSection
                id="genres"
                title="Genres"
                icon={Tag}
                isExpanded={expandedSections.genres}
                onToggle={() => toggleSection('genres')}
              >
                <GenreFilter
                  genres={genres}
                  selectedGenres={filters.genres}
                  onToggle={handleGenreToggle}
                />
              </FilterSection>

              {/* Certification */}
              <FilterSection
                id="certification"
                title="Classification"
                icon={Award}
                isExpanded={expandedSections.certification}
                onToggle={() => toggleSection('certification')}
              >
                <div className="flex flex-wrap gap-2">
                  {FR_CERTIFICATIONS.map(cert => (
                    <button
                      key={cert.value}
                      onClick={() => setFilters(prev => ({ ...prev, certification: cert.value }))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.certification === cert.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cert.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Langue */}
              <FilterSection
                id="language"
                title="Langue originale"
                icon={Globe}
                isExpanded={expandedSections.language}
                onToggle={() => toggleSection('language')}
              >
                <select
                  value={filters.originalLanguage}
                  onChange={(e) => setFilters(prev => ({ ...prev, originalLanguage: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Toutes les langues</option>
                  {languages.slice(0, 50).map(lang => (
                    <option key={lang.iso_639_1} value={lang.iso_639_1}>
                      {lang.english_name} {lang.name && lang.name !== lang.english_name ? `(${lang.name})` : ''}
                    </option>
                  ))}
                </select>
              </FilterSection>

              {/* Score utilisateur */}
              <FilterSection
                id="vote"
                title="Score utilisateur"
                icon={Star}
                isExpanded={expandedSections.vote}
                onToggle={() => toggleSection('vote')}
              >
                <VoteFilter
                  voteAverageMin={filters.voteAverageMin}
                  voteAverageMax={filters.voteAverageMax}
                  voteCountMin={filters.voteCountMin}
                  onVoteMinChange={(val) => setFilters(prev => ({ ...prev, voteAverageMin: val }))}
                  onVoteMaxChange={(val) => setFilters(prev => ({ ...prev, voteAverageMax: val }))}
                  onVoteCountChange={(val) => setFilters(prev => ({ ...prev, voteCountMin: val }))}
                />
              </FilterSection>

              {/* Durée */}
              <FilterSection
                id="runtime"
                title="Durée (minutes)"
                icon={Clock}
                isExpanded={expandedSections.runtime}
                onToggle={() => toggleSection('runtime')}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      value={filters.runtimeMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, runtimeMin: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-gray-400 pt-5">—</span>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      value={filters.runtimeMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, runtimeMax: parseInt(e.target.value) || 400 }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="400"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Mots-clés */}
              <FilterSection
                id="keywords"
                title="Mots-clés"
                icon={SearchIcon}
                isExpanded={expandedSections.keywords}
                onToggle={() => toggleSection('keywords')}
              >
                <KeywordFilter
                  keywords={filters.keywords}
                  searchValue={keywordSearch}
                  searchResults={keywordResults}
                  isSearching={isSearchingKeywords}
                  onSearchChange={handleKeywordSearch}
                  onKeywordAdd={handleKeywordAdd}
                  onKeywordRemove={handleKeywordRemove}
                />
              </FilterSection>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
