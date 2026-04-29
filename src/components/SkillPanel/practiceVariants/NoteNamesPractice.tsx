import { useMemo } from 'react'
import { Skill } from '../../../data/chapters'
import { PianoCanvas } from '../../Canvas/PianoCanvas'
import { getShuffledQuestionsForSkill } from '../../../data/questionBank'
import { useQuestionSession } from '../../../features/practice/useQuestionSession'

interface NoteNamesPracticeProps {
  skill: Skill
  onComplete: () => void
}

export function NoteNamesPractice({ skill, onComplete }: NoteNamesPracticeProps) {
  const tasks = useMemo(() => getShuffledQuestionsForSkill(skill.id, 'practice'), [skill.id])
  const session = useQuestionSession({ questions: tasks, onComplete: () => onComplete(), successDelay: 700, errorDelay: 1500 })
  const currentTask = session.currentQuestion

  if (!currentTask) {
    return (
      <div className="lesson-stage fade-up">
        <div className="lesson-shell floating-panel">
          <p className="lesson-copy">当前技能还没有配置练习题。</p>
        </div>
      </div>
    )
  }

  const hint = session.feedback === 'wrong'
    ? currentTask.explanation ?? (currentTask.type === 'choice' ? `提示：正确答案是 ${currentTask.answer}。` : `提示：试试 ${currentTask.answer}。`)
    : ''

  return (
    <div className="lesson-stage fade-up">
      <div className="lesson-shell floating-panel">
        <div className="lesson-topbar">
          <div>
            <div className="eyebrow">练习</div>
            <h2 className="lesson-title">{skill.title}</h2>
          </div>
          <div className="lesson-counter">{session.index + 1} / {session.total}</div>
        </div>
        <div className="lesson-dots">
          {Array.from({ length: session.total }, (_, index) => (
            <span key={index} className={`lesson-dot${index === session.index ? ' is-current' : index < session.index || (index === session.index && session.feedback === 'correct') ? ' is-complete' : ''}`} />
          ))}
        </div>
        <div className="lesson-main">
          <section className={`lesson-card${session.feedback ? ` is-${session.feedback}` : ''}`}>
            <p className="lesson-kicker">当前任务</p>
            <p className="lesson-copy">{currentTask.prompt}</p>
            {session.feedback === 'correct' && <p className="lesson-feedback is-correct">回答正确。</p>}
            {session.feedback === 'wrong' && <p className="lesson-feedback is-wrong">{hint}</p>}
          </section>
          {currentTask.type === 'choice' && currentTask.options && (
            <div className="assessment-options">
              {currentTask.options.map(option => {
                const selected = session.selectedChoice === option
                const className = selected
                  ? option === currentTask.answer
                    ? 'assessment-option is-correct'
                    : 'assessment-option is-wrong'
                  : 'assessment-option'
                return (
                  <button key={option} className={className} onClick={() => session.submitChoice(option)} disabled={!!session.feedback || !!session.selectedChoice}>
                    {option}
                  </button>
                )
              })}
            </div>
          )}
          {currentTask.type === 'piano' && (
            <div className="lesson-piano-wrap">
              <PianoCanvas onKeyPress={session.submitPiano} />
            </div>
          )}
        </div>
        <p className="lesson-footnote">练习模式不会扣除生命值，你可以放心尝试。</p>
      </div>
    </div>
  )
}
