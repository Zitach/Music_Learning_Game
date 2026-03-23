import { useCallback, useEffect, useMemo, useState } from 'react'
import type { QuestionItem } from '../../domain/questions/questionTypes'
import { isAnswerCorrect } from '../../domain/questions/questionBank'

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

  const advance = useCallback((isCorrect: boolean) => {
    setTimeout(() => {
      setFeedback(null)
      setSelectedChoice(null)
      setCorrectCount(current => {
        const nextCorrect = current + (isCorrect ? 1 : 0)
        if (index < questions.length - 1) {
          setIndex(currentIndex => currentIndex + 1)
        } else {
          onComplete?.(nextCorrect, questions.length)
        }
        return nextCorrect
      })
    }, isCorrect ? successDelay : errorDelay)
  }, [errorDelay, index, onComplete, questions.length, successDelay])

  const submit = useCallback((candidate: string) => {
    if (!currentQuestion || feedback) return
    const isCorrect = isAnswerCorrect(candidate, currentQuestion.answer, currentQuestion.answerMode)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    onAnswer?.(isCorrect, currentQuestion)
    advance(isCorrect)
  }, [advance, currentQuestion, feedback, onAnswer])

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

  useEffect(() => {
    setIndex(0)
    setCorrectCount(0)
    setFeedback(null)
    setSelectedChoice(null)
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

