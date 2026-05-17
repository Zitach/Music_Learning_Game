import { useState } from 'react'
import { useProgressStore } from '../../stores/progressStore'
import { ACHIEVEMENTS } from '../../domain/achievements/achievements'
import { AchievementPanel } from './AchievementPanel'

export function BadgeCounter() {
  const achievements = useProgressStore(s => s.achievements)
  const total = ACHIEVEMENTS.length
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="hud-chip"
        onClick={() => setIsOpen(prev => !prev)}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-expanded={isOpen}
        aria-label="查看成就"
      >
        <span style={{ fontSize: '16px' }}>🏅</span>
        <span style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 700 }}>
          {achievements.length}/{total}
        </span>
      </div>

      {isOpen && (
        <AchievementPanel
          achievements={achievements}
          allAchievements={ACHIEVEMENTS}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
