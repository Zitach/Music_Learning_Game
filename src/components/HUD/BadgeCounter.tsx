import { useProgressStore } from '../../stores/progressStore'
import { ACHIEVEMENTS } from '../../domain/achievements/achievements'

export function BadgeCounter() {
  const achievements = useProgressStore(s => s.achievements)
  const total = ACHIEVEMENTS.length

  return (
    <div className="hud-chip">
      <span style={{ fontSize: '16px' }}>🏅</span>
      <span style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 700 }}>
        {achievements.length}/{total}
      </span>
    </div>
  )
}
