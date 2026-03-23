import type { ProgressState, SkillProgress } from '../../stores/progressStore'
import type { Chapter } from '../chapters/chapters'

export function isChapterUnlocked(chapters: Chapter[], progress: Record<string, SkillProgress>, chapterId: string): boolean {
  const idx = chapters.findIndex(chapter => chapter.id === chapterId)
  if (idx < 0) return false
  if (idx === 0) return true
  const previousChapter = chapters[idx - 1]
  const lastSkill = previousChapter.skills[previousChapter.skills.length - 1]
  return progress[lastSkill.id]?.status === 'completed'
}

export function isSkillUnlocked(chapters: Chapter[], progress: Record<string, SkillProgress>, skillId: string): boolean {
  const allSkills = chapters.flatMap(chapter => chapter.skills)
  const idx = allSkills.findIndex(skill => skill.id === skillId)
  if (idx < 0) return false
  if (idx === 0) return true
  return progress[allSkills[idx - 1].id]?.status === 'completed'
}

export function getCompletedSkills(chapter: Chapter, progress: Record<string, SkillProgress>): number {
  return chapter.skills.filter(skill => progress[skill.id]?.status === 'completed').length
}

export function canUnlockSkill(progressState: ProgressState, skillId: string): boolean {
  return progressState.skillProgress[skillId]?.status === 'locked'
}
