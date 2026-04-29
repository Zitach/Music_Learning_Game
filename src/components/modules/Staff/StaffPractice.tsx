import { useCallback, useEffect, useState, useRef } from 'react'
import { drawTrebleClef, drawBassClef } from '../../../lib/music/clef'
import { drawLedgerLines, drawAccidental } from '../../../lib/music/notation'
import { useGameStore } from '../../../lib/stores/gameStore'

interface Note {
  note: string
  duration: number
}

interface StaffPracticeProps {
  notes: Note[]
  onComplete: () => void
}

function calculateNoteY(note: string, staffY: number, lineSpacing: number): number {
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const noteName = note.replace(/\d/, '').replace('#', '')
  const octave = parseInt(note.match(/\d/)?.[0] || '4')
  const baseNote = noteName.toUpperCase()
  const noteIndex = noteNames.indexOf(baseNote)
  const cIndex = 0
  const stepsFromC = noteIndex - cIndex + (octave - 4) * 7
  return staffY + 4 * lineSpacing - stepsFromC * (lineSpacing / 2)
}

export function StaffPractice({ notes, onComplete }: StaffPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { recordHit, recordMiss } = useGameStore()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const size = 40
    const staffY = 60
    const lineSpacing = size / 4

    drawTrebleClef({ ctx, x: 30, y: staffY, size })

    ctx.strokeStyle = '#1E1B4B'
    ctx.lineWidth = 1
    for (let index = 0; index < 5; index++) {
      ctx.beginPath()
      ctx.moveTo(20, staffY + index * lineSpacing)
      ctx.lineTo(canvas.width - 20, staffY + index * lineSpacing)
      ctx.stroke()
    }

    drawBassClef({ ctx, x: canvas.width - 70, y: staffY, size: size * 0.8 })

    if (currentIndex < notes.length) {
      const note = notes[currentIndex]
      const noteY = calculateNoteY(note.note, staffY, lineSpacing)
      const noteX = 200

      drawLedgerLines({ ctx, x: noteX, y: noteY, staffY, lineSpacing })

      ctx.fillStyle = '#1E1B4B'
      ctx.beginPath()
      ctx.ellipse(noteX, noteY, 6, 5, -0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(noteX + 5, noteY)
      ctx.lineTo(noteX + 5, noteY - 30)
      ctx.stroke()

      if (note.note.includes('#')) {
        drawAccidental({ ctx, x: noteX - 15, y: noteY, type: 'sharp', size })
      } else if (note.note.includes('b')) {
        drawAccidental({ ctx, x: noteX - 15, y: noteY, type: 'flat', size })
      }

      ctx.fillStyle = 'rgba(30, 27, 75, 0.55)'
      ctx.font = '12px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(note.note, noteX, staffY - 10)
    }
  }, [currentIndex, notes])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    if (isComplete) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (feedback) return

      const key = event.key.toUpperCase()
      const expectedNote = notes[currentIndex]?.note.replace(/\d/, '')
      const keyMap: Record<string, string> = {
        A: 'C', W: 'C#', S: 'D', E: 'D#',
        D: 'E', F: 'F', T: 'F#', G: 'G',
        Y: 'G#', H: 'A', U: 'A#', J: 'B',
      }

      const playedNote = keyMap[key]

      if (playedNote === expectedNote) {
        setFeedback('correct')
        recordHit()
        setTimeout(() => {
          setFeedback(null)
          if (currentIndex + 1 >= notes.length) {
            setIsComplete(true)
            onComplete()
          } else {
            setCurrentIndex(index => index + 1)
          }
        }, 500)
        return
      }

      setFeedback('wrong')
      recordMiss()
      setTimeout(() => setFeedback(null), 500)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, notes, feedback, recordHit, recordMiss, onComplete, isComplete])

  return (
    <div className="module-shell module-shell--staff">
      <div className="module-header-row">
        <div>
          <div className="eyebrow">五线谱训练</div>
          <h3 className="module-title">看谱并按下对应音名</h3>
        </div>
        <div className="module-stat-pill">进度 {currentIndex + 1} / {notes.length}</div>
      </div>

      <div className="module-canvas-wrap module-canvas-wrap--bright">
        <canvas ref={canvasRef} width={600} height={160} />
      </div>

      <div className="module-feedback-row">
        {feedback && (
          <div className={`module-feedback-badge ${feedback === 'correct' ? 'is-correct' : 'is-wrong'}`}>
            {feedback === 'correct' ? '✓ 正确' : '✗ 错误'}
          </div>
        )}
      </div>

      <div className="module-caption">按下键盘上对应的音名按键进行识谱。A-J 为白键，W/E/T/Y/U 为黑键。</div>

      <div className="module-keymap">
        <span>C:A</span>
        <span>D:S</span>
        <span>E:D</span>
        <span>F:F</span>
        <span>G:G</span>
        <span>A:H</span>
        <span>B:J</span>
        <span>|</span>
        <span>C#:W</span>
        <span>D#:E</span>
        <span>F#:T</span>
        <span>G#:Y</span>
        <span>A#:U</span>
      </div>
    </div>
  )
}

export default StaffPractice
