import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getContentTitle,
  getContentDate,
} from '@/hooks/useContentActions'
import { Movie, Serie } from '@/types'

describe('useContentActions helpers', () => {
  const mockMovie: Movie = {
    id: 1,
    adult: false,
    title: 'Test Movie',
    overview: 'A test movie',
    poster_path: '/test.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2024-01-15',
    vote_average: 8.5,
    vote_count: 1000,
    genre_ids: [28, 12],
    original_language: 'en',
    popularity: 100,
    video: false,
    media_type: 'movie',
  }

  const mockSerie: Serie = {
    id: 2,
    name: 'Test Series',
    overview: 'A test series',
    poster_path: '/series.jpg',
    backdrop_path: '/series-backdrop.jpg',
    first_air_date: '2023-05-20',
    vote_average: 9.0,
    vote_count: 500,
    genre_ids: [18, 10765],
    original_language: 'en',
    popularity: 200,
    origin_country: ['US'],
    media_type: 'tv',
  }

  describe('getContentTitle', () => {
    it('should return title for movies', () => {
      expect(getContentTitle(mockMovie)).toBe('Test Movie')
    })

    it('should return name for series', () => {
      expect(getContentTitle(mockSerie)).toBe('Test Series')
    })
  })

  describe('getContentDate', () => {
    it('should return release_date for movies', () => {
      expect(getContentDate(mockMovie)).toBe('2024-01-15')
    })

    it('should return first_air_date for series', () => {
      expect(getContentDate(mockSerie)).toBe('2023-05-20')
    })
  })
})
