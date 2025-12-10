"use client";

import React from "react";
import { Languages, Globe, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GeneralTabProps {
  preferences: any;
  updatePreferences: (updates: any) => void;
}

/**
 * Onglet Général - Langue, région et contenu adulte
 */
export default function GeneralTab({
  preferences,
  updatePreferences,
}: GeneralTabProps) {
  const { setLanguage } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Langue */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-medium">
            <Languages className="h-5 w-5 mr-2" />
            Langue de l'interface
          </label>
          <select
            value={preferences.language}
            onChange={(e) => {
              const newLang = e.target.value;
              updatePreferences({ language: newLang });
              setLanguage(newLang as any);
            }}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="fr-FR" className="bg-gray-800 text-white">🇫🇷 Français</option>
            <option value="en-US" className="bg-gray-800 text-white">🇺🇸 English (US)</option>
            <option value="en-GB" className="bg-gray-800 text-white">🇬🇧 English (UK)</option>
            <option value="es-ES" className="bg-gray-800 text-white">🇪🇸 Español</option>
            <option value="de-DE" className="bg-gray-800 text-white">🇩🇪 Deutsch</option>
            <option value="it-IT" className="bg-gray-800 text-white">🇮🇹 Italiano</option>
            <option value="pt-BR" className="bg-gray-800 text-white">🇧🇷 Português (BR)</option>
            <option value="ja-JP" className="bg-gray-800 text-white">🇯🇵 日本語</option>
            <option value="ko-KR" className="bg-gray-800 text-white">🇰🇷 한국어</option>
          </select>
          <p className="text-white/50 text-xs">
            Langue utilisée pour l'interface et les descriptions
          </p>
        </div>

        {/* Pays / Région */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-medium">
            <Globe className="h-5 w-5 mr-2" />
            Région du contenu
          </label>
          <select
            value={preferences.country}
            onChange={(e) => updatePreferences({ country: e.target.value })}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
          >
            <optgroup label="Europe" className="bg-gray-800 text-white">
              <option value="FR" className="bg-gray-800 text-white">🇫🇷 France</option>
              <option value="GB" className="bg-gray-800 text-white">🇬🇧 Royaume-Uni</option>
              <option value="DE" className="bg-gray-800 text-white">🇩🇪 Allemagne</option>
              <option value="ES" className="bg-gray-800 text-white">🇪🇸 Espagne</option>
              <option value="IT" className="bg-gray-800 text-white">🇮🇹 Italie</option>
              <option value="BE" className="bg-gray-800 text-white">🇧🇪 Belgique</option>
              <option value="CH" className="bg-gray-800 text-white">🇨🇭 Suisse</option>
              <option value="NL" className="bg-gray-800 text-white">🇳🇱 Pays-Bas</option>
            </optgroup>
            <optgroup label="Amérique" className="bg-gray-800 text-white">
              <option value="US" className="bg-gray-800 text-white">🇺🇸 États-Unis</option>
              <option value="CA" className="bg-gray-800 text-white">🇨🇦 Canada</option>
              <option value="MX" className="bg-gray-800 text-white">🇲🇽 Mexique</option>
              <option value="BR" className="bg-gray-800 text-white">🇧🇷 Brésil</option>
            </optgroup>
            <optgroup label="Asie & Océanie" className="bg-gray-800 text-white">
              <option value="JP" className="bg-gray-800 text-white">🇯🇵 Japon</option>
              <option value="KR" className="bg-gray-800 text-white">🇰🇷 Corée du Sud</option>
              <option value="AU" className="bg-gray-800 text-white">🇦🇺 Australie</option>
            </optgroup>
          </select>
          <p className="text-white/50 text-xs">
            Adapte les tendances, dates de sortie et disponibilités
          </p>
        </div>
      </div>

      {/* Contenu pour adultes */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-red-400" />
          <div>
            <h4 className="text-white font-medium">Contenu pour adultes</h4>
            <p className="text-white/60 text-sm">
              Inclure le contenu classé pour adultes
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            updatePreferences({ includeAdult: !preferences.includeAdult })
          }
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            preferences.includeAdult ? "bg-red-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              preferences.includeAdult ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
