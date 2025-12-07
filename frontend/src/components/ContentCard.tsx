"use client";

import React from "react";
import { Star, Calendar, User } from "lucide-react";
import { Movie, Serie, Person, SearchResult } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import SerieCard from "./SerieCard";
import MovieCard from "./MovieCard";

interface ContentCardProps {
  content: SearchResult;
  onContentClick?: (content: SearchResult) => void;
  className?: string;
}

export default function ContentCard({
  content,
  onContentClick,
  className = "",
}: ContentCardProps) {
  // Si c'est une série, utiliser SerieCard avec toutes les fonctionnalités
  if (content.media_type === "tv") {
    return (
      <SerieCard
        serie={content as Serie}
        onSerieClick={(serie) => onContentClick?.(serie as SearchResult)}
        className={className}
        showActions={true}
      />
    );
  }

  // Si c'est un film, utiliser MovieCard avec toutes les fonctionnalités
  if (content.media_type === "movie") {
    return (
      <MovieCard
        movie={content as Movie}
        onMovieClick={(movie) => onContentClick?.(movie as SearchResult)}
        className={className}
        showActions={true}
      />
    );
  }

  // Pour les personnes, garder l'affichage simple
  const handleClick = () => {
    onContentClick?.(content);
  };

  const getTitle = () => {
    if (content.media_type === "person") {
      return (content as Person).name;
    }
    return "Titre inconnu";
  };

  const getDate = () => {
    return null;
  };

  const getRating = () => {
    return null;
  };

  const getOverview = () => {
    return null;
  };

  const getImagePath = () => {
    if (content.media_type === "person") {
      return (content as Person).profile_path;
    }
    return null;
  };

  const getMediaTypeBadge = () => {
    const badges = {
      movie: { label: "Film", color: "bg-blue-500" },
      tv: { label: "Série", color: "bg-green-500" },
      person: { label: "Personne", color: "bg-purple-500" },
    };

    // Note: Due to early return, only 'person' is expected here, 
    // but we keep safey lookups in case of future changes.
    const badge = badges[content.media_type] || badges['person'];
    
    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear().toString();
  };

  const title = getTitle();
  const date = getDate();
  const rating = getRating();
  const overview = getOverview();
  const imagePath = getImagePath();

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[2/3] rounded-t-lg overflow-hidden">
        <img
          src={getImageUrl(imagePath)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Media type badge */}
        <div className="absolute top-2 left-2">{getMediaTypeBadge()}</div>

        {/* Rating badge pour films et séries */}

      </div>

      {/* Content info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Date pour films et séries */}


        {/* Profession pour les personnes */}
        {content.media_type === "person" && (content as Person).character && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <User size={14} className="mr-1" />
            <span className="line-clamp-1">
              {(content as Person).character}
            </span>
          </div>
        )}

        {/* Overview pour films et séries */}

      </div>
    </div>
  );
}
