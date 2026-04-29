import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CHAPTERS } from '../data/chapters'
import { isChapterUnlocked as selectChapterUnlocked, isSkillUnlocked as selectSkillUnlocked } from '../domain/progress/progressSelectors'
import type { AchievementId } from '../domain/achievements/achievementTypes'

export type SkillStatus = 'locked' | 'available' | 'completed'

export interface SkillProgress {
  status: SkillStatus
  stars: number
  practiceCount: number
  lastPlayed: string | null
}

export interface ProgressState {
  skillProgress: Record<string, SkillProgress>
  achievements: AchievementId[]
  achievementLog: Array<{ id: AchievementId; unlockedAt: string }>
}

interface ProgressActions {
  unlockSkill: (skillId: string) => void
  completeSkill: (skillId: string, stars: number) => void
  incrementPractice: (skillId: string) => void
  unlockAchievement: (id: AchievementId) => void
  isChapterUnlocked: (chapterId: string) => boolean
  isSkillUnlocked: (skillId: string) => boolean
  reset: () => void
}

export function buildInitialProgress(): Record<string, SkillProgress> {
  const map: Record<string, SkillProgress> = {}
  for (const chapter of CHAPTERS) {
    for (let i = 0; i < chapter.skills.length; i += 1) {
      const skill = chapter.skills[i]
      map[skill.id] = {
        status: i === 0 && chapter.id === CHAPTERS[0].id ? 'available' : 'locked',
        stars: 0,
        practiceCount: 0,
        lastPlayed: null,
      }
    }
  }
  return map
}

const initialState: ProgressState = {
  skillProgress: buildInitialProgress(),
  achievements: [],
  achievementLog: [],
}

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      unlockSkill: (skillId) =>
        set((state) => ({
          skillProgress: {
            ...state.skillProgress,
            [skillId]: {
              ...state.skillProgress[skillId],
              status: state.skillProgress[skillId].status === 'locked' ? 'available' : state.skillProgress[skillId].status,
            },
          },
        })),
      completeSkill: (skillId, stars) =>
        set((state) => {
          const current = state.skillProgress[skillId]
          return {
            skillProgress: {
              ...state.skillProgress,
              [skillId]: { ...current, status: 'completed', stars: Math.max(current.stars, stars) },
            },
          }
        }),
      incrementPractice: (skillId) =>
        set((state) => ({
          skillProgress: {
            ...state.skillProgress,
            [skillId]: {
              ...state.skillProgress[skillId],
              practiceCount: (state.skillProgress[skillId]?.practiceCount ?? 0) + 1,
              lastPlayed: new Date().toISOString(),
            },
          },
        })),
      unlockAchievement: (id) =>
        set((state) => {
          if (state.achievements.includes(id)) return state
          return {
            achievements: [...state.achievements, id],
            achievementLog: [...state.achievementLog, { id, unlockedAt: new Date().toISOString() }],
          }
        }),
      isChapterUnlocked: (chapterId) => selectChapterUnlocked(CHAPTERS, get().skillProgress, chapterId),
      isSkillUnlocked: (skillId) => selectSkillUnlocked(CHAPTERS, get().skillProgress, skillId),
      reset: () => set({ skillProgress: buildInitialProgress(), achievements: [], achievementLog: [] }),
    }),
    {
      name: 'music-quest-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
