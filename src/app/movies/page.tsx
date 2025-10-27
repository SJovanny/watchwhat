"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Film, TrendingUp, Star, Calendar, Search, Filter } from "lucide-react";
import { Movie } from "@/types";
import { tmdbService } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import HeroSection from "@/components/HeroSection";

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "popular" | "top_rated" | "now_playing" | "upcoming"
  >("popular");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadMovies();
  }, [currentPage, activeTab]);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      let response;

      switch (activeTab) {
        case "popular":
          response = await tmdbService.getPopularMovies(currentPage);
          break;
        case "top_rated":
          response = await tmdbService.getTopRatedMovies(currentPage);
          break;
        case "now_playing":
          response = await tmdbService.getNowPlayingMovies(currentPage);
          break;
        case "upcoming":
          response = await tmdbService.getUpcomingMovies(currentPage);
          break;
        default:
          response = await tmdbService.getPopularMovies(currentPage);
      }

      setMovies(response.results);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    router.push(`/movie/${movie.id}`);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await tmdbService.searchMovies(query);
      setSearchResults(results.results);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      setSearchResults([]);
    }
  };

  const handleTabChange = (
    tab: "popular" | "top_rated" | "now_playing" | "upcoming"
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "popular":
        return "Populaires";
      case "top_rated":
        return "Mieux notés";
      case "now_playing":
        return "En salles";
      case "upcoming":
        return "À venir";
      default:
        return "Populaires";
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "popular":
        return TrendingUp;
      case "top_rated":
        return Star;
      case "now_playing":
        return Film;
      case "upcoming":
        return Calendar;
      default:
        return TrendingUp;
    }
  };

  const displayedMovies = isSearching && searchQuery ? searchResults : movies;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero presentation */}
      <HeroSection />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Titre */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Film className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Films
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Découvrez les meilleurs films du moment
                </p>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="flex-1 max-w-md lg:max-w-lg">
              <SearchBar
                onResultSelect={(result) => {
                  if (result.media_type === "movie") {
                    handleMovieSelect(result as Movie);
                  }
                }}
                onSearchSubmit={handleSearch}
                placeholder="Rechercher un film..."
                className="w-full"
              />
            </div>
          </div>

          {/* Tabs de navigation */}
          <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {(
                ["popular", "top_rated", "now_playing", "upcoming"] as const
              ).map((tab) => {
                const Icon = getTabIcon(tab);
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        isActive ? "text-blue-600 dark:text-blue-400" : ""
                      }
                    />
                    <span>{getTabLabel(tab)}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Résultats de recherche */}
        {isSearching && searchQuery && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Search size={16} />
              <span>
                Résultats pour "{searchQuery}" : {searchResults.length} film
                {searchResults.length > 1 ? "s" : ""} trouvé
                {searchResults.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Grid de films */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse"
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onMovieClick={handleMovieSelect}
                />
              ))}
            </div>

            {/* Pagination (seulement pour les listes, pas pour la recherche) */}
            {!isSearching && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>

                  <div className="flex items-center space-x-1">
                    {/* Pages autour de la page actuelle */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page =
                        Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                        i;
                      if (page > totalPages) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            currentPage === page
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Film size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isSearching ? "Aucun film trouvé" : "Aucun film disponible"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isSearching
                ? "Essayez avec d'autres termes de recherche"
                : "Les films seront bientôt disponibles"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
