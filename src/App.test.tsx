import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import App from './App'

vi.mock('./lib/audio/audioPolicy', () => ({
  useAudioPolicy: () => ({ initialized: false, initError: null }),
}))

vi.mock('./domain/streaks/streakTracker', () => {
  const store = { checkIn: vi.fn(), currentStreak: 0, longestStreak: 0, dailyChallengeCompleted: false, dailyChallengeDate: null, dailyChallengeXP: 0, lastPlayedDate: null, completeDailyChallenge: vi.fn() }
  return {
    useStreakStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('./components/Effects/ParticleCanvas', () => ({
  ParticleCanvas: () => null,
}))

describe('App', () => {
  test('renders audio gate prompt on first load', () => {
    render(<App />)
    expect(screen.getByText('轻触唤醒')).toBeInTheDocument()
  })
})
