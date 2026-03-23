import { lazy, Suspense } from 'react'
import type { AppScreen } from './appState'
import { TitleScreen } from '../components/Opening/TitleScreen'
import { InstrumentPicker } from '../components/Opening/InstrumentPicker'
import { NicknameInput } from '../components/Opening/NicknameInput'

const WorldMapCanvas = lazy(async () => ({ default: (await import('../components/Canvas/WorldMapCanvas')).WorldMapCanvas }))
const SkillPanel = lazy(async () => ({ default: (await import('../components/SkillPanel/SkillPanel')).SkillPanel }))

function AudioGate({ onDismiss, initError }: { onDismiss: () => void; initError: string | null }) {
  return (
    <section className="opening-screen" onClick={onDismiss}>
      <div className="opening-panel fade-up" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', cursor: 'pointer' }}>
        <div className="staff-lines" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <span key={index} />)}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '88px', marginBottom: '18px' }}>🎧</div>
          <div className="eyebrow">音频启幕</div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(38px, 6vw, 72px)', marginBottom: '18px' }}>轻触唤醒<span className="accent">音乐舞台</span></h1>
          <p className="audio-gate-copy" style={{ position: 'static', transform: 'none', display: 'inline-flex' }}>浏览器需要一次手势来准备音频引擎。轻触任意位置，开始你的音乐冒险。</p>
          {initError && <p className="helper-text" style={{ marginTop: '12px' }}>音频暂未准备好，但你仍可继续浏览：{initError}</p>}
        </div>
      </div>
    </section>
  )
}

export interface AppRouterProps {
  screen: AppScreen
  selectedChapterId: string | null
  nickname: string
  level: number
  mapMessage: string | null
  initError: string | null
  onDismissAudioGate: () => void
  onTitleStart: () => void
  onInstrumentNext: () => void
  onNicknameComplete: () => void
  onChapterClick: (chapterId: string) => void
  onBackToMap: () => void
}

export function AppRouter(props: AppRouterProps) {
  const fallback = <div className="floating-panel fade-up">加载中...</div>

  switch (props.screen) {
    case 'audio-gate':
      return <AudioGate onDismiss={props.onDismissAudioGate} initError={props.initError} />
    case 'opening-title':
      return <TitleScreen onStart={props.onTitleStart} />
    case 'opening-instrument':
      return <InstrumentPicker onNext={props.onInstrumentNext} />
    case 'opening-nickname':
      return <NicknameInput onComplete={props.onNicknameComplete} />
    case 'chapter':
      return props.selectedChapterId ? (
        <Suspense fallback={fallback}>
          <SkillPanel chapterId={props.selectedChapterId} onBack={props.onBackToMap} />
        </Suspense>
      ) : null
    case 'map':
    default:
      return (
        <section className="map-screen fade-up">
          <div className="map-stage">
            <Suspense fallback={fallback}>
              <WorldMapCanvas onChapterClick={props.onChapterClick} />
            </Suspense>
          </div>
          <div className="map-ui-layer">
            <div className="map-title-tag">世界地图</div>
            <div className="map-subtitle-tag">{props.nickname || '冒险者'} · LV {props.level}</div>
            {props.mapMessage && <div className="map-message">{props.mapMessage}</div>}
          </div>
        </section>
      )
  }
}
