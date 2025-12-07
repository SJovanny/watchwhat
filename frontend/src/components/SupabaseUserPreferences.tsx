'use client'

import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Save, Bell, Eye, Star, Heart, Globe, Calendar, Filter, User, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { useUserPreferences } from '@/hooks/useSupabasePreferences';
import { tmdbService } from '@/lib/tmdb';

interface Genre {
  id: number;
  name: string;
}

const LANGUAGES = [
  { code: 'fr-FR', name: 'Français' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'it-IT', name: 'Italiano' },
  { code: 'pt-PT', name: 'Português' },
];

const TABS = [
  { id: 'genres', label: 'Genres', icon: Heart },
  { id: 'ratings', label: 'Notes', icon: Star },
  { id: 'language', label: 'Langue', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'display', label: 'Affichage', icon: Eye },
];

export default function UserPreferences() {
  const { user } = useAuth();
  const { preferences, updatePreferences, isLoading } = useUserPreferences();
  const [activeTab, setActiveTab] = useState('genres');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const genres = await tmdbService.getGenres();
      setGenres(genres);
    } catch (error) {
      console.error('Erreur lors du chargement des genres:', error);
    }
  };

  const handleSave = async (updates: any) => {
    try {
      setIsSaving(true);
      await updatePreferences(updates);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-white/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Connexion requise</h1>
          <p className="text-white/70">Veuillez vous connecter pour accéder à vos préférences.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Chargement des préférences</h1>
          <p className="text-white/70">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'genres':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-xl mb-4 flex items-center">
                <Heart className="h-6 w-6 text-pink-400 mr-3" />
                Genres favoris
              </h3>
              <p className="text-white/70 mb-6">
                Sélectionnez vos genres préférés pour recevoir des recommandations personnalisées.
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {genres.map((genre) => {
                  const isSelected = preferences.favoriteGenres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => {
                        const newFavorites = isSelected
                          ? preferences.favoriteGenres.filter(id => id !== genre.id)
                          : [...preferences.favoriteGenres, genre.id];
                        handleSave({ favoriteGenres: newFavorites });
                      }}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-400/50 text-pink-200'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-xl mb-4">Genres à éviter</h3>
              <p className="text-white/70 mb-6">
                Sélectionnez les genres que vous ne souhaitez pas voir dans vos recommandations.
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {genres.map((genre) => {
                  const isDisliked = preferences.dislikedGenres?.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => {
                        const newDislikes = isDisliked
                          ? (preferences.dislikedGenres || []).filter(id => id !== genre.id)
                          : [...(preferences.dislikedGenres || []), genre.id];
                        handleSave({ dislikedGenres: newDislikes });
                      }}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        isDisliked
                          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/50 text-red-200'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'ratings':
        return (
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Star className="h-6 w-6 text-yellow-400 mr-3" />
              Préférences de notation
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className="block text-white font-medium mb-4">
                  Note minimale : {preferences.minRating}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={preferences.minRating}
                  onChange={(e) => handleSave({ minRating: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-white/60 text-sm mt-2">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-4">
                  Note maximale : {preferences.maxRating}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={preferences.maxRating}
                  onChange={(e) => handleSave({ maxRating: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-white/60 text-sm mt-2">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Globe className="h-6 w-6 text-blue-400 mr-3" />
              Préférences linguistiques
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-3">Langue préférée</label>
                <select
                  value={preferences.preferredLanguage}
                  onChange={(e) => handleSave({ preferredLanguage: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-800">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h4 className="text-white font-medium">Contenu adulte</h4>
                  <p className="text-white/60 text-sm">Inclure le contenu réservé aux adultes</p>
                </div>
                <button
                  onClick={() => handleSave({ includeAdult: !preferences.includeAdult })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.includeAdult ? 'bg-blue-600' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.includeAdult ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Bell className="h-6 w-6 text-green-400 mr-3" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  key: 'newRecommendations' as keyof typeof preferences.notificationSettings,
                  title: 'Nouvelles recommandations',
                  description: 'Recevoir des notifications pour les nouvelles recommandations'
                },
                {
                  key: 'weeklyDigest' as keyof typeof preferences.notificationSettings,
                  title: 'Résumé hebdomadaire',
                  description: 'Recevoir un résumé hebdomadaire de vos activités'
                },
                {
                  key: 'newEpisodes' as keyof typeof preferences.notificationSettings,
                  title: 'Nouveaux épisodes',
                  description: 'Être notifié des nouveaux épisodes de vos séries favorites'
                }
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium">{notification.title}</h4>
                    <p className="text-white/60 text-sm">{notification.description}</p>
                  </div>
                  <button
                    onClick={() => handleSave({
                      notificationSettings: {
                        ...preferences.notificationSettings,
                        [notification.key]: !preferences.notificationSettings[notification.key]
                      }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.notificationSettings[notification.key] ? 'bg-green-600' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.notificationSettings[notification.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Eye className="h-6 w-6 text-purple-400 mr-3" />
              Affichage
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  key: 'compactView' as keyof typeof preferences.displaySettings,
                  title: 'Vue compacte',
                  description: 'Afficher plus de contenu sur l\'écran'
                },
                {
                  key: 'showRatings' as keyof typeof preferences.displaySettings,
                  title: 'Afficher les notes',
                  description: 'Montrer les notes TMDB sur les cartes'
                },
                {
                  key: 'showGenres' as keyof typeof preferences.displaySettings,
                  title: 'Afficher les genres',
                  description: 'Montrer les genres sur les cartes de contenu'
                },
                {
                  key: 'autoPlay' as keyof typeof preferences.displaySettings,
                  title: 'Lecture automatique',
                  description: 'Démarrer automatiquement la lecture des trailers'
                }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium">{setting.title}</h4>
                    <p className="text-white/60 text-sm">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handleSave({
                      displaySettings: {
                        ...preferences.displaySettings,
                        [setting.key]: !preferences.displaySettings[setting.key]
                      }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.displaySettings[setting.key] ? 'bg-purple-600' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.displaySettings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-r from-pink-400/25 to-purple-400/25 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
              <Settings className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
          </div>
          
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent leading-tight mb-4">
            Préférences Utilisateur
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Personnalisez votre expérience WatchWhat pour recevoir des recommandations parfaitement adaptées à vos goûts.
          </p>
        </div>

        {/* Navigation des onglets */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
              </button>
            );
          })}
        </div>

        {/* Contenu de l'onglet */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
          {renderTabContent()}
        </div>

        {/* Indicateur de sauvegarde */}
        {isSaving && (
          <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Sauvegarde...</span>
          </div>
        )}
      </div>
    </div>
  );
}
