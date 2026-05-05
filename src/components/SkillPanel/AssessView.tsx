import { useMemo, useRef, useEffect, useState } from 'react'
import { Skill, getNextSkill } from '../../data/chapters'
import { PianoCanvas } from '../Canvas/PianoCanvas'
import { useProgressStore } from '../../stores/progressStore'
import { usePlayerStore } from '../../stores/playerStore'
import { getShuffledQuestionsForSkill } from '../../data/questionBank'
import { useQuestionSession } from '../../features/practice/useQuestionSession'
import { useGameStore } from '../../lib/stores/gameStore'
import { audioEngine } from '../../lib/audio/Engine'
import { useEffects } from '../Effects/EffectsProvider'
import { checkAchievements } from '../../domain/achievements/achievementChecker'
import { ACHIEVEMENTS } from '../../domain/achievements/achievements'
import { CHAPTERS } from '../../data/chapters'

interface AssessViewProps {
  skill: Skill
  onComplete: (stars: number) => void
}

export function AssessView({ skill, onComplete }: AssessViewProps) {
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const completeSkill = useProgressStore(state => state.completeSkill)
  const unlockSkill = useProgressStore(state => state.unlockSkill)
  const unlockAchievement = useProgressStore(state => state.unlockAchievement)
  const skillProgress = useProgressStore(state => state.skillProgress)
  const achievements = useProgressStore(state => state.achievements)
  const addXP = usePlayerStore(state => state.addXP)
  const loseLife = usePlayerStore(state => state.loseLife)
  const healLife = usePlayerStore(state => state.healLife)
  const level = usePlayerStore(state => state.level)
  const xp = usePlayerStore(state => state.xp)
  const lives = usePlayerStore(state => state.lives)
  const maxLives = usePlayerStore(state => state.maxLives)
  const resetGame = useGameStore(state => state.resetGame)
  const combo = useGameStore(state => state.combo)
  const questions = useMemo(() => getShuffledQuestionsForSkill(skill.id, 'assessment'), [skill.id])
  const prevLivesRef = useRef(lives)
  const effects = useEffects()

  const session = useQuestionSession({
    questions,
    successDelay: 1000,
    errorDelay: 1200,
    onAnswer: isCorrect => {
      if (!isCorrect) loseLife()
    },
    onComplete: (correctCount, total) => {
      const stars = Math.min(3, Math.ceil((correctCount / total) * 3))
      completeSkill(skill.id, stars)
      addXP(stars * 20)
      const next = getNextSkill(skill.id)
      if (next) unlockSkill(next.id)
      if (stars >= 1 && lives < maxLives) healLife()
      resetGame()
      setResult({ correct: correctCount, total })

      // Check for new achievements
      const newAchs = checkAchievements(
        { level, xp },
        { skillProgress: { ...skillProgress, [skill.id]: { status: 'completed', stars } }, achievements },
        { combo },
        CHAPTERS
      )
      for (const id of newAchs) {
        unlockAchievement(id)
      }
      if (newAchs.length > 0) {
        setNewAchievements(newAchs)
      }
    },
  })

  // Audio feedback on correct/wrong
  useEffect(() => {
    if (session.feedback === 'correct') {
      audioEngine.playAnswerCorrect()
    } else if (session.feedback === 'wrong') {
      audioEngine.playAnswerWrong()
      effects.triggerShake(4)
    }
  }, [session.feedback, effects])

  // Low lives warning
  useEffect(() => {
    if (lives <= 1 && lives < prevLivesRef.current) {
      audioEngine.playLowLives()
    }
    prevLivesRef.current = lives
  }, [lives])

  // Skill complete celebration
  useEffect(() => {
    if (result) {
      const stars = Math.min(3, Math.ceil((result.correct / result.total) * 3))
      if (stars >= 1) {
        audioEngine.playChapterComplete()
        effects.triggerParticles('skillComplete')
      }
    }
    return () => {
      audioEngine.fadeOutAll(0.25)
    }
  }, [result, effects])

  if (questions.length === 0) {
    return <div className="lesson-stage fade-up"><div className="lesson-shell floating-panel"><section className="lesson-card"><p className="lesson-copy">当前技能尚未配置考核题，请先补齐题库数据。</p></section></div></div>
  }

  if (result) {
    const stars = Math.min(3, Math.ceil((result.correct / result.total) * 3))
    const passed = stars >= 1
    return (
      <div className="lesson-stage fade-up">
        <div className="result-overlay">
          <div className="result-panel floating-panel">
            <div className="result-emoji">{passed ? '🏆' : '🫠'}</div>
            <h2>{passed ? '技能已解锁' : '再试一次'}</h2>
            <div className="result-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
            <p>本次答对 {result.correct} / {result.total} 题。</p>
            {newAchievements.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {newAchievements.map(id => {
                  const a = ACHIEVEMENTS.find(a => a.id === id)
                  return a ? <p key={id} style={{ color: 'var(--gold)', fontSize: 14 }}>{a.icon} 成就解锁：{a.title}</p> : null
                })}
              </div>
            )}
            <button className="primary-button" onClick={() => onComplete(stars)}>{passed ? '返回章节 →' : '重新考核 →'}</button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = session.currentQuestion
  if (!currentQ) {
    return (
      <div className="lesson-stage fade-up">
        <div className="lesson-shell floating-panel">
          <p className="lesson-copy">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-stage fade-up">
      <div className="lesson-shell floating-panel">
        <div className="lesson-topbar">
          <div>
            <div className="eyebrow">考核</div>
            <h2 className="lesson-title">{skill.title}</h2>
          </div>
          <div className="lesson-counter">{session.index + 1} / {session.total}</div>
        </div>
        <div className="assessment-status">
          <span className="assessment-lives">❤️ {lives}</span>
          <span className="assessment-caption">通过考核后即可解锁下一项技能。</span>
        </div>
        <div className="lesson-main">
          <section className={`lesson-card${session.feedback ? ` is-${session.feedback}` : ''}`}>
            <p className="lesson-kicker">最终检查</p>
            <p className="lesson-copy">{currentQ.prompt}</p>
          </section>
          {currentQ.type === 'choice' && currentQ.options && (
            <div className="assessment-options">
              {currentQ.options.map(option => {
                const selected = session.selectedChoice === option
                const className = selected ? option === currentQ.answer ? 'assessment-option is-correct' : 'assessment-option is-wrong' : 'assessment-option'
                return <button key={option} className={className} onClick={() => session.submitChoice(option)} disabled={!!session.feedback || !!session.selectedChoice}>{option}</button>
              })}
            </div>
          )}
          {currentQ.type === 'piano' && <div className="lesson-piano-wrap"><PianoCanvas onKeyPress={session.submitPiano} /></div>}
        </div>
        <p className="lesson-footnote">答错会扣除一颗生命值，请认真判断再作答。</p>
      </div>
    </div>
  )
}
