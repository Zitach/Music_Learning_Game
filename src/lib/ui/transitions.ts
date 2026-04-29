export type TransitionStyle = 'banner' | 'fade' | 'dissolve' | 'levelUp'

export interface TransitionConfig {
  label: string
  style?: TransitionStyle
  duration?: number
}

export const TRANSITION_DURATIONS: Record<TransitionStyle, number> = {
  banner: 900,
  fade: 400,
  dissolve: 600,
  levelUp: 1500,
}
