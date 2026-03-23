import { describe, expect, test } from 'vitest'
import { validateQuestionBank } from './validation'
import type { QuestionItem } from './questionTypes'

describe('validateQuestionBank', () => {
  test('passes bundled question bank', () => {
    expect(validateQuestionBank()).toEqual([])
  })

  test('reports invalid questions', () => {
    const invalidQuestion: QuestionItem = {
      id: 'bad-1',
      skillId: 'unknown',
      mode: 'practice',
      type: 'choice',
      prompt: '',
      answer: 'x',
      options: ['y'],
      answerMode: 'exact',
    }
    const errors = validateQuestionBank([invalidQuestion])
    expect(errors.some(error => error.includes('Unknown skillId'))).toBe(true)
    expect(errors.some(error => error.includes('Empty prompt'))).toBe(true)
  })
})
