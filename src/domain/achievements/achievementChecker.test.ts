import { describe, expect, test } from 'vitest'
import { checkAchievements } from './achievementChecker'
import { CHAPTERS } from '../../data/chapters'
import type { AchievementId } from './achievementTypes'

describe('achievementChecker', () => {
  const emptyProgress = {
    skillProgress: {} as Record<string, { status: string; stars: number }>,
    achievements: [] as AchievementId[],
  }
  const emptyPlayer = { level: 1, xp: 0 }
  const emptyGame = { combo: 0 }

  test('returns first-skill when any skill completed', () => {
    const results = checkAchievements(
      emptyPlayer,
      {
        skillProgress: { 'ch1-s1': { status: 'completed', stars: 2 } },
        achievements: [],
      },
      emptyGame,
      CHAPTERS
    )
    expect(results).toContain('first-skill')
  })

  test('returns complete-ch1 when all ch1 skills done', () => {
    const sp: Record<string, { status: string; stars: number }> = {}
    for (const s of CHAPTERS[0].skills) {
      sp[s.id] = { status: 'completed', stars: 3 }
    }
    const results = checkAchievements(emptyPlayer, { skillProgress: sp, achievements: [] }, emptyGame, CHAPTERS)
    expect(results).toContain('complete-ch1')
  })

  test('returns perfect-ch1 when all ch1 skills have 3 stars', () => {
    const sp: Record<string, { status: string; stars: number }> = {}
    for (const s of CHAPTERS[0].skills) {
      sp[s.id] = { status: 'completed', stars: 3 }
    }
    const results = checkAchievements(emptyPlayer, { skillProgress: sp, achievements: [] }, emptyGame, CHAPTERS)
    expect(results).toContain('perfect-ch1')
  })

  test('does not return perfect when stars < 3', () => {
    const sp: Record<string, { status: string; stars: number }> = {}
    for (const s of CHAPTERS[0].skills) {
      sp[s.id] = { status: 'completed', stars: 1 }
    }
    const results = checkAchievements(emptyPlayer, { skillProgress: sp, achievements: [] }, emptyGame, CHAPTERS)
    expect(results).not.toContain('perfect-ch1')
  })

  test('returns combo achievements from game state', () => {
    const results = checkAchievements(emptyPlayer, emptyProgress, { combo: 10 }, CHAPTERS)
    expect(results).toContain('combo-10')
  })

  test('does not return already-unlocked achievements', () => {
    const sp: Record<string, { status: string; stars: number }> = {}
    for (const s of CHAPTERS[0].skills) {
      sp[s.id] = { status: 'completed', stars: 3 }
    }
    const results = checkAchievements(
      emptyPlayer,
      { skillProgress: sp, achievements: ['complete-ch1', 'first-skill', 'perfect-ch1'] },
      emptyGame,
      CHAPTERS
    )
    expect(results).toHaveLength(0)
  })
})
