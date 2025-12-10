"use client";

import React from "react";
import { Palette, Image, Eye, Play } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface DisplayTabProps {
  preferences: any;
  updatePreferences: (updates: any) => void;
}

/**
 * Onglet Affichage - Thème, vue par défaut, options
 */
export default function DisplayTab({
  preferences,
  updatePreferences,
}: DisplayTabProps) {
  const { setTheme: setGlobalTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thème */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-medium">
            <Palette className="h-5 w-5 mr-2" />
            Thème
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light", label: "Clair" },
              { value: "dark", label: "Sombre" },
              { value: "auto", label: "Auto" },
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => {
                  const newTheme = theme.value as "light" | "dark" | "auto";
                  updatePreferences({ theme: newTheme });
                  setGlobalTheme(newTheme === "auto" ? "system" : newTheme);
                }}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  preferences.theme === theme.value
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"
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
              { value: "grid", label: "Grille" },
              { value: "list", label: "Liste" },
            ].map((view) => (
              <button
                key={view.value}
                onClick={() =>
                  updatePreferences({
                    defaultView: view.value as "grid" | "list",
                  })
                }
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  preferences.defaultView === view.value
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"
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
          onChange={(e) =>
            updatePreferences({ itemsPerPage: parseInt(e.target.value) })
          }
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
              <p className="text-white/60 text-sm">
                Démarrer automatiquement les trailers
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              updatePreferences({ autoplay: !preferences.autoplay })
            }
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              preferences.autoplay ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                preferences.autoplay ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-yellow-400" />
            <div>
              <h5 className="text-white font-medium">Afficher les spoilers</h5>
              <p className="text-white/60 text-sm">
                Révéler les détails de l'intrigue
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              updatePreferences({ showSpoilers: !preferences.showSpoilers })
            }
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              preferences.showSpoilers ? "bg-yellow-500" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                preferences.showSpoilers ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
