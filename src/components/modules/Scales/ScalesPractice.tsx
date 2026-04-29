import { useCallback, useEffect, useState } from 'react'
import { drawTrebleClef } from '../../../lib/music/clef'
import { drawLedgerLines } from '../../../lib/music/notation'
import { useGameStore } from '../../../lib/stores/gameStore'
import { audioEngine } from '../../../lib/audio/Engine'
import { getCanvasTheme } from '../../../lib/canvas/canvasTheme'

type ScaleType = 'major' | 'naturalMinor' | 'pentatonic'

interface Scale {
  root: string      // e.g., 'C', 'G'
  type: ScaleType
}

const SCALE_FORMULAS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],        // W-W-H-W-W-W-H
  naturalMinor: [0, 2, 3, 5, 7, 8, 10, 12], // W-H-W-W-H-W-W
  pentatonic: [0, 2, 4, 7, 9, 12]            // pentatonic
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function getScaleNotes(root: string, type: ScaleType): string[] {
  const rootIndex = NOTE_NAMES.indexOf(root.toUpperCase())
  const formula = SCALE_FORMULAS[type]
  return formula.map(semitone => {
    const noteIndex = (rootIndex + semitone) % 12
    return NOTE_NAMES[noteIndex]
  })
}

interface ScalesPracticeProps {
  onComplete: () => void
}

export function ScalesPractice({ onComplete }: ScalesPracticeProps) {
  const [currentScale] = useState<Scale>({ root: 'C', type: 'major' })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const { recordHit, recordMiss } = useGameStore()

  const scaleNotes = getScaleNotes(currentScale.root, currentScale.type)

  // Ensure audio engine is loaded
  useEffect(() => {
    audioEngine.load()
  }, [])
  
  // Keyboard mapping
  const keyToNote: Record<string, string> = {
    'A': 'C', 'W': 'C#', 'S': 'D', 'E': 'D#',
    'D': 'E', 'F': 'F', 'T': 'F#', 'G': 'G',
    'Y': 'G#', 'H': 'A', 'U': 'A#', 'J': 'B',
    'K': 'C5', 'O': 'C#5', 'L': 'D', 'P': 'D#5',
    ';': 'E5'
  }
  
  // Canvas rendering
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (!node) return
    const ctx = node.getContext('2d')
    if (!ctx) return

    const theme = getCanvasTheme('light')
    
    ctx.fillStyle = theme.staffBackground
    ctx.fillRect(0, 0, node.width, node.height)

    const size = 40
    const staffY = 80
    const lineSpacing = size / 4

    // Draw treble clef
    drawTrebleClef({ ctx, x: 30, y: staffY, size })

    // Draw staff lines
    ctx.strokeStyle = theme.staffLine
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(20, staffY + i * lineSpacing)
      ctx.lineTo(node.width - 20, staffY + i * lineSpacing)
      ctx.stroke()
    }

    // Draw scale notes on staff
    const startX = 120
    scaleNotes.forEach((note, i) => {
      const noteY = calculateNoteY(note, staffY, lineSpacing)
      const noteX = startX + i * 50

      // Highlight current note
      if (i === currentIndex) {
        ctx.fillStyle = feedback === 'correct' ? theme.success : feedback === 'wrong' ? theme.error : theme.warning
        ctx.beginPath()
        ctx.arc(noteX, noteY, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw note head
      ctx.fillStyle = theme.staffNote
      ctx.beginPath()
      ctx.ellipse(noteX, noteY, 6, 5, -0.3, 0, Math.PI * 2)
      ctx.fill()

      // Draw ledger lines if needed
      drawLedgerLines({ ctx, x: noteX, y: noteY, staffY, lineSpacing })

      // Draw note name below
      ctx.fillStyle = theme.textMuted
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(note, noteX, staffY + 5 * lineSpacing + 15)
    })
  }, [currentIndex, scaleNotes, feedback])
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return
      
      const key = e.key.toUpperCase()
      const playedNote = keyToNote[key]
      const expectedNote = scaleNotes[currentIndex]

      // Play the pressed note via Tone.js
      if (playedNote) {
        const octaveNote = playedNote.includes('5') ? playedNote : playedNote + '4'
        audioEngine.playNote(octaveNote, '8n')
      }

      if (playedNote === expectedNote) {
        setFeedback('correct')
        recordHit()
        setTimeout(() => {
          setFeedback(null)
          if (currentIndex + 1 >= scaleNotes.length) {
            onComplete()
          } else {
            setCurrentIndex(i => i + 1)
          }
        }, 400)
      } else if (playedNote) {
        setFeedback('wrong')
        recordMiss()
        setTimeout(() => setFeedback(null), 400)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, scaleNotes, feedback, recordHit, recordMiss, onComplete])
  
  return (
    <div className="scales-practice">
      <div className="scale-info">
        <span>{currentScale.root} {currentScale.type === 'major' ? '大调音阶' : '小调音阶'}</span>
        <span className="progress">{currentIndex + 1} / {scaleNotes.length}</span>
      </div>
      <canvas ref={canvasRef} width={600} height={180} />
      <div className="hint">按顺序弹奏这些音：{scaleNotes.join(' → ')}</div>
    </div>
  )
}

function calculateNoteY(note: string, staffY: number, lineSpacing: number): number {
  const noteName = note.replace('#', '')
  const octave = note.includes('5') ? 5 : 4
  const positions: Record<string, number> = {
    'C': 6, 'D': 5.5, 'E': 5, 'F': 4.5, 'G': 4, 'A': 3.5, 'B': 3
  }
  const baseY = staffY + 4 * lineSpacing // E4 line
  const steps = (4 - octave) * 7 + (positions[noteName] - 5)
  return baseY - steps * (lineSpacing / 2)
}
