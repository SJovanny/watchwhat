"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import SerieCard from '@/components/SerieCard';
import { Serie } from '@/types';
import { tmdbService } from '@/lib/tmdb';

type TimeWindow = 'day' | 'week';

export default function TrendingPage() {
  const [series, setSeries] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('day');

  const loadSeries = useCallback(async (page = 1, reset = false) => {
    try {
      setIsLoading(true);
      const response = await tmdbService.getTrendingSeries(timeWindow, page);
      
      if (reset || page === 1) {
        setSeries(response.results);
      } else {
        setSeries(prev => [...prev, ...response.results]);
      }
      
      setHasMore(page < response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error(`Erreur lors du chargement des tendances (${timeWindow}):`, error);
    } finally {
      setIsLoading(false);
    }
  }, [timeWindow]);

  useEffect(() => {
    loadSeries(1, true);
  }, [timeWindow, loadSeries]);

  const handleTimeWindowChange = (newTimeWindow: TimeWindow) => {
    setTimeWindow(newTimeWindow);
  };

  const handleSerieSelect = useCallback((serie: Serie) => {
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadSeries(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Séries Tendances
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Les séries les plus populaires du moment.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1">
            <button
              onClick={() => handleTimeWindowChange('day')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                timeWindow === 'day'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => handleTimeWindowChange('week')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                timeWindow === 'week'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Cette semaine
            </button>
          </div>
        </div>

        {series.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {series.map((serie) => (
              <SerieCard
                key={`${serie.id}-${timeWindow}`}
                serie={serie}
                onSerieClick={handleSerieSelect}
              />
            ))}
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="text-center">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Charger plus
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        )}

        {!isLoading && series.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune série trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Impossible de charger les tendances pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
