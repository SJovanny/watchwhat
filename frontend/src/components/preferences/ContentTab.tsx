"use client";

import React from "react";
import { Star, Calendar, Heart, X } from "lucide-react";

interface Genre {
  id: number;
  name: string;
}

interface ContentTabProps {
  preferences: any;
  updatePreferences: (updates: any) => void;
  allGenres: Genre[];
  toggleGenre: (genreId: number, type: "favorite" | "disliked") => void;
}

/**
 * Onglet Contenu - Notes, années, genres favoris/détestés
 */
export default function ContentTab({
  preferences,
  updatePreferences,
  allGenres,
  toggleGenre,
}: ContentTabProps) {
  return (
    <div className="space-y-8">
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
              onChange={(e) =>
                updatePreferences({ minRating: parseFloat(e.target.value) })
              }
              className="w-full mt-2"
            />
            <span className="text-white text-sm">
              {preferences.minRating}/10
            </span>
          </div>
          <div>
            <label className="text-white/70 text-sm">Note maximum</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={preferences.maxRating}
              onChange={(e) =>
                updatePreferences({ maxRating: parseFloat(e.target.value) })
              }
              className="w-full mt-2"
            />
            <span className="text-white text-sm">
              {preferences.maxRating}/10
            </span>
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
              value={preferences.releaseYearFrom || ""}
              onChange={(e) =>
                updatePreferences({
                  releaseYearFrom: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
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
              value={preferences.releaseYearTo || ""}
              onChange={(e) =>
                updatePreferences({
                  releaseYearTo: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
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
              onClick={() => toggleGenre(genre.id, "favorite")}
              className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                preferences.favoriteGenres.includes(genre.id)
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"
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
              onClick={() => toggleGenre(genre.id, "disliked")}
              className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                preferences.dislikedGenres.includes(genre.id)
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                  : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
