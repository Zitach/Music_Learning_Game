import { Skill } from '../../../data/chapters'
import { RhythmNote } from '../../../lib/music/noteTiming'
import { FollowPractice } from '../../modules/Rhythm/FollowPractice'

interface RhythmPracticeProps {
  skill: Skill
  onComplete: () => void
}

function getRhythmNotesForSkill(skillId: string): RhythmNote[] {
  // Generate different rhythm patterns based on skill
  switch (skillId) {
    case 'ch2-s1': // 音符时值 — basic quarter notes
      return [
        { number: 1, duration: 'quarter' },
        { number: 2, duration: 'quarter' },
        { number: 3, duration: 'quarter' },
        { number: 4, duration: 'quarter' },
        { number: 1, duration: 'quarter' },
        { number: 2, duration: 'quarter' },
        { number: 3, duration: 'half' },
        { number: 4, duration: 'quarter' },
      ]
    case 'ch2-s2': // 休止符 — pattern with rests
      return [
        { number: 1, duration: 'quarter' },
        { number: 2, duration: 'quarter', isRest: true },
        { number: 3, duration: 'quarter' },
        { number: 4, duration: 'quarter' },
        { number: 5, duration: 'quarter', isRest: true },
        { number: 6, duration: 'quarter' },
        { number: 5, duration: 'half' },
        { number: 4, duration: 'quarter', isRest: true },
      ]
    case 'ch2-s3': // 常见拍号 — varied durations in 3/4
      return [
        { number: 1, duration: 'quarter' },
        { number: 3, duration: 'quarter' },
        { number: 5, duration: 'quarter' },
        { number: 3, duration: 'quarter' },
        { number: 1, duration: 'half' },
        { number: 3, duration: 'quarter' },
        { number: 5, duration: 'quarter' },
        { number: 1, duration: 'half' },
      ]
    case 'ch2-s4': // 打拍子 — mixed eighth and quarter notes
      return [
        { number: 1, duration: 'eighth' },
        { number: 1, duration: 'eighth' },
        { number: 2, duration: 'quarter' },
        { number: 1, duration: 'quarter' },
        { number: 3, duration: 'eighth' },
        { number: 1, duration: 'eighth' },
        { number: 2, duration: 'quarter' },
        { number: 1, duration: 'quarter' },
        { number: 4, duration: 'half' },
        { number: 3, duration: 'quarter' },
      ]
    default:
      return [
        { number: 1, duration: 'quarter' },
        { number: 2, duration: 'quarter' },
        { number: 3, duration: 'quarter' },
        { number: 4, duration: 'quarter' },
        { number: 1, duration: 'quarter' },
        { number: 2, duration: 'quarter' },
        { number: 3, duration: 'half' },
        { number: 4, duration: 'quarter' },
      ]
  }
}

export function RhythmPractice({ skill, onComplete }: RhythmPracticeProps) {
  const notes = getRhythmNotesForSkill(skill.id)

  const timeSignature = skill.id === 'ch2-s3' ? { top: 3, bottom: 4 } : undefined

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
            timeSignature={timeSignature}
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
