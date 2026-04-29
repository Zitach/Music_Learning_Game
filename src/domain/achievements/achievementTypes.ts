export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'chapter' | 'skill' | 'challenge' | 'mastery' | 'hidden'
}

export type AchievementId = string
