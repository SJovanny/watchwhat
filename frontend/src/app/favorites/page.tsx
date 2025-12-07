"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Star, Calendar, Trash2 } from 'lucide-react';
import SerieCard from '@/components/SerieCard';
import { Serie, WatchedSerie } from '@/types';
import { storageService } from '@/lib/storage';
import { formatDateToLocal } from '@/lib/utils';
import { useNotify } from '@/components/NotificationProvider';

export default function FavoritesPage() {
  const [favoriteSeries, setFavoriteSeries] = useState<Serie[]>([]);
  const [watchedSeries, setWatchedSeries] = useState<WatchedSerie[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'watched'>('favorites');
  const notify = useNotify();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const favorites = storageService.getFavoriteSeries();
    const watched = storageService.getWatchedSeries();
    
    setFavoriteSeries(favorites);
    setWatchedSeries(watched);
  };

  const handleSerieSelect = useCallback((serie: Serie) => {
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const handleAddToWatched = useCallback((serie: Serie) => {
    storageService.addWatchedSerie(serie);
    loadData(); // Recharger les données
    notify.success(
      'Série ajoutée !',
      `"${serie.name}" a été ajoutée à votre liste des séries vues`
    );
  }, [notify]);

  const handleRemoveFavorite = useCallback((serieId: number) => {
    storageService.removeFavoriteSerie(serieId);
    loadData();
    notify.info('Série retirée', 'La série a été retirée de vos favoris');
  }, [notify]);

  const handleRemoveWatched = useCallback((serieId: number) => {
    storageService.removeWatchedSerie(serieId);
    loadData();
    notify.info('Série retirée', 'La série a été retirée de votre historique');
  }, [notify]);

  const clearAllFavorites = () => {
    if (confirm('Êtes-vous sûr de vouloir vider votre liste de favoris ?')) {
      favoriteSeries.forEach(serie => {
        storageService.removeFavoriteSerie(serie.id);
      });
      loadData();
    }
  };

  const clearAllWatched = () => {
    if (confirm('Êtes-vous sûr de vouloir vider votre historique de visionnage ?')) {
      watchedSeries.forEach(watched => {
        storageService.removeWatchedSerie(watched.serieData.id);
      });
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ma Collection
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos séries favorites et votre historique de visionnage
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Heart size={18} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} />
            <span>Favoris ({favoriteSeries.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('watched')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'watched'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Star size={18} />
            <span>Vues ({watchedSeries.length})</span>
          </button>
        </div>

        {/* Contenu des favoris */}
        {activeTab === 'favorites' && (
          <div>
            {favoriteSeries.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Vos séries favorites
                  </h2>
                  {favoriteSeries.length > 0 && (
                    <button
                      onClick={clearAllFavorites}
                      className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Tout supprimer</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {favoriteSeries.map((serie) => (
                    <div key={serie.id} className="relative group">
                      <SerieCard
                        serie={serie}
                        onSerieClick={handleSerieSelect}
                      />
                      <button
                        onClick={() => handleRemoveFavorite(serie.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Retirer des favoris"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun favori pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Ajoutez des séries à vos favoris pour les retrouver ici
                </p>
                <button
                  onClick={() => window.location.href = '/discover'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Découvrir des séries
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contenu de l'historique */}
        {activeTab === 'watched' && (
          <div>
            {watchedSeries.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Séries que vous avez vues
                  </h2>
                  {watchedSeries.length > 0 && (
                    <button
                      onClick={clearAllWatched}
                      className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Tout supprimer</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {watchedSeries
                    .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
                    .map((watched) => (
                      <div key={watched.serieData.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${watched.serieData.poster_path}`}
                          alt={watched.serieData.name}
                          className="w-16 h-24 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
                          }}
                        />
                        
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => handleSerieSelect(watched.serieData)}
                          >
                            {watched.serieData.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>Vue le {formatDateToLocal(watched.watchedAt.toISOString())}</span>
                            </div>
                            {watched.rating && (
                              <div className="flex items-center space-x-1">
                                <Star size={14} className="text-yellow-500" fill="currentColor" />
                                <span>{watched.rating}/10</span>
                              </div>
                            )}
                          </div>
                          {watched.review && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              "{watched.review}"
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleRemoveWatched(watched.serieData.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          title="Retirer de l'historique"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune série vue
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Marquez des séries comme vues pour suivre votre progression
                </p>
                <button
                  onClick={() => window.location.href = '/discover'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Découvrir des séries
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
