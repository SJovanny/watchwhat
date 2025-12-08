"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Star,
  Eye,
  Download,
  Upload,
  Settings,
  Trash2,
  BarChart3,
  LogIn,
  User,
} from "lucide-react";
import { UserService } from "@/lib/user-service";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    watchlistCount: 0,
    watchedCount: 0,
    ratingsCount: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userStats = await UserService.getUserStats();
      if (userStats) {
        setStats(userStats);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [seriesWL, moviesWL, watchedSeries, watchedMovies, ratings] =
        await Promise.all([
          UserService.getWatchlist(),
          UserService.getMoviesWatchlist(),
          UserService.getWatchedSeries(),
          UserService.getWatchedMovies(),
          UserService.getUserRatings(),
        ]);

      const data = {
        exportDate: new Date().toISOString(),
        watchlistSeries: seriesWL,
        watchlistMovies: moviesWL,
        watchedSeries: watchedSeries,
        watchedMovies: watchedMovies,
        ratings: ratings,
      };

      const jsonString = JSON.stringify(data, null, 2);
      const filename = `watchwhat-export-${new Date().toISOString().split("T")[0]}.json`;
      
      // Créer le blob avec le bon type MIME
      const blob = new Blob([jsonString], {
        type: "application/json;charset=utf-8",
      });
      
      // Créer l'URL et le lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filename);
      
      // Ajouter au DOM, cliquer, puis nettoyer
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer après un court délai
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export des données");
    }
  };

  const handleClearAllData = async () => {
    if (
      confirm(
        "⚠️ Attention ! Cette action supprimera définitivement toutes vos données (watchlist, historique). Cette action est irréversible. Voulez-vous continuer ?"
      )
    ) {
      try {
        await Promise.all([
          UserService.clearWatchlist(),
          UserService.clearAllWatchedHistory(),
        ]);
        loadUserData();
        alert("Toutes vos données ont été supprimées.");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression des données");
      }
    }
  };

  // Affichage si non connecté
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <User className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Mon Profil
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Connectez-vous pour accéder à vos statistiques et préférences
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <LogIn size={20} />
              <span>Se connecter</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Affichage du chargement
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user?.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : user?.email?.split("@")[0]}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-4">
              <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.watchlistCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">À voir</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-4">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.watchedCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Vus</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg mx-auto mb-4">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.ratingsCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Notes données</div>
          </div>
        </div>

        {/* Gestion des données */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Gestion des Données
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exporter mes données</span>
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={handleClearAllData}
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer toutes mes données</span>
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Cette action est irréversible et supprimera votre watchlist et historique.
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (window.location.href = "/discover")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Découvrir du contenu
            </button>
            <button
              onClick={() => (window.location.href = "/favorites")}
              className="bg-gray-600 dark:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Voir ma collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
