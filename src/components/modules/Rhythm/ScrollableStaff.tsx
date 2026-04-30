import { useEffect, useRef, useCallback, useState } from 'react'
import { getCanvasTheme } from '../../../lib/canvas/canvasTheme'
import {
  RhythmNote,
  getDurationWidth,
  getCumulativeWidthOffsets,
  isRestNote,
} from '../../../lib/music/noteTiming'

export interface TimeSignature {
  top: number
  bottom: number
}

export interface ScrollableStaffProps {
  notes: RhythmNote[]
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
  const [offset, setOffset] = useState(0)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const completedNotesRef = useRef<Set<number>>(new Set())
  const isPlayingRef = useRef(isPlaying)
  const currentNoteIndexRef = useRef<number>(-1)
  const widthOffsetsRef = useRef<number[]>([])
  const totalContentWidthRef = useRef<number>(0)

  isPlayingRef.current = isPlaying

  useEffect(() => {
    const offsets = getCumulativeWidthOffsets(notes, NOTE_WIDTH)
    widthOffsetsRef.current = offsets
    const lastNoteWidth = notes.length > 0
      ? getDurationWidth(notes[notes.length - 1].duration, NOTE_WIDTH)
      : 0
    totalContentWidthRef.current =
      (offsets[offsets.length - 1] ?? 0) + lastNoteWidth + STAVE_PADDING * 2
    setOffset(0)
    currentNoteIndexRef.current = -1
    lastTimeRef.current = null
    completedNotesRef.current = new Set()
  }, [notes])

  const beatDuration = 60000 / bpm
  const pixelsPerMs = NOTE_WIDTH / beatDuration

  const notesStartX = timeSignature ? STAVE_PADDING + 30 : STAVE_PADDING
  const centerPosition = notesStartX + NOTE_WIDTH / 2

  const animate = useCallback(
    (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }

      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      setOffset((prevOffset) => {
        const newOffset = prevOffset + pixelsPerMs * deltaTime
        const widthOffsets = widthOffsetsRef.current

        let noteIndexAtCenter = -1
        for (let i = 0; i < widthOffsets.length; i++) {
          const noteCenterX = notesStartX + widthOffsets[i] + NOTE_WIDTH / 2
          if (newOffset + centerPosition >= noteCenterX - NOTE_WIDTH / 2) {
            noteIndexAtCenter = i
          }
        }

        if (noteIndexAtCenter >= notes.length) {
          if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
          }
          return newOffset
        }

        if (noteIndexAtCenter >= 0 && noteIndexAtCenter < notes.length) {
          const noteIndex = noteIndexAtCenter

          const notePositionAtCenter = notesStartX + widthOffsets[noteIndex]
          const distanceFromCenter = newOffset - (notePositionAtCenter - centerPosition)

          const completionThreshold = NOTE_WIDTH / 2

          if (distanceFromCenter > completionThreshold && !completedNotesRef.current.has(noteIndex)) {
            completedNotesRef.current.add(noteIndex)
            onNoteComplete?.(noteIndex)
          }

          if (noteIndex !== currentNoteIndexRef.current) {
            currentNoteIndexRef.current = noteIndex
          }
        }

        return newOffset
      })

      if (isPlayingRef.current) {
        animationRef.current = requestAnimationFrame(animate)
      }
    },
    [bpm, notes.length, centerPosition, notesStartX, onNoteComplete, pixelsPerMs]
  )

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

  const displayCurrentNoteIndex = (() => {
    if (!isPlaying && currentNoteIndexRef.current === -1) return -1
    const widthOffsets = widthOffsetsRef.current
    let centerNoteIndex = -1
    for (let i = 0; i < widthOffsets.length; i++) {
      const noteCenterX = notesStartX + widthOffsets[i] + NOTE_WIDTH / 2
      if (offset + centerPosition >= noteCenterX - NOTE_WIDTH / 2) {
        centerNoteIndex = i
      }
    }
    if (centerNoteIndex >= 0 && centerNoteIndex < notes.length) {
      return centerNoteIndex
    }
    return -1
  })()

  const totalContentWidth = totalContentWidthRef.current || width + NOTE_WIDTH * 2

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
          width: `${totalContentWidth}px`,
        }}
      >
        <CanvasWithOffset
          notes={notes}
          currentNoteIndex={displayCurrentNoteIndex >= 0 ? displayCurrentNoteIndex : undefined}
          timeSignature={timeSignature}
          width={totalContentWidth}
          height={height}
          offset={offset}
        />
      </div>
    </div>
  )
}

// Separate canvas component that handles offset rendering
interface CanvasWithOffsetProps {
  notes: RhythmNote[]
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
  const widthOffsetsRef = useRef<number[]>([])

  useEffect(() => {
    widthOffsetsRef.current = getCumulativeWidthOffsets(notes, NOTE_WIDTH)
  }, [notes])

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

    ctx.strokeStyle = theme.staffLine
    ctx.lineWidth = 1

    for (let i = 0; i < STAFF_LINE_COUNT; i++) {
      const y = staffTop + i * LINE_SPACING
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
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
    const DURATION_INDICATOR_Y_OFFSET = 18

    const widthOffsets = widthOffsetsRef.current

    // Draw notes
    notes.forEach((note, index) => {
      const noteX = notesStartX + (widthOffsets[index] ?? 0)
      const isCurrentNote = index === currentNoteIndex
      const isRest = isRestNote(note)

      const notePositionOffset = NOTE_POSITIONS[note.number] ?? 0
      const noteY = middleLineY - notePositionOffset * LINE_SPACING

      if (isRest) {
        ctx.font = `bold ${NUMBER_FONT_SIZE}px system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = isCurrentNote ? theme.text : theme.textMuted
        ctx.fillText('休', noteX, noteY)
      } else {
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
      }

      const durationY = noteY + DURATION_INDICATOR_Y_OFFSET
      ctx.fillStyle = isCurrentNote ? theme.text : theme.textMuted
      ctx.strokeStyle = isCurrentNote ? theme.text : theme.textMuted
      ctx.lineWidth = 1.5

      switch (note.duration) {
        case 'quarter': {
          ctx.beginPath()
          ctx.arc(noteX, durationY, 3, 0, Math.PI * 2)
          ctx.fill()
          break
        }
        case 'half': {
          ctx.beginPath()
          ctx.arc(noteX, durationY, 3, 0, Math.PI * 2)
          ctx.stroke()
          break
        }
        case 'whole': {
          const rectW = 14
          const rectH = 6
          ctx.beginPath()
          ctx.roundRect(noteX - rectW / 2, durationY - rectH / 2, rectW, rectH, 2)
          ctx.stroke()
          break
        }
        case 'eighth': {
          ctx.beginPath()
          ctx.arc(noteX, durationY, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.moveTo(noteX + 3, durationY)
          ctx.lineTo(noteX + 10, durationY)
          ctx.stroke()
          break
        }
      }
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

