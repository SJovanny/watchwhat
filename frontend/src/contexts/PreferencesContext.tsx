"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserPreferences } from "@/types";
import { UserService } from "@/lib/user-service";
import { tmdbService } from "@/lib/tmdb";
import { supabase } from "@/lib/supabase";

interface PreferencesContextType {
  preferences: UserPreferences | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  isLoading: boolean;
  reloadPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Préférences par défaut pour les utilisateurs non connectés
const getDefaultPreferences = (): UserPreferences => ({
  userId: "",
  language: "fr-FR",
  country: "FR",
  includeAdult: false,
  favoriteGenres: [],
  dislikedGenres: [],
  favoriteActors: [],
  minRating: 0,
  maxRating: 10,
  theme: "auto",
  defaultView: "grid",
  itemsPerPage: 20,
  autoplay: true,
  showSpoilers: false,
  notifications: {
    newReleases: true,
    recommendations: true,
    watchlistUpdates: true,
  },
  preferredLanguages: ["fr-FR"],
  favoriteSeries: [],
  notificationsEnabled: true,
  autoAddToWatchlist: false,
  showAdultContent: false,
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      let prefs: UserPreferences | null = null;
      
      if (user) {
        // Utilisateur connecté: charger depuis Supabase
        prefs = await UserService.getPreferences();
        console.log('[PreferencesContext] Préférences chargées depuis Supabase:', prefs);
      } else {
        // Utilisateur non connecté: utiliser le localStorage comme fallback
        const stored = localStorage.getItem("user_preferences");
        if (stored) {
          try {
            prefs = JSON.parse(stored);
          } catch {
            prefs = null;
          }
        }
      }
      
      // Si pas de préférences, utiliser les valeurs par défaut
      if (!prefs) {
        prefs = getDefaultPreferences();
      }
      
      setPreferences(prefs);
      
      // Appliquer la langue et la région au service TMDB
      tmdbService.setLanguage(prefs.language);
      tmdbService.setRegion(prefs.country);
      console.log(`[PreferencesContext] Langue: ${prefs.language}, Région: ${prefs.country}`);
      
    } catch (error) {
      console.error('[PreferencesContext] Erreur lors du chargement des préférences:', error);
      // En cas d'erreur, utiliser les valeurs par défaut
      const defaultPrefs = getDefaultPreferences();
      setPreferences(defaultPrefs);
      tmdbService.setLanguage(defaultPrefs.language);
      tmdbService.setRegion(defaultPrefs.country);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[PreferencesContext] Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await loadPreferences();
      }
    });

    // Écouter les changements localStorage pour les utilisateurs non connectés
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_preferences" && !isAuthenticated) {
        loadPreferences();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!preferences) return;
    
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    
    // Mettre à jour la langue et la région du service TMDB si elles ont changé
    if (updates.language) {
      tmdbService.setLanguage(updates.language);
      console.log(`[PreferencesContext] Langue mise à jour: ${updates.language}`);
    }
    if (updates.country) {
      tmdbService.setRegion(updates.country);
      console.log(`[PreferencesContext] Région mise à jour: ${updates.country}`);
    }
    
    // Sauvegarder
    if (isAuthenticated) {
      // Utilisateur connecté: sauvegarder dans Supabase
      const success = await UserService.updatePreferences(updates);
      if (success) {
        console.log('[PreferencesContext] Préférences sauvegardées dans Supabase');
      } else {
        console.error('[PreferencesContext] Erreur lors de la sauvegarde dans Supabase');
      }
    } else {
      // Utilisateur non connecté: sauvegarder dans localStorage
      localStorage.setItem("user_preferences", JSON.stringify(newPrefs));
      console.log('[PreferencesContext] Préférences sauvegardées dans localStorage');
    }
  };

  const reloadPreferences = async () => {
    await loadPreferences();
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, isLoading, reloadPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
