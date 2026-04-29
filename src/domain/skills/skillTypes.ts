export type SkillStepType = 'learn' | 'practice' | 'assessment'

export interface SkillFlowStep {
  type: SkillStepType
  completionKey: string
}

export type SkillId = string

export type PracticeVariant =
  | 'note-names'
  | 'ear-training'
  | 'rhythm'
  | 'staff-reading'
  | 'scales'
  | 'progressions'

export interface SkillDefinition {
  id: SkillId
  title: string
  description: string
  chapterId: string
  practiceCount: number
  assessmentCount: number
  starsToPass: number
  flow: SkillFlowStep[]
  practiceVariant?: PracticeVariant
}

export interface ChapterDefinition {
  id: string
  title: string
  emoji: string
  color: string
  position: { x: number; y: number }
  skills: SkillDefinition[]
}

export const DEFAULT_SKILL_FLOW: SkillFlowStep[] = [
  { type: 'learn', completionKey: 'learn' },
  { type: 'practice', completionKey: 'practice' },
  { type: 'assessment', completionKey: 'assessment' },
]
