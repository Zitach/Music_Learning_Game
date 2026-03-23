import { CHAPTERS } from '../chapters/chapters'
import { QUESTION_BANK, normalizeNoteParts } from './questionBank'
import type { QuestionItem } from './questionTypes'

export function validateQuestionBank(questions: QuestionItem[] = QUESTION_BANK): string[] {
  const errors: string[] = []
  const skillIds = new Set(CHAPTERS.flatMap(chapter => chapter.skills.map(skill => skill.id)))
  const ids = new Set<string>()

  for (const question of questions) {
    if (!skillIds.has(question.skillId)) {
      errors.push(`Unknown skillId: ${question.skillId} (${question.id})`)
    }
    if (ids.has(question.id)) {
      errors.push(`Duplicate question id: ${question.id}`)
    }
    ids.add(question.id)
    if (!question.prompt.trim()) {
      errors.push(`Empty prompt: ${question.id}`)
    }
    if (question.type === 'choice') {
      if (!question.options?.length) {
        errors.push(`Choice question missing options: ${question.id}`)
      }
      if (question.options && !question.options.includes(question.answer)) {
        errors.push(`Choice answer not present in options: ${question.id}`)
      }
    }
    if (question.type === 'piano' && !normalizeNoteParts(question.answer)) {
      errors.push(`Invalid piano answer: ${question.id}`)
    }
  }

  for (const chapter of CHAPTERS) {
    for (const skill of chapter.skills) {
      const practiceQuestions = questions.filter(question => question.skillId === skill.id && question.mode === 'practice')
      const assessmentQuestions = questions.filter(question => question.skillId === skill.id && question.mode === 'assessment')
      if (practiceQuestions.length < skill.practiceCount) {
        errors.push(`Not enough practice questions for ${skill.id}`)
      }
      if (assessmentQuestions.length < skill.assessmentCount) {
        errors.push(`Not enough assessment questions for ${skill.id}`)
      }
    }
  }

  return errors
}
