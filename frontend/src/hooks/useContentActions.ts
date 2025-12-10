"use client";

import { useState, useEffect, useCallback } from "react";
import { Movie, Serie } from "@/types";
import { UserService } from "@/lib/user-service";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";

export type ContentType = "movie" | "serie";

export interface UseContentActionsReturn {
  isInWatchlist: boolean;
  isWatched: boolean;
  loading: boolean;
  handleWatchlistToggle: (e: React.MouseEvent) => void;
  handleMarkAsWatched: (e: React.MouseEvent) => void;
}

// Helpers pour extraire les propriétés selon le type
function getContentTitle(content: Movie | Serie): string {
  return "title" in content ? content.title : content.name;
}

function getContentDate(content: Movie | Serie): string {
  return "release_date" in content
    ? content.release_date
    : content.first_air_date;
}

export function useContentActions(
  content: Movie | Serie,
  contentType: ContentType
): UseContentActionsReturn {
  const { user } = useAuth();
  const notify = useNotify();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!user) return;

    try {
      if (contentType === "movie") {
        const [watchlistStatus, watchedStatus] = await Promise.all([
          UserService.isMovieInWatchlist(content.id),
          UserService.isMovieWatched(content.id),
        ]);
        setIsInWatchlist(watchlistStatus);
        setIsWatched(watchedStatus);
      } else {
        const [watchlistStatus, watchedStatus] = await Promise.all([
          UserService.isInWatchlist(content.id),
          UserService.isWatched(content.id),
        ]);
        setIsInWatchlist(watchlistStatus);
        setIsWatched(watchedStatus);
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du statut:`, error);
    }
  }, [user, content.id, contentType]);

  useEffect(() => {
    if (user) {
      loadStatus();
    }
  }, [user, content.id, loadStatus]);

  const handleWatchlistToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!user) {
        notify.info(
          "Connexion requise",
          "Connectez-vous pour gérer votre watchlist"
        );
        return;
      }

      setLoading(true);
      const title = getContentTitle(content);

      try {
        if (isInWatchlist) {
          const success =
            contentType === "movie"
              ? await UserService.removeMovieFromWatchlist(content.id)
              : await UserService.removeFromWatchlist(content.id);

          if (success) {
            setIsInWatchlist(false);
            notify.success(
              "Retiré de la watchlist",
              `"${title}" a été retiré de votre watchlist`
            );
          }
        } else {
          const success =
            contentType === "movie"
              ? await UserService.addMovieToWatchlist(content as Movie)
              : await UserService.addToWatchlist(content as Serie);

          if (success) {
            setIsInWatchlist(true);
            notify.success(
              "Ajouté à la watchlist",
              `"${title}" a été ajouté à votre watchlist`
            );
          }
        }
      } catch (error) {
        console.error("Erreur lors de la gestion de la watchlist:", error);
        notify.error(
          "Erreur",
          "Une erreur est survenue lors de la mise à jour de votre watchlist"
        );
      } finally {
        setLoading(false);
      }
    },
    [user, content, contentType, isInWatchlist, notify]
  );

  const handleMarkAsWatched = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!user) {
        notify.info(
          "Connexion requise",
          `Connectez-vous pour marquer des ${contentType === "movie" ? "films" : "séries"} comme vus`
        );
        return;
      }

      setLoading(true);
      const title = getContentTitle(content);
      const typeLabel = contentType === "movie" ? "films" : "séries";

      try {
        const success =
          contentType === "movie"
            ? await UserService.markMovieAsWatched(content as Movie)
            : await UserService.markAsWatched(content as Serie);

        if (success) {
          setIsWatched(true);
          setIsInWatchlist(false); // Le trigger PostgreSQL retire automatiquement de la watchlist
          notify.success(
            "Marqué comme vu",
            `"${title}" a été ajouté à vos ${typeLabel} vus`,
            {
              label: `Voir mes ${typeLabel} vus`,
              onClick: () => (window.location.href = "/profile"),
            }
          );
        }
      } catch (error) {
        console.error("Erreur lors du marquage comme vu:", error);
        notify.error(
          "Erreur",
          `Une erreur est survenue lors du marquage ${contentType === "movie" ? "du film" : "de la série"}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, content, contentType, notify]
  );

  return {
    isInWatchlist,
    isWatched,
    loading,
    handleWatchlistToggle,
    handleMarkAsWatched,
  };
}

// Export des helpers pour réutilisation
export { getContentTitle, getContentDate };
