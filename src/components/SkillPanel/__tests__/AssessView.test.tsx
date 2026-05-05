import { describe, expect, test, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssessView } from '../AssessView'
import type { Skill } from '../../../data/chapters'

vi.mock('../../../stores/progressStore', () => {
  const store = {
    completeSkill: vi.fn(),
    unlockSkill: vi.fn(),
    unlockAchievement: vi.fn(),
    skillProgress: {},
    achievements: [] as string[],
  }
  return {
    useProgressStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../../../stores/playerStore', () => {
  const store = {
    addXP: vi.fn(),
    loseLife: vi.fn(),
    healLife: vi.fn(),
    level: 1,
    xp: 0,
    lives: 3,
    maxLives: 5,
  }
  return {
    usePlayerStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../../../lib/stores/gameStore', () => {
  const store = {
    resetGame: vi.fn(),
    combo: 0,
    recordHit: vi.fn(),
    recordMiss: vi.fn(),
  }
  return {
    useGameStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../../../lib/audio/Engine', () => ({
  audioEngine: {
    playAnswerCorrect: vi.fn(),
    playAnswerWrong: vi.fn(),
    playLowLives: vi.fn(),
    playChapterComplete: vi.fn(),
    fadeOutAll: vi.fn(),
  },
}))

vi.mock('../../Effects/EffectsProvider', () => ({
  useEffects: () => ({
    triggerShake: vi.fn(),
    triggerParticles: vi.fn(),
    particleSystem: { emit: vi.fn() },
    screenShake: { shake: vi.fn() },
  }),
}))

vi.mock('../../Canvas/PianoCanvas', () => ({
  PianoCanvas: () => <div data-testid="piano-canvas" />,
}))

const mockSkill: Skill = {
  id: 'ch1-s1',
  title: '认识音名',
  description: '认识 C D E F G A B',
  chapterId: 'ch1',
  practiceCount: 5,
  assessmentCount: 3,
  starsToPass: 1,
  flow: [
    { type: 'learn', completionKey: 'learn' },
    { type: 'practice', completionKey: 'practice' },
    { type: 'assessment', completionKey: 'assessment' },
  ],
}

let mockSessionOverride: (() => Record<string, unknown>) | null = null

vi.mock('../../../features/practice/useQuestionSession', () => ({
  useQuestionSession: () => {
    if (mockSessionOverride) return mockSessionOverride()
    return {
      currentQuestion: null,
      index: 0,
      total: 0,
      feedback: null,
      selectedChoice: null,
      submitChoice: vi.fn(),
      submitPiano: vi.fn(),
      resetFeedback: vi.fn(),
    }
  },
}))

describe('AssessView', () => {
  beforeEach(() => {
    mockSessionOverride = null
  })

  test('renders loading state when currentQuestion is null (not blank)', () => {
    mockSessionOverride = () => ({
      currentQuestion: null,
      index: 0,
      total: 3,
      feedback: null,
      selectedChoice: null,
      submitChoice: vi.fn(),
      submitPiano: vi.fn(),
      resetFeedback: vi.fn(),
    })

    render(<AssessView skill={mockSkill} onComplete={vi.fn()} />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  test('renders assessment question content', () => {
    mockSessionOverride = () => ({
      currentQuestion: {
        id: 'ch1-s1-assessment-01',
        skillId: 'ch1-s1',
        mode: 'assessment',
        type: 'piano',
        prompt: '请在键盘上按出 C。',
        answer: 'C4',
        answerMode: 'exact',
      },
      index: 0,
      total: 3,
      feedback: null,
      selectedChoice: null,
      submitChoice: vi.fn(),
      submitPiano: vi.fn(),
      resetFeedback: vi.fn(),
    })

    render(<AssessView skill={mockSkill} onComplete={vi.fn()} />)

    expect(screen.getByText('考核')).toBeInTheDocument()
    expect(screen.getByText('认识音名')).toBeInTheDocument()
  })
})
