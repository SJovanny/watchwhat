'use client'

import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { supabaseUserService, UserPreferences } from '@/lib/supabase-user';

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType>({
  preferences: null,
  isLoading: true,
  updatePreferences: async () => {},
  refreshPreferences: async () => {},
});

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

// Préférences par défaut
const defaultPreferences: Partial<UserPreferences> = {
  favoriteGenres: [],
  dislikedGenres: [],
  favoriteActors: [],
  minRating: 6.0,
  maxRating: 10.0,
  preferredLanguage: 'fr-FR',
  includeAdult: false,
  notificationSettings: {
    newRecommendations: true,
    weeklyDigest: false,
    newEpisodes: true,
  },
  displaySettings: {
    compactView: false,
    showRatings: true,
    showGenres: true,
    autoPlay: false,
  },
};

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      loadPreferences();
    }
  }, [user, authLoading]);

  const loadPreferences = async () => {
    if (!user) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let userPrefs = await supabaseUserService.getUserPreferences(user.id);

      // Si l'utilisateur n'a pas de préférences, créer les préférences par défaut
      if (!userPrefs) {
        userPrefs = await supabaseUserService.saveUserPreferences(user.id, defaultPreferences);
      }

      setPreferences(userPrefs);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const updatedPrefs = await supabaseUserService.saveUserPreferences(user.id, {
        ...preferences,
        ...updates
      });

      setPreferences(updatedPrefs);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  };

  const refreshPreferences = async () => {
    await loadPreferences();
  };

  const value = {
    preferences,
    isLoading,
    updatePreferences,
    refreshPreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
