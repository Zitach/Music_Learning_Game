import { Skill } from '../../../data/chapters'
import { ScalesPractice as ScalesModule } from '../../modules/Scales/ScalesPractice'

interface ScalesPracticeProps {
  skill: Skill
  onComplete: () => void
}

export function ScalesPractice({ skill, onComplete }: ScalesPracticeProps) {
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
            <p className="lesson-kicker">音阶训练</p>
            <p className="lesson-copy">按顺序弹奏音阶中的每个音。使用键盘 A-J 为白键，W/E/T/Y/U 为黑键。</p>
          </section>
          <ScalesModule onComplete={() => onComplete()} />
        </div>
        <p className="lesson-footnote">练习模式不会扣除生命值，你可以放心尝试。</p>
      </div>
    </div>
  )
}
