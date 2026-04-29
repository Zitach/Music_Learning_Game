import { XPBar } from './XPBar'
import { BadgeCounter } from './BadgeCounter'
import { LivesDisplay } from './LivesDisplay'
import { ComboCounter } from './ComboCounter'
import { usePlayerStore } from '../../stores/playerStore'
import { useGameStore } from '../../lib/stores/gameStore'

export function GameHUD() {
  const lives = usePlayerStore(s => s.lives)
  const maxLives = usePlayerStore(s => s.maxLives)
  const combo = useGameStore(s => s.combo)

  return (
    <div className="hud-cluster" role="status" aria-label="游戏状态">
      <XPBar />
      <BadgeCounter />
      <div className="hud-chip">
        <LivesDisplay lives={lives} maxLives={maxLives} />
      </div>
      {combo > 1 && <ComboCounter combo={combo} />}
    </div>
  )
}
