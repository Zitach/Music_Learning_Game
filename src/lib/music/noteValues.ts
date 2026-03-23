export type NoteType = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth'

export interface NoteRenderOptions {
  x: number
  y: number
  size: number
  color: string
  ctx: CanvasRenderingContext2D
}

export function drawNote(type: NoteType, options: NoteRenderOptions): void {
  const { x, y, size, color, ctx } = options
  const ctx2 = ctx

  ctx2.fillStyle = color
  ctx2.strokeStyle = color
  ctx2.lineWidth = size * 0.08
  ctx2.lineCap = 'round'

  const noteWidth = size * 0.6
  const noteHeight = size * 0.5

  // Draw stem for notes that have one (half, quarter, eighth, sixteenth)
  const hasStem = type !== 'whole'
  // Draw filled for notes that are filled (quarter, eighth, sixteenth)
  const isFilled = type === 'quarter' || type === 'eighth' || type === 'sixteenth'

  // Draw the note head (oval)
  ctx2.beginPath()
  ctx2.ellipse(x, y, noteWidth / 2, noteHeight / 2, -0.2, 0, Math.PI * 2)
  if (isFilled) {
    ctx2.fill()
  } else {
    ctx2.stroke()
  }

  // Draw stem
  if (hasStem) {
    const stemX = x + noteWidth / 2 - size * 0.04
    const stemTop = y - size * 1.2
    ctx2.beginPath()
    ctx2.moveTo(stemX, y - noteHeight / 2 * 0.6)
    ctx2.lineTo(stemX, stemTop)
    ctx2.stroke()

    // Draw flags for eighth and sixteenth notes
    if (type === 'eighth' || type === 'sixteenth') {
      const flagY = stemTop
      const flagX = stemX
      ctx2.beginPath()
      ctx2.moveTo(flagX, flagY)
      ctx2.quadraticCurveTo(
        flagX + size * 0.3,
        flagY + size * 0.2,
        flagX + size * 0.15,
        flagY + size * 0.5
      )
      ctx2.stroke()

      // Double flag for sixteenth
      if (type === 'sixteenth') {
        ctx2.beginPath()
        ctx2.moveTo(flagX + size * 0.05, flagY + size * 0.15)
        ctx2.quadraticCurveTo(
          flagX + size * 0.35,
          flagY + size * 0.35,
          flagX + size * 0.2,
          flagY + size * 0.65
        )
        ctx2.stroke()
      }
    }
  }
}

export function drawRest(type: NoteType, options: NoteRenderOptions): void {
  const { x, y, size, color, ctx } = options
  const ctx2 = ctx

  ctx2.fillStyle = color
  ctx2.strokeStyle = color
  ctx2.lineWidth = size * 0.08
  ctx2.lineCap = 'round'

  switch (type) {
    case 'whole':
      // Whole rest - rectangle hanging from line
      ctx2.fillRect(x - size * 0.3, y - size * 0.5, size * 0.6, size * 0.25)
      break
    case 'half':
      // Half rest - rectangle sitting on line
      ctx2.fillRect(x - size * 0.3, y - size * 0.25, size * 0.6, size * 0.25)
      break
    case 'quarter':
      // Quarter rest - zigzag shape
      ctx2.beginPath()
      ctx2.moveTo(x, y - size * 0.5)
      ctx2.lineTo(x + size * 0.2, y - size * 0.25)
      ctx2.lineTo(x - size * 0.1, y)
      ctx2.lineTo(x + size * 0.15, y + size * 0.25)
      ctx2.lineTo(x, y + size * 0.5)
      ctx2.stroke()
      break
    case 'eighth':
      // Eighth rest - dot with flag
      ctx2.beginPath()
      ctx2.arc(x - size * 0.1, y + size * 0.3, size * 0.12, 0, Math.PI * 2)
      ctx2.fill()
      ctx2.beginPath()
      ctx2.moveTo(x, y + size * 0.3)
      ctx2.quadraticCurveTo(x + size * 0.2, y + size * 0.1, x + size * 0.1, y - size * 0.2)
      ctx2.stroke()
      break
    case 'sixteenth':
      // Sixteenth rest - dot with double flag
      ctx2.beginPath()
      ctx2.arc(x - size * 0.1, y + size * 0.35, size * 0.12, 0, Math.PI * 2)
      ctx2.fill()
      ctx2.beginPath()
      ctx2.moveTo(x, y + size * 0.35)
      ctx2.quadraticCurveTo(x + size * 0.2, y + size * 0.15, x + size * 0.1, y - size * 0.2)
      ctx2.stroke()
      ctx2.beginPath()
      ctx2.moveTo(x + size * 0.05, y + size * 0.2)
      ctx2.quadraticCurveTo(x + size * 0.25, y, x + size * 0.15, y - size * 0.35)
      ctx2.stroke()
      break
  }
}
