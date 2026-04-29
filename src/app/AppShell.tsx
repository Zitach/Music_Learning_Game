import { type ReactNode, useEffect, useState } from 'react'
import { GameHUD } from '../components/HUD/GameHUD'
import { TransitionOverlay } from '../components/Transitions/TransitionOverlay'
import { EffectsProvider, useEffects } from '../components/Effects/EffectsProvider'
import { ParticleCanvas } from '../components/Effects/ParticleCanvas'
import { TutorialProvider } from '../features/tutorial/TutorialProvider'
import { TutorialOverlay } from '../features/tutorial/TutorialOverlay'
import { usePlayerStore } from '../stores/playerStore'
import type { TransitionStyle } from '../lib/ui/transitions'

function StageDecor() {
  return (
    <>
      <div className="aurora-orb aurora-orb--gold" />
      <div className="aurora-orb aurora-orb--mint" />
      <div className="aurora-orb aurora-orb--violet" />
    </>
  )
}

function ShakeWrapper({ children }: { children: ReactNode }) {
  const { screenShake } = useEffects()
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let raf: number
    const tick = () => {
      const o = screenShake.getOffset()
      setOffset(o)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [screenShake])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      {children}
    </div>
  )
}

export function AppShell({
  showHud,
  transitionLabel,
  transitionStyle,
  onTransitionDismiss,
  children,
}: {
  showHud: boolean
  transitionLabel: string | null
  transitionStyle?: TransitionStyle
  onTransitionDismiss?: () => void
  children: ReactNode
}) {
  const theme = usePlayerStore(s => s.theme)
  const setTheme = usePlayerStore(s => s.setTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <EffectsProvider>
      <TutorialProvider>
        <div className="game-shell">
          <StageDecor />
          {showHud && <GameHUD />}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              position: 'fixed',
              top: 12,
              right: 12,
              zIndex: 100,
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 13,
              opacity: 0.7,
            }}
            title="切换主题"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <ShakeWrapper>{children}</ShakeWrapper>
          <ParticleCanvas />
          <TutorialOverlay />
          <TransitionOverlay
            label={transitionLabel}
            style={transitionStyle}
            onDismiss={onTransitionDismiss}
          />
        </div>
      </TutorialProvider>
    </EffectsProvider>
  )
}
