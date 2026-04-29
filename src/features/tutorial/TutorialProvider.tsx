import { createContext, useContext, useState, useCallback } from 'react'
import { usePlayerStore } from '../../stores/playerStore'

export interface TutorialStep {
  targetSelector: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

interface TutorialContextValue {
  isActive: boolean
  currentStep: number
  steps: TutorialStep[]
  startTutorial: (id: string, steps: TutorialStep[]) => void
  nextStep: () => void
  skipTutorial: () => void
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TutorialStep[]>([])
  const [tutorialId, setTutorialId] = useState('')
  const completedTutorials = usePlayerStore(s => s.completedTutorials)
  const completeTutorial = usePlayerStore(s => s.completeTutorial)

  const startTutorial = useCallback((id: string, tutorialSteps: TutorialStep[]) => {
    if (completedTutorials.includes(id)) return
    setTutorialId(id)
    setSteps(tutorialSteps)
    setCurrentStep(0)
    setIsActive(true)
  }, [completedTutorials])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      setIsActive(false)
      completeTutorial(tutorialId)
    }
  }, [currentStep, steps.length, tutorialId, completeTutorial])

  const skipTutorial = useCallback(() => {
    setIsActive(false)
    completeTutorial(tutorialId)
  }, [tutorialId, completeTutorial])

  return (
    <TutorialContext.Provider value={{ isActive, currentStep, steps, startTutorial, nextStep, skipTutorial }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const ctx = useContext(TutorialContext)
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider')
  return ctx
}
