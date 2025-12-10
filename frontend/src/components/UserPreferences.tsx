"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  User,
  Filter,
  Bell,
  Monitor,
  Check,
  ChevronRight,
} from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";
import {
  tmdbV4Service,
  type UserPreferences as UserPreferencesType,
  type TMDBv4Account,
} from "@/lib/tmdb-v4";
import { tmdbService } from "@/lib/tmdb";

// Import des sous-composants
import {
  GeneralTab,
  ContentTab,
  DisplayTab,
  NotificationsTab,
  AccountTab,
} from "./preferences";

interface Genre {
  id: number;
  name: string;
}

/**
 * Composant de préférences utilisateur
 * Refactorisé pour utiliser des sous-composants (SRP)
 */
export default function UserPreferences() {
  const {
    preferences: contextPreferences,
    updatePreferences: saveToContext,
    isLoading: isContextLoading,
  } = usePreferences();

  const [preferences, setPreferences] = useState<UserPreferencesType | null>(
    null
  );
  const [account, setAccount] = useState<TMDBv4Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle"
  );
  const [activeTab, setActiveTab] = useState("general");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);

  useEffect(() => {
    if (contextPreferences) {
      setPreferences(contextPreferences);
      setIsLoading(false);
    }
  }, [contextPreferences]);

  useEffect(() => {
    loadAccountData();
    loadGenres();
  }, []);

  const loadAccountData = async () => {
    try {
      if (tmdbV4Service.isAuthenticated()) {
        const accountData = await tmdbV4Service.getAccount();
        setAccount(accountData);
      }
    } catch (error) {
      console.warn("Impossible de charger les données du compte:", error);
    }
  };

  const loadGenres = async () => {
    try {
      const [movieGenresData, tvGenresData] = await Promise.all([
        tmdbService.getMovieGenres(),
        tmdbService.getGenres(),
      ]);
      setMovieGenres(movieGenresData);
      setTvGenres(tvGenresData);
    } catch (error) {
      console.error("Erreur lors du chargement des genres:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await tmdbV4Service.logout();
      setAccount(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferencesType>) => {
    if (!preferences) return;
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    setSaveStatus("saving");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      saveToContext(updates);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  const toggleGenre = (genreId: number, type: "favorite" | "disliked") => {
    if (!preferences) return;

    const currentList =
      type === "favorite"
        ? preferences.favoriteGenres
        : preferences.dislikedGenres;
    const otherList =
      type === "favorite"
        ? preferences.dislikedGenres
        : preferences.favoriteGenres;

    let newCurrentList: number[];
    let newOtherList = otherList;

    if (currentList.includes(genreId)) {
      newCurrentList = currentList.filter((id: number) => id !== genreId);
    } else {
      newCurrentList = [...currentList, genreId];
      newOtherList = otherList.filter((id: number) => id !== genreId);
    }

    updatePreferences({
      [type === "favorite" ? "favoriteGenres" : "dislikedGenres"]:
        newCurrentList,
      [type === "favorite" ? "dislikedGenres" : "favoriteGenres"]: newOtherList,
    });
  };

  // États de chargement et erreur
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
          <p className="text-white/70">
            Impossible de charger les préférences utilisateur.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "Général", icon: Settings },
    { id: "content", label: "Contenu", icon: Filter },
    { id: "display", label: "Affichage", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Compte", icon: User },
  ];

  const allGenres = [...movieGenres, ...tvGenres].reduce((acc, genre) => {
    if (!acc.find((g) => g.id === genre.id)) {
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
                <p className="text-white/70 text-lg">
                  Personnalisez votre expérience WatchWhat
                </p>
              </div>
            </div>

            {/* Auto-save Status */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
              {saveStatus === "saving" && (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-white/70 text-sm">Sauvegarde...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">Enregistré</span>
                </>
              )}
              {saveStatus === "idle" && (
                <span className="text-white/50 text-sm">À jour</span>
              )}
            </div>
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
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          activeTab === tab.id ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
              {/* Tab Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  {tabs.find((t) => t.id === activeTab)?.icon &&
                    React.createElement(
                      tabs.find((t) => t.id === activeTab)!.icon,
                      { className: "h-6 w-6 mr-3" }
                    )}
                  {activeTab === "general" && "Paramètres Généraux"}
                  {activeTab === "content" && "Préférences de Contenu"}
                  {activeTab === "display" && "Préférences d'Affichage"}
                  {activeTab === "notifications" &&
                    "Préférences de Notifications"}
                  {activeTab === "account" && "Compte TMDB"}
                </h3>
              </div>

              {/* Tab Content */}
              {activeTab === "general" && (
                <GeneralTab
                  preferences={preferences}
                  updatePreferences={updatePreferences}
                />
              )}
              {activeTab === "content" && (
                <ContentTab
                  preferences={preferences}
                  updatePreferences={updatePreferences}
                  allGenres={allGenres}
                  toggleGenre={toggleGenre}
                />
              )}
              {activeTab === "display" && (
                <DisplayTab
                  preferences={preferences}
                  updatePreferences={updatePreferences}
                />
              )}
              {activeTab === "notifications" && (
                <NotificationsTab
                  preferences={preferences}
                  updatePreferences={updatePreferences}
                />
              )}
              {activeTab === "account" && (
                <AccountTab account={account} onLogout={handleLogout} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
