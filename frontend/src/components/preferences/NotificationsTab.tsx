"use client";

import React from "react";
import { Calendar, Star, Heart } from "lucide-react";

interface NotificationsTabProps {
  preferences: any;
  updatePreferences: (updates: any) => void;
}

/**
 * Onglet Notifications - Paramètres de notifications
 */
export default function NotificationsTab({
  preferences,
  updatePreferences,
}: NotificationsTabProps) {
  const toggleNotification = (key: string) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key],
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h5 className="text-white font-medium">Nouvelles sorties</h5>
            <p className="text-white/60 text-sm">
              Films et séries récemment ajoutés
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleNotification("newReleases")}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            preferences.notifications.newReleases ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              preferences.notifications.newReleases
                ? "translate-x-7"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Star className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h5 className="text-white font-medium">Recommandations</h5>
            <p className="text-white/60 text-sm">
              Contenu personnalisé basé sur vos goûts
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleNotification("recommendations")}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            preferences.notifications.recommendations
              ? "bg-purple-500"
              : "bg-gray-600"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              preferences.notifications.recommendations
                ? "translate-x-7"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Heart className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h5 className="text-white font-medium">Mises à jour Watchlist</h5>
            <p className="text-white/60 text-sm">
              Changements dans votre liste de suivi
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleNotification("watchlistUpdates")}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            preferences.notifications.watchlistUpdates
              ? "bg-green-500"
              : "bg-gray-600"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              preferences.notifications.watchlistUpdates
                ? "translate-x-7"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
