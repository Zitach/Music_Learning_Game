import { renderHook, act } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useQuestionSession } from './useQuestionSession'
import type { QuestionItem } from '../../domain/questions/questionTypes'

vi.mock('../../lib/stores/gameStore', () => {
  const mockStore: Record<string, () => void> = {
    recordHit: vi.fn(),
    recordMiss: vi.fn(),
  }
  return {
    useGameStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
  }
})

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

  test('does not reset index when questions reference changes but content is same', () => {
    const onComplete = vi.fn()
    const sameContentDifferentRef: QuestionItem[] = [
      { id: 'q1', skillId: 's1', mode: 'practice', type: 'choice', prompt: 'Q1', answer: 'A', options: ['A', 'B'], answerMode: 'exact' },
      { id: 'q2', skillId: 's1', mode: 'practice', type: 'choice', prompt: 'Q2', answer: 'B', options: ['A', 'B'], answerMode: 'exact' },
    ]
    const { result, rerender } = renderHook(
      ({ qs }) => useQuestionSession({ questions: qs, onComplete, successDelay: 10, errorDelay: 10 }),
      { initialProps: { qs: questions } }
    )

    expect(result.current.index).toBe(0)

    rerender({ qs: sameContentDifferentRef })
    expect(result.current.index).toBe(0)
    expect(result.current.currentQuestion?.id).toBe('q1')
  })

  test('resets index when questions content actually changes', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const differentQuestions: QuestionItem[] = [
      { id: 'q3', skillId: 's1', mode: 'practice', type: 'choice', prompt: 'Q3', answer: 'C', options: ['C', 'D'], answerMode: 'exact' },
      { id: 'q4', skillId: 's1', mode: 'practice', type: 'choice', prompt: 'Q4', answer: 'D', options: ['C', 'D'], answerMode: 'exact' },
    ]

    const { result, rerender } = renderHook(
      ({ qs }) => useQuestionSession({ questions: qs, onComplete, successDelay: 10, errorDelay: 10 }),
      { initialProps: { qs: questions } }
    )

    act(() => result.current.submitChoice('A'))
    act(() => { vi.advanceTimersByTime(10) })
    expect(result.current.index).toBe(1)

    rerender({ qs: differentQuestions })
    expect(result.current.index).toBe(0)
    expect(result.current.currentQuestion?.id).toBe('q3')

    vi.useRealTimers()
  })
})
