import { useState, useCallback, useEffect, useRef } from 'react'
import { ScrollableStaff } from './ScrollableStaff'
import { judgeAccuracy, calculateScore, AccuracyLevel } from '../../../lib/game/accuracy'
import { getBeatInterval } from '../../../lib/music/rhythmInput'

export interface FollowPracticeProps {
  notes: Array<{ number: number; duration?: string }>
  bpm?: number
  onComplete?: (score: number, accuracy: number) => void
}

interface NoteFeedback {
  index: number
  level: AccuracyLevel
  timestamp: number
}

const FEEDBACK_DISPLAY_DURATION = 800

export function FollowPractice({ notes, bpm = 120, onComplete }: FollowPracticeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1)
  const [feedback, setFeedback] = useState<NoteFeedback | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [notesCompleted, setNotesCompleted] = useState(0)

  const startTimeRef = useRef<number | null>(null)
  const completedNotesRef = useRef<Set<number>>(new Set())
  const beatIntervalRef = useRef(getBeatInterval(bpm))

  useEffect(() => {
    beatIntervalRef.current = getBeatInterval(bpm)
    completedNotesRef.current = new Set()
    setCurrentNoteIndex(-1)
    setFeedback(null)
    setTotalScore(0)
    setCombo(0)
    setNotesCompleted(0)
  }, [notes, bpm])

  const getExpectedNoteTime = useCallback((noteIndex: number): number => {
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now()
    }
    return startTimeRef.current + noteIndex * beatIntervalRef.current
  }, [])

  const handleInput = useCallback(() => {
    if (!isPlaying || currentNoteIndex < 0) return
    if (completedNotesRef.current.has(currentNoteIndex)) return
    if (currentNoteIndex >= notes.length) return

    const now = performance.now()
    const expectedTime = getExpectedNoteTime(currentNoteIndex)
    const offset = now - expectedTime
    const result = judgeAccuracy(offset)
    const score = calculateScore(result.level, combo)

    completedNotesRef.current.add(currentNoteIndex)
    setNotesCompleted(previous => previous + 1)
    setTotalScore(previous => previous + score)

    if (result.level !== 'miss') setCombo(previous => previous + 1)
    else setCombo(0)

    setFeedback({ index: currentNoteIndex, level: result.level, timestamp: now })

    setTimeout(() => {
      setFeedback(current => (current?.timestamp === now ? null : current))
    }, FEEDBACK_DISPLAY_DURATION)
  }, [isPlaying, currentNoteIndex, notes.length, combo, getExpectedNoteTime])

  const handleNoteComplete = useCallback((index: number) => {
    if (completedNotesRef.current.has(index)) return

    completedNotesRef.current.add(index)
    setNotesCompleted(previous => previous + 1)
    setCombo(0)
    setFeedback({ index, level: 'miss', timestamp: performance.now() })

    setTimeout(() => {
      setFeedback(current => (current?.index === index ? null : current))
    }, FEEDBACK_DISPLAY_DURATION)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        handleInput()
      }
    }

    if (isPlaying) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, handleInput])

  useEffect(() => {
    if (notesCompleted === notes.length && notes.length > 0) {
      const accuracy = notes.length > 0 ? (notesCompleted / notes.length) * 100 : 0
      onComplete?.(totalScore, accuracy)
      setIsPlaying(false)
    }
  }, [notesCompleted, notes.length, totalScore, onComplete])

  const handleStart = useCallback(() => {
    startTimeRef.current = performance.now()
    completedNotesRef.current = new Set()
    setCurrentNoteIndex(0)
    setIsPlaying(true)
  }, [])

  const handleStop = useCallback(() => {
    setIsPlaying(false)
    startTimeRef.current = null
    completedNotesRef.current = new Set()
  }, [])

  const getFeedbackStyle = (level: AccuracyLevel): React.CSSProperties => {
    switch (level) {
      case 'perfect':
        return { color: 'var(--success)', textShadow: '0 0 12px color-mix(in srgb, var(--success) 55%, transparent)' }
      case 'good':
        return { color: 'var(--warning)', textShadow: '0 0 12px color-mix(in srgb, var(--warning) 50%, transparent)' }
      case 'miss':
      default:
        return { color: 'var(--error)', textShadow: '0 0 12px color-mix(in srgb, var(--error) 45%, transparent)' }
    }
  }

  const getFeedbackText = (level: AccuracyLevel): string => {
    switch (level) {
      case 'perfect':
        return '完美'
      case 'good':
        return '不错'
      case 'miss':
      default:
        return '漏拍'
    }
  }

  return (
    <div className="module-shell module-shell--rhythm" onClick={handleInput}>
      <div className="module-header-row module-header-row--stats">
        <div>
          <div className="eyebrow">节奏跟随</div>
          <h3 className="module-title">在音符经过中心时准确击打</h3>
        </div>
        <div className="module-stats-grid">
          <div className="module-stat-pill">得分 {totalScore}</div>
          <div className="module-stat-pill">连击 {combo}</div>
          <div className="module-stat-pill">进度 {notesCompleted}/{notes.length}</div>
        </div>
      </div>

      <div className="module-scroll-stage">
        <ScrollableStaff
          notes={notes}
          bpm={bpm}
          isPlaying={isPlaying}
          onNoteComplete={handleNoteComplete}
          width={600}
          height={120}
        />
        {feedback && (
          <div className="module-scroll-feedback" style={getFeedbackStyle(feedback.level)}>
            {getFeedbackText(feedback.level)}
          </div>
        )}
      </div>

      <div className="module-actions-row">
        {!isPlaying ? (
          <button onClick={handleStart} className="primary-button">
            {notesCompleted > 0 && notesCompleted < notes.length ? '继续' : '开始'}
          </button>
        ) : (
          <button onClick={handleStop} className="secondary-button module-stop-button">
            停止
          </button>
        )}
      </div>

      <div className="module-caption">
        {isPlaying
          ? '当音符移动到中心线时，按下空格键或直接点击界面。'
          : '点击开始按钮，进入节奏跟随练习。'}
      </div>
    </div>
  )
}

export default FollowPractice
