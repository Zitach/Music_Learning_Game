import { renderHook, act } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useQuestionSession } from './useQuestionSession'
import type { QuestionItem } from '../../domain/questions/questionTypes'

const questions: QuestionItem[] = [
  { id: 'q1', skillId: 's1', mode: 'practice', type: 'choice', prompt: 'Q1', answer: 'A', options: ['A', 'B'], answerMode: 'exact' },
  { id: 'q2', skillId: 's1', mode: 'practice', type: 'choice', prompt: 'Q2', answer: 'B', options: ['A', 'B'], answerMode: 'exact' },
]

describe('useQuestionSession', () => {
  test('advances after correct answer', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const { result } = renderHook(() => useQuestionSession({ questions, onComplete, successDelay: 10, errorDelay: 10 }))
    act(() => result.current.submitChoice('A'))
    expect(result.current.feedback).toBe('correct')
    await act(async () => { vi.advanceTimersByTime(10) })
    expect(result.current.index).toBe(1)
    expect(onComplete).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  test('completes once after wrong answer on final question', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const { result } = renderHook(() => useQuestionSession({ questions: [questions[0]], onComplete, successDelay: 10, errorDelay: 10 }))
    act(() => result.current.submitPiano('B4'))
    await act(async () => { vi.advanceTimersByTime(10) })
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
