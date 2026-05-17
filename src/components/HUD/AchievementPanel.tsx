import type { Achievement, AchievementId } from '../../domain/achievements/achievementTypes'

interface AchievementPanelProps {
  achievements: AchievementId[]
  allAchievements: Achievement[]
  onClose: () => void
}

export function AchievementPanel({ achievements, allAchievements, onClose }: AchievementPanelProps) {
  const unlockedSet = new Set(achievements)

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="floating-panel fade-up"
        onWheel={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '68px',
          left: '14px',
          zIndex: 100,
          width: 'min(360px, 90vw)',
          maxHeight: 'min(480px, 70vh)',
          overflowY: 'auto',
          padding: '20px',
          borderRadius: '20px',
        }}
        role="dialog"
        aria-label="成就面板"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              成就
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--gold)',
              }}
            >
              已解锁 {achievements.length} / {allAchievements.length}
            </span>
          </div>

          {allAchievements.map((ach) => {
            const isUnlocked = unlockedSet.has(ach.id)
            return (
              <div
                key={ach.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isUnlocked ? 'var(--bg-1)' : 'transparent',
                  opacity: isUnlocked ? 1 : 0.4,
                  filter: isUnlocked ? 'none' : 'grayscale(1)',
                  transition: 'opacity 0.2s ease',
                }}
              >
                <span style={{ fontSize: '22px', lineHeight: 1 }}>{ach.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      lineHeight: 1.3,
                    }}
                  >
                    {ach.title}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      lineHeight: 1.4,
                      marginTop: '2px',
                    }}
                  >
                    {ach.description}
                  </div>
                </div>
                {isUnlocked ? (
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'var(--success)',
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'var(--muted)',
                      flexShrink: 0,
                    }}
                  >
                    🔒
                    </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
