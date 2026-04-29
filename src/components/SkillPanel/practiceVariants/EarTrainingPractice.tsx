import { useState } from 'react'
import { Skill } from '../../../data/chapters'
import { IntervalsPractice } from '../../modules/Intervals/IntervalsPractice'
import { ChordsPractice } from '../../modules/Chords/ChordsPractice'

interface EarTrainingPracticeProps {
  skill: Skill
  onComplete: () => void
}

export function EarTrainingPractice({ skill, onComplete }: EarTrainingPracticeProps) {
  const [completed, setCompleted] = useState(false)

  const handleComplete = () => {
    setCompleted(true)
    onComplete()
  }

  if (completed) return null

  // ch5 skills use interval training, ch6 skills use chord training
  const isIntervals = skill.chapterId === 'ch5'

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
            <p className="lesson-kicker">听力训练</p>
            <p className="lesson-copy">
              {isIntervals
                ? '聆听两个音程并识别它们之间的距离。使用键盘数字键 1-0、-、= 快速作答。'
                : '聆听和弦并识别其类型。使用键盘数字键 1-8 快速作答。'}
            </p>
          </section>
          <div className="ear-training-stage">
            {isIntervals ? (
              <IntervalsPractice onComplete={handleComplete} />
            ) : (
              <ChordsPractice onComplete={handleComplete} />
            )}
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
