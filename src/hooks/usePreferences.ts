'use client'

import { useState, useEffect } from 'react';
import { tmdbV4Service, type UserPreferences, type TMDBv4Account } from '@/lib/tmdb-v4';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const prefs = tmdbV4Service.getUserPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    if (!preferences) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    tmdbV4Service.saveUserPreferences(updates);
  };

  const resetPreferences = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_preferences');
    }
    loadPreferences();
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    resetPreferences,
    reload: loadPreferences
  };
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [account, setAccount] = useState<TMDBv4Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      if (tmdbV4Service.isAuthenticated()) {
        setIsAuthenticated(true);
        try {
          const accountData = await tmdbV4Service.getAccount();
          setAccount(accountData);
        } catch (error) {
          console.warn('Impossible de charger les données du compte:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await tmdbV4Service.logout();
      setIsAuthenticated(false);
      setAccount(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return {
    isAuthenticated,
    account,
    isLoading,
    logout,
    refreshAuth: checkAuthStatus
  };
}
