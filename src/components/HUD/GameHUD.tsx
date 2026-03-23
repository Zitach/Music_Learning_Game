import { XPBar } from './XPBar'
import { BadgeCounter } from './BadgeCounter'
import { LivesDisplay } from './LivesDisplay'
import { usePlayerStore } from '../../stores/playerStore'

export function GameHUD() {
  const lives = usePlayerStore(s => s.lives)
  const maxLives = usePlayerStore(s => s.maxLives)

  return (
    <div className="hud-cluster">
      <XPBar />
      <BadgeCounter />
      <div className="hud-chip">
        <LivesDisplay lives={lives} maxLives={maxLives} />
      </div>
    </div>
  )
}
