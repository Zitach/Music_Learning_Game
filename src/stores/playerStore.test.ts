import { describe, expect, test, beforeEach } from 'vitest'
import { usePlayerStore } from './playerStore'

describe('playerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      nickname: '',
      instrument: null,
      lives: 5,
      maxLives: 5,
      xp: 0,
      level: 1,
      hasCompletedOpening: false,
      theme: 'dark',
      completedTutorials: [],
    })
  })

  test('setNickname updates name', () => {
    usePlayerStore.getState().setNickname('张三')
    expect(usePlayerStore.getState().nickname).toBe('张三')
  })

  test('addXP increases xp and recalculates level', () => {
    usePlayerStore.getState().addXP(150)
    const state = usePlayerStore.getState()
    expect(state.xp).toBe(150)
    expect(state.level).toBe(2) // floor(150/100) + 1 = 2
  })

  test('addXP stacks for higher levels', () => {
    usePlayerStore.getState().addXP(250)
    expect(usePlayerStore.getState().level).toBe(3) // floor(250/100) + 1 = 3
  })

  test('loseLife decrements lives', () => {
    usePlayerStore.getState().loseLife()
    expect(usePlayerStore.getState().lives).toBe(4)
  })

  test('loseLife floors at 0', () => {
    usePlayerStore.setState({ lives: 0 })
    usePlayerStore.getState().loseLife()
    expect(usePlayerStore.getState().lives).toBe(0)
  })

  test('healLife increments but caps at maxLives', () => {
    usePlayerStore.setState({ lives: 3, maxLives: 5 })
    usePlayerStore.getState().healLife()
    expect(usePlayerStore.getState().lives).toBe(4)

    usePlayerStore.setState({ lives: 5 })
    usePlayerStore.getState().healLife()
    expect(usePlayerStore.getState().lives).toBe(5)
  })

  test('setTheme toggles theme', () => {
    usePlayerStore.getState().setTheme('light')
    expect(usePlayerStore.getState().theme).toBe('light')
  })

  test('completeTutorial adds id', () => {
    usePlayerStore.getState().completeTutorial('map-first-visit')
    expect(usePlayerStore.getState().completedTutorials).toContain('map-first-visit')
  })

  test('completeTutorial does not duplicate', () => {
    usePlayerStore.getState().completeTutorial('t1')
    usePlayerStore.getState().completeTutorial('t1')
    expect(usePlayerStore.getState().completedTutorials).toEqual(['t1'])
  })

  test('completeOpening marks opening done', () => {
    usePlayerStore.getState().completeOpening()
    expect(usePlayerStore.getState().hasCompletedOpening).toBe(true)
  })
})
