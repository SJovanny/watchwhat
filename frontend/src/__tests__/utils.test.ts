import { describe, it, expect } from 'vitest'
import { formatDateToYear, formatRating, getRatingColor, formatDuration, truncateText } from '@/lib/utils'

describe('Utils', () => {
  describe('formatDateToYear', () => {
    it('should extract year from date string', () => {
      expect(formatDateToYear('2024-01-15')).toBe('2024')
    })

    it('should return N/A for undefined', () => {
      expect(formatDateToYear(undefined)).toBe('N/A')
    })

    it('should return N/A for empty string', () => {
      expect(formatDateToYear('')).toBe('N/A')
    })

    it('should return N/A for null', () => {
      expect(formatDateToYear(null)).toBe('N/A')
    })
  })

  describe('formatRating', () => {
    it('should format rating with one decimal', () => {
      expect(formatRating(7.5)).toBe('7.5')
    })

    it('should handle zero rating', () => {
      expect(formatRating(0)).toBe('0.0')
    })

    it('should format whole numbers', () => {
      expect(formatRating(8)).toBe('8.0')
    })

    it('should handle null', () => {
      expect(formatRating(null)).toBe('0.0')
    })

    it('should clamp values above 10', () => {
      expect(formatRating(15)).toBe('10.0')
    })
  })

  describe('getRatingColor', () => {
    it('should return green for high ratings (8+)', () => {
      const color = getRatingColor(8)
      expect(color).toContain('green')
    })

    it('should return yellow for medium ratings (6.5-7.9)', () => {
      const color = getRatingColor(7)
      expect(color).toContain('yellow')
    })

    it('should return red for low ratings (< 6.5)', () => {
      const color = getRatingColor(5)
      expect(color).toContain('red')
    })

    it('should return gray for zero', () => {
      const color = getRatingColor(0)
      expect(color).toContain('gray')
    })
  })

  describe('formatDuration', () => {
    it('should format hours and minutes', () => {
      expect(formatDuration(125)).toBe('2h5min')
    })

    it('should handle exact hours', () => {
      expect(formatDuration(120)).toBe('2h')
    })

    it('should handle only minutes', () => {
      expect(formatDuration(45)).toBe('45min')
    })

    it('should return N/A for null', () => {
      expect(formatDuration(null)).toBe('N/A')
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is a...')
    })

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short')
    })

    it('should return empty for null', () => {
      expect(truncateText(null, 10)).toBe('')
    })
  })
})
