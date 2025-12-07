"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserPreferences } from "@/types";
import { tmdbV4Service } from "@/lib/tmdb-v4";

interface PreferencesContextType {
  preferences: UserPreferences | null;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = () => {
      const prefs = tmdbV4Service.getUserPreferences();
      setPreferences(prefs);
      setIsLoading(false);
    };

    loadPreferences();

    // Optional: Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_preferences") {
        loadPreferences();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    if (!preferences) return;
    
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    tmdbV4Service.saveUserPreferences(newPrefs);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, isLoading }}>
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
