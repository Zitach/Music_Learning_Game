import { describe, expect, test } from 'vitest'
import { CHAPTERS } from '../chapters/chapters'
import { buildInitialProgress } from '../../stores/progressStore'
import { getCompletedSkills, isChapterUnlocked, isSkillUnlocked } from './progressSelectors'

describe('progressSelectors', () => {
  test('unlocks first chapter and first skill', () => {
    const progress = buildInitialProgress()
    expect(isChapterUnlocked(CHAPTERS, progress, 'ch1')).toBe(true)
    expect(isSkillUnlocked(CHAPTERS, progress, 'ch1-s1')).toBe(true)
  })

  test('unlocks next skill and next chapter after completion', () => {
    const progress = buildInitialProgress()
    progress['ch1-s1'].status = 'completed'
    progress['ch1-s2'].status = 'completed'
    progress['ch1-s3'].status = 'completed'
    expect(isSkillUnlocked(CHAPTERS, progress, 'ch2-s1')).toBe(true)
    expect(isChapterUnlocked(CHAPTERS, progress, 'ch2')).toBe(true)
  })

  test('counts completed skills', () => {
    const progress = buildInitialProgress()
    progress['ch1-s1'].status = 'completed'
    expect(getCompletedSkills(CHAPTERS[0], progress)).toBe(1)
  })
})
