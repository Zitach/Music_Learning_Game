import { shuffleItems } from '../../../lib/utils/shuffle'
import { isAnswerCorrect, normalizeNoteParts, toMidiLikeValue } from '../evaluators'
import type { QuestionDraft, QuestionItem, QuestionMode } from '../questionTypes'
import { CH1_QUESTIONS } from './ch1'
import { CH2_QUESTIONS } from './ch2'
import { CH3_QUESTIONS } from './ch3'
import { CH4_QUESTIONS } from './ch4'
import { CH5_QUESTIONS } from './ch5'
import { CH6_QUESTIONS } from './ch6'
import { BOSS_QUESTIONS } from './boss'

const RAW_QUESTIONS: QuestionDraft[] = [...CH1_QUESTIONS, ...CH2_QUESTIONS, ...CH3_QUESTIONS, ...CH4_QUESTIONS, ...CH5_QUESTIONS, ...CH6_QUESTIONS, ...BOSS_QUESTIONS]

function withStableIds(questions: QuestionDraft[]): QuestionItem[] {
  const sequenceByKey = new Map<string, number>()
  return questions.map(question => {
    const key = `${question.skillId}-${question.mode}`
    const sequence = (sequenceByKey.get(key) ?? 0) + 1
    sequenceByKey.set(key, sequence)
    return {
      ...question,
      id: `${question.skillId}-${question.mode}-${String(sequence).padStart(2, '0')}`,
    }
  })
}

export const QUESTION_BANK = withStableIds(RAW_QUESTIONS)

export { isAnswerCorrect, normalizeNoteParts, toMidiLikeValue }
export type { QuestionItem, QuestionMode }

export function getQuestionsForSkill(skillId: string, mode: QuestionMode): QuestionItem[] {
  return QUESTION_BANK.filter(question => question.skillId === skillId && question.mode === mode)
}

export function getShuffledQuestionsForSkill(skillId: string, mode: QuestionMode): QuestionItem[] {
  return shuffleItems(getQuestionsForSkill(skillId, mode))
}
