/**
 * Music notation rendering utilities
 * Ledger lines, key signatures, and accidentals for standard music notation
 */

/**
 * Options for drawing ledger lines
 */
export interface LedgerLineOptions {
  ctx: CanvasRenderingContext2D
  x: number        // center X of the note
  y: number        // Y position of the note
  staffY: number   // Y of top staff line
  lineSpacing: number
  width?: number   // default 20px
}

/**
 * Draw ledger lines above or below the staff
 * Ledger lines are short horizontal lines centered on the note
 */
export function drawLedgerLines(options: LedgerLineOptions): void {
  const { ctx, x, y, staffY, lineSpacing, width = 20 } = options
  const staffBottom = staffY + 4 * lineSpacing // bottom line of staff

  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1

  const halfWidth = width / 2

  // Note is above the staff (above top line)
  if (y < staffY) {
    let currentY = staffY - lineSpacing
    while (currentY >= y - lineSpacing / 2) {
      ctx.beginPath()
      ctx.moveTo(x - halfWidth, currentY)
      ctx.lineTo(x + halfWidth, currentY)
      ctx.stroke()
      currentY -= lineSpacing
    }
  }

  // Note is below the staff (below bottom line)
  if (y > staffBottom) {
    let currentY = staffBottom + lineSpacing
    while (currentY <= y + lineSpacing / 2) {
      ctx.beginPath()
      ctx.moveTo(x - halfWidth, currentY)
      ctx.lineTo(x + halfWidth, currentY)
      ctx.stroke()
      currentY += lineSpacing
    }
  }
}

/**
 * Options for drawing key signatures
 */
export interface KeySignatureOptions {
  ctx: CanvasRenderingContext2D
  x: number
  y: number        // top of staff line 1
  key: number      // 0=C, 1=G, 2=D, 3=A, 4=E, 5=B, 6=F#, 7=C# (positive = sharps, negative = flats)
  size?: number
}

/**
 * Staff positions for accidentals (0 = bottom line, 4 = top line)
 * Sharps from left to right: F, C, G, D, A, E, B
 * Flats from left to right: B, E, A, D, G, C, F
 */
const SHARP_POSITIONS = [0, 2, 4, 1, 3, 5, 6] // F, C, G, D, A, E, B
const FLAT_POSITIONS = [6, 3, 1, 4, 2, 0, 5]  // B, E, A, D, G, C, F

/**
 * Get Y position for a given staff position (0-6)
 */
function getStaffY(y: number, position: number, lineSpacing: number): number {
  // Position 0 = bottom line, position 4 = top line
  // Each position is half a lineSpacing (between lines count as positions)
  // Even positions (0, 2, 4, 6) are on lines
  // Odd positions (1, 3, 5) are in spaces
  const lineIndex = Math.floor(position / 2)
  const isOnLine = position % 2 === 0
  const baseY = y + (4 - lineIndex) * lineSpacing // 4 = top line index
  return isOnLine ? baseY : baseY - lineSpacing / 2
}

/**
 * Draw a sharp symbol (#)
 */
function drawSharp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = size * 0.08

  const thick = size * 0.13
  const thin = size * 0.06
  const height = size * 0.35
  const width = size * 0.22

  // Two vertical thick lines (slightly tilted)
  ctx.beginPath()
  ctx.moveTo(x - thick / 2 - thin / 2, y - height / 2)
  ctx.lineTo(x - thick / 2 + thin / 2, y + height / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + thick / 2 - thin / 2, y - height / 2)
  ctx.lineTo(x + thick / 2 + thin / 2, y + height / 2)
  ctx.stroke()

  // Two horizontal thin lines
  const barY1 = y - size * 0.08
  const barY2 = y + size * 0.08
  const barX1 = x - width / 2
  const barX2 = x + width / 2

  ctx.beginPath()
  ctx.moveTo(barX1, barY1)
  ctx.lineTo(barX2, barY1)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(barX1, barY2)
  ctx.lineTo(barX2, barY2)
  ctx.stroke()
}

/**
 * Draw a flat symbol (b)
 */
function drawFlat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = size * 0.08

  const height = size * 0.45
  const width = size * 0.18

  // Vertical stem
  ctx.beginPath()
  ctx.moveTo(x, y - height / 2)
  ctx.lineTo(x, y + height * 0.3)
  ctx.stroke()

  // Curved bottom part (simplified as a small horizontal bar)
  const barY = y + height * 0.15
  ctx.beginPath()
  ctx.moveTo(x - width / 2, barY - size * 0.04)
  ctx.lineTo(x + width / 4, barY - size * 0.04)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x - width / 2, barY + size * 0.04)
  ctx.lineTo(x + width / 4, barY + size * 0.04)
  ctx.stroke()
}

/**
 * Draw a natural symbol (♮)
 */
function drawNatural(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = size * 0.08

  const height = size * 0.4
  const width = size * 0.16

  // Two vertical stems (slightly angled)
  ctx.beginPath()
  ctx.moveTo(x - width / 3, y - height / 2)
  ctx.lineTo(x - width / 3 + size * 0.05, y + height / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + width / 3, y - height / 2)
  ctx.lineTo(x + width / 3 + size * 0.05, y + height / 2)
  ctx.stroke()

  // Two horizontal bars
  const barY1 = y - size * 0.06
  const barY2 = y + size * 0.06
  const barX1 = x - width / 2
  const barX2 = x + width / 2

  ctx.beginPath()
  ctx.moveTo(barX1, barY1)
  ctx.lineTo(barX2, barY1)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(barX1, barY2)
  ctx.lineTo(barX2, barY2)
  ctx.stroke()
}

/**
 * Draw key signature (sharps or flats)
 */
export function drawKeySignature(options: KeySignatureOptions): void {
  const { ctx, x, y, key, size = 30 } = options
  const lineSpacing = size / 4

  const numAccidentals = Math.abs(key)

  if (numAccidentals === 0 || numAccidentals > 7) return

  if (key > 0) {
    // Sharps: 1=G, 2=D, 3=A, 4=E, 5=B, 6=F#, 7=C#
    for (let i = 0; i < numAccidentals; i++) {
      const position = SHARP_POSITIONS[i]
      const accY = getStaffY(y, position, lineSpacing)
      const accX = x + i * size * 0.5
      drawSharp(ctx, accX, accY, size)
    }
  } else {
    // Flats: -1=F, -2=Bb, -3=Eb, -4=Ab, -5=Db, -6=Gb, -7=Cb
    for (let i = 0; i < numAccidentals; i++) {
      const position = FLAT_POSITIONS[i]
      const accY = getStaffY(y, position, lineSpacing)
      const accX = x + i * size * 0.5
      drawFlat(ctx, accX, accY, size)
    }
  }
}

/**
 * Options for drawing accidentals
 */
export interface AccidentalOptions {
  ctx: CanvasRenderingContext2D
  x: number
  y: number        // Y position of the note
  type: 'sharp' | 'flat' | 'natural'
  size?: number
}

/**
 * Draw an accidental symbol (sharp, flat, or natural)
 */
export function drawAccidental(options: AccidentalOptions): void {
  const { ctx, x, y, type, size = 20 } = options

  switch (type) {
    case 'sharp':
      drawSharp(ctx, x, y, size)
      break
    case 'flat':
      drawFlat(ctx, x, y, size)
      break
    case 'natural':
      drawNatural(ctx, x, y, size)
      break
  }
}
