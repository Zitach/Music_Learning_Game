import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Instrument = 'piano' | 'guitar' | 'ukulele' | null

export interface PlayerState {
  nickname: string
  instrument: Instrument
  lives: number
  maxLives: number
  xp: number
  level: number
  hasCompletedOpening: boolean
}

interface PlayerActions {
  setNickname: (name: string) => void
  setInstrument: (inst: Instrument) => void
  completeOpening: () => void
  addXP: (amount: number) => void
  loseLife: () => void
  healLife: () => void
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

      reset: () => set({ ...initialState, hasCompletedOpening: true }),
    }),
    {
      name: 'music-quest-player',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
