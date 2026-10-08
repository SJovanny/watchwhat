"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { Movie, Serie } from "@/types";
import { UserService } from "@/lib/user-service";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";

type Kind = "serie" | "movie";
type Media = Serie | Movie;

interface UserListsContextType {
  isInWatchlist: (kind: Kind, id: number) => boolean;
  isWatched: (kind: Kind, id: number) => boolean;
  toggleWatchlist: (kind: Kind, item: Media) => Promise<void>;
  markWatched: (kind: Kind, item: Media) => Promise<void>;
  unmarkWatched: (kind: Kind, item: Media) => Promise<void>;
  isBusy: (kind: Kind, id: number) => boolean;
}

const UserListsContext = createContext<UserListsContextType | undefined>(
  undefined
);

const key = (kind: Kind, id: number) => `${kind}:${id}`;
const titleOf = (kind: Kind, item: Media) =>
  kind === "serie" ? (item as Serie).name : (item as Movie).title;

export function UserListsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const notify = useNotify();
  const pathname = usePathname();
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());

  // Une seule série de requêtes pour toutes les cartes; rechargée à chaque navigation
  // car les pages profil/favoris modifient les listes sans passer par ce contexte
  useEffect(() => {
    if (!user) {
      setWatchlist(new Set());
      setWatched(new Set());
      return;
    }
    let cancelled = false;
    UserService.getUserListIds().then((ids) => {
      if (cancelled) return;
      setWatchlist(
        new Set([
          ...ids.watchlistSeries.map((id) => key("serie", id)),
          ...ids.watchlistMovies.map((id) => key("movie", id)),
        ])
      );
      setWatched(
        new Set([
          ...ids.watchedSeries.map((id) => key("serie", id)),
          ...ids.watchedMovies.map((id) => key("movie", id)),
        ])
      );
    });
    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  const update = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    k: string,
    present: boolean
  ) =>
    setter((prev) => {
      const next = new Set(prev);
      if (present) next.add(k);
      else next.delete(k);
      return next;
    });

  const run = useCallback(
    async (kind: Kind, item: Media, action: () => Promise<void>) => {
      const k = key(kind, item.id);
      setBusy((prev) => new Set(prev).add(k));
      try {
        await action();
      } catch (error) {
        console.error("Erreur liste utilisateur:", error);
        notify.error("Erreur", "Une erreur est survenue, veuillez réessayer");
      } finally {
        setBusy((prev) => {
          const next = new Set(prev);
          next.delete(k);
          return next;
        });
      }
    },
    [notify]
  );

  const requireUser = useCallback(
    (message: string) => {
      if (user) return true;
      notify.info("Connexion requise", message);
      return false;
    },
    [user, notify]
  );

  const toggleWatchlist = useCallback(
    async (kind: Kind, item: Media) => {
      if (!requireUser("Connectez-vous pour gérer votre watchlist")) return;
      const k = key(kind, item.id);
      const title = titleOf(kind, item);
      await run(kind, item, async () => {
        const remove = watchlist.has(k);
        const success = remove
          ? kind === "serie"
            ? await UserService.removeFromWatchlist(item.id)
            : await UserService.removeMovieFromWatchlist(item.id)
          : kind === "serie"
          ? await UserService.addToWatchlist(item as Serie)
          : await UserService.addMovieToWatchlist(item);
        if (!success) {
          notify.error(
            "Erreur",
            "Impossible de mettre à jour votre watchlist"
          );
          return;
        }
        update(setWatchlist, k, !remove);
        notify.success(
          remove ? "Retiré de la watchlist" : "Ajouté à la watchlist",
          `"${title}" a été ${remove ? "retiré de" : "ajouté à"} votre watchlist`
        );
      });
    },
    [requireUser, run, watchlist, notify]
  );

  const markWatched = useCallback(
    async (kind: Kind, item: Media) => {
      if (!requireUser("Connectez-vous pour marquer comme vu")) return;
      const k = key(kind, item.id);
      const title = titleOf(kind, item);
      await run(kind, item, async () => {
        const success =
          kind === "serie"
            ? await UserService.markAsWatched(item as Serie)
            : await UserService.markMovieAsWatched(item);
        if (!success) {
          notify.error("Erreur", `Impossible de marquer "${title}" comme vu`);
          return;
        }
        update(setWatched, k, true);
        update(setWatchlist, k, false);
        notify.success("Marqué comme vu", `"${title}" a été ajouté à vos vus`, {
          label: "Voir mon profil",
          onClick: () => (window.location.href = "/profile"),
        });
      });
    },
    [requireUser, run, notify]
  );

  const unmarkWatched = useCallback(
    async (kind: Kind, item: Media) => {
      if (!requireUser("Connectez-vous pour gérer vos vus")) return;
      const k = key(kind, item.id);
      const title = titleOf(kind, item);
      await run(kind, item, async () => {
        const success =
          kind === "serie"
            ? await UserService.removeWatchedSerie(item.id)
            : await UserService.removeWatchedMovie(item.id);
        if (!success) {
          notify.error("Erreur", `Impossible de retirer "${title}" des vus`);
          return;
        }
        update(setWatched, k, false);
        notify.success("Retiré des vus", `"${title}" n'est plus marqué comme vu`);
      });
    },
    [requireUser, run, notify]
  );

  const value = useMemo<UserListsContextType>(
    () => ({
      isInWatchlist: (kind, id) => watchlist.has(key(kind, id)),
      isWatched: (kind, id) => watched.has(key(kind, id)),
      isBusy: (kind, id) => busy.has(key(kind, id)),
      toggleWatchlist,
      markWatched,
      unmarkWatched,
    }),
    [watchlist, watched, busy, toggleWatchlist, markWatched, unmarkWatched]
  );

  return (
    <UserListsContext.Provider value={value}>
      {children}
    </UserListsContext.Provider>
  );
}

export function useUserLists() {
  const context = useContext(UserListsContext);
  if (!context) {
    throw new Error("useUserLists must be used within a UserListsProvider");
  }
  return context;
}
