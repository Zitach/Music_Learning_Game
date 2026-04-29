import { useCallback, useEffect, useState } from 'react'
import { useGameStore } from '../../../lib/stores/gameStore'
import { audioEngine } from '../../../lib/audio/Engine'

// Common chord progressions in Roman numeral notation
const PROGRESSIONS = [
  { name: 'I - IV - V - I', numerals: ['I', 'IV', 'V', 'I'] },
  { name: 'I - V - vi - IV', numerals: ['I', 'V', 'vi', 'IV'] },
  { name: 'ii - V - I', numerals: ['ii', 'V', 'I'] },
  { name: 'I - vi - IV - V', numerals: ['I', 'vi', 'IV', 'V'] },
  { name: 'vi - IV - I - V', numerals: ['vi', 'IV', 'I', 'V'] },
  { name: 'I - IV - I - V', numerals: ['I', 'IV', 'I', 'V'] },
  { name: 'iv - V - I', numerals: ['iv', 'V', 'I'] },
  { name: 'I - III - IV - V', numerals: ['I', 'III', 'IV', 'V'] }
]

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Map numerals to chord intervals (used for audio synthesis)
const NUMERAL_INTERVALS: Record<string, number[]> = {
  'I': [0, 4, 7],      // Major tonic
  'ii': [0, 3, 7],     // Minor supertonic
  'iii': [0, 4, 7],    // Major mediant
  'IV': [0, 5, 9],     // Major subdominant
  'V': [0, 4, 7],      // Major dominant
  'vi': [0, 3, 7],     // Minor submediant
  'vii': [0, 3, 6],    // Diminished leading tone
  'iv': [0, 3, 7],     // Minor subdominant
}

interface ProgressionsPracticeProps {
  onComplete: () => void
}

export function ProgressionsPractice({ onComplete: _onComplete }: ProgressionsPracticeProps) {
  const [rootNote, setRootNote] = useState('')
  const [targetProgression, setTargetProgression] = useState<typeof PROGRESSIONS[0] | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [_currentChordIndex, setCurrentChordIndex] = useState(0)
  const { recordHit, recordMiss } = useGameStore()

  // Ensure audio engine is loaded
  useEffect(() => {
    audioEngine.load()
  }, [])

  // Generate new progression question
  const generateQuestion = useCallback(() => {
    const rootIndex = Math.floor(Math.random() * 12)
    const progIndex = Math.floor(Math.random() * PROGRESSIONS.length)
    setRootNote(NOTE_NAMES[rootIndex])
    setTargetProgression(PROGRESSIONS[progIndex])
    setHasPlayed(false)
    setCurrentChordIndex(0)
    setFeedback(null)
  }, [])

  useEffect(() => {
    generateQuestion()
  }, [generateQuestion])

  // Play progression using Tone.js — builds chord notes from numeral intervals
  const playProgression = () => {
    if (!targetProgression || !rootNote) return
    setHasPlayed(true)

    const rootIndex = NOTE_NAMES.indexOf(rootNote)

    const chords = targetProgression.numerals.map(numeral => {
      const intervals = NUMERAL_INTERVALS[numeral]
      if (!intervals) return ['C4']
      return intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12
        const noteName = NOTE_NAMES[noteIndex]
        const octave = rootIndex + interval >= 12 ? 5 : 4
        return noteName + octave
      })
    })

    audioEngine.playProgression(chords, 100)
  }
  
  // Handle progression selection
  const handleProgressionSelect = (prog: typeof PROGRESSIONS[0]) => {
    if (!targetProgression || feedback) return
    
    if (prog.name === targetProgression.name) {
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
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4,
        '6': 5, '7': 6, '8': 7
      }
      const index = keyMap[e.key]
      if (index !== undefined && PROGRESSIONS[index]) {
        handleProgressionSelect(PROGRESSIONS[index])
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [targetProgression, feedback])
  
  return (
    <div className="progressions-practice">
      <div className="progression-question">
        <h3>识别这个和弦进行</h3>
        <div className="root-note">调性：{rootNote}</div>
        <button onClick={playProgression} disabled={hasPlayed}>
          {hasPlayed ? '再次播放' : '播放进行'}
        </button>
      </div>
      
      <div className="progression-options">
        {PROGRESSIONS.map((prog, i) => (
          <button
            key={prog.name}
            className={`prog-btn ${feedback === 'correct' && prog.name === targetProgression?.name ? 'correct' : ''} ${feedback === 'wrong' ? 'wrong' : ''}`}
            onClick={() => handleProgressionSelect(prog)}
          >
            <span className="key-hint">[{i + 1}]</span>
            {prog.name}
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
