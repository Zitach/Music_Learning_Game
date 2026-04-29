import { useState } from 'react'
import { Skill } from '../../../data/chapters'
import { ProgressionsPractice as ProgressionsModule } from '../../modules/Progressions/ProgressionsPractice'

interface ProgressionsPracticeProps {
  skill: Skill
  onComplete: () => void
}

export function ProgressionsPractice({ skill, onComplete }: ProgressionsPracticeProps) {
  const [completed, setCompleted] = useState(false)

  const handleComplete = () => {
    setCompleted(true)
    onComplete()
  }

  if (completed) return null

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
            <p className="lesson-kicker">和弦进行训练</p>
            <p className="lesson-copy">聆听和弦进行并识别其模式。使用键盘数字键 1-8 快速作答。</p>
          </section>
          <div className="ear-training-stage">
            <ProgressionsModule onComplete={handleComplete} />
          </div>
        </div>
        <div className="lesson-actions" style={{ marginTop: '24px' }}>
          <button className="primary-button" onClick={handleComplete}>
            完成练习 →
          </button>
        </div>
        <p className="lesson-footnote">练习模式不会扣除生命值，你可以放心尝试。完成后点击上方按钮继续。</p>
      </div>
    </div>
  )
}
