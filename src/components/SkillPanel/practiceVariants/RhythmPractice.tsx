import { Skill } from '../../../data/chapters'
import { FollowPractice } from '../../modules/Rhythm/FollowPractice'

interface RhythmPracticeProps {
  skill: Skill
  onComplete: () => void
}

function getRhythmNotesForSkill(skillId: string): Array<{ number: number; duration?: string }> {
  // Generate different rhythm patterns based on skill
  switch (skillId) {
    case 'ch2-s1': // 音符时值 — basic quarter notes
      return [
        { number: 1 }, { number: 2 }, { number: 3 }, { number: 4 },
        { number: 1 }, { number: 2 }, { number: 3 }, { number: 4 },
      ]
    case 'ch2-s2': // 休止符 — pattern with varied durations
      return [
        { number: 1 }, { number: 2 }, { number: 3 }, { number: 4 },
        { number: 5 }, { number: 6 }, { number: 5 }, { number: 4 },
        { number: 3 }, { number: 2 }, { number: 1 }, { number: 1 },
      ]
    case 'ch2-s3': // 常见拍号 — varied pattern
      return [
        { number: 1 }, { number: 3 }, { number: 1 }, { number: 3 },
        { number: 5 }, { number: 3 }, { number: 1 }, { number: 1 },
        { number: 3 }, { number: 5 }, { number: 3 }, { number: 1 },
      ]
    case 'ch2-s4': // 打拍子 — mixed pattern
      return [
        { number: 1 }, { number: 1 }, { number: 2 }, { number: 1 },
        { number: 3 }, { number: 1 }, { number: 2 }, { number: 1 },
        { number: 4 }, { number: 3 }, { number: 2 }, { number: 1 },
        { number: 5 }, { number: 5 }, { number: 1 }, { number: 1 },
      ]
    default:
      return [
        { number: 1 }, { number: 2 }, { number: 3 }, { number: 4 },
        { number: 1 }, { number: 2 }, { number: 3 }, { number: 4 },
      ]
  }
}

export function RhythmPractice({ skill, onComplete }: RhythmPracticeProps) {
  const notes = getRhythmNotesForSkill(skill.id)

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
            <p className="lesson-kicker">节奏跟随</p>
            <p className="lesson-copy">当音符移动到中心线时，按下空格键或点击界面进行击打。</p>
          </section>
          <FollowPractice
            notes={notes}
            bpm={120}
            onComplete={(_score, _accuracy) => {
              onComplete()
            }}
          />
        </div>
        <p className="lesson-footnote">练习模式不会扣除生命值，你可以放心尝试。</p>
      </div>
    </div>
  )
}
