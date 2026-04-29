import { useCallback, useEffect, useState } from 'react'
import { useGameStore } from '../../../lib/stores/gameStore'
import { audioEngine } from '../../../lib/audio/Engine'

const INTERVALS = [
  { name: 'Minor 2nd', semitones: 1 },
  { name: 'Major 2nd', semitones: 2 },
  { name: 'Minor 3rd', semitones: 3 },
  { name: 'Major 3rd', semitones: 4 },
  { name: 'Perfect 4th', semitones: 5 },
  { name: 'Tritone', semitones: 6 },
  { name: 'Perfect 5th', semitones: 7 },
  { name: 'Minor 6th', semitones: 8 },
  { name: 'Major 6th', semitones: 9 },
  { name: 'Minor 7th', semitones: 10 },
  { name: 'Major 7th', semitones: 11 },
  { name: 'Octave', semitones: 12 }
]

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

interface IntervalsPracticeProps {
  onComplete: () => void
}

export function IntervalsPractice(_props: IntervalsPracticeProps) {
  const [rootNote, setRootNote] = useState('')
  const [targetInterval, setTargetInterval] = useState<typeof INTERVALS[0] | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hasPlayedFirst, setHasPlayedFirst] = useState(false)
  const { recordHit, recordMiss } = useGameStore()

  // Ensure audio engine is loaded
  useEffect(() => {
    audioEngine.load()
  }, [])

  // Generate new interval question
  const generateQuestion = useCallback(() => {
    const rootIndex = Math.floor(Math.random() * 12)
    const intervalIndex = Math.floor(Math.random() * INTERVALS.length)
    setRootNote(NOTE_NAMES[rootIndex])
    setTargetInterval(INTERVALS[intervalIndex])
    setHasPlayedFirst(false)
    setFeedback(null)
  }, [])

  useEffect(() => {
    generateQuestion()
  }, [generateQuestion])

  // Play first note (root only)
  const playFirstNote = () => {
    if (!rootNote) return
    audioEngine.playNote(rootNote + '4', '8n')
    setHasPlayedFirst(true)
  }

  // Play second note (the interval note above root)
  const playSecondNote = () => {
    if (!targetInterval || !rootNote) return
    const rootIndex = NOTE_NAMES.indexOf(rootNote)
    const secondNoteIndex = (rootIndex + targetInterval.semitones) % 12
    const secondNote = NOTE_NAMES[secondNoteIndex]
    const octave = rootIndex + targetInterval.semitones >= 12 ? 5 : 4
    audioEngine.playNote(secondNote + octave, '8n')
  }

  // Handle interval selection
  const handleIntervalSelect = (interval: typeof INTERVALS[0]) => {
    if (!targetInterval || feedback) return

    if (interval.semitones === targetInterval.semitones) {
      setFeedback('correct')
      recordHit()
      setTimeout(() => {
        generateQuestion()
      }, 1000)
    } else {
      setFeedback('wrong')
      recordMiss()
      setTimeout(() => setFeedback(null), 500)
    }
  }

  // Keyboard shortcuts for intervals (1-9, 0, -, = for 12 intervals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return
      const keyMap: Record<string, number> = {
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4,
        '6': 5, '7': 6, '8': 7, '9': 8, '0': 9,
        '-': 10, '=': 11
      }
      const index = keyMap[e.key]
      if (index !== undefined) {
        handleIntervalSelect(INTERVALS[index])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [targetInterval, feedback])

  return (
    <div className="intervals-practice">
      <div className="interval-question">
        <h3>识别这个音程</h3>
        <div className="note-buttons">
          <button onClick={playFirstNote} disabled={hasPlayedFirst}>
            播放第一个音（{rootNote}）
          </button>
          <button onClick={playSecondNote} disabled={!hasPlayedFirst}>
            播放第二个音
          </button>
        </div>
      </div>

      <div className="interval-options">
        {INTERVALS.map((interval, i) => (
          <button
            key={interval.name}
            className={`interval-btn ${feedback === 'correct' && interval.semitones === targetInterval?.semitones ? 'correct' : ''} ${feedback === 'wrong' ? 'wrong' : ''}`}
            onClick={() => handleIntervalSelect(interval)}
          >
            <span className="key-hint">[{i + 1}]</span>
            {interval.name}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`feedback ${feedback}`}>
          {feedback === 'correct' ? '✓ 回答正确！' : '✗ 再试一次'}
        </div>
      )}
    </div>
  )
}
