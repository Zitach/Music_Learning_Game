import { describe, it, expect } from 'vitest'
import { judgeAccuracy, calculateComboBonus, calculateScore } from '../accuracy'

describe('judgeAccuracy', () => {
  describe('perfect window', () => {
    it('returns perfect for offset 0', () => {
      const result = judgeAccuracy(0)
      expect(result.level).toBe('perfect')
      expect(result.score).toBe(100)
      expect(result.comboBonus).toBe(0)
    })

    it('returns perfect for offset 100 (boundary)', () => {
      const result = judgeAccuracy(100)
      expect(result.level).toBe('perfect')
      expect(result.score).toBe(100)
    })

    it('returns perfect for offset -100 (negative boundary)', () => {
      const result = judgeAccuracy(-100)
      expect(result.level).toBe('perfect')
      expect(result.score).toBe(100)
    })

    it('returns perfect for offset 50 (inside window)', () => {
      const result = judgeAccuracy(50)
      expect(result.level).toBe('perfect')
    })

    it('returns perfect for offset -50 (negative inside window)', () => {
      const result = judgeAccuracy(-50)
      expect(result.level).toBe('perfect')
    })
  })

  describe('good window', () => {
    it('returns good for offset 101 (just outside perfect)', () => {
      const result = judgeAccuracy(101)
      expect(result.level).toBe('good')
      expect(result.score).toBe(50)
      expect(result.comboBonus).toBe(0)
    })

    it('returns good for offset -101 (negative just outside perfect)', () => {
      const result = judgeAccuracy(-101)
      expect(result.level).toBe('good')
      expect(result.score).toBe(50)
    })

    it('returns good for offset 200 (boundary)', () => {
      const result = judgeAccuracy(200)
      expect(result.level).toBe('good')
      expect(result.score).toBe(50)
    })

    it('returns good for offset -200 (negative boundary)', () => {
      const result = judgeAccuracy(-200)
      expect(result.level).toBe('good')
      expect(result.score).toBe(50)
    })

    it('returns good for offset 150 (inside window)', () => {
      const result = judgeAccuracy(150)
      expect(result.level).toBe('good')
    })
  })

  describe('miss window', () => {
    it('returns miss for offset 201 (just outside good)', () => {
      const result = judgeAccuracy(201)
      expect(result.level).toBe('miss')
      expect(result.score).toBe(0)
      expect(result.comboBonus).toBe(0)
    })

    it('returns miss for offset -201 (negative just outside good)', () => {
      const result = judgeAccuracy(-201)
      expect(result.level).toBe('miss')
      expect(result.score).toBe(0)
    })

    it('returns miss for large offset', () => {
      const result = judgeAccuracy(1000)
      expect(result.level).toBe('miss')
      expect(result.score).toBe(0)
    })
  })
})

describe('calculateComboBonus', () => {
  it('returns 0 for combo 0', () => {
    expect(calculateComboBonus(0)).toBe(0)
  })

  it('returns 0.1 for combo 1', () => {
    expect(calculateComboBonus(1)).toBe(0.1)
  })

  it('returns 1.0 for combo 10', () => {
    expect(calculateComboBonus(10)).toBe(1)
  })
})

describe('calculateScore', () => {
  it('calculates perfect score with no combo', () => {
    expect(calculateScore('perfect', 0)).toBe(100)
  })

  it('calculates perfect score with combo', () => {
    expect(calculateScore('perfect', 10)).toBe(200)
  })

  it('calculates good score with no combo', () => {
    expect(calculateScore('good', 0)).toBe(50)
  })

  it('calculates good score with combo', () => {
    expect(calculateScore('good', 10)).toBe(100)
  })

  it('calculates miss score (always 0)', () => {
    expect(calculateScore('miss', 0)).toBe(0)
    expect(calculateScore('miss', 100)).toBe(0)
  })
})
