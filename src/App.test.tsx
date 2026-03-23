import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import App from './App'

vi.mock('./lib/audio/audioPolicy', () => ({
  useAudioPolicy: () => ({ initialized: false, initError: null }),
}))

describe('App', () => {
  test('renders audio gate prompt on first load', () => {
    render(<App />)
    expect(screen.getByText('轻触唤醒')).toBeInTheDocument()
  })
})
