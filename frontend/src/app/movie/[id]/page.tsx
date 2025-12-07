"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Play,
  Heart,
  Users,
  Globe,
  Film,
  Info,
  PlayCircle,
  DollarSign,
  Award,
  Languages,
  Check,
} from "lucide-react";
import { Movie, MovieDetails, Video, Cast, Crew } from "@/types";
import { tmdbService, getImageUrl, getBackdropUrl } from "@/lib/tmdb";
import { formatDateToYear, formatRating, getRatingColor } from "@/lib/utils";
import { UserService } from "@/lib/user-service";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";
import MovieCard from "@/components/MovieCard";

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);
  const { user } = useAuth();
  const notify = useNotify();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [mainTrailer, setMainTrailer] = useState<Video | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMovieData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [movieData, videosData, similarData] = await Promise.all([
          tmdbService.getMovieDetails(movieId),
          tmdbService.getMovieVideos(movieId),
          tmdbService.getSimilarMovies(movieId),
        ]);

        setMovie(movieData as MovieDetails);
        setVideos(videosData.results);
        setSimilarMovies(similarData.results.slice(0, 8));

        // Trouver le trailer principal
        const trailer =
          videosData.results.find(
            (video: Video) =>
              video.type === "Trailer" &&
              video.site === "YouTube" &&
              video.official
          ) ||
          videosData.results.find(
            (video: Video) =>
              video.type === "Teaser" && video.site === "YouTube"
          ) ||
          videosData.results[0];

        setMainTrailer(trailer || null);

        // Vérifier si le film est dans les favoris (localStorage)
        const favorites = JSON.parse(
          localStorage.getItem("favoriteMovies") || "[]"
        );
        setIsFavorite(favorites.some((fav: Movie) => fav.id === movieId));

        // Charger le statut du film (vu/watchlist) si l'utilisateur est connecté
        if (user) {
          const [watchedStatus, watchlistStatus] = await Promise.all([
            UserService.isMovieWatched(movieId),
            UserService.isMovieInWatchlist(movieId),
          ]);
          setIsWatched(watchedStatus);
          setIsInWatchlist(watchlistStatus);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du film:", err);
        setError("Impossible de charger les détails du film");
      } finally {
        setIsLoading(false);
      }
    };

    if (movieId) {
      loadMovieData();
    }
  }, [movieId, user]);

  const handleFavoriteToggle = () => {
    if (!movie) return;

    const favorites = JSON.parse(
      localStorage.getItem("favoriteMovies") || "[]"
    );

    if (isFavorite) {
      // Retirer des favoris
      const newFavorites = favorites.filter(
        (fav: Movie) => fav.id !== movie.id
      );
      localStorage.setItem("favoriteMovies", JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      // Ajouter aux favoris
      const newFavorites = [...favorites, movie];
      localStorage.setItem("favoriteMovies", JSON.stringify(newFavorites));
      setIsFavorite(true);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!movie || !user) {
      notify.info(
        "Connexion requise",
        "Connectez-vous pour marquer des films comme vus"
      );
      return;
    }

    setLoading(true);
    try {
      if (isWatched) {
        notify.info(
          "Déjà marqué comme vu",
          `"${movie.title}" est déjà dans vos films vus`
        );
      } else {
        const success = await UserService.markMovieAsWatched(movie);
        if (success) {
          setIsWatched(true);
          // Le trigger PostgreSQL retire automatiquement de la watchlist
          setIsInWatchlist(false);
          notify.success(
            "Marqué comme vu",
            `"${movie.title}" a été ajouté à vos films vus`,
            {
              label: "Voir mes films vus",
              onClick: () => router.push("/profile"),
            }
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors du marquage comme vu:", error);
      notify.error(
        "Erreur",
        "Une erreur est survenue lors du marquage du film"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (selectedMovie: Movie) => {
    router.push(`/movie/${selectedMovie.id}`);
  };

  const getTrailerUrl = (video: Video) => {
    if (video.site === "YouTube") {
      return `https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3&showinfo=0&controls=1`;
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Loading state avec design premium */}
        <div className="relative h-[60vh] bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Film className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">
              Chargement du film
            </h3>
            <p className="text-white/70 text-lg">
              Préparation de votre expérience cinéma...
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Skeleton cards */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Info size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Film introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Ce film n'existe pas ou n'est pas disponible."}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header avec image de fond */}
      <div className="relative">
        {/* Image de fond */}
        <div className="relative h-[60vh] overflow-hidden">
          <Image
            src={getBackdropUrl(movie.backdrop_path, "original")}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30" />
        </div>

        {/* Contenu superposé */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <div className="relative w-48 h-72 rounded-lg overflow-hidden shadow-2xl">
                    <Image
                      src={getImageUrl(movie.poster_path, "w500")}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Informations */}
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => router.back()}
                      className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {movie.title}
                    </h1>
                  </div>

                  {movie.tagline && (
                    <p className="text-lg text-gray-200 mb-4 italic">
                      "{movie.tagline}"
                    </p>
                  )}

                  {/* Métadonnées */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className={getRatingColor(movie.vote_average)}
                        fill="currentColor"
                      />
                      <span className="font-semibold">
                        {formatRating(movie.vote_average)}
                      </span>
                      <span className="text-gray-300">
                        ({movie.vote_count.toLocaleString()} votes)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{formatDateToYear(movie.release_date)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Languages size={16} />
                      <span>{movie.original_language.toUpperCase()}</span>
                    </div>

                    {movie.status && (
                      <div className="flex items-center gap-1">
                        <Award size={16} />
                        <span>{movie.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-blue-600/80 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {mainTrailer && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                      >
                        <Play size={20} />
                        Regarder la bande-annonce
                      </button>
                    )}

                    {user && (
                      <button
                        onClick={handleMarkAsWatched}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                          isWatched
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                      >
                        <Check size={20} />
                        {isWatched ? "Déjà vu" : "Marquer comme vu"}
                      </button>
                    )}

                    <button
                      onClick={handleFavoriteToggle}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isFavorite
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                      {isFavorite
                        ? "Retirer des favoris"
                        : "Ajouter aux favoris"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Synopsis
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {movie.overview || "Aucun synopsis disponible."}
              </p>
            </section>

            {/* Cast principal */}
            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Distribution
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.credits.cast.slice(0, 8).map((actor: Cast) => (
                    <div key={actor.id} className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {actor.profile_path ? (
                          <Image
                            src={getImageUrl(actor.profile_path, "w200")}
                            alt={actor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {actor.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {actor.character}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Équipe technique */}
            {movie.credits?.crew && movie.credits.crew.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Équipe technique
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.credits.crew
                    .filter((person) =>
                      [
                        "Director",
                        "Producer",
                        "Screenplay",
                        "Story",
                        "Writer",
                      ].includes(person.job)
                    )
                    .slice(0, 8)
                    .map((person: Crew) => (
                      <div
                        key={`${person.id}-${person.job}`}
                        className="text-center"
                      >
                        <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          {person.profile_path ? (
                            <Image
                              src={getImageUrl(person.profile_path, "w200")}
                              alt={person.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {person.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {person.job}
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Films similaires */}
            {similarMovies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Films similaires
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {similarMovies.map((similarMovie) => (
                    <MovieCard
                      key={similarMovie.id}
                      movie={similarMovie}
                      onMovieClick={handleMovieSelect}
                      className="hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations détaillées */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Informations
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Statut
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {movie.status}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Date de sortie
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(movie.release_date).toLocaleDateString("fr-FR")}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Durée
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {formatRuntime(movie.runtime)}
                  </dd>
                </div>

                {movie.budget > 0 && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                      Budget
                    </dt>
                    <dd className="text-gray-900 dark:text-white">
                      {formatCurrency(movie.budget)}
                    </dd>
                  </div>
                )}

                {movie.revenue > 0 && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                      Recettes
                    </dt>
                    <dd className="text-gray-900 dark:text-white">
                      {formatCurrency(movie.revenue)}
                    </dd>
                  </div>
                )}

                {movie.spoken_languages &&
                  movie.spoken_languages.length > 0 && (
                    <div>
                      <dt className="font-medium text-gray-600 dark:text-gray-400">
                        Langues
                      </dt>
                      <dd className="text-gray-900 dark:text-white">
                        {movie.spoken_languages
                          .map((lang) => lang.english_name)
                          .join(", ")}
                      </dd>
                    </div>
                  )}

                {movie.production_countries &&
                  movie.production_countries.length > 0 && (
                    <div>
                      <dt className="font-medium text-gray-600 dark:text-gray-400">
                        Pays
                      </dt>
                      <dd className="text-gray-900 dark:text-white">
                        {movie.production_countries
                          .map((country) => country.name)
                          .join(", ")}
                      </dd>
                    </div>
                  )}

                {movie.production_companies &&
                  movie.production_companies.length > 0 && (
                    <div>
                      <dt className="font-medium text-gray-600 dark:text-gray-400">
                        Production
                      </dt>
                      <dd className="text-gray-900 dark:text-white">
                        {movie.production_companies
                          .slice(0, 3)
                          .map((company) => company.name)
                          .join(", ")}
                      </dd>
                    </div>
                  )}

                {movie.imdb_id && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                      IMDB
                    </dt>
                    <dd>
                      <a
                        href={`https://www.imdb.com/title/${movie.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Voir sur IMDB
                      </a>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Autres vidéos */}
            {videos.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Autres vidéos
                </h3>
                <div className="space-y-2">
                  {videos.slice(0, 5).map((video) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        setMainTrailer(video);
                        setShowTrailer(true);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <PlayCircle
                        size={16}
                        className="text-red-600 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {video.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {video.type}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Box office */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Box Office
                </h3>
                <div className="space-y-3 text-sm">
                  {movie.budget > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Budget:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(movie.budget)}
                      </span>
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Recettes:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(movie.revenue)}
                      </span>
                    </div>
                  )}
                  {movie.budget > 0 && movie.revenue > 0 && (
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">
                        Profit:
                      </span>
                      <span
                        className={`font-semibold ${
                          movie.revenue > movie.budget
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(movie.revenue - movie.budget)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour la bande-annonce */}
      {showTrailer && mainTrailer && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl mx-auto">
            {/* Bouton de fermeture optimisé */}
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-16 right-0 group z-10"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 group-hover:border-red-500/40 transition-all duration-300">
                  <svg
                    className="h-6 w-6 text-white group-hover:text-red-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-red-500 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
            </button>

            {/* Container vidéo avec ratio 16:9 optimisé */}
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              {/* Effets de bordure subtils */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-lg opacity-50"></div>

              {/* Video iframe avec taille optimisée */}
              {getTrailerUrl(mainTrailer) && (
                <iframe
                  src={getTrailerUrl(mainTrailer)!}
                  title={`Trailer: ${movie.title}`}
                  className="relative z-10 w-full h-full rounded-xl shadow-2xl border border-white/20"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>

            {/* Info du trailer compacte */}
            <div className="mt-6 text-center">
              <h3 className="text-white text-xl font-bold mb-2">
                {movie.title}
              </h3>
              <p className="text-white/70">
                Bande-annonce officielle •{" "}
                {formatDateToYear(movie.release_date)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
