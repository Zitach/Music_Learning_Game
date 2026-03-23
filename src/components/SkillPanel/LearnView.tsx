import { useState, useEffect } from 'react'
import { Skill } from '../../data/chapters'
import { PianoCanvas } from '../Canvas/PianoCanvas'
import { useProgressStore } from '../../stores/progressStore'
import { getLessonContent } from '../../data/lessonContent'

interface LearnViewProps {
  skill: Skill
  onComplete: () => void
}

export function LearnView({ skill, onComplete }: LearnViewProps) {
  const content = getLessonContent(skill.id) ?? {
    skillId: skill.id,
    title: skill.title,
    steps: [{ text: skill.description }],
  }
  const [step, setStep] = useState(0)
  const incrementPractice = useProgressStore(state => state.incrementPractice)

  useEffect(() => {
    incrementPractice(skill.id)
  }, [skill.id, incrementPractice])

  const currentStep = content.steps[step]
  const isLast = step === content.steps.length - 1

  return (
    <div className="lesson-stage fade-up">
      <div className="lesson-shell floating-panel">
        <div className="lesson-topbar">
          <div>
            <div className="eyebrow">学习</div>
            <h2 className="lesson-title">{content.title}</h2>
          </div>
          <div className="lesson-counter">{step + 1} / {content.steps.length}</div>
        </div>

        <div className="lesson-dots">
          {content.steps.map((_, index) => (
            <span key={index} className={`lesson-dot${index === step ? ' is-current' : index < step ? ' is-complete' : ''}`} />
          ))}
        </div>

        <div className="lesson-main">
          <section className="lesson-card">
            <p className="lesson-kicker">知识要点</p>
            <p className="lesson-copy">{currentStep.text}</p>
          </section>

          <div className="lesson-piano-wrap">
            <PianoCanvas key={`learn-${skill.id}-${step}`} initialHighlight={currentStep.note} />
          </div>
        </div>

        <div className="lesson-actions">
          <button className="primary-button" onClick={() => (isLast ? onComplete() : setStep(value => value + 1))}>
            {isLast ? '开始练习 →' : '下一条 →'}
          </button>
        </div>
      </div>
    </div>
  )
}
