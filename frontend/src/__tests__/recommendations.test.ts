import { describe, it, expect } from 'vitest'
import { rankRecommendations, seedWeight, contentKey, type Seed, type Recommendable } from '@/lib/recommendations'

function movie(id: number, overrides: Partial<Recommendable> = {}): Recommendable {
  return {
    id,
    title: `Film ${id}`,
    adult: false,
    overview: '',
    poster_path: `/p${id}.jpg`,
    backdrop_path: null,
    release_date: '2020-01-01',
    vote_average: 7,
    vote_count: 1000,
    genre_ids: [18],
    original_language: 'en',
    popularity: 10,
    video: false,
    media_type: 'movie',
    ...overrides,
  } as Recommendable
}

const seedA: Seed = { id: 1, mediaType: 'movie', title: 'Dune', weight: 1 }
const seedB: Seed = { id: 2, mediaType: 'movie', title: 'Arrival', weight: 0.85 }

const base = { excludeKeys: new Set<string>(), favoriteGenres: [], dislikedGenres: [], minRating: 0, limit: 20 }

describe('rankRecommendations', () => {
  it('fait remonter un titre recommandé par plusieurs titres vus', () => {
    const ranked = rankRecommendations(
      [
        { seed: seedA, results: [movie(10), movie(20)] },
        { seed: seedB, results: [movie(30), movie(20)] },
      ],
      base
    )
    expect(ranked[0].item.id).toBe(20)
    expect(ranked[0].becauseOf).toEqual(['Dune', 'Arrival'])
  })

  it('exclut ce qui est déjà vu ou dans la liste', () => {
    const ranked = rankRecommendations(
      [{ seed: seedA, results: [movie(10), movie(20)] }],
      { ...base, excludeKeys: new Set([contentKey('movie', 10)]) }
    )
    expect(ranked.map((r) => r.item.id)).toEqual([20])
  })

  it('ne confond pas un film et une série qui partagent le même id', () => {
    const serieSeed: Seed = { id: 3, mediaType: 'tv', title: 'Dark', weight: 1 }
    const ranked = rankRecommendations(
      [{ seed: serieSeed, results: [movie(10)] }],
      { ...base, excludeKeys: new Set([contentKey('movie', 10)]) }
    )
    expect(ranked).toHaveLength(1)
    expect(ranked[0].item.media_type).toBe('tv')
  })

  it('applique genres exclus, note minimale, votes trop rares et affiches manquantes', () => {
    const ranked = rankRecommendations(
      [{
        seed: seedA,
        results: [
          movie(10, { genre_ids: [27] }),
          movie(11, { vote_average: 5 }),
          movie(12, { vote_count: 3 }),
          movie(13, { poster_path: null }),
          movie(14, { adult: true } as Partial<Recommendable>),
          movie(15),
        ],
      }],
      { ...base, dislikedGenres: [27], minRating: 6 }
    )
    expect(ranked.map((r) => r.item.id)).toEqual([15])
  })

  it('favorise les genres favoris à affinité égale', () => {
    const ranked = rankRecommendations(
      [
        { seed: seedA, results: [movie(10, { genre_ids: [18] })] },
        { seed: { ...seedB, weight: 1 }, results: [movie(20, { genre_ids: [878] })] },
      ],
      { ...base, favoriteGenres: [878] }
    )
    expect(ranked[0].item.id).toBe(20)
  })

  it('mélange les titres de départ au lieu de laisser le plus récent remplir la rangée', () => {
    const fromA = Array.from({ length: 10 }, (_, i) => movie(100 + i))
    const fromB = Array.from({ length: 10 }, (_, i) => movie(200 + i))
    const ranked = rankRecommendations(
      [
        { seed: seedA, results: fromA },
        { seed: { ...seedB, weight: 0.7 }, results: fromB },
      ],
      { ...base, limit: 6 }
    )
    const fromSeedB = ranked.filter((r) => r.becauseOf[0] === 'Arrival').length
    expect(fromSeedB).toBeGreaterThanOrEqual(2)
    expect(ranked[0].becauseOf[0]).toBe('Dune')
  })

  it('applique un genre favori de film aux séries équivalentes', () => {
    const serieSeed: Seed = { id: 3, mediaType: 'tv', title: 'Dark', weight: 1 }
    const ranked = rankRecommendations(
      [
        { seed: serieSeed, results: [movie(10, { genre_ids: [18] }), movie(11, { genre_ids: [10765] })] },
      ],
      { ...base, favoriteGenres: [878] }
    )
    expect(ranked[0].item.id).toBe(11)
  })

  it('respecte la limite', () => {
    const results = Array.from({ length: 30 }, (_, i) => movie(100 + i))
    expect(rankRecommendations([{ seed: seedA, results }], { ...base, limit: 5 })).toHaveLength(5)
  })
})

describe('seedWeight', () => {
  it('donne plus de poids au récent et au déjà vu', () => {
    expect(seedWeight(0, 'watched')).toBe(1)
    expect(seedWeight(1, 'watched')).toBeLessThan(seedWeight(0, 'watched'))
    expect(seedWeight(0, 'watchlist')).toBeLessThan(seedWeight(0, 'watched'))
  })
})
