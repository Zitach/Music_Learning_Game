import { describe, expect, test, beforeEach } from 'vitest'
import { useProgressStore, buildInitialProgress } from './progressStore'

describe('progressStore', () => {
  beforeEach(() => {
    useProgressStore.setState({
      skillProgress: buildInitialProgress(),
      achievements: [],
      achievementLog: [],
    })
  })

  test('first skill of ch1 is initially available', () => {
    const state = useProgressStore.getState()
    expect(state.skillProgress['ch1-s1'].status).toBe('available')
  })

  test('later skills start locked', () => {
    const state = useProgressStore.getState()
    expect(state.skillProgress['boss-final'].status).toBe('locked')
  })

  test('unlockSkill changes locked to available', () => {
    useProgressStore.getState().unlockSkill('ch1-s2')
    expect(useProgressStore.getState().skillProgress['ch1-s2'].status).toBe('available')
  })

  test('unlockSkill does not downgrade completed', () => {
    useProgressStore.setState(s => ({
      skillProgress: { ...s.skillProgress, 'ch1-s1': { ...s.skillProgress['ch1-s1'], status: 'completed', stars: 3 } },
    }))
    useProgressStore.getState().unlockSkill('ch1-s1')
    expect(useProgressStore.getState().skillProgress['ch1-s1'].status).toBe('completed')
  })

  test('completeSkill sets status and stars', () => {
    useProgressStore.getState().completeSkill('ch1-s1', 2)
    const sp = useProgressStore.getState().skillProgress['ch1-s1']
    expect(sp.status).toBe('completed')
    expect(sp.stars).toBe(2)
  })

  test('completeSkill keeps highest stars', () => {
    useProgressStore.getState().completeSkill('ch1-s1', 3)
    useProgressStore.getState().completeSkill('ch1-s1', 1)
    expect(useProgressStore.getState().skillProgress['ch1-s1'].stars).toBe(3)
  })

  test('incrementPractice bumps count and sets lastPlayed', () => {
    useProgressStore.getState().incrementPractice('ch1-s1')
    const sp = useProgressStore.getState().skillProgress['ch1-s1']
    expect(sp.practiceCount).toBe(1)
    expect(sp.lastPlayed).toBeTruthy()
  })

  test('unlockAchievement adds new achievement', () => {
    useProgressStore.getState().unlockAchievement('first-skill')
    expect(useProgressStore.getState().achievements).toContain('first-skill')
    expect(useProgressStore.getState().achievementLog).toHaveLength(1)
  })

  test('unlockAchievement does not duplicate', () => {
    const store = useProgressStore.getState()
    store.unlockAchievement('combo-10')
    store.unlockAchievement('combo-10')
    expect(useProgressStore.getState().achievements).toEqual(['combo-10'])
    expect(useProgressStore.getState().achievementLog).toHaveLength(1)
  })

  test('reset clears progress and achievements', () => {
    useProgressStore.getState().completeSkill('ch1-s1', 3)
    useProgressStore.getState().unlockAchievement('first-skill')
    useProgressStore.getState().reset()
    const state = useProgressStore.getState()
    expect(state.skillProgress['ch1-s1'].status).toBe('available')
    expect(state.skillProgress['ch1-s1'].stars).toBe(0)
    expect(state.achievements).toEqual([])
  })
})
