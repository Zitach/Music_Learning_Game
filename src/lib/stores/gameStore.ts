import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type GamePhase = 'demo' | 'playing' | 'transition'

export interface GameState {
  phase: GamePhase
  lives: number
  maxLives: number
  combo: number
  accuracy: number
  currentTask: string | null
  score: number
  totalHits: number
  totalMisses: number
}

interface GameActions {
  startDemo: () => void
  startPlaying: () => void
  recordHit: () => void
  recordMiss: () => void
  resetGame: () => void
  setCurrentTask: (task: string) => void
}

type GameStore = GameState & GameActions

const initialState: GameState = {
  phase: 'demo',
  lives: 3,
  maxLives: 3,
  combo: 0,
  accuracy: 100,
  currentTask: null,
  score: 0,
  totalHits: 0,
  totalMisses: 0,
}

const calculateAccuracy = (hits: number, misses: number): number => {
  const total = hits + misses
  if (total === 0) return 100
  return Math.round((hits / total) * 100)
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
  ...initialState,

  startDemo: () => set({ phase: 'demo' }),

  startPlaying: () => set({ phase: 'playing' }),

  recordHit: () =>
    set((state) => {
      const newHits = state.totalHits + 1
      const newCombo = state.combo + 1
      const newScore = state.score + (10 + newCombo * 2)
      return {
        totalHits: newHits,
        combo: newCombo,
        score: newScore,
        accuracy: calculateAccuracy(newHits, state.totalMisses),
      }
    }),

  recordMiss: () =>
    set((state) => {
      const newMisses = state.totalMisses + 1
      const newLives = Math.max(0, state.lives - 1)
      return {
        totalMisses: newMisses,
        lives: newLives,
        combo: 0,
        accuracy: calculateAccuracy(state.totalHits, newMisses),
      }
    }),

  resetGame: () =>
    set({
      ...initialState,
    }),

  setCurrentTask: (task: string) => set({ currentTask: task }),
    }),
    {
      name: 'music-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
