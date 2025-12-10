"use client";

import React from "react";
import { Movie } from "@/types";
import BaseContentCard from "./BaseContentCard";

interface MovieCardProps {
  movie: Movie;
  onMovieClick: (movie: Movie) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * Composant pour afficher une carte de film.
 * Délègue le rendu à BaseContentCard pour éviter la duplication de code.
 */
export default function MovieCard({
  movie,
  onMovieClick,
  showActions = true,
  className = "",
}: MovieCardProps) {
  return (
    <BaseContentCard
      content={movie}
      contentType="movie"
      onContentClick={(content) => onMovieClick(content as Movie)}
      showActions={showActions}
      className={className}
    />
  );
}
