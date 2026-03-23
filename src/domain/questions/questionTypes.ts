export type QuestionMode = 'practice' | 'assessment'
export type QuestionType = 'piano' | 'choice'
export type AnswerMode = 'exact' | 'pitch_equivalent'
export type QuestionDifficulty = 'intro' | 'basic' | 'intermediate'

export interface QuestionItem {
  id: string
  skillId: string
  mode: QuestionMode
  type: QuestionType
  prompt: string
  answer: string
  options?: string[]
  answerMode: AnswerMode
  explanation?: string
  concept?: string
  difficulty?: QuestionDifficulty
}

export type QuestionDraft = Omit<QuestionItem, 'id'>
