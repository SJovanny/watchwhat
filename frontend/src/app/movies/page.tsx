"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Film, Search } from "lucide-react";
import { Movie } from "@/types";
import { tmdbService } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import HeroSection from "@/components/HeroSection";
import UnifiedFilterBar, { FilterState } from "@/components/UnifiedFilterBar";

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null);

  // Charger les films avec les filtres
  const loadMovies = useCallback(async (page: number = 1, filters?: FilterState) => {
    try {
      setIsLoading(true);
      
      // Construire les paramètres de l'API
      const params: Record<string, any> = {
        page,
      };

      if (filters) {
        // Tri
        if (filters.sortBy) {
          params.sort_by = filters.sortBy;
        }

        // Genres
        if (filters.genres.length > 0) {
          params.with_genres = filters.genres.join(',');
        }

        // Services de streaming
        if (filters.watchProviders.length > 0) {
          params.with_watch_providers = filters.watchProviders.join('|');
          params.watch_region = filters.watchRegion || 'FR';
        }

        // Types de monétisation
        if (filters.monetizationTypes.length > 0) {
          params.with_watch_monetization_types = filters.monetizationTypes.join('|');
        }

        // Dates de sortie
        if (filters.releaseDateFrom) {
          params.primary_release_date_gte = filters.releaseDateFrom;
        }
        if (filters.releaseDateTo) {
          params.primary_release_date_lte = filters.releaseDateTo;
        }

        // Certification
        if (filters.certification) {
          params.certification = filters.certification;
          params.certification_country = 'FR';
        }

        // Langue
        if (filters.originalLanguage) {
          params.with_original_language = filters.originalLanguage;
        }

        // Score
        if (filters.voteAverageMin > 0) {
          params.vote_average_gte = filters.voteAverageMin;
        }
        if (filters.voteAverageMax < 10) {
          params.vote_average_lte = filters.voteAverageMax;
        }

        // Nombre de votes
        if (filters.voteCountMin > 0) {
          params.vote_count_gte = filters.voteCountMin;
        }

        // Durée
        if (filters.runtimeMin > 0) {
          params.with_runtime_gte = filters.runtimeMin;
        }
        if (filters.runtimeMax < 400) {
          params.with_runtime_lte = filters.runtimeMax;
        }

        // Mots-clés
        if (filters.keywords.length > 0) {
          params.with_keywords = filters.keywords.map(k => k.id).join(',');
        }
      }

      const response = await tmdbService.discoverMovies(params);
      setMovies(response.results);
      setTotalPages(Math.min(response.total_pages, 500)); // TMDB limite à 500 pages
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les films au montage
  useEffect(() => {
    loadMovies(1);
  }, [loadMovies]);

  // Gérer les changements de filtres
  const handleFiltersChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    loadMovies(1, filters);
  }, [loadMovies]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadMovies(page, currentFilters || undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
              <div className="flex-1">
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
              <UnifiedFilterBar
                mediaType="movie"
                onFiltersChange={handleFiltersChange}
              />
            </div>
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
                ? "Essayez avec d'autres termes de recherche ou modifiez vos filtres"
                : "Les films seront bientôt disponibles"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

