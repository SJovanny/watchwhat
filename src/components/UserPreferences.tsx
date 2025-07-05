'use client'

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Heart, 
  Eye, 
  Star, 
  Bell, 
  Palette, 
  Monitor,
  Globe,
  Calendar,
  Filter,
  Save,
  LogOut,
  Check,
  X,
  ChevronRight,
  Shield,
  Play,
  Image,
  Volume2,
  Languages
} from 'lucide-react';
import { tmdbV4Service, type UserPreferences, type TMDBv4Account } from '@/lib/tmdb-v4';
import { tmdbService } from '@/lib/tmdb';

interface Genre {
  id: number;
  name: string;
}

export default function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [account, setAccount] = useState<TMDBv4Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);

  useEffect(() => {
    loadUserData();
    loadGenres();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les préférences locales
      const userPrefs = tmdbV4Service.getUserPreferences();
      setPreferences(userPrefs);

      // Charger les données de compte si connecté
      if (tmdbV4Service.isAuthenticated()) {
        try {
          const accountData = await tmdbV4Service.getAccount();
          setAccount(accountData);
        } catch (error) {
          console.warn('Impossible de charger les données du compte:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const [movieGenresData, tvGenresData] = await Promise.all([
        tmdbService.getMovieGenres(),
        tmdbService.getGenres()
      ]);
      
      setMovieGenres(movieGenresData);
      setTvGenres(tvGenresData);
    } catch (error) {
      console.error('Erreur lors du chargement des genres:', error);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      tmdbV4Service.saveUserPreferences(preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await tmdbV4Service.logout();
      setAccount(null);
      // Rediriger vers la page d'accueil
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    if (!preferences) return;
    setPreferences({ ...preferences, ...updates });
  };

  const toggleGenre = (genreId: number, type: 'favorite' | 'disliked') => {
    if (!preferences) return;

    const currentList = type === 'favorite' ? preferences.favoriteGenres : preferences.dislikedGenres;
    const otherList = type === 'favorite' ? preferences.dislikedGenres : preferences.favoriteGenres;
    
    let newCurrentList: number[];
    let newOtherList = otherList;

    if (currentList.includes(genreId)) {
      // Retirer des favoris/détestés
      newCurrentList = currentList.filter((id: number) => id !== genreId);
    } else {
      // Ajouter aux favoris/détestés et retirer de l'autre liste si présent
      newCurrentList = [...currentList, genreId];
      newOtherList = otherList.filter((id: number) => id !== genreId);
    }

    updatePreferences({
      [type === 'favorite' ? 'favoriteGenres' : 'dislikedGenres']: newCurrentList,
      [type === 'favorite' ? 'dislikedGenres' : 'favoriteGenres']: newOtherList
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-white/10 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="h-96 bg-white/10 rounded-2xl"></div>
              <div className="lg:col-span-3 h-96 bg-white/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6 flex items-center justify-center">
        <div className="text-center text-white">
          <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-white/70">Impossible de charger les préférences utilisateur.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'content', label: 'Contenu', icon: Filter },
    { id: 'display', label: 'Affichage', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Compte', icon: User }
  ];

  const allGenres = [...movieGenres, ...tvGenres].reduce((acc, genre) => {
    if (!acc.find(g => g.id === genre.id)) {
      acc.push(genre);
    }
    return acc;
  }, [] as Genre[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Préférences</h1>
                <p className="text-white/70 text-lg">Personnalisez votre expérience WatchWhat</p>
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Sauvegardé !</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation des onglets */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-white font-bold text-lg mb-4">Navigation</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        activeTab === tab.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
              
              {/* Onglet Général */}
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Settings className="h-6 w-6 mr-3" />
                      Paramètres Généraux
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Langue */}
                    <div className="space-y-3">
                      <label className="flex items-center text-white font-medium">
                        <Languages className="h-5 w-5 mr-2" />
                        Langue
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => updatePreferences({ language: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="fr-FR">Français</option>
                        <option value="en-US">English</option>
                        <option value="es-ES">Español</option>
                        <option value="de-DE">Deutsch</option>
                        <option value="it-IT">Italiano</option>
                      </select>
                    </div>

                    {/* Pays */}
                    <div className="space-y-3">
                      <label className="flex items-center text-white font-medium">
                        <Globe className="h-5 w-5 mr-2" />
                        Pays
                      </label>
                      <select
                        value={preferences.country}
                        onChange={(e) => updatePreferences({ country: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="FR">France</option>
                        <option value="US">États-Unis</option>
                        <option value="GB">Royaume-Uni</option>
                        <option value="CA">Canada</option>
                        <option value="DE">Allemagne</option>
                        <option value="ES">Espagne</option>
                        <option value="IT">Italie</option>
                      </select>
                    </div>
                  </div>

                  {/* Contenu pour adultes */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-red-400" />
                      <div>
                        <h4 className="text-white font-medium">Contenu pour adultes</h4>
                        <p className="text-white/60 text-sm">Inclure le contenu classé pour adultes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updatePreferences({ includeAdult: !preferences.includeAdult })}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                        preferences.includeAdult ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        preferences.includeAdult ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet Contenu */}
              {activeTab === 'content' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Filter className="h-6 w-6 mr-3" />
                      Préférences de Contenu
                    </h3>
                  </div>

                  {/* Plage de notes */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-lg flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-400" />
                      Plage de Notes
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm">Note minimum</label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={preferences.minRating}
                          onChange={(e) => updatePreferences({ minRating: parseFloat(e.target.value) })}
                          className="w-full mt-2"
                        />
                        <span className="text-white text-sm">{preferences.minRating}/10</span>
                      </div>
                      <div>
                        <label className="text-white/70 text-sm">Note maximum</label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={preferences.maxRating}
                          onChange={(e) => updatePreferences({ maxRating: parseFloat(e.target.value) })}
                          className="w-full mt-2"
                        />
                        <span className="text-white text-sm">{preferences.maxRating}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Années de sortie */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                      Période de Sortie
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm">Depuis l'année</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                          value={preferences.releaseYearFrom || ''}
                          onChange={(e) => updatePreferences({ 
                            releaseYearFrom: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="w-full p-3 mt-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                          placeholder="Ex: 2000"
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-sm">Jusqu'à l'année</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                          value={preferences.releaseYearTo || ''}
                          onChange={(e) => updatePreferences({ 
                            releaseYearTo: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="w-full p-3 mt-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                          placeholder="Ex: 2024"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Genres favoris */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-lg flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-400" />
                      Genres Favoris
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {allGenres.map((genre) => (
                        <button
                          key={`fav-${genre.id}`}
                          onClick={() => toggleGenre(genre.id, 'favorite')}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                            preferences.favoriteGenres.includes(genre.id)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                          }`}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Genres détestés */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-lg flex items-center">
                      <X className="h-5 w-5 mr-2 text-red-400" />
                      Genres à Éviter
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {allGenres.map((genre) => (
                        <button
                          key={`dis-${genre.id}`}
                          onClick={() => toggleGenre(genre.id, 'disliked')}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                            preferences.dislikedGenres.includes(genre.id)
                              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                              : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                          }`}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Affichage */}
              {activeTab === 'display' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Monitor className="h-6 w-6 mr-3" />
                      Préférences d'Affichage
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thème */}
                    <div className="space-y-3">
                      <label className="flex items-center text-white font-medium">
                        <Palette className="h-5 w-5 mr-2" />
                        Thème
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'light', label: 'Clair' },
                          { value: 'dark', label: 'Sombre' },
                          { value: 'auto', label: 'Auto' }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => updatePreferences({ theme: theme.value as 'light' | 'dark' | 'auto' })}
                            className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                              preferences.theme === theme.value
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                            }`}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vue par défaut */}
                    <div className="space-y-3">
                      <label className="flex items-center text-white font-medium">
                        <Image className="h-5 w-5 mr-2" />
                        Vue par défaut
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'grid', label: 'Grille' },
                          { value: 'list', label: 'Liste' }
                        ].map((view) => (
                          <button
                            key={view.value}
                            onClick={() => updatePreferences({ defaultView: view.value as 'grid' | 'list' })}
                            className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                              preferences.defaultView === view.value
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                            }`}
                          >
                            {view.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Éléments par page */}
                  <div className="space-y-4">
                    <label className="text-white font-medium text-lg flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Éléments par page: {preferences.itemsPerPage}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="10"
                      value={preferences.itemsPerPage}
                      onChange={(e) => updatePreferences({ itemsPerPage: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-white/60 text-sm">
                      <span>10</span>
                      <span>20</span>
                      <span>30</span>
                      <span>40</span>
                      <span>50</span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-lg">Options</h4>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <Play className="h-5 w-5 text-blue-400" />
                        <div>
                          <h5 className="text-white font-medium">Lecture automatique</h5>
                          <p className="text-white/60 text-sm">Démarrer automatiquement les trailers</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ autoplay: !preferences.autoplay })}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          preferences.autoplay ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          preferences.autoplay ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <Eye className="h-5 w-5 text-yellow-400" />
                        <div>
                          <h5 className="text-white font-medium">Afficher les spoilers</h5>
                          <p className="text-white/60 text-sm">Révéler les détails de l'intrigue</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ showSpoilers: !preferences.showSpoilers })}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          preferences.showSpoilers ? 'bg-yellow-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          preferences.showSpoilers ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Bell className="h-6 w-6 mr-3" />
                      Préférences de Notifications
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Nouvelles sorties</h5>
                          <p className="text-white/60 text-sm">Films et séries récemment ajoutés</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ 
                          notifications: { 
                            ...preferences.notifications, 
                            newReleases: !preferences.notifications.newReleases 
                          } 
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          preferences.notifications.newReleases ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          preferences.notifications.newReleases ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Star className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Recommandations</h5>
                          <p className="text-white/60 text-sm">Contenu personnalisé basé sur vos goûts</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ 
                          notifications: { 
                            ...preferences.notifications, 
                            recommendations: !preferences.notifications.recommendations 
                          } 
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          preferences.notifications.recommendations ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          preferences.notifications.recommendations ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Heart className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Mises à jour Watchlist</h5>
                          <p className="text-white/60 text-sm">Changements dans votre liste de suivi</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ 
                          notifications: { 
                            ...preferences.notifications, 
                            watchlistUpdates: !preferences.notifications.watchlistUpdates 
                          } 
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          preferences.notifications.watchlistUpdates ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          preferences.notifications.watchlistUpdates ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Compte */}
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <User className="h-6 w-6 mr-3" />
                      Compte TMDB
                    </h3>
                  </div>

                  {account ? (
                    <div className="space-y-6">
                      {/* Informations du compte */}
                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-xl">{account.name || account.username}</h4>
                            <p className="text-white/70">@{account.username}</p>
                            <p className="text-white/50 text-sm">ID: {account.id}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/70">Langue:</span>
                            <span className="text-white ml-2">{account.iso_639_1.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Pays:</span>
                            <span className="text-white ml-2">{account.iso_3166_1}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Contenu adulte:</span>
                            <span className={`ml-2 ${account.include_adult ? 'text-red-400' : 'text-green-400'}`}>
                              {account.include_adult ? 'Activé' : 'Désactivé'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions du compte */}
                      <div className="space-y-4">
                        <h4 className="text-white font-medium text-lg">Actions</h4>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all duration-300"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="h-12 w-12 text-white/50" />
                      </div>
                      <h4 className="text-white font-bold text-xl mb-2">Compte non connecté</h4>
                      <p className="text-white/70 mb-6">
                        Connectez-vous pour synchroniser vos préférences et accéder à vos listes personnalisées.
                      </p>
                      <button
                        onClick={() => window.location.href = '/auth'}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-white font-semibold transition-all duration-300"
                      >
                        Se connecter à TMDB
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
