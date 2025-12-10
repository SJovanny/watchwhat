'use client';

import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, ChevronRight } from 'lucide-react';
import { SearchResult } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import { usePreferences } from '@/contexts/PreferencesContext';
import AllTrendingCarousel from './AllTrendingCarousel';

// Map des noms de pays en français
const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  US: 'États-Unis',
  UK: 'Royaume-Uni',
  GB: 'Royaume-Uni',
  JP: 'Japon',
  KR: 'Corée du Sud',
  DE: 'Allemagne',
  ES: 'Espagne',
  IT: 'Italie',
  BR: 'Brésil',
  CA: 'Canada',
  AU: 'Australie',
  IN: 'Inde',
  MX: 'Mexique',
  AR: 'Argentine',
  NL: 'Pays-Bas',
  BE: 'Belgique',
  CH: 'Suisse',
  PT: 'Portugal',
  SE: 'Suède',
  NO: 'Norvège',
  DK: 'Danemark',
  FI: 'Finlande',
  PL: 'Pologne',
  RU: 'Russie',
  CN: 'Chine',
  TW: 'Taïwan',
  TH: 'Thaïlande',
};

interface RegionalTrendingProps {
  onContentClick: (content: SearchResult) => void;
  className?: string;
}

export default function RegionalTrending({ onContentClick, className = '' }: RegionalTrendingProps) {
  const { preferences } = usePreferences();
  const [content, setContent] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRegionalContent();
  }, [preferences?.country]);

  const loadRegionalContent = async () => {
    try {
      setIsLoading(true);
      
      // Charger 2 pages pour avoir plus de contenu
      const [page1, page2] = await Promise.all([
        tmdbService.getTrendingByRegion(1),
        tmdbService.getTrendingByRegion(2),
      ]);

      // Combiner et dédupliquer
      const allContent = [...(page1.results || []), ...(page2.results || [])];
      const uniqueContent = allContent.reduce((unique, item) => {
        if (!unique.find(i => i.id === item.id && i.media_type === item.media_type)) {
          unique.push(item);
        }
        return unique;
      }, [] as SearchResult[]);

      setContent(uniqueContent.slice(0, 20));
      console.log(`[RegionalTrending] Loaded ${uniqueContent.length} items for region: ${preferences?.country || 'FR'}`);
    } catch (error) {
      console.error('[RegionalTrending] Error loading content:', error);
      setContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  const countryCode = preferences?.country || 'FR';
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;

  if (isLoading) {
    return (
      <section className={`mb-12 ${className}`}>
        <div className="flex items-center space-x-2 mb-6">
          <Globe className="h-6 w-6 text-emerald-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Populaire en {countryName}
          </h2>
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (content.length === 0) {
    return null; // Ne pas afficher si pas de contenu
  }

  return (
    <section className={`mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Populaire en {countryName}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({content.length} contenus)
          </span>
        </div>
        <button
          onClick={() => window.location.href = '/discover'}
          className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
        >
          <span>Explorer plus</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <AllTrendingCarousel
        content={content}
        onContentClick={onContentClick}
      />
    </section>
  );
}
