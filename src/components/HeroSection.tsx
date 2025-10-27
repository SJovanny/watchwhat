"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tmdbService, getBackdropUrl } from "@/lib/tmdb";
import { Movie } from "@/types";

export default function HeroSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await tmdbService.getPopularMovies(1);
        if (!mounted) return;
        setMovies(res.results.slice(0, 8));
      } catch (err) {
        console.error("Erreur chargement films pour le hero:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-advance
  useEffect(() => {
    if (movies.length <= 1) return;
    const id = setInterval(() => {
      setIndex((s) => (s + 1) % movies.length);
    }, 6000);
    return () => clearInterval(id);
  }, [movies]);

  const goToPrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + movies.length) % movies.length);
      setIsTransitioning(false);
    }, 150);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % movies.length);
      setIsTransitioning(false);
    }, 150);
  };

  if (movies.length === 0) {
    return (
      <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center rounded-b-3xl shadow-2xl">
        <div className="text-center text-white">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            WatchWhat
          </h3>
          <p className="mt-4 text-xl text-gray-300">
            Découvrez les meilleurs films et séries
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  const movie = movies[index];
  const backdrop = getBackdropUrl(
    movie.backdrop_path || movie.poster_path,
    "w1280"
  );
  const overview = movie.overview || "";
  const shortOverview =
    overview.length > 200 ? overview.slice(0, 200) + "..." : overview;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero Background */}
      <div
        className={`h-[600px] md:h-[700px] lg:h-[800px] bg-cover bg-center relative rounded-b-3xl shadow-2xl transition-all duration-500 ease-in-out ${
          isTransitioning ? "opacity-80 scale-105" : "opacity-100 scale-100"
        }`}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.9) 100%), url('${backdrop}')`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
          aria-label="Film précédent"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
          aria-label="Film suivant"
        >
          <ChevronRight size={24} />
        </button>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 h-full flex flex-col justify-center">
          {/* Site Title and Description */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 drop-shadow-2xl animate-pulse">
              WatchWhat
            </h1>
            <p className="text-xl md:text-2xl text-gray-200/90 font-medium max-w-3xl leading-relaxed drop-shadow-lg mx-auto">
              Découvrez et explorez les meilleurs films et séries personnalisés
              selon vos goûts. Gérez vos favoris et recevez des recommandations
              intelligentes.
            </p>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index
                ? "bg-white scale-125 shadow-lg"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Aller au film ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
