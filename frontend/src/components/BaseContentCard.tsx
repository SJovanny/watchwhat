"use client";

import React from "react";
import Image from "next/image";
import { Film, Heart, Plus, Check, Play } from "lucide-react";
import { Movie, Serie } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import { formatDateToYear, formatRating, handleImageError } from "@/lib/utils";
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
 * Affiche unifiée pour les films et les séries.
 * L'affiche porte l'image ; titre et ligne mono en dessous ;
 * actions (vu, ma liste) au survol.
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
  const year = formatDateToYear(getContentDate(content));
  const posterPath = content.poster_path;
  const country =
    isSerie(content) && content.origin_country?.length ? content.origin_country[0] : null;

  const handleClick = () => onContentClick(content);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onContentClick(content);
    }
  };

  const actionBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-150 active:scale-[0.94] disabled:opacity-50";

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`${title}, ${year}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      className={`group cursor-pointer rounded-lg outline-offset-4 ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-raised ring-1 ring-line transition-[transform,box-shadow] duration-300 ease-[var(--ease-cinema)] group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_32px_rgb(0_0_0/0.35)]">
        {posterPath ? (
          <Image
            src={getImageUrl(posterPath, "w500")}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover transition-transform duration-500 ease-[var(--ease-cinema)] group-hover:scale-[1.03]"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
            {contentType === "movie" ? (
              <Film size={28} strokeWidth={1.5} className="text-ink-3" />
            ) : (
              <Play size={28} strokeWidth={1.5} className="text-ink-3" />
            )}
            <span className="font-display text-[18px] leading-tight text-ink-2">{title}</span>
          </div>
        )}

        {/* Statut */}
        {user && (isWatched || isInWatchlist) && (
          <div className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-1 text-white backdrop-blur-sm">
            {isWatched ? (
              <>
                <Check size={12} strokeWidth={2} />
                <span className="text-[11px] leading-none">Vu</span>
              </>
            ) : (
              <>
                <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-accent" />
                <span className="text-[11px] leading-none">Ma liste</span>
              </>
            )}
          </div>
        )}

        {/* Actions au survol */}
        {showActions && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-14 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <div className="flex gap-1.5">
              <button
                onClick={handleWatchlistToggle}
                disabled={loading}
                aria-label={isInWatchlist ? "Retirer de ma liste" : "Ajouter à ma liste"}
                title={isInWatchlist ? "Retirer de ma liste" : "Ajouter à ma liste"}
                className={`${actionBtn} ${
                  isInWatchlist
                    ? "border-white bg-white text-gray-950 hover:bg-white/85"
                    : "border-white/40 bg-black/30 text-white hover:border-white hover:bg-white/10"
                }`}
              >
                {isInWatchlist ? (
                  <Heart size={16} fill="currentColor" strokeWidth={0} />
                ) : (
                  <Plus size={16} strokeWidth={1.75} />
                )}
              </button>
              {!isWatched && (
                <button
                  onClick={handleMarkAsWatched}
                  disabled={loading}
                  aria-label="Marquer comme vu"
                  title="Marquer comme vu"
                  className={`${actionBtn} border-white/40 bg-black/30 text-white hover:border-white hover:bg-white/10`}
                >
                  <Check size={16} strokeWidth={1.75} />
                </button>
              )}
            </div>
            <span className="meta pb-1 text-white/90">★ {formatRating(content.vote_average)}</span>
          </div>
        )}
      </div>

      <div className="px-0.5 pt-3">
        <h3 className="line-clamp-1 text-[14px] font-medium leading-5 text-ink">{title}</h3>
        <p className="meta mt-1 flex items-center gap-1.5 text-ink-3">
          <span>{year}</span>
          <span aria-hidden>·</span>
          <span className="text-yellow-500 dark:text-yellow-400">★</span>
          <span className="-ml-1">{formatRating(content.vote_average)}</span>
          {country && (
            <>
              <span aria-hidden>·</span>
              <span>{country}</span>
            </>
          )}
        </p>
      </div>
    </article>
  );
}

// Export du type guard pour réutilisation
export { isSerie };
