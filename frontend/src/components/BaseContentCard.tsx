"use client";

import React from "react";
import Image from "next/image";
import { Star, Calendar, Film, Heart, Plus, Check, Play } from "lucide-react";
import { Movie, Serie } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import {
  formatDateToYear,
  formatRating,
  getRatingColor,
  handleImageError,
} from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import {
  useContentActions,
  ContentType,
  getContentTitle,
  getContentDate,
} from "@/hooks/useContentActions";

interface BaseContentCardProps {
  content: Movie | Serie;
  contentType: ContentType;
  onContentClick: (content: Movie | Serie) => void;
  showActions?: boolean;
  className?: string;
}

// Type guard pour Serie
function isSerie(content: Movie | Serie): content is Serie {
  return "name" in content;
}

/**
 * Composant de base unifié pour afficher les films et les séries.
 * Ce composant contient toute la logique partagée entre MovieCard et SerieCard.
 */
export default function BaseContentCard({
  content,
  contentType,
  onContentClick,
  showActions = true,
  className = "",
}: BaseContentCardProps) {
  const { user } = useAuth();
  const {
    isInWatchlist,
    isWatched,
    loading,
    handleWatchlistToggle,
    handleMarkAsWatched,
  } = useContentActions(content, contentType);

  const title = getContentTitle(content);
  const date = getContentDate(content);
  const posterPath = content.poster_path;

  const handleClick = () => {
    onContentClick(content);
  };

  return (
    <div
      className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {posterPath ? (
          <Image
            src={getImageUrl(posterPath, "w300")}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {contentType === "movie" ? (
              <Film size={32} className="text-gray-400" />
            ) : (
              <Play size={32} className="text-gray-400" />
            )}
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
            className={getRatingColor(content.vote_average)}
            fill="currentColor"
          />
          <span className="text-white text-xs font-bold">
            {formatRating(content.vote_average)}
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
          {title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={10} />
            <span>{formatDateToYear(date)}</span>
          </div>

          {content.vote_count > 0 && (
            <span className="text-xs">{content.vote_count} votes</span>
          )}
        </div>

        {/* Overview preview */}
        {content.overview && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {content.overview}
          </p>
        )}

        {/* Extra info for series: Country badges */}
        {isSerie(content) &&
          content.origin_country &&
          content.origin_country.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {content.origin_country.slice(0, 2).map((country) => (
                <span
                  key={country}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full"
                >
                  {country}
                </span>
              ))}
            </div>
          )}

        {/* Actions pour utilisateurs non connectés */}
        {showActions && !user && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Connectez-vous pour gérer vos{" "}
              {contentType === "movie" ? "films" : "séries"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export du type guard pour réutilisation
export { isSerie };
