import type { AppAction, AppUiState } from './appState'

export function createInitialAppUiState(hasCompletedOpening: boolean): AppUiState {
  return {
    screen: hasCompletedOpening ? 'map' : 'audio-gate',
    selectedChapterId: null,
    transitionLabel: null,
    mapMessage: null,
  }
}

export function appReducer(state: AppUiState, action: AppAction): AppUiState {
  switch (action.type) {
    case 'audioGateDismissed':
      return { ...state, screen: 'opening-title' }
    case 'startOpening':
      return { ...state, screen: 'opening-instrument' }
    case 'selectInstrumentDone':
      return { ...state, screen: 'opening-nickname' }
    case 'nicknameDone':
      return { ...state, screen: 'map' }
    case 'chapterSelected':
      return { ...state, screen: 'chapter', selectedChapterId: action.chapterId, mapMessage: null }
    case 'chapterBack':
      return { ...state, screen: 'map', selectedChapterId: null }
    case 'showMapMessage':
      return { ...state, mapMessage: action.message }
    case 'clearMapMessage':
      return { ...state, mapMessage: null }
    case 'showTransition':
      return { ...state, transitionLabel: action.label }
    case 'clearTransition':
      return { ...state, transitionLabel: null }
    default:
      return state
  }
}
