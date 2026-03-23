import { useProgressStore } from '../../stores/progressStore'
import { CHAPTERS } from '../../data/chapters'

export function BadgeCounter() {
  const badges = useProgressStore(s => s.badges)
  const totalSkills = CHAPTERS.flatMap(c => c.skills).length

  return (
    <div className="hud-chip">
      <span style={{ fontSize: '16px' }}>🏅</span>
      <span style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 700 }}>
        {badges.length}/{totalSkills}
      </span>
    </div>
  )
}
