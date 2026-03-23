/**
 * Clef Notation Rendering Utility
 * Pure Canvas 2D rendering for music notation clefs
 */

export interface ClefRenderOptions {
  ctx: CanvasRenderingContext2D
  x: number
  y: number  // top of staff line 1
  size?: number
}

const DEFAULT_SIZE = 40

/**
 * Draw a treble clef (G clef) centered on the G line (second line from bottom)
 * Stylized "G" with spiral, used for higher notes
 */
export function drawTrebleClef(options: ClefRenderOptions): void {
  const { ctx, x, y, size = DEFAULT_SIZE } = options
  const s = size / 40 // scale factor

  ctx.save()
  ctx.strokeStyle = '#000'
  ctx.fillStyle = '#000'
  ctx.lineWidth = 2 * s
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Staff line spacing
  const lineSpacing = size / 4

  // G line is the second line from bottom (line index 1, 0-indexed)
  // Center the clef on this line
  const gLineY = y + lineSpacing * 3 // line 1 is bottom, line 3 is G line (0-indexed: lines 0,1,2,3 where 3=G)

  ctx.beginPath()

  // Treble clef is a complex spiral shape
  // Simplified recognizable version:

  // Main spiral stem going up
  ctx.moveTo(x + 18 * s, gLineY + 2 * s)

  // Upward stroke
  ctx.bezierCurveTo(
    x + 18 * s, gLineY - 8 * s,
    x + 8 * s, gLineY - 10 * s,
    x + 8 * s, gLineY - 16 * s
  )

  // Curve around top
  ctx.bezierCurveTo(
    x + 8 * s, gLineY - 24 * s,
    x + 18 * s, gLineY - 26 * s,
    x + 24 * s, gLineY - 20 * s
  )

  // Curve back down
  ctx.bezierCurveTo(
    x + 28 * s, gLineY - 16 * s,
    x + 22 * s, gLineY - 14 * s,
    x + 22 * s, gLineY - 10 * s
  )

  // Inner spiral curl (the G hook)
  ctx.bezierCurveTo(
    x + 22 * s, gLineY - 6 * s,
    x + 16 * s, gLineY - 4 * s,
    x + 12 * s, gLineY - 2 * s
  )

  // Hook inward to center
  ctx.bezierCurveTo(
    x + 8 * s, gLineY,
    x + 10 * s, gLineY + 4 * s,
    x + 16 * s, gLineY + 4 * s
  )

  // Bottom tail curving up and around
  ctx.bezierCurveTo(
    x + 26 * s, gLineY + 4 * s,
    x + 28 * s, gLineY - 4 * s,
    x + 28 * s, gLineY - 10 * s
  )

  // Continue spiral inward
  ctx.bezierCurveTo(
    x + 28 * s, gLineY - 16 * s,
    x + 20 * s, gLineY - 16 * s,
    x + 16 * s, gLineY - 12 * s
  )

  ctx.stroke()

  // The G clef has a small spiral inside near the bottom
  ctx.beginPath()
  ctx.arc(x + 16 * s, gLineY + 2 * s, 4 * s, 0, Math.PI * 1.5)
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw a bass clef (F clef) centered on the F line (second line from top)
 * Stylized "F" with two dots, used for lower notes
 */
export function drawBassClef(options: ClefRenderOptions): void {
  const { ctx, x, y, size = DEFAULT_SIZE } = options
  const s = size / 40 // scale factor

  ctx.save()
  ctx.strokeStyle = '#000'
  ctx.fillStyle = '#000'
  ctx.lineWidth = 2 * s
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Staff line spacing
  const lineSpacing = size / 4

  // F line is second from top (line 3 in 5-line staff, 0-indexed)
  const fLineY = y + lineSpacing

  ctx.beginPath()

  // Bass clef is a stylized "F" shape with a curve
  // Main vertical stem
  ctx.moveTo(x + 10 * s, fLineY - 8 * s)
  ctx.lineTo(x + 10 * s, fLineY + 12 * s)

  // Top horizontal bar
  ctx.moveTo(x + 10 * s, fLineY - 8 * s)
  ctx.bezierCurveTo(
    x + 14 * s, fLineY - 10 * s,
    x + 22 * s, fLineY - 10 * s,
    x + 26 * s, fLineY - 8 * s
  )

  // Middle horizontal bar
  ctx.moveTo(x + 10 * s, fLineY + 2 * s)
  ctx.bezierCurveTo(
    x + 16 * s, fLineY,
    x + 22 * s, fLineY,
    x + 26 * s, fLineY + 2 * s
  )

  ctx.stroke()

  // The dot on top (characteristic of bass clef)
  ctx.beginPath()
  ctx.arc(x + 10 * s, fLineY - 12 * s, 2.5 * s, 0, Math.PI * 2)
  ctx.fill()

  // Two dots after the F (distinguishing feature)
  const dotX = x + 32 * s
  ctx.beginPath()
  ctx.arc(dotX, fLineY - 4 * s, 2.5 * s, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(dotX, fLineY + 4 * s, 2.5 * s, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
