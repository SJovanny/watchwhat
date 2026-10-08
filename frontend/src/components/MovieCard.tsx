"use client";

import React from "react";
import Image from "next/image";
import { Star, Calendar, Film, Heart, Plus, Check } from "lucide-react";
import { Movie } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import {
  formatDateToYear,
  formatRating,
  getRatingColor,
  handleImageError,
} from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { useUserLists } from "@/contexts/UserListsContext";

interface MovieCardProps {
  movie: Movie;
  onMovieClick: (movie: Movie) => void;
  showActions?: boolean;
  className?: string;
}

export default function MovieCard({
  movie,
  onMovieClick,
  showActions = true,
  className = "",
}: MovieCardProps) {
  const { user } = useAuth();
  const lists = useUserLists();
  const isInWatchlist = lists.isInWatchlist("movie", movie.id);
  const isWatched = lists.isWatched("movie", movie.id);
  const loading = lists.isBusy("movie", movie.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    lists.toggleWatchlist("movie", movie);
  };

  const handleMarkAsWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    lists.markWatched("movie", movie);
  };

  const handleClick = () => {
    onMovieClick(movie);
  };

  return (
    <div
      className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.poster_path ? (
          <Image
            src={getImageUrl(movie.poster_path, "w300")}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Film size={32} className="text-gray-400" />
          </div>
        )}

        {/* Overlay avec actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <div className="flex space-x-3">
              {!isWatched && (
                <button
                  onClick={handleMarkAsWatched}
                  disabled={loading}
                  className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all transform hover:scale-110 disabled:opacity-50 shadow-lg"
                  title="Marquer comme vu"
                >
                  <Check size={20} />
                </button>
              )}

              <button
                onClick={handleWatchlistToggle}
                disabled={loading}
                className={`p-3 rounded-full transition-all transform hover:scale-110 disabled:opacity-50 shadow-lg ${
                  isInWatchlist
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-800 hover:bg-gray-100"
                }`}
                title={
                  isInWatchlist
                    ? "Retirer de la watchlist"
                    : "Ajouter à la watchlist"
                }
              >
                {isInWatchlist ? (
                  <Heart size={20} fill="currentColor" />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1 z-20">
          <Star
            size={12}
            className={getRatingColor(movie.vote_average)}
            fill="currentColor"
          />
          <span className="text-white text-xs font-bold">
            {formatRating(movie.vote_average)}
          </span>
        </div>

        {/* Indicateurs de statut */}
        {user && (
          <div className="absolute top-2 left-2 flex flex-col space-y-1 z-20">
            {isWatched && (
              <div
                className="bg-green-600 text-white p-1 rounded-full"
                title="Déjà vu"
              >
                <Check size={12} />
              </div>
            )}
            {isInWatchlist && !isWatched && (
              <div
                className="bg-blue-600 text-white p-1 rounded-full"
                title="Dans la watchlist"
              >
                <Heart size={12} fill="currentColor" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={10} />
            <span>{formatDateToYear(movie.release_date)}</span>
          </div>

          {movie.vote_count > 0 && (
            <span className="text-xs">{movie.vote_count} votes</span>
          )}
        </div>

        {/* Overview preview */}
        {movie.overview && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
}
