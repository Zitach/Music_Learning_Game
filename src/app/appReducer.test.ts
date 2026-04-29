import { describe, expect, test } from 'vitest'
import { appReducer, createInitialAppUiState } from './appReducer'

describe('appReducer', () => {
  test('moves from audio gate through opening demo to map', () => {
    let state = createInitialAppUiState(false)
    state = appReducer(state, { type: 'audioGateDismissed' })
    expect(state.screen).toBe('opening-title')
    state = appReducer(state, { type: 'startOpening' })
    expect(state.screen).toBe('opening-demo')
    state = appReducer(state, { type: 'demoDone' })
    expect(state.screen).toBe('opening-instrument')
    state = appReducer(state, { type: 'selectInstrumentDone' })
    expect(state.screen).toBe('opening-nickname')
    state = appReducer(state, { type: 'nicknameDone' })
    expect(state.screen).toBe('map')
  })

  test('shows locked chapter message without changing screen', () => {
    const initial = createInitialAppUiState(true)
    const state = appReducer(initial, { type: 'showMapMessage', message: 'locked' })
    expect(state.screen).toBe('map')
    expect(state.mapMessage).toBe('locked')
  })

  test('enters chapter and returns to map', () => {
    let state = createInitialAppUiState(true)
    state = appReducer(state, { type: 'chapterSelected', chapterId: 'ch1' })
    expect(state.screen).toBe('chapter')
    expect(state.selectedChapterId).toBe('ch1')
    state = appReducer(state, { type: 'chapterBack' })
    expect(state.screen).toBe('map')
    expect(state.selectedChapterId).toBeNull()
  })

  test('clears transition and map message', () => {
    let state = createInitialAppUiState(true)
    state = appReducer(state, { type: 'showTransition', label: '进入章节' })
    state = appReducer(state, { type: 'showMapMessage', message: '提示' })
    expect(state.transitionLabel).toBe('进入章节')
    expect(state.mapMessage).toBe('提示')
    state = appReducer(state, { type: 'clearTransition' })
    state = appReducer(state, { type: 'clearMapMessage' })
    expect(state.transitionLabel).toBeNull()
    expect(state.mapMessage).toBeNull()
  })
})
