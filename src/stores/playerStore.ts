import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Instrument = 'piano' | 'guitar' | 'ukulele' | null
export type Theme = 'dark' | 'light'

export interface PlayerState {
  nickname: string
  instrument: Instrument
  lives: number
  maxLives: number
  xp: number
  level: number
  hasCompletedOpening: boolean
  theme: Theme
  completedTutorials: string[]
}

interface PlayerActions {
  setNickname: (name: string) => void
  setInstrument: (inst: Instrument) => void
  completeOpening: () => void
  addXP: (amount: number) => void
  loseLife: () => void
  healLife: () => void
  setTheme: (theme: Theme) => void
  completeTutorial: (tutorialId: string) => void
  reset: () => void
}

const XP_PER_LEVEL = 100

const initialState: PlayerState = {
  nickname: '',
  instrument: null,
  lives: 5,
  maxLives: 5,
  xp: 0,
  level: 1,
  hasCompletedOpening: false,
  theme: 'light',
  completedTutorials: [],
}

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  persist(
    (set) => ({
      ...initialState,

      setNickname: (name) => set({ nickname: name }),
      setInstrument: (inst) => set({ instrument: inst }),
      completeOpening: () => set({ hasCompletedOpening: true }),

      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount
          const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
          return { xp: newXP, level: newLevel }
        }),

      loseLife: () =>
        set((state) => ({
          lives: Math.max(0, state.lives - 1),
        })),

      healLife: () =>
        set((state) => ({
          lives: Math.min(state.maxLives, state.lives + 1),
        })),

      setTheme: (theme) => set({ theme }),
      completeTutorial: (id) =>
        set((state) => ({
          completedTutorials: state.completedTutorials.includes(id)
            ? state.completedTutorials
            : [...state.completedTutorials, id],
        })),

      reset: () => set({ ...initialState, hasCompletedOpening: true }),
    }),
    {
      name: 'music-quest-player',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
