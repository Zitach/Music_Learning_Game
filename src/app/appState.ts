export type AppScreen =
  | 'audio-gate'
  | 'opening-title'
  | 'opening-instrument'
  | 'opening-nickname'
  | 'map'
  | 'chapter'

export interface AppUiState {
  screen: AppScreen
  selectedChapterId: string | null
  transitionLabel: string | null
  mapMessage: string | null
}

export type AppAction =
  | { type: 'audioGateDismissed' }
  | { type: 'startOpening' }
  | { type: 'selectInstrumentDone' }
  | { type: 'nicknameDone' }
  | { type: 'chapterSelected'; chapterId: string }
  | { type: 'chapterBack' }
  | { type: 'showMapMessage'; message: string }
  | { type: 'clearMapMessage' }
  | { type: 'showTransition'; label: string }
  | { type: 'clearTransition' }
