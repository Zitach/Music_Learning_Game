import { useCallback, useEffect, useState } from 'react'
import { useGameStore } from '../../../lib/stores/gameStore'
import { audioEngine } from '../../../lib/audio/Engine'

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

interface ChordsPracticeProps {
  onComplete: () => void
}

export function ChordsPractice({ onComplete: _onComplete }: ChordsPracticeProps) {
  const [rootNote, setRootNote] = useState('')
  const [targetChord, setTargetChord] = useState<typeof CHORDS[0] | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const { recordHit, recordMiss } = useGameStore()

  // Ensure audio engine is loaded
  useEffect(() => {
    audioEngine.load()
  }, [])

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

  // Play chord using Tone.js polyphonic synth
  const playChord = () => {
    if (!targetChord || !rootNote) return
    const rootIndex = NOTE_NAMES.indexOf(rootNote)

    const notes = targetChord.intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12
      const noteName = NOTE_NAMES[noteIndex]
      const octave = rootIndex + interval >= 12 ? 5 : 4
      return noteName + octave
    })

    audioEngine.playChord(notes, '2n')
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
