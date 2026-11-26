"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import AllTrendingCarousel, { CarouselSkeleton } from "@/components/AllTrendingCarousel";
import { useAuth } from "@/components/AuthProvider";
import { usePreferences } from "@/contexts/PreferencesContext";
import { RecommendationsService, type PersonalRecommendations } from "@/lib/services";
import type { SearchResult } from "@/types";

interface ForYouRowProps {
  onContentClick?: (content: SearchResult) => void;
}

/**
 * « Pour vous » : suggestions tirées de ce que l'utilisateur a vu et mis de côté,
 * à défaut de ses genres favoris. Rien n'est affiché pour un visiteur.
 */
export default function ForYouRow({ onContentClick }: ForYouRowProps) {
  const { user } = useAuth();
  const { preferences, isLoading: isPrefsLoading } = usePreferences();

  const favoriteGenres = preferences?.favoriteGenres ?? [];
  const dislikedGenres = preferences?.dislikedGenres ?? [];
  const minRating = preferences?.minRating ?? 0;

  // La requête est identifiée par ses entrées : un résultat ne s'affiche que pour la requête qui l'a produit
  const requestKey = user
    ? [user.id, favoriteGenres.join(","), dislikedGenres.join(","), minRating].join("|")
    : null;
  const [result, setResult] = useState<{ key: string; data: PersonalRecommendations | null } | null>(null);

  useEffect(() => {
    if (!requestKey || isPrefsLoading) return;
    let cancelled = false;

    RecommendationsService.getForCurrentUser({ favoriteGenres, dislikedGenres, minRating })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((error) => {
        console.error("[ForYouRow] Suggestions indisponibles", error);
        if (!cancelled) setResult({ key: requestKey, data: null });
      });

    return () => {
      cancelled = true;
    };
    // requestKey résume favoriteGenres, dislikedGenres et minRating
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, isPrefsLoading]);

  if (!user) return null;

  const isLoading = isPrefsLoading || result?.key !== requestKey;
  const data = isLoading ? null : result?.data ?? null;

  return (
    <section aria-labelledby="row-for-you">
      <SectionHeader
        title={<span id="row-for-you">Pour vous</span>}
        meta={data ? describeBasis(data) : undefined}
      />

      {isLoading ? (
        <CarouselSkeleton />
      ) : data ? (
        <AllTrendingCarousel content={data.items} onContentClick={onContentClick} />
      ) : (
        <p className="max-w-[52ch] text-[15px] leading-[1.6] text-ink-2">
          Marquez quelques films ou séries comme vus, ou ajoutez-les à votre liste : vos
          suggestions apparaîtront ici.{" "}
          <Link
            href="/discover"
            className="text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:decoration-ink"
          >
            Parcourir les séries
          </Link>
        </p>
      )}
    </section>
  );
}

function describeBasis(data: PersonalRecommendations): string {
  if (data.basis === "genres" || data.becauseOf.length === 0) return "D'après vos genres favoris";
  const titles = data.becauseOf;
  const list =
    titles.length === 1 ? titles[0] : `${titles.slice(0, -1).join(", ")} et ${titles[titles.length - 1]}`;
  return `D'après ${list}`;
}
