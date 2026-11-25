"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRight, Play, Heart, Check } from "lucide-react";
import { Movie, MovieDetails, Video, Cast, Crew } from "@/types";
import { tmdbService } from "@/lib/tmdb";
import { formatDateToYear } from "@/lib/utils";
import { UserService } from "@/lib/user-service";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";
import AllTrendingCarousel from "@/components/AllTrendingCarousel";
import SectionHeader from "@/components/SectionHeader";
import TrailerModal from "@/components/TrailerModal";
import {
  DetailHero,
  DetailNotFound,
  DetailSection,
  DetailSkeleton,
  InfoPanel,
  InfoRow,
  PersonTile,
  detailContainer,
  heroPrimary,
  heroSecondary,
  heroSecondaryOn,
} from "@/components/detail/DetailParts";

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
    return hours > 0 ? `${hours} h ${String(remainingMinutes).padStart(2, "0")}` : `${remainingMinutes} min`;
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !movie) {
    return (
      <DetailNotFound
        title="Film introuvable"
        message={error || "Ce film n'existe pas ou n'est pas disponible."}
        onBack={() => router.back()}
      />
    );
  }

  const crew = (movie.credits?.crew || [])
    .filter((person) => ["Director", "Producer", "Screenplay", "Story", "Writer"].includes(person.job))
    .slice(0, 8);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <DetailHero
        title={movie.title}
        backdropPath={movie.backdrop_path}
        posterPath={movie.poster_path}
        tagline={movie.tagline}
        rating={movie.vote_average}
        voteCount={movie.vote_count}
        meta={[
          formatDateToYear(movie.release_date),
          movie.runtime ? formatRuntime(movie.runtime) : null,
          movie.original_language?.toUpperCase(),
        ]}
        genres={movie.genres}
        onBack={() => router.back()}
        actions={
          <>
            {mainTrailer && (
              <button onClick={() => setShowTrailer(true)} className={heroPrimary}>
                <Play size={18} fill="currentColor" strokeWidth={0} />
                Bande-annonce
              </button>
            )}
            <button
              onClick={handleFavoriteToggle}
              className={isFavorite ? heroSecondaryOn : heroSecondary}
            >
              <Heart size={18} strokeWidth={1.75} fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? "Dans mes favoris" : "Ajouter aux favoris"}
            </button>
            {user && (
              <button
                onClick={handleMarkAsWatched}
                disabled={loading}
                className={heroSecondary}
              >
                <Check size={18} strokeWidth={1.75} />
                {isWatched ? "Déjà vu" : "Marquer comme vu"}
              </button>
            )}
          </>
        }
      />

      <div className={`${detailContainer} grid gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16`}>
        <div className="min-w-0 space-y-14">
          <DetailSection title="Synopsis">
            <p className="max-w-[68ch] text-[17px] leading-[1.7] text-ink-2">
              {movie.overview || "Aucun synopsis disponible."}
            </p>
          </DetailSection>

          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <DetailSection title="Distribution">
              <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                {movie.credits.cast.slice(0, 9).map((actor: Cast) => (
                  <li key={actor.id}>
                    <PersonTile name={actor.name} role={actor.character} profilePath={actor.profile_path} />
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {crew.length > 0 && (
            <DetailSection title="Équipe technique">
              <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                {crew.map((person: Crew) => (
                  <li key={`${person.id}-${person.job}`}>
                    <PersonTile name={person.name} role={person.job} profilePath={person.profile_path} />
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
        </div>

        <aside className="space-y-6">
          <InfoPanel title="Informations">
            {movie.status && <InfoRow label="Statut">{movie.status}</InfoRow>}
            {movie.release_date && (
              <InfoRow label="Sortie">
                {new Date(movie.release_date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </InfoRow>
            )}
            {movie.runtime > 0 && <InfoRow label="Durée">{formatRuntime(movie.runtime)}</InfoRow>}
            {movie.spoken_languages && movie.spoken_languages.length > 0 && (
              <InfoRow label="Langues">
                {movie.spoken_languages.map((lang) => lang.english_name).join(", ")}
              </InfoRow>
            )}
            {movie.production_countries && movie.production_countries.length > 0 && (
              <InfoRow label="Pays">
                {movie.production_countries.map((country) => country.name).join(", ")}
              </InfoRow>
            )}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <InfoRow label="Production">
                {movie.production_companies
                  .slice(0, 3)
                  .map((company) => company.name)
                  .join(", ")}
              </InfoRow>
            )}
            {movie.imdb_id && (
              <InfoRow label="IMDb">
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  Voir la fiche
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </a>
              </InfoRow>
            )}
          </InfoPanel>

          {(movie.budget > 0 || movie.revenue > 0) && (
            <InfoPanel title="Box-office">
              {movie.budget > 0 && (
                <InfoRow label="Budget">
                  <span className="font-mono tabular-nums">{formatCurrency(movie.budget)}</span>
                </InfoRow>
              )}
              {movie.revenue > 0 && (
                <InfoRow label="Recettes">
                  <span className="font-mono tabular-nums">{formatCurrency(movie.revenue)}</span>
                </InfoRow>
              )}
              {movie.budget > 0 && movie.revenue > 0 && (
                <InfoRow label="Bénéfice">
                  <span
                    className={`font-mono tabular-nums ${
                      movie.revenue > movie.budget
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(movie.revenue - movie.budget)}
                  </span>
                </InfoRow>
              )}
            </InfoPanel>
          )}

          {videos.length > 1 && (
            <div className="rounded-xl border border-line bg-surface p-3">
              <h3 className="px-3 pb-2 pt-3 text-[14px] font-medium text-ink">Autres vidéos</h3>
              <ul>
                {videos.slice(0, 5).map((video) => (
                  <li key={video.id}>
                    <button
                      onClick={() => {
                        setMainTrailer(video);
                        setShowTrailer(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-raised"
                    >
                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-raised text-ink-2">
                        <Play size={14} fill="currentColor" strokeWidth={0} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] text-ink">{video.name}</span>
                        <span className="meta block text-ink-3">{video.type}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {similarMovies.length > 0 && (
        <section className={`${detailContainer} mt-16`}>
          <SectionHeader title="Dans la même veine" meta={`${similarMovies.length} films`} />
          <AllTrendingCarousel
            content={similarMovies.map((m) => ({ ...m, media_type: "movie" as const }))}
            onContentClick={(item) => handleMovieSelect(item as unknown as Movie)}
          />
        </section>
      )}

      {showTrailer && mainTrailer && mainTrailer.site === "YouTube" && (
        <TrailerModal
          videoKey={mainTrailer.key}
          title={movie.title}
          subtitle={`${mainTrailer.type} · ${formatDateToYear(movie.release_date)}`}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
}
