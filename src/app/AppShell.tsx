import type { ReactNode } from 'react'
import { GameHUD } from '../components/HUD/GameHUD'

function StageDecor() {
  return (
    <>
      <div className="aurora-orb aurora-orb--gold" />
      <div className="aurora-orb aurora-orb--mint" />
      <div className="aurora-orb aurora-orb--violet" />
    </>
  )
}

export function AppShell({ showHud, transitionLabel, children }: { showHud: boolean; transitionLabel: string | null; children: ReactNode }) {
  return (
    <div className="game-shell">
      <StageDecor />
      {showHud && <GameHUD />}
      {children}
      {transitionLabel && <div className="transition-banner">{transitionLabel}</div>}
    </div>
  )
}
