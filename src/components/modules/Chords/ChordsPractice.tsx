import { useCallback, useEffect, useState } from 'react'
import { useGameStore } from '../../../lib/stores/gameStore'

const CHORDS = [
  { name: 'Major', intervals: [0, 4, 7] },
  { name: 'Minor', intervals: [0, 3, 7] },
  { name: 'Diminished', intervals: [0, 3, 6] },
  { name: 'Augmented', intervals: [0, 4, 8] },
  { name: 'Major 7th', intervals: [0, 4, 7, 11] },
  { name: 'Minor 7th', intervals: [0, 3, 7, 10] },
  { name: 'Dominant 7th', intervals: [0, 4, 7, 10] },
  { name: 'Diminished 7th', intervals: [0, 3, 6, 9] }
]

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Base frequency for A4 = 440Hz
const A4_FREQUENCY = 440
const A4_INDEX = 9 // A is index 9 in NOTE_NAMES

interface ChordsPracticeProps {
  onComplete: () => void
}

export function ChordsPractice({ onComplete: _onComplete }: ChordsPracticeProps) {
  const [rootNote, setRootNote] = useState('')
  const [targetChord, setTargetChord] = useState<typeof CHORDS[0] | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const { recordHit, recordMiss } = useGameStore()

  // Generate new chord question
  const generateQuestion = useCallback(() => {
    const rootIndex = Math.floor(Math.random() * 12)
    const chordIndex = Math.floor(Math.random() * CHORDS.length)
    setRootNote(NOTE_NAMES[rootIndex])
    setTargetChord(CHORDS[chordIndex])
    setHasPlayed(false)
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

  // Play chord (all notes simultaneously)
  const playChord = () => {
    if (!targetChord || !rootNote) return
    const rootIndex = NOTE_NAMES.indexOf(rootNote)
    
    targetChord.intervals.forEach((interval, idx) => {
      const noteIndex = (rootIndex + interval) % 12
      const noteName = NOTE_NAMES[noteIndex]
      const octave = rootIndex + interval >= 12 ? 5 : 4
      const frequency = getFrequency(noteName, octave)
      
      // Stagger slightly for better separation
      setTimeout(() => {
        const audio = new Audio()
        audio.src = `data:audio/wav;base64,${generateTone(frequency, 0.8)}`
        audio.play()
      }, idx * 50)
    })
    setHasPlayed(true)
  }

  // Handle chord selection
  const handleChordSelect = (chord: typeof CHORDS[0]) => {
    if (!targetChord || feedback) return

    if (chord.name === targetChord.name) {
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

  // Keyboard shortcuts for chords
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return
      const keyMap: Record<string, number> = {
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4,
        '6': 5, '7': 6, '8': 7
      }
      const index = keyMap[e.key]
      if (index !== undefined) {
        handleChordSelect(CHORDS[index])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [targetChord, feedback])

  return (
    <div className="chords-practice">
      <div className="chord-question">
        <h3>识别这个和弦</h3>
        <div className="root-note">根音：{rootNote}</div>
        <button onClick={playChord} disabled={hasPlayed}>
          {hasPlayed ? '再次播放' : '播放和弦'}
        </button>
      </div>

      <div className="chord-options">
        {CHORDS.map((chord, i) => (
          <button
            key={chord.name}
            className={`chord-btn ${feedback === 'correct' && chord.name === targetChord?.name ? 'correct' : ''} ${feedback === 'wrong' ? 'wrong' : ''}`}
            onClick={() => handleChordSelect(chord)}
          >
            <span className="key-hint">[{i + 1}]</span>
            {chord.name}
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
