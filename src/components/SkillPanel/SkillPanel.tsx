import { useState } from 'react'
import { CHAPTERS } from '../../data/chapters'
import { useProgressStore } from '../../stores/progressStore'
import { getCompletedSkills } from '../../domain/progress/progressSelectors'
import { LearnView } from './LearnView'
import { AssessView } from './AssessView'
import { NoteNamesPractice } from './practiceVariants/NoteNamesPractice'
import { EarTrainingPractice } from './practiceVariants/EarTrainingPractice'
import { RhythmPractice } from './practiceVariants/RhythmPractice'
import { StaffReadingPractice } from './practiceVariants/StaffReadingPractice'
import { ScalesPractice } from './practiceVariants/ScalesPractice'
import { ProgressionsPractice } from './practiceVariants/ProgressionsPractice'

type SkillPhase = 'list' | 'step'

interface SkillPanelProps {
  chapterId: string
  onBack: () => void
}

export function SkillPanel({ chapterId, onBack }: SkillPanelProps) {
  const chapter = CHAPTERS.find(c => c.id === chapterId)!
  const skillProgress = useProgressStore(s => s.skillProgress)
  const isSkillUnlocked = useProgressStore(s => s.isSkillUnlocked)
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null)
  const [phase, setPhase] = useState<SkillPhase>('list')
  const [stepIndex, setStepIndex] = useState(0)

  const handleSkillClick = (skillId: string) => {
    if (!isSkillUnlocked(skillId)) return
    setCurrentSkillId(skillId)
    setStepIndex(0)
    setPhase('step')
  }

  function renderPracticeVariant(skill: typeof chapter.skills[0]) {
    const variant = skill.practiceVariant ?? 'note-names'
    switch (variant) {
      case 'note-names':
        return <NoteNamesPractice skill={skill} onComplete={handleStepComplete} />
      case 'ear-training':
        return <EarTrainingPractice skill={skill} onComplete={handleStepComplete} />
      case 'rhythm':
        return <RhythmPractice skill={skill} onComplete={handleStepComplete} />
      case 'staff-reading':
        return <StaffReadingPractice skill={skill} onComplete={handleStepComplete} />
      case 'scales':
        return <ScalesPractice skill={skill} onComplete={handleStepComplete} />
      case 'progressions':
        return <ProgressionsPractice skill={skill} onComplete={handleStepComplete} />
      default:
        return <NoteNamesPractice skill={skill} onComplete={handleStepComplete} />
    }
  }

  const handleStepComplete = () => {
    const skill = chapter.skills.find(item => item.id === currentSkillId)
    if (!skill) return
    if (stepIndex < skill.flow.length - 1) {
      setStepIndex(index => index + 1)
      return
    }
    setPhase('list')
    setCurrentSkillId(null)
    setStepIndex(0)
  }

  if (phase === 'step' && currentSkillId) {
    const skill = chapter.skills.find(item => item.id === currentSkillId)!
    const step = skill.flow[stepIndex]
    if (step.type === 'learn') return <LearnView skill={skill} onComplete={handleStepComplete} />
    if (step.type === 'practice') return renderPracticeVariant(skill)
    return <AssessView skill={skill} onComplete={handleStepComplete} />
  }

  const completedSkills = getCompletedSkills(chapter, skillProgress)

  return (
    <div className="chapter-page fade-up">
      <div className="chapter-backdrop" />
      <header className="chapter-header">
        <button className="secondary-button chapter-back-button" onClick={onBack}>← 返回地图</button>
        <div className="chapter-header-copy">
          <div className="eyebrow">章节舞台</div>
          <h1>{chapter.emoji} {chapter.title}</h1>
          <p>沿着课程路径逐步推进，完成每个技能节点，继续深入这一章节。</p>
        </div>
        <div className="chapter-progress-summary"><span role="progressbar" aria-valuenow={completedSkills} aria-valuemin={0} aria-valuemax={chapter.skills.length}>已完成 {completedSkills}/{chapter.skills.length}</span></div>
      </header>
      <section className="chapter-grid">
        <div className="chapter-intro floating-panel">
          <div className="chapter-intro-copy">
            <div className="eyebrow">学习路线</div>
            <h2>选择下一项要挑战的技能。</h2>
            <p>先学习，再练习，最后通过考核，逐步解锁章节中的下一段内容。</p>
          </div>
          <div className="chapter-meter"><div className="chapter-meter-track"><div className="chapter-meter-fill" style={{ width: `${(completedSkills / chapter.skills.length) * 100}%`, background: chapter.color }} /></div></div>
        </div>
        <div className="chapter-timeline floating-panel">
          <div className="chapter-timeline-line" style={{ background: `linear-gradient(180deg, ${chapter.color}, var(--line))` }} />
          {chapter.skills.map(skill => {
            const progress = skillProgress[skill.id]
            const unlocked = isSkillUnlocked(skill.id)
            const completed = progress?.status === 'completed'
            const stars = progress?.stars ?? 0
            return (
              <button key={skill.id} type="button" className={`chapter-node${unlocked ? ' is-unlocked' : ''}${completed ? ' is-complete' : ''}`} onClick={() => handleSkillClick(skill.id)} disabled={!unlocked} style={{ ['--chapter-accent' as string]: chapter.color }}>
                <span className="chapter-node-dot">{completed ? '✓' : unlocked ? skill.title.slice(0, 1) : '🔒'}</span>
                <span className="chapter-node-copy">
                  <strong>{skill.title}</strong>
                  <small>{skill.description}</small>
                  <em>{completed ? `★`.repeat(stars || 1) : unlocked ? '可以开始' : '尚未解锁'}</em>
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
