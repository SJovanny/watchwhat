"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Heart, Check } from "lucide-react";
import { SerieDetails, Video, Cast } from "@/types";
import { tmdbService } from "@/lib/tmdb";
import { useFavoriteSeries } from "@/lib/storage";
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

export default function SeriePage() {
  const params = useParams();
  const router = useRouter();
  const serieId = parseInt(params.id as string);
  const { user } = useAuth();
  const notify = useNotify();

  const [serie, setSerie] = useState<SerieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similarSeries, setSimilarSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [mainTrailer, setMainTrailer] = useState<Video | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addFavoriteSerie, removeFavoriteSerie, isFavorite } =
    useFavoriteSeries();
  const isSerieInFavorites = serie ? isFavorite(serie.id) : false;

  useEffect(() => {
    const loadSerieData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [serieData, videosData, similarData] = await Promise.all([
          tmdbService.getSerieDetails(serieId),
          tmdbService.getSerieVideos(serieId),
          tmdbService.getSimilarSeries(serieId),
        ]);

        setSerie(serieData);
        setVideos(videosData.results);
        setSimilarSeries(similarData.results.slice(0, 8));

        // Trouver le trailer principal
        const trailer =
          videosData.results.find(
            (video) =>
              video.type === "Trailer" &&
              video.site === "YouTube" &&
              video.official
          ) ||
          videosData.results.find(
            (video) => video.type === "Teaser" && video.site === "YouTube"
          ) ||
          videosData.results[0];

        setMainTrailer(trailer || null);

        // Charger le statut de la série (vu/watchlist) si l'utilisateur est connecté
        if (user) {
          const [watchedStatus, watchlistStatus] = await Promise.all([
            UserService.isWatched(serieId),
            UserService.isInWatchlist(serieId),
          ]);
          setIsWatched(watchedStatus);
          setIsInWatchlist(watchlistStatus);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la série:", err);
        setError("Impossible de charger les détails de la série");
      } finally {
        setIsLoading(false);
      }
    };

    if (serieId) {
      loadSerieData();
    }
  }, [serieId, user]);

  const handleFavoriteToggle = () => {
    if (!serie) return;

    if (isSerieInFavorites) {
      removeFavoriteSerie(serie.id);
    } else {
      addFavoriteSerie(serie);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!serie || !user) {
      notify.info(
        "Connexion requise",
        "Connectez-vous pour marquer des séries comme vues"
      );
      return;
    }

    setLoading(true);
    try {
      if (isWatched) {
        // Option pour retirer de "vu" si nécessaire
        notify.info(
          "Déjà marquée comme vue",
          `"${serie.name}" est déjà dans vos séries vues`
        );
      } else {
        const success = await UserService.markAsWatched(serie);
        if (success) {
          setIsWatched(true);
          // Le trigger PostgreSQL retire automatiquement de la watchlist
          setIsInWatchlist(false);
          notify.success(
            "Marqué comme vu",
            `"${serie.name}" a été ajouté à vos séries vues`,
            {
              label: "Voir mes séries vues",
              onClick: () => router.push("/profile"),
            }
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors du marquage comme vu:", error);
      notify.error(
        "Erreur",
        "Une erreur est survenue lors du marquage de la série"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSerieSelect = (selectedSerie: any) => {
    router.push(`/serie/${selectedSerie.id}`);
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !serie) {
    return (
      <DetailNotFound
        title="Série introuvable"
        message={error || "Cette série n'existe pas ou n'est pas disponible."}
        onBack={() => router.back()}
      />
    );
  }

  const seasonsLabel = serie.number_of_seasons
    ? `${serie.number_of_seasons} saison${serie.number_of_seasons > 1 ? "s" : ""}`
    : null;
  const runtime = serie.episode_run_time?.[0];
  const longDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <DetailHero
        title={serie.name}
        backdropPath={serie.backdrop_path}
        posterPath={serie.poster_path}
        tagline={serie.tagline}
        rating={serie.vote_average}
        voteCount={serie.vote_count}
        meta={[
          formatDateToYear(serie.first_air_date),
          seasonsLabel,
          runtime ? `${runtime} min / ép.` : null,
          serie.origin_country?.join(", "),
        ]}
        genres={serie.genres}
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
              className={isSerieInFavorites ? heroSecondaryOn : heroSecondary}
            >
              <Heart size={18} strokeWidth={1.75} fill={isSerieInFavorites ? "currentColor" : "none"} />
              {isSerieInFavorites ? "Dans mes favoris" : "Ajouter aux favoris"}
            </button>
            {user && (
              <button onClick={handleMarkAsWatched} disabled={loading} className={heroSecondary}>
                <Check size={18} strokeWidth={1.75} />
                {isWatched ? "Déjà vue" : "Marquer comme vue"}
              </button>
            )}
          </>
        }
      />

      <div className={`${detailContainer} grid gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16`}>
        <div className="min-w-0 space-y-14">
          <DetailSection title="Synopsis">
            <p className="max-w-[68ch] text-[17px] leading-[1.7] text-ink-2">
              {serie.overview || "Aucun synopsis disponible."}
            </p>
          </DetailSection>

          {serie.credits?.cast && serie.credits.cast.length > 0 && (
            <DetailSection title="Distribution">
              <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                {serie.credits.cast.slice(0, 9).map((actor: Cast) => (
                  <li key={actor.id}>
                    <PersonTile name={actor.name} role={actor.character} profilePath={actor.profile_path} />
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
        </div>

        <aside className="space-y-6">
          <InfoPanel title="Informations">
            {serie.status && <InfoRow label="Statut">{serie.status}</InfoRow>}
            {serie.first_air_date && <InfoRow label="Première">{longDate(serie.first_air_date)}</InfoRow>}
            {serie.last_air_date && <InfoRow label="Dernière">{longDate(serie.last_air_date)}</InfoRow>}
            {seasonsLabel && <InfoRow label="Saisons">{seasonsLabel}</InfoRow>}
            {serie.number_of_episodes > 0 && (
              <InfoRow label="Épisodes">
                <span className="font-mono tabular-nums">{serie.number_of_episodes}</span>
              </InfoRow>
            )}
            {serie.networks && serie.networks.length > 0 && (
              <InfoRow label="Diffuseur">{serie.networks.map((network) => network.name).join(", ")}</InfoRow>
            )}
            {serie.production_companies && serie.production_companies.length > 0 && (
              <InfoRow label="Production">
                {serie.production_companies
                  .slice(0, 3)
                  .map((company) => company.name)
                  .join(", ")}
              </InfoRow>
            )}
          </InfoPanel>

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

      {similarSeries.length > 0 && (
        <section className={`${detailContainer} mt-16`}>
          <SectionHeader title="Dans la même veine" meta={`${similarSeries.length} séries`} />
          <AllTrendingCarousel
            content={similarSeries.map((s) => ({ ...s, media_type: "tv" as const }))}
            onContentClick={(item) => handleSerieSelect(item)}
          />
        </section>
      )}

      {showTrailer && mainTrailer && mainTrailer.site === "YouTube" && (
        <TrailerModal
          videoKey={mainTrailer.key}
          title={serie.name}
          subtitle={`${mainTrailer.type} · ${formatDateToYear(serie.first_air_date)}`}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
}
