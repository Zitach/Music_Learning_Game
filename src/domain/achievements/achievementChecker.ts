import type { AchievementId } from './achievementTypes'
import { ACHIEVEMENTS } from './achievements'
import type { Chapter } from '../chapters/chapters'

interface PlayerState {
  level: number
  xp: number
}

interface ProgressState {
  skillProgress: Record<string, { status: string; stars: number }>
  achievements: AchievementId[]
}

interface GameState {
  combo: number
}

export function checkAchievements(
  _player: PlayerState,
  progress: ProgressState,
  game: GameState,
  chapters: Chapter[]
): AchievementId[] {
  const existing = new Set(progress.achievements)
  const newAchievements: AchievementId[] = []

  const add = (id: string) => {
    if (!existing.has(id)) {
      newAchievements.push(id)
    }
  }

  // Chapter completion
  for (const chapter of chapters) {
    const allDone = chapter.skills.every(s => progress.skillProgress[s.id]?.status === 'completed')
    if (allDone) {
      add(`complete-${chapter.id}`)
      // Check perfect stars for ch1, ch2
      if (chapter.id === 'ch1' || chapter.id === 'ch2') {
        const allThreeStars = chapter.skills.every(s => (progress.skillProgress[s.id]?.stars ?? 0) >= 3)
        if (allThreeStars) add(`perfect-${chapter.id}`)
      }
    }
  }

  // First skill
  const anyCompleted = Object.values(progress.skillProgress).some(s => s.status === 'completed')
  if (anyCompleted) add('first-skill')

  // All skills
  const allSkills = chapters.flatMap(c => c.skills)
  const allDone = allSkills.every(s => progress.skillProgress[s.id]?.status === 'completed')
  if (allDone) add('all-skills')

  // Ear training master (ch5 + ch6)
  const ch5Done = chapters.find(c => c.id === 'ch5')?.skills.every(s => progress.skillProgress[s.id]?.status === 'completed') ?? false
  const ch6Done = chapters.find(c => c.id === 'ch6')?.skills.every(s => progress.skillProgress[s.id]?.status === 'completed') ?? false
  if (ch5Done && ch6Done) add('ear-training-master')

  // Combo achievements (checked from game state)
  if (game.combo >= 10) add('combo-10')
  if (game.combo >= 20) add('combo-20')

  // Filter to only valid achievement IDs
  const validIds = new Set(ACHIEVEMENTS.map(a => a.id))
  return newAchievements.filter(id => validIds.has(id))
}
