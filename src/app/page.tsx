"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Star,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import SerieCard from "@/components/SerieCard";
import AllTrendingCarousel from "@/components/AllTrendingCarousel";
import PopularTrailers from "@/components/PopularTrailers";
import PopularMovies from "@/components/PopularMovies";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import LoginButton from "@/components/LoginButton";
import HeroSection from "@/components/HeroSection";
import { Serie, SearchResult } from "@/types";
import { tmdbService, generateRecommendations } from "@/lib/tmdb";
import { UserService } from "@/lib/user-service";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";

type TimeWindow = "day" | "week";

export default function Home() {
  const { user } = useAuth();
  const [trendingContent, setTrendingContent] = useState<SearchResult[]>([]);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("day");
  const [topRatedSeries, setTopRatedSeries] = useState<Serie[]>([]);
  const [recommendations, setRecommendations] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    loadData();
  }, [timeWindow, user]);

  const loadData = async () => {
    try {
      // Charger les données de base - récupérer 2 pages pour avoir plus de contenu tendance
      const [trending1, trending2, topRated] = await Promise.all([
        tmdbService.getTrendingAll(timeWindow, 1),
        tmdbService.getTrendingAll(timeWindow, 2),
        tmdbService.getTopRatedSeries(),
      ]);

      // Combiner les 2 pages pour avoir ~40 contenus tendance
      const allTrending = [
        ...(trending1.results || []),
        ...(trending2.results || []),
      ];
      setTrendingContent(allTrending.slice(0, 20)); // Garder les 20 premiers
      setTopRatedSeries(topRated.results.slice(0, 12));

      // Générer des recommandations si l'utilisateur est connecté
      if (user) {
        try {
          const [preferences, watchedSeries] = await Promise.all([
            UserService.getPreferences(),
            UserService.getWatchedSeries(),
          ]);

          if (
            preferences &&
            (preferences.favoriteGenres.length > 0 || watchedSeries.length > 0)
          ) {
            const recs = await generateRecommendations({
              favoriteGenres: preferences.favoriteGenres,
              favoriteActors: [], // TODO: Adapter quand on aura les données acteurs
              watchedSeries: watchedSeries.map((w) => w.serieId),
              minRating: preferences.minRating,
            });
            setRecommendations(recs);
          } else {
            // Afficher l'onboarding si pas de préférences
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des préférences:", error);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      notify.error("Erreur", "Impossible de charger les séries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeWindowChange = (newTimeWindow: TimeWindow) => {
    setTimeWindow(newTimeWindow);
  };

  const handleSearchSubmit = useCallback((query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }, []);

  const handleResultSelect = useCallback((query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }, []);

  const handleSerieSelect = useCallback((serie: Serie) => {
    // Naviguer vers la page de détail de la série
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const handleContentSelect = useCallback(
    (content: SearchResult) => {
      if (content.media_type === "tv") {
        // Naviguer vers la page de détail de la série
        window.location.href = `/serie/${content.id}`;
      } else if (content.media_type === "movie") {
        // Naviguer vers la page de détail du film
        window.location.href = `/movie/${content.id}`;
      } else if (content.media_type === "person") {
        // Pour les personnes, rediriger vers TMDB
        notify.info(
          "Fonctionnalité bientôt disponible",
          "Les pages de détails pour les personnes seront bientôt disponibles !",
          {
            label: "Voir sur TMDB",
            onClick: () =>
              window.open(
                `https://www.themoviedb.org/person/${content.id}`,
                "_blank"
              ),
          }
        );
      }
    },
    [notify]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommandations personnalisées */}
        {user && recommendations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recommandé pour vous
                </h2>
              </div>
              <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline">
                <span>Voir tout</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendations.slice(0, 12).map((serie) => (
                <SerieCard
                  key={serie.id}
                  serie={serie}
                  onSerieClick={handleSerieSelect}
                />
              ))}
            </div>
          </section>
        )}

        {/* Séries tendances avec carrousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tendances{" "}
                {timeWindow === "day" ? "d'aujourd'hui" : "de la semaine"}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({trendingContent.length} contenus)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleTimeWindowChange("day")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeWindow === "day"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => handleTimeWindowChange("week")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeWindow === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Cette semaine
              </button>
              <button
                onClick={() => (window.location.href = "/trending")}
                className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                <span>Voir tout</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>

          <AllTrendingCarousel
            content={trendingContent}
            onContentClick={handleContentSelect}
          />
        </section>

        {/* Popular Trailers Section */}
        <PopularTrailers className="mb-12" />

        {/* Films populaires */}
        <PopularMovies className="mb-12" />

        {/* Recommandations personnalisées */}
        <PersonalizedRecommendations className="mb-12" />

        {/* Mieux notées */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Les mieux notées
              </h2>
            </div>
            <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline">
              <span>Voir tout</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {topRatedSeries.map((serie) => (
              <SerieCard
                key={serie.id}
                serie={serie}
                onSerieClick={handleSerieSelect}
              />
            ))}
          </div>
        </section>

        {/* Call to action pour les nouveaux utilisateurs connectés */}
        {user && showOnboarding && (
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Personnalisez vos recommandations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configurez vos préférences pour recevoir des suggestions encore
              plus précises
            </p>
            <button
              onClick={() => (window.location.href = "/preferences")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Configurer mes préférences
            </button>
          </section>
        )}

        {/* Call to action pour les utilisateurs non connectés */}
        {!user && (
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Rejoignez WatchWhat
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez votre compte pour sauvegarder vos séries favorites, créer
              votre watchlist et recevoir des recommandations personnalisées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LoginButton />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
