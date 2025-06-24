"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Star, Eye, Download, Upload, Settings, Trash2, BarChart3 } from 'lucide-react';
import { storageService } from '@/lib/storage';
import { UserPreferences, WatchedSerie, Serie } from '@/types';

export default function ProfilePage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [favoriteSeries, setFavoriteSeries] = useState<Serie[]>([]);
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalFavorites: 0,
    averageRating: 0,
    totalHours: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userPrefs = storageService.getUserPreferences();
    const watched = storageService.getWatchedSeries();
    const favorites = storageService.getFavoriteSeries();

    setPreferences(userPrefs);
    setFavoriteSeries(favorites);

    // Calculer les statistiques
    const totalWatched = watched.length;
    const totalFavorites = favorites.length;
    const ratingsWithValue = watched.filter(w => w.rating && w.rating > 0);
    const averageRating = ratingsWithValue.length > 0 
      ? ratingsWithValue.reduce((sum, w) => sum + (w.rating || 0), 0) / ratingsWithValue.length 
      : 0;

    // Estimation des heures (moyenne de 45min par épisode, 20 épisodes par série)
    const totalHours = totalWatched * 45 * 20 / 60;

    setStats({
      totalWatched,
      totalFavorites,
      averageRating,
      totalHours
    });
  };

  const handleExportData = () => {
    const data = storageService.exportUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchwhat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          const success = storageService.importUserData(data);
          if (success) {
            alert('Données importées avec succès !');
            loadUserData();
          } else {
            alert('Erreur lors de l\'import des données.');
          }
        } catch (error) {
          alert('Fichier invalide.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAllData = () => {
    if (confirm('⚠️ Attention ! Cette action supprimera définitivement toutes vos données (favoris, historique, préférences). Cette action est irréversible. Voulez-vous continuer ?')) {
      storageService.clearAllData();
      loadUserData();
      alert('Toutes vos données ont été supprimées.');
    }
  };

  if (!preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos préférences et consultez vos statistiques
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-4">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWatched}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Séries vues</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg mx-auto mb-4">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFavorites}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Favoris</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg mx-auto mb-4">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(stats.totalHours)}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Estimées</div>
          </div>
        </div>

        {/* Préférences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Vos Préférences
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Note minimale</h3>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                <span className="text-gray-600 dark:text-gray-400">{preferences.minRating}/10</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Langues préférées</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.preferredLanguages.map((lang) => (
                  <span key={lang} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
                    {lang.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Genres favoris</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.favoriteGenres.length > 0 ? (
                  preferences.favoriteGenres.map((genreId) => (
                    <span key={genreId} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full">
                      Genre #{genreId}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Aucun genre sélectionné</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gestion des données */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Gestion des Données
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exporter mes données</span>
              </button>

              <label className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Importer des données</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={handleClearAllData}
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer toutes mes données</span>
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Cette action est irréversible et supprimera tous vos favoris, historique et préférences.
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/discover'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Découvrir des séries
            </button>
            <button
              onClick={() => window.location.href = '/favorites'}
              className="bg-gray-600 dark:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Voir mes favoris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
