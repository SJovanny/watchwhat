'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Filter, X, ChevronDown, ChevronUp, Star, Calendar, Clock, 
  Tv, Search as SearchIcon, Tag, Globe, Award, Play
} from 'lucide-react';
import { TMDBGenre, WatchProvider, Language, Keyword, Certification } from '@/types';
import { tmdbService, getImageUrl } from '@/lib/tmdb';

// Types pour les filtres
export interface FilterState {
  // Tri
  sortBy: string;
  
  // Services de streaming
  watchProviders: number[];
  watchRegion: string;
  
  // Disponibilités
  monetizationTypes: ('flatrate' | 'free' | 'rent' | 'buy')[];
  
  // Dates
  releaseDateFrom: string;
  releaseDateTo: string;
  
  // Genres
  genres: number[];
  
  // Certifications
  certification: string;
  
  // Langue
  originalLanguage: string;
  
  // Vote
  voteAverageMin: number;
  voteAverageMax: number;
  voteCountMin: number;
  
  // Durée (en minutes)
  runtimeMin: number;
  runtimeMax: number;
  
  // Mots-clés
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

// Certifications françaises
const FR_CERTIFICATIONS = [
  { value: '', label: 'Toutes' },
  { value: 'U', label: 'U (Tous publics)' },
  { value: '10', label: '10+' },
  { value: '12', label: '12+' },
  { value: '16', label: '16+' },
  { value: '18', label: '18+' },
];

// Providers populaires en France (IDs TMDB)
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
  { id: 35, name: 'Rakuten TV' },
  { id: 11, name: 'MUBI' },
  { id: 310, name: 'LaCinetek' },
  { id: 445, name: 'ADN' },
  { id: 190, name: 'Curiosity Stream' },
  { id: 531, name: 'Paramount Plus' },
  { id: 1796, name: 'Netflix avec pubs' },
  { id: 10, name: 'Amazon Video' },
  { id: 300, name: 'Pluto TV' },
  { id: 1870, name: 'TF1+' },
  { id: 384, name: 'HBO Max' },
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
        // Charger les genres selon le type de média
        const genresFn = mediaType === 'movie' 
          ? tmdbService.getMovieGenres 
          : tmdbService.getGenres;
        const genresList = await genresFn();
        setGenres(genresList);

        // Charger les providers
        const providersList = await tmdbService.getWatchProviders(mediaType, 'FR');
        setProviders(providersList);

        // Charger les langues
        const languagesList = await tmdbService.getLanguages();
        // Trier les langues, français et anglais en premier
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
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onFiltersChange(filters);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
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
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
      setFilters(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
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

  // Composant Section pliable
  const FilterSection = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Icon size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white text-sm">{title}</span>
        </div>
        {expandedSections[id] ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="pb-4 px-1">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de filtre */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
          activeFiltersCount > 0
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg shadow-blue-500/25'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
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
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute z-40 top-full mt-2 left-0 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Filtres {mediaType === 'movie' ? 'Films' : 'Séries'}
              </h3>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Réinitialiser
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-0">
              {/* Tri */}
              <FilterSection id="sort" title="Trier par" icon={Filter}>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FilterSection>

              {/* Services de streaming */}
              <FilterSection id="providers" title="Où regarder" icon={Tv}>
                <div className="grid grid-cols-4 gap-2">
                  {POPULAR_PROVIDERS_FR.slice(0, 16).map(provider => {
                    const fullProvider = providers.find(p => p.provider_id === provider.id);
                    const isSelected = filters.watchProviders.includes(provider.id);
                    
                    return (
                      <button
                        key={provider.id}
                        onClick={() => handleProviderToggle(provider.id)}
                        className={`relative p-2 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        title={provider.name}
                      >
                        {fullProvider?.logo_path ? (
                          <img
                            src={getImageUrl(fullProvider.logo_path, 'w200')}
                            alt={provider.name}
                            className="w-full h-8 object-contain rounded"
                          />
                        ) : (
                          <div className="w-full h-8 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {provider.name.slice(0, 3)}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {filters.watchProviders.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {filters.watchProviders.length} service(s) sélectionné(s)
                  </p>
                )}
              </FilterSection>

              {/* Disponibilités */}
              <FilterSection id="availability" title="Disponibilités" icon={Play}>
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
              <FilterSection id="dates" title="Dates de sortie" icon={Calendar}>
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
              <FilterSection id="genres" title="Genres" icon={Tag}>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {genres.map(genre => {
                    const isSelected = filters.genres.includes(genre.id);
                    
                    return (
                      <button
                        key={genre.id}
                        onClick={() => handleGenreToggle(genre.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              {/* Certification */}
              <FilterSection id="certification" title="Classification" icon={Award}>
                <div className="flex flex-wrap gap-2">
                  {FR_CERTIFICATIONS.map(cert => {
                    const isSelected = filters.certification === cert.value;
                    
                    return (
                      <button
                        key={cert.value}
                        onClick={() => setFilters(prev => ({ ...prev, certification: cert.value }))}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {cert.label}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              {/* Langue */}
              <FilterSection id="language" title="Langue originale" icon={Globe}>
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
              <FilterSection id="vote" title="Score utilisateur" icon={Star}>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Note minimale: {filters.voteAverageMin}</span>
                      <span>Note maximale: {filters.voteAverageMax}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={filters.voteAverageMin}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          voteAverageMin: Math.min(parseFloat(e.target.value), prev.voteAverageMax - 0.5)
                        }))}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={filters.voteAverageMax}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          voteAverageMax: Math.max(parseFloat(e.target.value), prev.voteAverageMin + 0.5)
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Nombre minimum de votes
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={filters.voteCountMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, voteCountMin: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Durée */}
              <FilterSection id="runtime" title="Durée (minutes)" icon={Clock}>
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
              <FilterSection id="keywords" title="Mots-clés" icon={SearchIcon}>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={keywordSearch}
                      onChange={(e) => handleKeywordSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                      placeholder="Rechercher un mot-clé..."
                    />
                    {isSearchingKeywords && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Résultats de recherche */}
                  {keywordResults.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {keywordResults.map(keyword => (
                        <button
                          key={keyword.id}
                          onClick={() => handleKeywordAdd(keyword)}
                          className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {keyword.name}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Mots-clés sélectionnés */}
                  {filters.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.keywords.map(keyword => (
                        <span
                          key={keyword.id}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                        >
                          <span>{keyword.name}</span>
                          <button
                            onClick={() => handleKeywordRemove(keyword.id)}
                            className="hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </FilterSection>
            </div>

            {/* Footer avec bouton appliquer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
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
