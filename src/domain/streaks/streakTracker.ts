import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface StreakState {
  lastPlayedDate: string | null
  currentStreak: number
  longestStreak: number
  dailyChallengeCompleted: boolean
  dailyChallengeDate: string | null
  dailyChallengeXP: number
}

interface StreakActions {
  checkIn: () => void
  completeDailyChallenge: (xp: number) => void
}

export const useStreakStore = create<StreakState & StreakActions>()(
  persist(
    (set, get) => ({
      lastPlayedDate: null,
      currentStreak: 0,
      longestStreak: 0,
      dailyChallengeCompleted: false,
      dailyChallengeDate: null,
      dailyChallengeXP: 0,

      checkIn: () => {
        const today = new Date().toISOString().split('T')[0]
        const state = get()

        if (state.lastPlayedDate === today) return

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const newStreak = state.lastPlayedDate === yesterday ? state.currentStreak + 1 : 1

        set({
          lastPlayedDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          dailyChallengeCompleted: false,
          dailyChallengeDate: null,
          dailyChallengeXP: 0,
        })
      },

      completeDailyChallenge: (xp) => {
        const today = new Date().toISOString().split('T')[0]
        set({
          dailyChallengeCompleted: true,
          dailyChallengeDate: today,
          dailyChallengeXP: xp,
        })
      },
    }),
    {
      name: 'music-quest-streaks',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
