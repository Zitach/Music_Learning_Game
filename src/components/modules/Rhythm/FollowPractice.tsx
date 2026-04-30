import { useState, useCallback, useEffect, useRef } from 'react'
import { ScrollableStaff, type TimeSignature } from './ScrollableStaff'
import { judgeAccuracy, calculateScore, AccuracyLevel } from '../../../lib/game/accuracy'
import { getBeatInterval } from '../../../lib/music/rhythmInput'
import {
  type RhythmNote,
  getCurrentNoteIndex,
  getExpectedNoteTimeMs,
  getCumulativeBeatOffsets,
  isRestNote,
  getPlayableNoteIndices,
} from '../../../lib/music/noteTiming'

export interface FollowPracticeProps {
  notes: RhythmNote[]
  bpm?: number
  timeSignature?: TimeSignature
  onComplete?: (score: number, accuracy: number) => void
}

interface NoteFeedback {
  index: number
  level: AccuracyLevel
  timestamp: number
}

const FEEDBACK_DISPLAY_DURATION = 800

export function FollowPractice({ notes, bpm = 120, timeSignature, onComplete }: FollowPracticeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [feedback, setFeedback] = useState<NoteFeedback | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [notesCompleted, setNotesCompleted] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const completedNotesRef = useRef<Set<number>>(new Set())
  const beatIntervalRef = useRef(getBeatInterval(bpm))
  const cumulativeBeatOffsetsRef = useRef<number[]>([])
  const playableNoteIndicesRef = useRef<number[]>([])
  const hitQualityRef = useRef({ perfect: 0, good: 0, miss: 0 })
  const maxComboRef = useRef(0)
  const comboRef = useRef(0)
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  useEffect(() => {
    beatIntervalRef.current = getBeatInterval(bpm)
    cumulativeBeatOffsetsRef.current = getCumulativeBeatOffsets(notes)
    playableNoteIndicesRef.current = getPlayableNoteIndices(notes)
    completedNotesRef.current = new Set()
    hitQualityRef.current = { perfect: 0, good: 0, miss: 0 }
    maxComboRef.current = 0
    comboRef.current = 0
    setFeedback(null)
    setTotalScore(0)
    setCombo(0)
    setNotesCompleted(0)
    setShowResult(false)
  }, [notes, bpm])

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current
    return () => {
      timeoutIds.forEach(id => clearTimeout(id))
      timeoutIds.clear()
    }
  }, [])

  const scheduleFeedbackClear = useCallback((timestamp: number) => {
    const timeoutId = setTimeout(() => {
      timeoutIdsRef.current.delete(timeoutId)
      setFeedback(current => (current?.timestamp === timestamp ? null : current))
    }, FEEDBACK_DISPLAY_DURATION)
    timeoutIdsRef.current.add(timeoutId)
  }, [])

  const getCurrentNote = useCallback((): number => {
    if (startTimeRef.current === null) return -1
    const elapsed = performance.now() - startTimeRef.current
    return getCurrentNoteIndex(elapsed, beatIntervalRef.current, cumulativeBeatOffsetsRef.current)
  }, [])

  const getExpectedNoteTime = useCallback((noteIndex: number): number => {
    if (startTimeRef.current === null) return -1
    const elapsedOffset = getExpectedNoteTimeMs(noteIndex, beatIntervalRef.current, cumulativeBeatOffsetsRef.current)
    return startTimeRef.current + elapsedOffset
  }, [])

  const handleInput = useCallback(() => {
    if (!isPlaying) return

    const currentNoteIndex = getCurrentNote()
    if (currentNoteIndex < 0 || currentNoteIndex >= notes.length) return
    if (completedNotesRef.current.has(currentNoteIndex)) return

    if (isRestNote(notes[currentNoteIndex])) return

    // Prevent double-tap: skip if this note was already completed
    if (completedNotesRef.current.has(currentNoteIndex)) return

    const now = performance.now()
    const expectedTime = getExpectedNoteTime(currentNoteIndex)
    if (expectedTime < 0) return
    const offset = now - expectedTime
    const result = judgeAccuracy(offset)
    const score = calculateScore(result.level, comboRef.current)

    completedNotesRef.current.add(currentNoteIndex)
    setNotesCompleted(previous => previous + 1)
    setTotalScore(previous => previous + score)

    if (result.level !== 'miss') {
      comboRef.current += 1
      setCombo(comboRef.current)
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current
      }
    } else {
      comboRef.current = 0
      setCombo(0)
    }

    hitQualityRef.current[result.level] += 1

    setFeedback({ index: currentNoteIndex, level: result.level, timestamp: now })
    scheduleFeedbackClear(now)
  }, [isPlaying, notes, getCurrentNote, getExpectedNoteTime, scheduleFeedbackClear])


  const handleNoteComplete = useCallback((index: number) => {
    if (completedNotesRef.current.has(index)) return
    if (index < 0 || index >= notes.length) return

    completedNotesRef.current.add(index)

    if (isRestNote(notes[index])) {
      setNotesCompleted(previous => previous + 1)
      return
    }

    comboRef.current = 0
    setCombo(0)
    hitQualityRef.current.miss += 1

    const now = performance.now()
    setFeedback({ index, level: 'miss', timestamp: now })
    scheduleFeedbackClear(now)
    setNotesCompleted(previous => previous + 1)
  }, [notes, scheduleFeedbackClear])

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
      setShowResult(true)
      setIsPlaying(false)
    }
  }, [notesCompleted, notes.length])

  const handleStart = useCallback(() => {
    startTimeRef.current = performance.now()
    completedNotesRef.current = new Set()
    hitQualityRef.current = { perfect: 0, good: 0, miss: 0 }
    maxComboRef.current = 0
    comboRef.current = 0
    cumulativeBeatOffsetsRef.current = getCumulativeBeatOffsets(notes)
    playableNoteIndicesRef.current = getPlayableNoteIndices(notes)
    setTotalScore(0)
    setCombo(0)
    setNotesCompleted(0)
    setShowResult(false)
    setIsPlaying(true)

    // Auto-complete leading rest notes without penalizing the player
    const firstPlayableIndex = playableNoteIndicesRef.current[0]
    if (firstPlayableIndex !== undefined && firstPlayableIndex > 0) {
      for (let i = 0; i < firstPlayableIndex; i++) {
        if (isRestNote(notes[i])) {
          completedNotesRef.current.add(i)
          setNotesCompleted(prev => prev + 1)
        }
      }
    }
  }, [notes])

  const handleStop = useCallback(() => {
    setIsPlaying(false)
    startTimeRef.current = null
    completedNotesRef.current = new Set()
    timeoutIdsRef.current.forEach(id => clearTimeout(id))
    timeoutIdsRef.current.clear()
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
    <div className="module-shell module-shell--rhythm" onClick={handleInput} style={{ position: 'relative' }}>
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
          timeSignature={timeSignature}
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
          <button
            onClick={handleStart}
            className="primary-button"
            disabled={notes.length === 0}
          >
            {showResult ? '再来一次' : notesCompleted > 0 && notesCompleted < notes.length ? '继续' : '开始'}
          </button>
        ) : (
          <button onClick={handleStop} className="secondary-button module-stop-button">
            停止
          </button>
        )}
      </div>

      {showResult && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: 'var(--panel-bg, #fff)',
              borderRadius: 18,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: '32px 40px',
              textAlign: 'center',
              minWidth: 280,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700 }}>练习完成！</h2>

            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{totalScore}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary, #888)', marginBottom: 16 }}>得分</div>

            {(() => {
              const playableCount = playableNoteIndicesRef.current.length
              const { perfect, good } = hitQualityRef.current
              const accuracy = playableCount > 0 ? Math.round(((perfect + good) / playableCount) * 100) : 0
              return (
                <>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{accuracy}%</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary, #888)', marginBottom: 16 }}>准确率</div>
                </>
              )
            })()}

            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              最大连击: {maxComboRef.current}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              <span style={{ color: 'var(--success)' }}>完美: {hitQualityRef.current.perfect}</span>
              <span style={{ color: 'var(--warning)' }}>不错: {hitQualityRef.current.good}</span>
              <span style={{ color: 'var(--error)' }}>漏拍: {hitQualityRef.current.miss}</span>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                const playableCount = playableNoteIndicesRef.current.length
                const { perfect, good } = hitQualityRef.current
                const accuracy = playableCount > 0 ? Math.round(((perfect + good) / playableCount) * 100) : 0
                onComplete?.(totalScore, accuracy)
              }}
            >
              继续
            </button>
          </div>
        </div>
      )}

      <div className="module-caption">
        {isPlaying
          ? '当音符移动到中心线时，按下空格键或直接点击界面。'
          : '点击开始按钮，进入节奏跟随练习。'}
      </div>
    </div>
  )
}

export default FollowPractice
