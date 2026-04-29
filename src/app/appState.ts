import type { TransitionStyle } from '../lib/ui/transitions'

export type AppScreen =
  | 'audio-gate'
  | 'opening-title'
  | 'opening-demo'
  | 'opening-instrument'
  | 'opening-nickname'
  | 'map'
  | 'chapter'

export interface AppUiState {
  screen: AppScreen
  selectedChapterId: string | null
  transitionLabel: string | null
  transitionStyle?: TransitionStyle
  mapMessage: string | null
}

export type AppAction =
  | { type: 'audioGateDismissed' }
  | { type: 'startOpening' }
  | { type: 'demoDone' }
  | { type: 'selectInstrumentDone' }
  | { type: 'nicknameDone' }
  | { type: 'chapterSelected'; chapterId: string }
  | { type: 'chapterBack' }
  | { type: 'showMapMessage'; message: string }
  | { type: 'clearMapMessage' }
  | { type: 'showTransition'; label: string; style?: TransitionStyle }
  | { type: 'clearTransition' }
