import { usePlayerStore } from '../../stores/playerStore'

const XP_PER_LEVEL = 100

export function XPBar() {
  const xp = usePlayerStore(s => s.xp)
  const level = usePlayerStore(s => s.level)
  const progress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL

  return (
    <div className="hud-chip">
      <span style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em' }}>
        LV {level}
      </span>
      <div className="xp-track">
        <div className="xp-fill" style={{ width: `${progress * 100}%`, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}
