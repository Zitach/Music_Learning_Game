import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { AppRouter } from './AppRouter'

vi.mock('../components/Opening/TitleScreen', () => ({
  TitleScreen: ({ onStart }: { onStart: () => void }) => <button onClick={onStart}>title</button>,
}))
vi.mock('../components/Opening/InstrumentPicker', () => ({
  InstrumentPicker: ({ onNext }: { onNext: () => void }) => <button onClick={onNext}>instrument</button>,
}))
vi.mock('../components/Opening/NicknameInput', () => ({
  NicknameInput: ({ onComplete }: { onComplete: () => void }) => <button onClick={onComplete}>nickname</button>,
}))
vi.mock('../components/SkillPanel/SkillPanel', () => ({
  SkillPanel: ({ chapterId, onBack }: { chapterId: string; onBack: () => void }) => (
    <div data-testid="skill-panel">SkillPanel-{chapterId}<button onClick={onBack}>back</button></div>
  ),
}))

const defaultProps = {
  nickname: 'Tester',
  level: 1,
  mapMessage: null as string | null,
  initError: null as string | null,
  onDismissAudioGate: () => undefined,
  onTitleStart: () => undefined,
  onDemoDone: () => undefined,
  onInstrumentNext: () => undefined,
  onNicknameComplete: () => undefined,
  onChapterClick: () => undefined,
  onBackToMap: () => undefined,
}

describe('AppRouter layout', () => {
  test('renders map screen with fullscreen stage containers', () => {
    render(
      <AppRouter
        screen="map"
        selectedChapterId={null}
        {...defaultProps}
      />
    )

    expect(document.querySelector('.map-screen')).toBeInTheDocument()
    expect(document.querySelector('.map-stage')).toBeInTheDocument()
  })

  test('renders fallback and auto-navigates when chapter screen has no selectedChapterId', async () => {
    const onBackToMap = vi.fn()
    render(
      <AppRouter
        screen="chapter"
        selectedChapterId={null}
        {...defaultProps}
        onBackToMap={onBackToMap}
      />
    )

    expect(screen.getByText('章节加载失败，返回地图...')).toBeInTheDocument()
    await waitFor(() => expect(onBackToMap).toHaveBeenCalledTimes(1))
  })

  test('renders SkillPanel when chapter screen has valid selectedChapterId', async () => {
    render(
      <AppRouter
        screen="chapter"
        selectedChapterId="ch1"
        {...defaultProps}
      />
    )

    await waitFor(() => expect(screen.getByTestId('skill-panel')).toHaveTextContent('SkillPanel-ch1'))
  })
})

