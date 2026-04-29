import { useEffect, useRef, useCallback, useState } from 'react'
import { getCanvasTheme } from '../../lib/canvas/canvasTheme'

function useCurrentTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  )
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => {
      setTheme(el.dataset.theme === 'dark' ? 'dark' : 'light')
    })
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return theme
}

export interface Note {
  number: number // 1-7 representing do, re, mi, fa, sol, la, si
  duration?: string
  dotsAbove?: number // 0-2, single or double dot for high octave
  dotsBelow?: number // 0-2, single or double dot for low octave
}

export interface TimeSignature {
  top: number
  bottom: number
}

export interface StaffCanvasProps {
  notes?: Note[]
  currentNoteIndex?: number
  timeSignature?: TimeSignature
  width?: number
  height?: number
}

// Staff layout constants
const STAFF_LINE_COUNT = 5
const LINE_SPACING = 16
const NOTE_WIDTH = 40
const DOT_RADIUS = 3
const DOT_GAP = 6
const NUMBER_FONT_SIZE = 20
const TIME_SIGNATURE_FONT_SIZE = 18
const STAVE_PADDING = 60
const DOT_OFFSET_Y = 8

// Note positions relative to middle line (positive = above, negative = below)
// 3 (mi) and 4 (fa) are on the middle line
const NOTE_POSITIONS: Record<number, number> = {
  1: -1.5, // do - below middle (first space below)
  2: -0.5, // re - below middle (first ledger line below)
  3: 0,    // mi - on middle line
  4: 0,    // fa - on middle line
  5: 0.5,  // sol - first space above middle
  6: 1,    // la - second line above
  7: 1.5,  // si - second space above
}

export function StaffCanvas({
  notes = [],
  currentNoteIndex,
  timeSignature,
  width = 400,
  height = 120,
}: StaffCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentTheme = useCurrentTheme()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const theme = getCanvasTheme(currentTheme)
    const displayWidth = width
    const displayHeight = height

    // Calculate staff dimensions
    const staffTop = displayHeight / 2 - (STAFF_LINE_COUNT - 1) * LINE_SPACING / 2
    const middleLineY = staffTop + 2 * LINE_SPACING // Third line from top (index 2)

    // Clear canvas and draw background
    ctx.clearRect(0, 0, displayWidth, displayHeight)
    ctx.fillStyle = theme.staffBackground
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    // Draw 5 horizontal staff lines
    ctx.strokeStyle = theme.staffLine
    ctx.lineWidth = 1

    for (let i = 0; i < STAFF_LINE_COUNT; i++) {
      const y = staffTop + i * LINE_SPACING
      ctx.beginPath()
      ctx.moveTo(STAVE_PADDING, y)
      ctx.lineTo(displayWidth - STAVE_PADDING, y)
      ctx.stroke()
    }

    // Draw time signature at the start (left side)
    if (timeSignature) {
      ctx.font = `bold ${TIME_SIGNATURE_FONT_SIZE}px system-ui, sans-serif`
      ctx.fillStyle = theme.staffNote
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Draw top number
      ctx.fillText(
        timeSignature.top.toString(),
        STAVE_PADDING / 2,
        middleLineY - LINE_SPACING
      )
      // Draw bottom number
      ctx.fillText(
        timeSignature.bottom.toString(),
        STAVE_PADDING / 2,
        middleLineY + LINE_SPACING
      )
    }

    // Calculate starting X position for notes
    const notesStartX = timeSignature ? STAVE_PADDING + 30 : STAVE_PADDING

    // Draw notes
    notes.forEach((note, index) => {
      const noteX = notesStartX + index * NOTE_WIDTH
      const isCurrentNote = index === currentNoteIndex

      // Get Y position based on note number
      const notePositionOffset = NOTE_POSITIONS[note.number] ?? 0
      const noteY = middleLineY - notePositionOffset * LINE_SPACING

      // Draw dots above (high octave indicators)
      if (note.dotsAbove && note.dotsAbove > 0) {
        for (let i = 0; i < note.dotsAbove; i++) {
          const dotY = noteY - DOT_OFFSET_Y - i * DOT_GAP * 2
          const dotX = noteX + NUMBER_FONT_SIZE / 2 + DOT_GAP

          ctx.beginPath()
          ctx.arc(dotX, dotY, DOT_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = isCurrentNote ? theme.staffNoteHighlight : theme.staffNote
          ctx.fill()
        }
      }

      // Draw dots below (low octave indicators)
      if (note.dotsBelow && note.dotsBelow > 0) {
        for (let i = 0; i < note.dotsBelow; i++) {
          const dotY = noteY + DOT_OFFSET_Y + i * DOT_GAP * 2
          const dotX = noteX + NUMBER_FONT_SIZE / 2 + DOT_GAP

          ctx.beginPath()
          ctx.arc(dotX, dotY, DOT_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = isCurrentNote ? theme.staffNoteHighlight : theme.staffNote
          ctx.fill()
        }
      }

      // Draw note number
      ctx.font = `bold ${NUMBER_FONT_SIZE}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Highlight current note with background
      if (isCurrentNote) {
        const bgPadding = 4
        ctx.fillStyle = theme.staffNoteHighlight
        ctx.beginPath()
        ctx.roundRect(
          noteX - NUMBER_FONT_SIZE / 2 - bgPadding,
          noteY - NUMBER_FONT_SIZE / 2 - bgPadding,
          NUMBER_FONT_SIZE + bgPadding * 2,
          NUMBER_FONT_SIZE + bgPadding * 2,
          4
        )
        ctx.fill()

        ctx.fillStyle = '#ffffff'
      } else {
        ctx.fillStyle = theme.staffNote
      }

      ctx.fillText(note.number.toString(), noteX, noteY)
    })
  }, [notes, currentNoteIndex, timeSignature, width, height, currentTheme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1

    // Set display size
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Set actual canvas size in memory (scaled for retina)
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Scale context to match devicePixelRatio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    draw()

    return () => {
      // Cleanup if needed
    }
  }, [draw, width, height, currentTheme])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
      }}
    />
  )
}
