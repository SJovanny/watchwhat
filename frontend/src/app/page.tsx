"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import SectionHeader, { Segmented } from "@/components/SectionHeader";
import AllTrendingCarousel from "@/components/AllTrendingCarousel";
import PopularTrailers from "@/components/PopularTrailers";
import PopularMovies from "@/components/PopularMovies";
import RegionalTrending from "@/components/RegionalTrending";
import LoginButton from "@/components/LoginButton";
import HeroSection from "@/components/HeroSection";
import { Serie, SearchResult } from "@/types";
import { tmdbService, getImageUrl } from "@/lib/tmdb";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";

type TimeWindow = "day" | "week";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { preferences, isLoading: isPrefsLoading } = usePreferences();
  const [trendingContent, setTrendingContent] = useState<SearchResult[]>([]);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("day");
  const [topRatedSeries, setTopRatedSeries] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    // Attendre que les préférences soient chargées avant de charger les données
    if (!isPrefsLoading) {
      loadData();
    }
  }, [timeWindow, user, preferences, isPrefsLoading]);

  const loadData = async () => {
    try {
      // Charger les données de base - récupérer 2 pages pour avoir plus de contenu tendance
      const [trending1, trending2, topRated] = await Promise.all([
        tmdbService.getTrendingAll(timeWindow, 1),
        tmdbService.getTrendingAll(timeWindow, 2),
        tmdbService.getTopRatedSeries(),
      ]);

      // Combiner les 2 pages pour avoir ~40 contenus tendance
      let allTrending = [
        ...(trending1.results || []),
        ...(trending2.results || []),
      ];

      // Filtrer selon les préférences
      if (preferences) {
        allTrending = allTrending.filter(item => {
          // Filtrer contenu adulte (générique si la propriété existe)
          if (!preferences.includeAdult && (item as any).adult) {
            return false;
          }

          // Pour les personnes, on ne filtre pas par note/genre
          if (item.media_type === 'person') return true;

          // Cast sécurisé pour Movie/Serie qui ont vote_average et genre_ids
          const content = item as SearchResult & { vote_average: number; genre_ids: number[] };

          // Filtrer par note minimum
          if (preferences.minRating > 0 && content.vote_average < preferences.minRating) {
            return false;
          }
          
          // Filtrer par genres détestés
          if (preferences.dislikedGenres.length > 0 && content.genre_ids) {
            const hasDislikedGenre = content.genre_ids.some(id => preferences.dislikedGenres.includes(id));
            if (hasDislikedGenre) return false;
          }
          
          return true;
        });
      }

      setTrendingContent(allTrending.slice(0, 20)); // Garder les 20 premiers après filtrage
      console.log(`[DEBUG] Trending loaded: ${allTrending.length} total, showing ${Math.min(allTrending.length, 20)}`);

      // Filtrer et définir les séries les mieux notées
      let topSeries = topRated.results || [];
      if (preferences) {
        topSeries = topSeries.filter(item => {
           if (preferences.minRating > 0 && item.vote_average < preferences.minRating) return false;
           if (preferences.dislikedGenres.length > 0 && item.genre_ids) {
             if (item.genre_ids.some(id => preferences.dislikedGenres.includes(id))) return false;
           }
           return true;
        });
      }
      setTopRatedSeries(topSeries.slice(0, 12));
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      notify.error("Erreur", "Impossible de charger les séries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeWindowChange = (newTimeWindow: TimeWindow) => {
    setTimeWindow(newTimeWindow);
  };

  const handleSearchSubmit = useCallback((query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }, []);

  const handleResultSelect = useCallback((query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }, []);

  const handleSerieSelect = useCallback((serie: Serie) => {
    // Naviguer vers la page de détail de la série
    window.location.href = `/serie/${serie.id}`;
  }, []);

  const handleContentSelect = useCallback(
    (content: SearchResult) => {
      if (content.media_type === "tv") {
        // Naviguer vers la page de détail de la série
        window.location.href = `/serie/${content.id}`;
      } else if (content.media_type === "movie") {
        // Naviguer vers la page de détail du film
        window.location.href = `/movie/${content.id}`;
      } else if (content.media_type === "person") {
        // Pour les personnes, rediriger vers TMDB
        notify.info(
          "Fonctionnalité bientôt disponible",
          "Les pages de détails pour les personnes seront bientôt disponibles !",
          {
            label: "Voir sur TMDB",
            onClick: () =>
              window.open(
                `https://www.themoviedb.org/person/${content.id}`,
                "_blank"
              ),
          }
        );
      }
    },
    [notify]
  );

  const container = "mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12";

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <HeroSection />

      <div className={`${container} relative space-y-14 pt-6 sm:space-y-16`}>
        {/* Tendances */}
        <section aria-labelledby="row-trending">
          <SectionHeader
            title={<span id="row-trending">{timeWindow === "day" ? t.home.trendingToday : t.home.trendingWeek}</span>}
            meta={isLoading ? undefined : `${trendingContent.length} titres`}
            action={{ label: t.home.viewAll, href: "/trending" }}
          >
            <Segmented
              label="Période"
              value={timeWindow}
              onChange={handleTimeWindowChange}
              options={[
                { value: "day", label: t.home.today },
                { value: "week", label: t.home.thisWeek },
              ]}
            />
          </SectionHeader>

          {isLoading ? (
            <RowSkeleton />
          ) : (
            <AllTrendingCarousel content={trendingContent} onContentClick={handleContentSelect} />
          )}
        </section>

        {/* Classement des séries les mieux notées */}
        {topRatedSeries.length > 0 && (
          <section aria-labelledby="row-top">
            <SectionHeader
              title={<span id="row-top">{t.home.topRated}</span>}
              meta="Top 10 · note TMDB"
              action={{ label: t.home.viewAll, href: "/discover" }}
            />
            <RankedRow series={topRatedSeries.slice(0, 10)} onSelect={handleSerieSelect} />
          </section>
        )}

        {/* Populaire dans le pays de l'utilisateur */}
        {user && <RegionalTrending onContentClick={handleContentSelect} />}

        {/* Bandes-annonces */}
        <PopularTrailers />

        {/* Films populaires */}
        <PopularMovies />

        {/* Invitation à créer un compte */}
        {!user && (
          <section className="relative overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
              <div>
                <h2 className="font-display text-[36px] leading-[1.05] text-ink sm:text-[48px]">
                  Gardez la liste de ce que vous voulez voir
                </h2>
                <p className="mt-4 max-w-[34rem] text-[16px] leading-[1.6] text-ink-2">
                  Un compte garde votre watchlist, vos favoris et ce que vous avez déjà vu,
                  et trie les tendances selon vos genres et votre pays.
                </p>
                <div className="mt-8">
                  <LoginButton />
                </div>
              </div>
              <ul className="grid grid-cols-3 gap-3" aria-hidden>
                {topRatedSeries.slice(3, 6).map((serie) => (
                  <li
                    key={serie.id}
                    className="relative aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-line"
                  >
                    {serie.poster_path && (
                      <Image
                        src={getImageUrl(serie.poster_path, "w300")}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden sm:gap-4" aria-hidden>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="w-[140px] flex-shrink-0 sm:w-[160px] md:w-[176px] lg:w-[192px]">
          <div className="skeleton aspect-[2/3]" />
          <div className="skeleton mt-3 h-4 w-3/4" />
          <div className="skeleton mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Le classement : grands chiffres serif adossés aux affiches */
function RankedRow({ series, onSelect }: { series: Serie[]; onSelect: (s: Serie) => void }) {
  return (
    <div className="row-scroller scrollbar-hide -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <ol className="flex gap-2 sm:gap-4" style={{ width: "max-content" }}>
        {series.map((serie, i) => (
          <li key={serie.id}>
            <button
              onClick={() => onSelect(serie)}
              aria-label={`${i + 1}. ${serie.name}`}
              className="group flex items-end rounded-lg text-left"
            >
              <span
                aria-hidden
                className="font-display relative -mr-2 select-none text-[136px] leading-[0.74] tracking-[-0.04em] text-canvas [-webkit-text-stroke:2px_var(--ink-3)] [paint-order:stroke_fill] transition-[-webkit-text-stroke-color] duration-300 group-hover:[-webkit-text-stroke-color:var(--ink)] sm:-mr-3 sm:text-[176px]"
              >
                {i + 1}
              </span>
              <span className="relative block aspect-[2/3] w-[112px] overflow-hidden rounded-lg bg-raised ring-1 ring-line transition-transform duration-300 ease-[var(--ease-cinema)] group-hover:-translate-y-0.5 sm:w-[132px]">
                {serie.poster_path && (
                  <Image
                    src={getImageUrl(serie.poster_path, "w300")}
                    alt=""
                    fill
                    sizes="132px"
                    className="object-cover transition-transform duration-500 ease-[var(--ease-cinema)] group-hover:scale-[1.03]"
                  />
                )}
                <span className="meta absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-white backdrop-blur-sm">
                  ★ {serie.vote_average.toFixed(1)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
