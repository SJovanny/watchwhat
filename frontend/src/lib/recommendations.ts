import type { Movie, Serie } from "@/types";

export type MediaType = "movie" | "tv";
export type Recommendable = Movie | Serie;

/** Un titre de l'utilisateur qui sert de point de départ aux recommandations */
export interface Seed {
  id: number;
  mediaType: MediaType;
  title: string;
  /** Poids du point de départ : un titre vu récemment pèse plus qu'un ajout ancien à la liste */
  weight: number;
}

export interface SeedCandidates {
  seed: Seed;
  /** Résultats de /recommendations de TMDB pour ce titre, dans l'ordre renvoyé */
  results: Recommendable[];
}

export interface RankingOptions {
  /** Clés `movie:123` / `tv:456` déjà vues ou déjà dans la liste : jamais proposées */
  excludeKeys: Set<string>;
  favoriteGenres: number[];
  dislikedGenres: number[];
  minRating: number;
  limit: number;
}

export interface RankedRecommendation {
  item: Recommendable;
  score: number;
  /** Titres de l'utilisateur qui ont mené à cette suggestion, du plus influent au moins influent */
  becauseOf: string[];
}

/** En dessous, la note TMDB repose sur trop peu de votes pour être fiable */
const MIN_VOTE_COUNT = 50;
/** Bonus par genre favori présent, plafonné pour ne pas écraser le signal des titres vus */
const FAVORITE_GENRE_BONUS = 0.25;
const MAX_FAVORITE_GENRES_COUNTED = 2;
/**
 * Chaque suggestion supplémentaire issue du même titre de départ voit son score
 * multiplié une fois de plus par ce facteur : sans lui, le titre le plus récent
 * remplit toute la rangée.
 */
const SAME_SOURCE_DECAY = 0.75;

/**
 * TMDB numérote différemment les genres des films et des séries.
 * Un goût pour « Science-Fiction » (878, films) vaut aussi pour « Science-Fiction & Fantastique » (10765, séries).
 */
const GENRE_EQUIVALENTS: Record<number, number[]> = {
  28: [10759], // Action → Action & Adventure
  12: [10759], // Aventure → Action & Adventure
  878: [10765], // Science-Fiction → Science-Fiction & Fantastique
  14: [10765], // Fantastique → Science-Fiction & Fantastique
  10752: [10768], // Guerre → War & Politics
  10759: [28, 12],
  10765: [878, 14],
  10768: [10752],
};

export function expandGenres(genres: number[]): number[] {
  return [...new Set(genres.flatMap((id) => [id, ...(GENRE_EQUIVALENTS[id] ?? [])]))];
}

/** Le premier résultat TMDB compte plein, le 20e (fin de la page) compte moitié */
const POSITION_FLOOR = 0.5;
const TMDB_PAGE_SIZE = 20;

export function contentKey(mediaType: MediaType, id: number): string {
  return `${mediaType}:${id}`;
}

/** Poids d'un point de départ selon son rang (0 = le plus récent) et son origine */
export function seedWeight(rank: number, origin: "watched" | "watchlist"): number {
  const base = origin === "watched" ? 1 : 0.6;
  return base * Math.pow(0.85, rank);
}

/**
 * Fusionne les recommandations TMDB de plusieurs titres en un seul classement.
 *
 * Un titre recommandé par plusieurs de vos titres cumule leurs poids, ce qui fait
 * remonter ce qui correspond à l'ensemble de vos goûts plutôt qu'à un seul titre.
 */
export function rankRecommendations(
  candidatesBySeed: SeedCandidates[],
  options: RankingOptions
): RankedRecommendation[] {
  const { excludeKeys, minRating, limit } = options;
  const favoriteGenres = expandGenres(options.favoriteGenres);
  const dislikedGenres = expandGenres(options.dislikedGenres);
  const aggregated = new Map<
    string,
    { item: Recommendable; affinity: number; contributions: Map<string, number> }
  >();

  for (const { seed, results } of candidatesBySeed) {
    results.forEach((item, position) => {
      const key = contentKey(seed.mediaType, item.id);
      if (excludeKeys.has(key) || !isAcceptable(item, dislikedGenres, minRating)) return;

      const positionFactor =
        1 - (1 - POSITION_FLOOR) * (Math.min(position, TMDB_PAGE_SIZE - 1) / (TMDB_PAGE_SIZE - 1));
      const contribution = seed.weight * positionFactor;

      const entry = aggregated.get(key) ?? {
        item: { ...item, media_type: seed.mediaType } as Recommendable,
        affinity: 0,
        contributions: new Map<string, number>(),
      };
      entry.affinity += contribution;
      entry.contributions.set(seed.title, (entry.contributions.get(seed.title) ?? 0) + contribution);
      aggregated.set(key, entry);
    });
  }

  const scored = [...aggregated.values()].map(({ item, affinity, contributions }) => ({
    item,
    score: affinity * (1 + favoriteGenreBonus(item, favoriteGenres)) * qualityFactor(item),
    becauseOf: [...contributions.entries()].sort((a, b) => b[1] - a[1]).map(([title]) => title),
  }));

  return pickDiverse(scored, limit);
}

/**
 * Sélection gloutonne : à chaque tour, on prend la meilleure suggestion une fois
 * pénalisée par le nombre de suggestions déjà retenues pour son titre de départ principal.
 */
function pickDiverse(candidates: RankedRecommendation[], limit: number): RankedRecommendation[] {
  const remaining = [...candidates];
  const picked: RankedRecommendation[] = [];
  const picksPerSource = new Map<string, number>();

  while (picked.length < limit && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    remaining.forEach((candidate, index) => {
      const adjusted =
        candidate.score * Math.pow(SAME_SOURCE_DECAY, picksPerSource.get(candidate.becauseOf[0]) ?? 0);
      if (adjusted > bestScore) {
        bestScore = adjusted;
        bestIndex = index;
      }
    });

    const [best] = remaining.splice(bestIndex, 1);
    picked.push(best);
    picksPerSource.set(best.becauseOf[0], (picksPerSource.get(best.becauseOf[0]) ?? 0) + 1);
  }

  return picked;
}

function isAcceptable(item: Recommendable, dislikedGenres: number[], minRating: number): boolean {
  if (!item.poster_path) return false;
  if ((item.vote_count ?? 0) < MIN_VOTE_COUNT) return false;
  if (minRating > 0 && item.vote_average < minRating) return false;
  if ("adult" in item && item.adult) return false;
  return !(item.genre_ids ?? []).some((id) => dislikedGenres.includes(id));
}

function favoriteGenreBonus(item: Recommendable, favoriteGenres: number[]): number {
  const matches = (item.genre_ids ?? []).filter((id) => favoriteGenres.includes(id)).length;
  return Math.min(matches, MAX_FAVORITE_GENRES_COUNTED) * FAVORITE_GENRE_BONUS;
}

/** Départage léger par la note : entre 0.8 (note 0) et 1.2 (note 10) */
function qualityFactor(item: Recommendable): number {
  return 0.8 + (item.vote_average / 10) * 0.4;
}
