export type AccuracyLevel = 'perfect' | 'good' | 'miss'

export interface AccuracyResult {
  level: AccuracyLevel
  score: number
  comboBonus: number
}

const PERFECT_WINDOW_MS = 100
const GOOD_WINDOW_MS = 200

const BASE_SCORE_PERFECT = 100
const BASE_SCORE_GOOD = 50
const BASE_SCORE_MISS = 0

const COMBO_BONUS_MULTIPLIER = 0.1

export function judgeAccuracy(offsetMs: number): AccuracyResult {
  const absOffset = Math.abs(offsetMs)

  if (absOffset <= PERFECT_WINDOW_MS) {
    return {
      level: 'perfect',
      score: BASE_SCORE_PERFECT,
      comboBonus: 0,
    }
  }

  if (absOffset <= GOOD_WINDOW_MS) {
    return {
      level: 'good',
      score: BASE_SCORE_GOOD,
      comboBonus: 0,
    }
  }

  return {
    level: 'miss',
    score: BASE_SCORE_MISS,
    comboBonus: 0,
  }
}

export function calculateComboBonus(combo: number): number {
  return combo * COMBO_BONUS_MULTIPLIER
}

export function calculateScore(accuracy: AccuracyLevel, combo: number): number {
  let baseScore: number

  switch (accuracy) {
    case 'perfect':
      baseScore = BASE_SCORE_PERFECT
      break
    case 'good':
      baseScore = BASE_SCORE_GOOD
      break
    case 'miss':
      baseScore = BASE_SCORE_MISS
      break
  }

  const comboBonus = calculateComboBonus(combo)
  return Math.floor(baseScore * (1 + comboBonus))
}
