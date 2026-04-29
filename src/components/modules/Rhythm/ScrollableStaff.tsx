import { useEffect, useRef, useCallback, useState } from 'react'
import { getCanvasTheme } from '../../../lib/canvas/canvasTheme'

export interface Note {
  number: number
  duration?: string
  dotsAbove?: number
  dotsBelow?: number
}

export interface TimeSignature {
  top: number
  bottom: number
}

export interface ScrollableStaffProps {
  notes: Array<{ number: number; duration?: string }>
  bpm?: number
  isPlaying?: boolean
  onNoteComplete?: (index: number) => void
  timeSignature?: TimeSignature
  width?: number
  height?: number
}

// Staff layout constants (must match StaffCanvas)
const STAFF_LINE_COUNT = 5
const LINE_SPACING = 16
const NOTE_WIDTH = 40
const STAVE_PADDING = 60

export function ScrollableStaff({
  notes,
  bpm = 120,
  isPlaying = false,
  onNoteComplete,
  timeSignature,
  width = 600,
  height = 120,
}: ScrollableStaffProps) {
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(-1)
  const [offset, setOffset] = useState(0)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const completedNotesRef = useRef<Set<number>>(new Set())
  const isPlayingRef = useRef(isPlaying)
  
  // Keep ref in sync with prop
  isPlayingRef.current = isPlaying

  // Calculate pixels per millisecond based on BPM
  // At 120 BPM: 1 beat = 500ms, notes spaced by NOTE_WIDTH
  // Speed = NOTE_WIDTH / beatDuration pixels per ms
  const beatDuration = 60000 / bpm
  const pixelsPerMs = NOTE_WIDTH / beatDuration

  // Calculate the center position where current note is highlighted
  const notesStartX = timeSignature ? STAVE_PADDING + 30 : STAVE_PADDING
  const centerPosition = notesStartX + NOTE_WIDTH / 2

  const animate = useCallback(
    (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }

      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Move notes from right to left
      setOffset((prevOffset) => {
        const newOffset = prevOffset + pixelsPerMs * deltaTime
        
        // Calculate which note should now be at center position
        // offset tells us how much the notes have scrolled
        // When offset reaches note.position - centerPosition, that's the current note
        
        // Find the note index at center position
        const noteIndexAtCenter = Math.round((newOffset + centerPosition - notesStartX) / NOTE_WIDTH)
        
        // Update current note if it changed
        if (noteIndexAtCenter >= 0 && noteIndexAtCenter < notes.length) {
          const noteIndex = noteIndexAtCenter
          
          // Check if we've passed this note (it's to the left of center)
          const notePositionAtCenter = notesStartX + noteIndex * NOTE_WIDTH
          const distanceFromCenter = newOffset - (notePositionAtCenter - centerPosition)
          
          // When note passes center (offset increases past threshold), trigger completion
          const completionThreshold = NOTE_WIDTH / 2
          
          if (distanceFromCenter > completionThreshold && !completedNotesRef.current.has(noteIndex)) {
            completedNotesRef.current.add(noteIndex)
            onNoteComplete?.(noteIndex)
          }
          
          // Update current note highlight
          if (noteIndex !== currentNoteIndex) {
            setCurrentNoteIndex(noteIndex)
          }
        }
        
        return newOffset
      })

      animationRef.current = requestAnimationFrame(animate)
    },
    [bpm, notes.length, centerPosition, notesStartX, onNoteComplete, currentNoteIndex, pixelsPerMs]
  )

  // Reset animation state when notes change
  useEffect(() => {
    setCurrentNoteIndex(-1)
    setOffset(0)
    lastTimeRef.current = null
    completedNotesRef.current = new Set()
  }, [notes])

  // Start/stop animation based on isPlaying
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isPlaying, animate])

  // Calculate current note index for display
  const displayCurrentNoteIndex = (() => {
    if (!isPlaying && currentNoteIndex === -1) return -1
    // Find which note is at the center position
    const centerNoteIndex = Math.round((offset + centerPosition - notesStartX) / NOTE_WIDTH)
    if (centerNoteIndex >= 0 && centerNoteIndex < notes.length) {
      return centerNoteIndex
    }
    return -1
  })()

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,247,250,0.96))',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), 0 12px 28px rgba(0,0,0,0.12)',
      }}
    >
      {/* Center indicator line */}
      <div
        style={{
          position: 'absolute',
          left: `${centerPosition}px`,
          top: 0,
          width: '2px',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(248, 210, 122, 0.12), rgba(124, 224, 195, 0.55), rgba(248, 210, 122, 0.12))',
          boxShadow: '0 0 20px rgba(124, 224, 195, 0.3)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      
      {/* Canvas for staff and notes */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translateX(${-offset}px)`,
          width: `${width + offset + NOTE_WIDTH * 2}px`,
        }}
      >
        <CanvasWithOffset
          notes={notes}
          currentNoteIndex={displayCurrentNoteIndex >= 0 ? displayCurrentNoteIndex : undefined}
          timeSignature={timeSignature}
          width={width + offset + NOTE_WIDTH * 2}
          height={height}
          offset={offset}
        />
      </div>
    </div>
  )
}

// Separate canvas component that handles offset rendering
interface CanvasWithOffsetProps {
  notes: Note[]
  currentNoteIndex?: number
  timeSignature?: TimeSignature
  width: number
  height: number
  offset: number
}

function CanvasWithOffset({
  notes,
  currentNoteIndex,
  timeSignature,
  width,
  height,
  offset,
}: CanvasWithOffsetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const theme = getCanvasTheme('light')

    const dpr = window.devicePixelRatio || 1

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Calculate staff dimensions
    const staffTop = height / 2 - (STAFF_LINE_COUNT - 1) * LINE_SPACING / 2
    const middleLineY = staffTop + 2 * LINE_SPACING
    const notesStartX = timeSignature ? STAVE_PADDING + 30 : STAVE_PADDING

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw 5 horizontal staff lines
    ctx.strokeStyle = theme.staffLine
    ctx.lineWidth = 1

    for (let i = 0; i < STAFF_LINE_COUNT; i++) {
      const y = staffTop + i * LINE_SPACING
      ctx.beginPath()
      ctx.moveTo(STAVE_PADDING, y)
      ctx.lineTo(width - STAVE_PADDING, y)
      ctx.stroke()
    }

    // Draw time signature
    if (timeSignature) {
      ctx.font = `bold 18px system-ui, sans-serif`
      ctx.fillStyle = theme.textMuted
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(timeSignature.top.toString(), STAVE_PADDING / 2, middleLineY - LINE_SPACING)
      ctx.fillText(timeSignature.bottom.toString(), STAVE_PADDING / 2, middleLineY + LINE_SPACING)
    }

    // Note positions
    const NOTE_POSITIONS: Record<number, number> = {
      1: -1.5,
      2: -0.5,
      3: 0,
      4: 0,
      5: 0.5,
      6: 1,
      7: 1.5,
    }
    const DOT_RADIUS = 3
    const DOT_GAP = 6
    const DOT_OFFSET_Y = 8
    const NUMBER_FONT_SIZE = 20

    // Draw notes
    notes.forEach((note, index) => {
      const noteX = notesStartX + index * NOTE_WIDTH
      const isCurrentNote = index === currentNoteIndex

      const notePositionOffset = NOTE_POSITIONS[note.number] ?? 0
      const noteY = middleLineY - notePositionOffset * LINE_SPACING

      // Draw dots above
      if (note.dotsAbove && note.dotsAbove > 0) {
        for (let i = 0; i < note.dotsAbove; i++) {
          const dotY = noteY - DOT_OFFSET_Y - i * DOT_GAP * 2
          const dotX = noteX + NUMBER_FONT_SIZE / 2 + DOT_GAP

          ctx.beginPath()
          ctx.arc(dotX, dotY, DOT_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = isCurrentNote ? theme.text : theme.textMuted
          ctx.fill()
        }
      }

      // Draw dots below
      if (note.dotsBelow && note.dotsBelow > 0) {
        for (let i = 0; i < note.dotsBelow; i++) {
          const dotY = noteY + DOT_OFFSET_Y + i * DOT_GAP * 2
          const dotX = noteX + NUMBER_FONT_SIZE / 2 + DOT_GAP

          ctx.beginPath()
          ctx.arc(dotX, dotY, DOT_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = isCurrentNote ? theme.text : theme.textMuted
          ctx.fill()
        }
      }

      ctx.font = `bold ${NUMBER_FONT_SIZE}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Highlight current note
      if (isCurrentNote) {
        const bgPadding = 4
        ctx.fillStyle = theme.warning
        ctx.beginPath()
        ctx.roundRect(
          noteX - NUMBER_FONT_SIZE / 2 - bgPadding,
          noteY - NUMBER_FONT_SIZE / 2 - bgPadding,
          NUMBER_FONT_SIZE + bgPadding * 2,
          NUMBER_FONT_SIZE + bgPadding * 2,
          4
        )
        ctx.fill()
        ctx.fillStyle = theme.text
      } else {
        ctx.fillStyle = theme.textMuted
      }

      ctx.fillText(note.number.toString(), noteX, noteY)
    })
  }, [notes, currentNoteIndex, timeSignature, width, height, offset])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
      }}
    />
  )
}

