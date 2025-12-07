"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fr, en, es, de } from "../i18n/translations";
import { tmdbV4Service } from "@/lib/tmdb-v4";
import { tmdbService } from "@/lib/tmdb";

type Language = "fr-FR" | "en-US" | "es-ES" | "de-DE";
type Translations = typeof fr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr-FR");
  const [t, setT] = useState<Translations>(fr);

  useEffect(() => {
    // Charger la langue depuis les préférences stockées
    const prefs = tmdbV4Service.getUserPreferences();
    if (prefs?.language) {
      setLanguageState(prefs.language as Language);
    }
  }, []);

  useEffect(() => {
    // Mettre à jour les traductions
    let newTranslations = fr;
    if (language.startsWith("en")) newTranslations = en;
    else if (language.startsWith("es")) newTranslations = es;
    else if (language.startsWith("de")) newTranslations = de;
    
    setT(newTranslations);
    
    // Mettre à jour la configuration axios de TMDB
    tmdbService.setLanguage(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Sauvegarder dans les préférences
    const prefs = tmdbV4Service.getUserPreferences();
    if (prefs) {
      tmdbV4Service.saveUserPreferences({ ...prefs, language: lang });
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
