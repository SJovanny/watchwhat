"use client";

import React from "react";
import { User } from "lucide-react";
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

  // Personnes : portrait, nom, rôle
  const person = content as Person;
  const handleClick = () => onContentClick?.(content);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={person.name}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
      className={`group cursor-pointer rounded-lg outline-offset-4 ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-raised ring-1 ring-line transition-transform duration-300 ease-[var(--ease-cinema)] group-hover:-translate-y-0.5">
        {person.profile_path ? (
          <img
            src={getImageUrl(person.profile_path)}
            alt=""
            className="h-full w-full object-cover grayscale-[35%] transition-[transform,filter] duration-500 ease-[var(--ease-cinema)] group-hover:scale-[1.03] group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User size={28} strokeWidth={1.5} className="text-ink-3" />
          </div>
        )}
      </div>
      <div className="px-0.5 pt-3">
        <h3 className="line-clamp-1 text-[14px] font-medium leading-5 text-ink">{person.name}</h3>
        <p className="meta mt-1 line-clamp-1 text-ink-3">{person.character || "Personnalité"}</p>
      </div>
    </article>
  );
}
