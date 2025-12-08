"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart, Star, Calendar, Trash2, Film, Tv, LogIn } from "lucide-react";
import SerieCard from "@/components/SerieCard";
import MovieCard from "@/components/MovieCard";
import { Serie, Movie } from "@/types";
import { formatDateToLocal } from "@/lib/utils";
import { useNotify } from "@/components/NotificationProvider";
import { UserService } from "@/lib/user-service";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface WatchlistSerieItem {
  id: string;
  serieId: number;
  serieName: string;
  serieData: Serie;
  addedAt: string;
}

interface WatchlistMovieItem {
  id: string;
  movieId: number;
  movieName: string;
  movieData: Movie;
  addedAt: string;
}

interface WatchedSerieItem {
  id: string;
  serieId: number;
  serieName: string;
  serieData: Serie;
  watchedAt: string;
  seasonsWatched: number[];
  episodesWatched: Record<string, number[]>;
}

interface WatchedMovieItem {
  id: string;
  movieId: number;
  movieName: string;
  movieData: Movie;
  watchedAt: string;
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlistSeries, setWatchlistSeries] = useState<WatchlistSerieItem[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<WatchlistMovieItem[]>([]);
  const [watchedSeries, setWatchedSeries] = useState<WatchedSerieItem[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovieItem[]>([]);
  const [activeTab, setActiveTab] = useState<"watchlist" | "watched">("watchlist");
  const [isLoading, setIsLoading] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    if (user) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [seriesWL, moviesWL, seriesWatched, moviesWatched] = await Promise.all([
        UserService.getWatchlist(),
        UserService.getMoviesWatchlist(),
        UserService.getWatchedSeries(),
        UserService.getWatchedMovies(),
      ]);

      setWatchlistSeries(seriesWL as WatchlistSerieItem[]);
      setWatchlistMovies(moviesWL as WatchlistMovieItem[]);
      setWatchedSeries(seriesWatched as WatchedSerieItem[]);
      setWatchedMovies(moviesWatched as WatchedMovieItem[]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      notify.error("Erreur", "Impossible de charger vos données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSerieSelect = useCallback((serie: Serie) => {
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const handleMovieSelect = useCallback((movie: Movie) => {
    window.location.href = `/movie/${movie.id}`;
  }, []);

  const handleRemoveFromWatchlist = useCallback(
    async (serieId: number) => {
      const success = await UserService.removeFromWatchlist(serieId);
      if (success) {
        loadData();
        notify.info("Série retirée", "La série a été retirée de votre watchlist");
      }
    },
    [notify]
  );

  const handleRemoveMovieFromWatchlist = useCallback(
    async (movieId: number) => {
      const success = await UserService.removeMovieFromWatchlist(movieId);
      if (success) {
        loadData();
        notify.info("Film retiré", "Le film a été retiré de votre watchlist");
      }
    },
    [notify]
  );

  const handleRemoveWatchedSerie = useCallback(
    async (serieId: number) => {
      const success = await UserService.removeWatchedSerie(serieId);
      if (success) {
        loadData();
        notify.info("Série retirée", "La série a été retirée de votre historique");
      }
    },
    [notify]
  );

  const handleRemoveWatchedMovie = useCallback(
    async (movieId: number) => {
      const success = await UserService.removeWatchedMovie(movieId);
      if (success) {
        loadData();
        notify.info("Film retiré", "Le film a été retiré de votre historique");
      }
    },
    [notify]
  );

  const clearAllWatchlist = async () => {
    if (confirm("Êtes-vous sûr de vouloir vider votre watchlist ?")) {
      const success = await UserService.clearWatchlist();
      if (success) {
        loadData();
        notify.success("Watchlist vidée", "Votre watchlist a été vidée");
      }
    }
  };

  const clearAllWatched = async () => {
    if (confirm("Êtes-vous sûr de vouloir vider votre historique de visionnage ?")) {
      const success = await UserService.clearAllWatchedHistory();
      if (success) {
        loadData();
        notify.success("Historique vidé", "Votre historique a été vidé");
      }
    }
  };

  // Affichage si non connecté
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <Heart className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ma Collection
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Connectez-vous pour accéder à votre watchlist et historique de visionnage
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

  const totalWatchlist = watchlistSeries.length + watchlistMovies.length;
  const totalWatched = watchedSeries.length + watchedMovies.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ma Collection
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez votre watchlist et votre historique de visionnage
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "watchlist"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Heart size={18} fill={activeTab === "watchlist" ? "currentColor" : "none"} />
            <span>À voir ({totalWatchlist})</span>
          </button>

          <button
            onClick={() => setActiveTab("watched")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "watched"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Star size={18} />
            <span>Vues ({totalWatched})</span>
          </button>
        </div>

        {/* Contenu Watchlist */}
        {activeTab === "watchlist" && (
          <div>
            {totalWatchlist > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Votre watchlist
                  </h2>
                  <button
                    onClick={clearAllWatchlist}
                    className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Tout supprimer</span>
                  </button>
                </div>

                {/* Séries */}
                {watchlistSeries.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <Tv size={18} className="mr-2" />
                      Séries ({watchlistSeries.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {watchlistSeries.map((item) => (
                        <div key={item.id} className="relative group">
                          <SerieCard
                            serie={item.serieData}
                            onSerieClick={handleSerieSelect}
                          />
                          <button
                            onClick={() => handleRemoveFromWatchlist(item.serieId)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Retirer de la watchlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Films */}
                {watchlistMovies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <Film size={18} className="mr-2" />
                      Films ({watchlistMovies.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {watchlistMovies.map((item) => (
                        <div key={item.id} className="relative group">
                          <MovieCard
                            movie={item.movieData}
                            onMovieClick={handleMovieSelect}
                          />
                          <button
                            onClick={() => handleRemoveMovieFromWatchlist(item.movieId)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Retirer de la watchlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Votre watchlist est vide
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Ajoutez des séries et films à voir pour les retrouver ici
                </p>
                <button
                  onClick={() => (window.location.href = "/discover")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Découvrir du contenu
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contenu de l'historique */}
        {activeTab === "watched" && (
          <div>
            {totalWatched > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Contenus que vous avez vus
                  </h2>
                  <button
                    onClick={clearAllWatched}
                    className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Tout supprimer</span>
                  </button>
                </div>

                {/* Séries vues */}
                {watchedSeries.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <Tv size={18} className="mr-2" />
                      Séries ({watchedSeries.length})
                    </h3>
                    <div className="space-y-4">
                      {watchedSeries
                        .sort(
                          (a, b) =>
                            new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
                        )
                        .map((watched) => (
                          <div
                            key={watched.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
                          >
                            <img
                              src={`https://image.tmdb.org/t/p/w92${watched.serieData.poster_path}`}
                              alt={watched.serieData.name}
                              className="w-16 h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleSerieSelect(watched.serieData)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-poster.svg";
                              }}
                            />

                            <div className="flex-1">
                              <h3
                                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => handleSerieSelect(watched.serieData)}
                              >
                                {watched.serieData.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar size={14} />
                                  <span>Vue le {formatDateToLocal(watched.watchedAt)}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveWatchedSerie(watched.serieId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                              title="Retirer de l'historique"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Films vus */}
                {watchedMovies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <Film size={18} className="mr-2" />
                      Films ({watchedMovies.length})
                    </h3>
                    <div className="space-y-4">
                      {watchedMovies
                        .sort(
                          (a, b) =>
                            new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
                        )
                        .map((watched) => (
                          <div
                            key={watched.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
                          >
                            <img
                              src={`https://image.tmdb.org/t/p/w92${watched.movieData.poster_path}`}
                              alt={watched.movieData.title}
                              className="w-16 h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleMovieSelect(watched.movieData)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-poster.svg";
                              }}
                            />

                            <div className="flex-1">
                              <h3
                                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => handleMovieSelect(watched.movieData)}
                              >
                                {watched.movieData.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar size={14} />
                                  <span>Vu le {formatDateToLocal(watched.watchedAt)}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveWatchedMovie(watched.movieId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                              title="Retirer de l'historique"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun contenu vu
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Marquez des séries et films comme vus pour suivre votre progression
                </p>
                <button
                  onClick={() => (window.location.href = "/discover")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Découvrir du contenu
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
