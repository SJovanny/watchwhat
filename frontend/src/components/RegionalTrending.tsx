'use client';

import React, { useState, useEffect } from 'react';
import { SearchResult } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import { usePreferences } from '@/contexts/PreferencesContext';
import AllTrendingCarousel from './AllTrendingCarousel';
import SectionHeader from './SectionHeader';

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
  const { preferences, isLoading: isPrefsLoading } = usePreferences();
  const [content, setContent] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attendre que les préférences soient chargées avant de charger le contenu
    if (!isPrefsLoading && preferences?.country) {
      loadRegionalContent();
    }
  }, [preferences?.country, isPrefsLoading]);

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

  if (!isLoading && content.length === 0) {
    return null; // Ne pas afficher si pas de contenu
  }

  return (
    <section className={className} aria-labelledby="row-regional">
      <SectionHeader
        title={<span id="row-regional">Populaire en {countryName}</span>}
        meta={isLoading ? undefined : `${content.length} titres`}
        action={{ label: 'Explorer', href: '/discover' }}
      />
      {isLoading ? (
        <div className="flex gap-3 overflow-hidden sm:gap-4" aria-hidden>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] w-[140px] flex-shrink-0 sm:w-[160px] md:w-[176px] lg:w-[192px]" />
          ))}
        </div>
      ) : (
        <AllTrendingCarousel content={content} onContentClick={onContentClick} />
      )}
    </section>
  );
}
