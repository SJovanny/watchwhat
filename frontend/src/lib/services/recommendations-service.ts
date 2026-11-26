/**
 * Service de recommandations personnalisées
 * Principe SRP : collecte les titres de l'utilisateur et les candidats TMDB,
 * le classement lui-même vit dans lib/recommendations.ts
 */
import { tmdbService } from "../tmdb";
import {
  contentKey,
  rankRecommendations,
  seedWeight,
  type Recommendable,
  type Seed,
  type SeedCandidates,
} from "../recommendations";
import { WatchHistoryService } from "./watch-history-service";
import { WatchlistService } from "./watchlist-service";

/** Nombre de titres vus / de la liste pris comme points de départ (= appels TMDB) */
const MAX_WATCHED_SEEDS = 8;
const MAX_WATCHLIST_SEEDS = 4;

export interface PersonalRecommendations {
  /** "history" : d'après vos titres ; "genres" : d'après vos genres favoris, faute d'historique */
  basis: "history" | "genres";
  items: Recommendable[];
  /** Titres de l'utilisateur les plus influents, pour expliquer la rangée */
  becauseOf: string[];
}

interface TasteFilters {
  favoriteGenres: number[];
  dislikedGenres: number[];
  minRating: number;
}

interface UserTitle {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  date: string;
}

export class RecommendationsService {
  static async getForCurrentUser(
    filters: TasteFilters,
    limit = 20
  ): Promise<PersonalRecommendations | null> {
    const [watchedSeries, watchedMovies, listSeries, listMovies] = await Promise.all([
      WatchHistoryService.getWatchedSeries(),
      WatchHistoryService.getWatchedMovies(),
      WatchlistService.getSeries(),
      WatchlistService.getMovies(),
    ]);

    const watched = byMostRecent([
      ...watchedSeries.map((s) => ({ id: s.serieId, mediaType: "tv" as const, title: s.serieName, date: s.watchedAt })),
      ...watchedMovies.map((m) => ({ id: m.movieId, mediaType: "movie" as const, title: m.movieName, date: m.watchedAt })),
    ]);
    const watchlist = byMostRecent([
      ...listSeries.map((s) => ({ id: s.serieId, mediaType: "tv" as const, title: s.serieName, date: s.addedAt })),
      ...listMovies.map((m) => ({ id: m.movieId, mediaType: "movie" as const, title: m.movieName, date: m.addedAt })),
    ]);

    // Déjà vu ou déjà prévu : inutile de le suggérer
    const excludeKeys = new Set(
      [...watched, ...watchlist].map((t) => contentKey(t.mediaType, t.id))
    );

    const seeds: Seed[] = [
      ...watched.slice(0, MAX_WATCHED_SEEDS).map((t, i) => toSeed(t, seedWeight(i, "watched"))),
      ...watchlist.slice(0, MAX_WATCHLIST_SEEDS).map((t, i) => toSeed(t, seedWeight(i, "watchlist"))),
    ];

    if (seeds.length === 0) {
      return this.fromFavoriteGenres(filters, excludeKeys, limit);
    }

    const candidates = await fetchCandidates(seeds);
    const ranked = rankRecommendations(candidates, { ...filters, excludeKeys, limit });
    if (ranked.length === 0) return null;

    return {
      basis: "history",
      items: ranked.map((r) => r.item),
      becauseOf: mostInfluential(ranked.map((r) => r.becauseOf), 3),
    };
  }

  /** Sans historique ni liste : les titres populaires et bien notés de vos genres favoris */
  private static async fromFavoriteGenres(
    filters: TasteFilters,
    excludeKeys: Set<string>,
    limit: number
  ): Promise<PersonalRecommendations | null> {
    if (filters.favoriteGenres.length === 0) return null;

    const query = {
      with_genres: filters.favoriteGenres.join("|"),
      without_genres: filters.dislikedGenres.length > 0 ? filters.dislikedGenres.join(",") : undefined,
      vote_average_gte: filters.minRating > 0 ? filters.minRating : undefined,
      vote_count_gte: 200,
    };
    const [movies, series] = await Promise.allSettled([
      tmdbService.discoverMovies(query),
      tmdbService.discoverSeriesAdvanced(query),
    ]);

    const moviesList = movies.status === "fulfilled" ? movies.value.results : [];
    const seriesList = series.status === "fulfilled" ? series.value.results : [];
    const items = interleave<Recommendable>(
      moviesList.map((m) => ({ ...m, media_type: "movie" as const })),
      seriesList.map((s) => ({ ...s, media_type: "tv" as const }))
    )
      .filter((item) => item.poster_path && !excludeKeys.has(contentKey(item.media_type, item.id)))
      .slice(0, limit);

    return items.length > 0 ? { basis: "genres", items, becauseOf: [] } : null;
  }
}

function byMostRecent(titles: UserTitle[]): UserTitle[] {
  return [...titles].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

function toSeed(title: UserTitle, weight: number): Seed {
  return { id: title.id, mediaType: title.mediaType, title: title.title, weight };
}

/** Une requête TMDB par titre de départ ; un échec isolé n'empêche pas les autres */
async function fetchCandidates(seeds: Seed[]): Promise<SeedCandidates[]> {
  const responses = await Promise.allSettled(
    seeds.map((seed) =>
      seed.mediaType === "movie"
        ? tmdbService.getMovieRecommendations(seed.id)
        : tmdbService.getRecommendations(seed.id)
    )
  );

  return responses.flatMap((response, i) => {
    if (response.status === "rejected") {
      console.warn(`[Recommendations] TMDB indisponible pour « ${seeds[i].title} »`, response.reason);
      return [];
    }
    return [{ seed: seeds[i], results: response.value.results as Recommendable[] }];
  });
}

/** Les titres de départ cités le plus souvent en tête des suggestions retenues */
function mostInfluential(reasons: string[][], count: number): string[] {
  const tally = new Map<string, number>();
  for (const titles of reasons) {
    const top = titles[0];
    if (top) tally.set(top, (tally.get(top) ?? 0) + 1);
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(([title]) => title);
}

function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}
