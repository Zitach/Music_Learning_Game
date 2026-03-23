import { render } from '@testing-library/react'
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

describe('AppRouter layout', () => {
  test('renders map screen with fullscreen stage containers', () => {
    render(
      <AppRouter
        screen="map"
        selectedChapterId={null}
        nickname="Tester"
        level={1}
        mapMessage={null}
        initError={null}
        onDismissAudioGate={() => undefined}
        onTitleStart={() => undefined}
        onInstrumentNext={() => undefined}
        onNicknameComplete={() => undefined}
        onChapterClick={() => undefined}
        onBackToMap={() => undefined}
      />
    )

    expect(document.querySelector('.map-screen')).toBeInTheDocument()
    expect(document.querySelector('.map-stage')).toBeInTheDocument()
  })
})

