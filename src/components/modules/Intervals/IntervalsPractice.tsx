import { useCallback, useEffect, useState } from 'react'
import { useGameStore } from '../../../lib/stores/gameStore'

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

// Base frequency for A4 = 440Hz
const A4_FREQUENCY = 440
const A4_INDEX = 9 // A is index 9 in NOTE_NAMES

interface IntervalsPracticeProps {
  onComplete: () => void
}

export function IntervalsPractice(_props: IntervalsPracticeProps) {
  const [rootNote, setRootNote] = useState('')
  const [targetInterval, setTargetInterval] = useState<typeof INTERVALS[0] | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hasPlayedFirst, setHasPlayedFirst] = useState(false)
  const { recordHit, recordMiss } = useGameStore()

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

  // Calculate frequency for a note
  const getFrequency = (noteName: string, octave: number = 4): number => {
    const noteIndex = NOTE_NAMES.indexOf(noteName)
    const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - A4_INDEX)
    return A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12)
  }

  // Generate simple sine wave tone as base64 WAV
  const generateTone = (frequency: number, duration: number = 0.5): string => {
    const sampleRate = 44100
    const samples = Math.floor(sampleRate * duration)
    const buffer = new ArrayBuffer(44 + samples * 2)
    const view = new DataView(buffer)

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, samples * 2, true)

    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const envelope = Math.min(1, Math.min(t * 100, (duration - t) * 20))
      const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.5
      view.setInt16(44 + i * 2, sample * 32767, true)
    }

    // Convert to base64
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Play first note (root)
  const playFirstNote = () => {
    if (!rootNote) return
    const frequency = getFrequency(rootNote, 4)
    const audio = new Audio()
    audio.src = `data:audio/wav;base64,${generateTone(frequency, 0.8)}`
    audio.play()
    setHasPlayedFirst(true)
  }

  // Play second note (root + interval)
  const playSecondNote = () => {
    if (!targetInterval || !rootNote) return
    const rootIndex = NOTE_NAMES.indexOf(rootNote)
    const secondNoteIndex = (rootIndex + targetInterval.semitones) % 12
    const secondNote = NOTE_NAMES[secondNoteIndex]
    const octave = rootIndex + targetInterval.semitones >= 12 ? 5 : 4
    const frequency = getFrequency(secondNote, octave)
    const audio = new Audio()
    audio.src = `data:audio/wav;base64,${generateTone(frequency, 0.8)}`
    audio.play()
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
