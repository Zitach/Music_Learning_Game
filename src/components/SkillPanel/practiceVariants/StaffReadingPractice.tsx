import { Skill } from '../../../data/chapters'
import { StaffPractice } from '../../modules/Staff/StaffPractice'

interface StaffReadingPracticeProps {
  skill: Skill
  onComplete: () => void
}

function getStaffNotesForSkill(skillId: string): Array<{ note: string; duration: number }> {
  switch (skillId) {
    case 'ch3-s1': // 简谱基础 — simple C major scale notes
      return [
        { note: 'C4', duration: 1 },
        { note: 'D4', duration: 1 },
        { note: 'E4', duration: 1 },
        { note: 'F4', duration: 1 },
        { note: 'G4', duration: 1 },
      ]
    case 'ch3-s2': // 五线谱入门 — wider range with accidentals
      return [
        { note: 'C4', duration: 1 },
        { note: 'D4', duration: 1 },
        { note: 'E4', duration: 1 },
        { note: 'F4', duration: 1 },
        { note: 'G4', duration: 1 },
        { note: 'A4', duration: 1 },
        { note: 'B4', duration: 1 },
        { note: 'C5', duration: 1 },
      ]
    default:
      return [
        { note: 'C4', duration: 1 },
        { note: 'D4', duration: 1 },
        { note: 'E4', duration: 1 },
        { note: 'F4', duration: 1 },
        { note: 'G4', duration: 1 },
      ]
  }
}

export function StaffReadingPractice({ skill, onComplete }: StaffReadingPracticeProps) {
  const notes = getStaffNotesForSkill(skill.id)

  return (
    <div className="lesson-stage fade-up">
      <div className="lesson-shell floating-panel">
        <div className="lesson-topbar">
          <div>
            <div className="eyebrow">练习</div>
            <h2 className="lesson-title">{skill.title}</h2>
          </div>
        </div>
        <div className="lesson-main">
          <section className="lesson-card">
            <p className="lesson-kicker">识谱训练</p>
            <p className="lesson-copy">看谱并按下键盘上对应的音名按键。A-J 为白键，W/E/T/Y/U 为黑键。</p>
          </section>
          <StaffPractice
            notes={notes}
            onComplete={() => onComplete()}
          />
        </div>
        <p className="lesson-footnote">练习模式不会扣除生命值，你可以放心尝试。</p>
      </div>
    </div>
  )
}
