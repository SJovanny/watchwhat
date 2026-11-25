"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Plus, Check, Info } from "lucide-react";
import { tmdbService, getBackdropUrl } from "@/lib/tmdb";
import { Movie } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentActions } from "@/hooks/useContentActions";
import { formatDateToYear, formatRating } from "@/lib/utils";
import TrailerModal from "./TrailerModal";

const SLIDE_MS = 7000;

function WatchlistButton({ movie }: { movie: Movie }) {
  const { isInWatchlist, loading, handleWatchlistToggle } = useContentActions(movie, "movie");
  const label = isInWatchlist ? "Retirer de ma liste" : "Ajouter à ma liste";
  return (
    <button
      onClick={handleWatchlistToggle}
      disabled={loading}
      aria-label={label}
      title={label}
      className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/25 bg-black/20 text-white backdrop-blur-sm transition-[background-color,border-color,transform] duration-150 hover:border-white/50 hover:bg-white/10 active:scale-[0.97] disabled:opacity-50"
    >
      {isInWatchlist ? <Check size={20} strokeWidth={1.75} /> : <Plus size={20} strokeWidth={1.75} />}
    </button>
  );
}

export default function HeroSection() {
  const { t } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [trailer, setTrailer] = useState<{ key: string; movie: Movie } | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await tmdbService.getPopularMovies(1);
        if (!mounted) return;
        setMovies(res.results.filter((m) => m.backdrop_path).slice(0, 6));
      } catch (err) {
        console.error("Erreur chargement films pour le hero:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (movies.length === 0) return;
      setIndex((i) => (i + delta + movies.length) % movies.length);
    },
    [movies.length]
  );

  // Avance automatique, en pause au survol, au focus et pendant la bande-annonce
  useEffect(() => {
    if (movies.length <= 1 || paused || reducedMotion || trailer) return;
    const id = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(id);
  }, [movies.length, paused, reducedMotion, trailer, index, go]);

  const openTrailer = async (movie: Movie) => {
    setTrailerLoading(true);
    try {
      const videos = await tmdbService.getMovieVideos(movie.id);
      const yt = videos.results.filter((v) => v.site === "YouTube");
      const pick =
        yt.find((v) => v.type === "Trailer" && v.official) ||
        yt.find((v) => v.type === "Trailer") ||
        yt.find((v) => v.type === "Teaser") ||
        yt[0];
      if (pick) {
        setTrailer({ key: pick.key, movie });
      } else {
        window.location.href = `/movie/${movie.id}`;
      }
    } catch (err) {
      console.error("Bande-annonce indisponible:", err);
      window.location.href = `/movie/${movie.id}`;
    } finally {
      setTrailerLoading(false);
    }
  };

  if (movies.length === 0) {
    return (
      <section
        aria-busy="true"
        className="relative -mt-16 flex h-[86svh] min-h-[560px] max-h-[920px] items-end bg-gray-950"
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 sm:px-6 lg:px-12">
          <div className="skeleton mb-4 h-4 w-40 bg-white/10!" />
          <div className="skeleton mb-6 h-16 w-[min(560px,80%)] bg-white/10!" />
          <div className="skeleton h-4 w-[min(420px,70%)] bg-white/10!" />
          <span className="sr-only">{t.hero.loading}</span>
        </div>
      </section>
    );
  }

  const movie = movies[index];
  const overview = movie.overview || t.hero.description;

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="À l’affiche"
      className="relative -mt-16 h-[86svh] min-h-[560px] max-h-[920px] overflow-hidden bg-gray-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Affiches en fondu enchaîné */}
      {movies.map((m, i) => (
        <div
          key={m.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-cinema)] ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={getBackdropUrl(m.backdrop_path, "original")}
            alt=""
            fill
            priority={i === 0}
            loading={i === 0 ? undefined : "lazy"}
            sizes="100vw"
            className="object-cover object-[center_20%]"
          />
        </div>
      ))}

      {/* Voiles neutres pour la lecture */}
      <div aria-hidden className="scrim-left absolute inset-0" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-canvas to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-20 sm:px-6 sm:pb-24 lg:px-12 lg:pb-28">
        <div key={movie.id} className="animate-rise max-w-[640px]">
          <p className="meta mb-4 flex items-center gap-2 text-white/70">
            <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-accent" />
            À l’affiche
            <span aria-hidden className="text-white/35">·</span>
            {formatDateToYear(movie.release_date)}
            <span aria-hidden className="text-white/35">·</span>
            <span className="text-yellow-400">★ {formatRating(movie.vote_average)}</span>
            <span className="text-white/50">{movie.vote_count.toLocaleString("fr-FR")} votes</span>
          </p>

          <h1 className="font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-balance sm:text-[64px] lg:text-[84px]">
            {movie.title}
          </h1>

          <p className="mt-5 line-clamp-3 max-w-[560px] text-[16px] leading-[1.6] text-white/80 sm:text-[17px]">
            {overview}
          </p>

          <div className="mt-8 grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:flex sm:gap-3">
            <button
              onClick={() => openTrailer(movie)}
              disabled={trailerLoading}
              className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3 text-[14px] font-medium text-gray-950 sm:gap-2 sm:px-6 sm:text-[15px] transition-[background-color,transform] duration-150 hover:bg-white/85 active:scale-[0.97] disabled:opacity-70"
            >
              <Play size={18} fill="currentColor" strokeWidth={0} />
              Bande-annonce
            </button>
            <Link
              href={`/movie/${movie.id}`}
              className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-white/15 px-3 text-[14px] font-medium text-white sm:gap-2 sm:px-6 sm:text-[15px] backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-white/25 active:scale-[0.97]"
            >
              <Info size={18} strokeWidth={1.75} />
              Plus d’infos
            </Link>
            <WatchlistButton movie={movie} />
          </div>
        </div>
      </div>

      {/* Contrôles : progression et navigation */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 right-4 flex items-center gap-4 sm:right-6 lg:right-12">
          <ol className="hidden items-center gap-2 sm:flex" aria-label="Choisir un film">
            {movies.map((m, i) => (
              <li key={m.id}>
                <button
                  onClick={() => setIndex(i)}
                  aria-label={`${m.title} (${i + 1} sur ${movies.length})`}
                  aria-current={i === index ? "true" : undefined}
                  className="group flex h-8 items-center"
                >
                  <span className="relative block h-[3px] w-10 overflow-hidden rounded-full bg-white/25 transition-colors duration-150 group-hover:bg-white/45">
                    {i < index && <span className="absolute inset-0 bg-white/80" />}
                    {i === index && (
                      <span
                        key={`${index}-${paused}`}
                        className="absolute inset-0 origin-left bg-white"
                        style={
                          paused || reducedMotion || trailer
                            ? undefined
                            : { animation: `progress ${SLIDE_MS}ms linear both` }
                        }
                      />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <span className="meta text-white/60 sm:hidden">
            {String(index + 1).padStart(2, "0")} / {String(movies.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => go(-1)}
              aria-label="Film précédent"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Film suivant"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {trailer && (
        <TrailerModal
          videoKey={trailer.key}
          title={trailer.movie.title}
          subtitle={`Bande-annonce · ${formatDateToYear(trailer.movie.release_date)}`}
          onClose={() => setTrailer(null)}
        />
      )}
    </section>
  );
}
