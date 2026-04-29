import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { QuestionItem } from '../../domain/questions/questionTypes'
import { isAnswerCorrect } from '../../domain/questions/questionBank'
import { useGameStore } from '../../lib/stores/gameStore'

export interface QuestionSessionResult {
  currentQuestion: QuestionItem | null
  index: number
  total: number
  feedback: 'correct' | 'wrong' | null
  selectedChoice: string | null
  submitChoice: (choice: string) => void
  submitPiano: (note: string) => void
  resetFeedback: () => void
}

interface UseQuestionSessionOptions {
  questions: QuestionItem[]
  onAnswer?: (isCorrect: boolean, question: QuestionItem) => void
  onComplete?: (correctCount: number, total: number) => void
  successDelay?: number
  errorDelay?: number
}

export function useQuestionSession({
  questions,
  onAnswer,
  onComplete,
  successDelay = 800,
  errorDelay = 1200,
}: UseQuestionSessionOptions): QuestionSessionResult {
  const [index, setIndex] = useState(0)
  const [, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const currentQuestion = questions[index] ?? null
  const recordHit = useGameStore(s => s.recordHit)
  const recordMiss = useGameStore(s => s.recordMiss)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const correctCountRef = useRef(0)
  const advance = useCallback((isCorrect: boolean) => {
    const timer = setTimeout(() => {
      setFeedback(null)
      setSelectedChoice(null)
      correctCountRef.current += isCorrect ? 1 : 0
      setCorrectCount(correctCountRef.current)
      if (index < questions.length - 1) {
        setIndex(currentIndex => currentIndex + 1)
      } else {
        onComplete?.(correctCountRef.current, questions.length)
      }
    }, isCorrect ? successDelay : errorDelay)
    advanceTimerRef.current = timer
  }, [errorDelay, index, onComplete, questions.length, successDelay])

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        clearTimeout(advanceTimerRef.current)
        advanceTimerRef.current = null
      }
    }
  }, [])

  const submit = useCallback((candidate: string) => {
    if (!currentQuestion || feedback) return
    const isCorrect = isAnswerCorrect(candidate, currentQuestion.answer, currentQuestion.answerMode)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      recordHit()
    } else {
      recordMiss()
    }
    onAnswer?.(isCorrect, currentQuestion)
    advance(isCorrect)
  }, [advance, currentQuestion, feedback, onAnswer, recordHit, recordMiss])

  const submitChoice = useCallback((choice: string) => {
    if (selectedChoice || !currentQuestion) return
    setSelectedChoice(choice)
    submit(choice)
  }, [currentQuestion, selectedChoice, submit])

  const submitPiano = useCallback((note: string) => {
    submit(note)
  }, [submit])

  const resetFeedback = useCallback(() => {
    setFeedback(null)
    setSelectedChoice(null)
  }, [])

  const prevQuestionsRef = useRef(questions)
  useEffect(() => {
    const prev = prevQuestionsRef.current
    const contentChanged = prev.length !== questions.length ||
      prev.some((q, i) => q.id !== questions[i]?.id)
    if (contentChanged) {
      setIndex(0)
      setCorrectCount(0)
      correctCountRef.current = 0
      setFeedback(null)
      setSelectedChoice(null)
      prevQuestionsRef.current = questions
    }
  }, [questions])

  return useMemo(() => ({
    currentQuestion,
    index,
    total: questions.length,
    feedback,
    selectedChoice,
    submitChoice,
    submitPiano,
    resetFeedback,
  }), [currentQuestion, feedback, index, questions.length, resetFeedback, selectedChoice, submitChoice, submitPiano])
}
