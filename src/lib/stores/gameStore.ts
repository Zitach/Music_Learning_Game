import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface GameState {
  lives: number
  maxLives: number
  combo: number
  accuracy: number
  score: number
  totalHits: number
  totalMisses: number
}

interface GameActions {
  recordHit: () => void
  recordMiss: () => void
  resetGame: () => void
  resetCombo: () => void
  addScore: (points: number) => void
}

type GameStore = GameState & GameActions

const initialState: GameState = {
  lives: 3,
  maxLives: 3,
  combo: 0,
  accuracy: 100,
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

      resetCombo: () => set({ combo: 0 }),

      addScore: (points: number) =>
        set((state) => ({
          score: state.score + points,
        })),
    }),
    {
      name: 'music-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
