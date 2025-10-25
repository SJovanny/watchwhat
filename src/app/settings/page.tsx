"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { UserService } from '@/lib/user-service';
import { Genre } from '@/types';
import { tmdbService } from '@/lib/tmdb';
import { useNotify } from '@/components/NotificationProvider';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const notify = useNotify();

  const [favoriteGenres, setFavoriteGenres] = useState<number[]>([]);
  const [minRating, setMinRating] = useState<number>(5);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Attendre que l'authentification soit résolue avant de rediriger
    if (authLoading) return;

    if (!user) {
      router.push('/auth?redirect=/settings');
      return;
    }

    async function loadInitialData() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [genresResponse, preferences] = await Promise.all([
          tmdbService.getGenres(),
          UserService.getPreferences(),
        ]);
        setAllGenres(genresResponse);
        if (preferences) {
          setFavoriteGenres(preferences.favoriteGenres || []);
          setMinRating(preferences.minRating || 5);
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des données:", error);
        const message = error?.message || String(error) || 'Erreur inconnue';
        setLoadError(message);
        notify.error("Erreur", "Impossible de charger vos préférences.");
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [user, router, notify]);

  const handleGenreToggle = (genreId: number) => {
    setFavoriteGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await UserService.updatePreferences({ favoriteGenres, minRating });
      notify.success("Sauvegardé", "Vos préférences ont été mises à jour.");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      notify.error("Erreur", "Impossible de sauvegarder vos préférences.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearWatched = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre historique de visionnage ? Cette action est irréversible.")) {
      try {
        await UserService.clearWatchedHistory();
        notify.success("Historique supprimé", "Votre historique de visionnage a été effacé.");
      } catch (error) {
        console.error("Erreur lors de la suppression de l'historique:", error);
        notify.error("Erreur", "Impossible de supprimer l'historique.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Erreur de chargement</h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Nous n'avons pas pu charger vos préférences : <span className="font-medium">{loadError}</span></p>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => {
                setIsLoading(true);
                loadInitialData();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Paramètres</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Préférences de recommandation</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genres favoris</label>
            <div className="flex flex-wrap gap-2">
              {allGenres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.id)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    favoriteGenres.includes(genre.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note minimale (sur 10)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="minRating"
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={e => setMinRating(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="font-semibold text-gray-900 dark:text-white w-10 text-center">{minRating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gestion des données</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Supprimer mon historique de visionnage</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cette action est irréversible.</p>
            </div>
            <button
              onClick={handleClearWatched}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
