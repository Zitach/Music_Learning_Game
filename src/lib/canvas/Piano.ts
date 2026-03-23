/**
 * Piano keyboard canvas renderer
 * Draws a piano keyboard with click detection for musical notes
 */

export interface KeyLayout {
  note: string
  x: number
  y: number
  width: number
  height: number
  isBlack: boolean
}

export interface PianoConfig {
  startOctave?: number
  numOctaves?: number
}

export class Piano {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private startOctave: number
  private numOctaves: number
  private whiteKeys: KeyLayout[] = []
  private blackKeys: KeyLayout[] = []
  private whiteKeyWidth: number = 0
  private blackKeyWidth: number = 0
  private blackKeyHeight: number = 0

  // Color palette
  private readonly WHITE_KEY_COLOR = '#f8f8f8'
  private readonly WHITE_KEY_BORDER = '#333333'
  private readonly BLACK_KEY_COLOR = '#1a1a1a'
  private readonly BLACK_KEY_BORDER = '#111111'
  private readonly SHADOW_COLOR = 'rgba(0, 0, 0, 0.3)'

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number, config: PianoConfig = {}) {
    this.ctx = ctx
    this.width = width
    this.height = height
    this.startOctave = config.startOctave ?? 4
    this.numOctaves = config.numOctaves ?? 1
    this.calculateKeyDimensions()
    this.buildKeyLayout(this.startOctave, this.numOctaves)
  }

  private calculateKeyDimensions(): void {
    // One octave practice keyboard should include the top C as well.
    // e.g. C4 D4 E4 F4 G4 A4 B4 C5 => 8 white keys
    const whiteKeyCount = this.numOctaves * 7 + 1
    this.whiteKeyWidth = this.width / whiteKeyCount
    this.blackKeyWidth = this.whiteKeyWidth * 0.6
    this.blackKeyHeight = this.height * 0.6
  }

  private buildKeyLayout(startOctave: number, numOctaves: number): void {
    this.whiteKeys = []
    this.blackKeys = []

    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    // Black keys are positioned between white keys: C#/D#, D#/E#, F#/G#, G#/A#, A#/B#
    // E# and B# don't exist, so we skip them
    const blackKeyPositions: { [key: string]: string } = {
      'C': 'C#',
      'D': 'D#',
      'F': 'F#',
      'G': 'G#',
      'A': 'A#'
    }

    let whiteKeyIndex = 0

    for (let octave = 0; octave < numOctaves; octave++) {
      const currentOctave = startOctave + octave

      for (const note of whiteNotes) {
        const x = whiteKeyIndex * this.whiteKeyWidth
        const keyLayout: KeyLayout = {
          note: `${note}${currentOctave}`,
          x,
          y: 0,
          width: this.whiteKeyWidth,
          height: this.height,
          isBlack: false
        }
        this.whiteKeys.push(keyLayout)
        whiteKeyIndex++
      }

      const octaveWhiteStartIndex = octave * 7
      for (let i = 0; i < whiteNotes.length; i++) {
        const note = whiteNotes[i]
        const blackNote = blackKeyPositions[note]

        if (blackNote) {
          const x = (octaveWhiteStartIndex + i + 1) * this.whiteKeyWidth - this.blackKeyWidth / 2
          const keyLayout: KeyLayout = {
            note: `${blackNote}${currentOctave}`,
            x,
            y: 0,
            width: this.blackKeyWidth,
            height: this.blackKeyHeight,
            isBlack: true
          }
          this.blackKeys.push(keyLayout)
        }
      }
    }

    const finalOctave = startOctave + numOctaves
    this.whiteKeys.push({
      note: `C${finalOctave}`,
      x: whiteKeyIndex * this.whiteKeyWidth,
      y: 0,
      width: this.whiteKeyWidth,
      height: this.height,
      isBlack: false,
    })
  }

  /**
   * Draws the piano keyboard
   * @param highlightedKey Optional note name to highlight (e.g., "C4", "D#4")
   * @param highlightColor Optional color for highlight (defaults to green)
   */
  draw(highlightedKey?: string, highlightColor: string = '#22c55e'): void {
    const ctx = this.ctx

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height)

    // Draw white keys first (background layer)
    for (const key of this.whiteKeys) {
      this.drawWhiteKey(key, highlightedKey, highlightColor)
    }

    // Draw black keys on top
    for (const key of this.blackKeys) {
      this.drawBlackKey(key, highlightedKey, highlightColor)
    }
  }

  private drawWhiteKey(key: KeyLayout, highlightedKey?: string, highlightColor: string = '#22c55e'): void {
    const ctx = this.ctx
    const radius = 4

    ctx.save()

    // Determine key color based on highlight state
    let fillColor = this.WHITE_KEY_COLOR
    if (highlightedKey && key.note === highlightedKey) {
      fillColor = highlightColor
    }

    // Draw shadow
    ctx.shadowColor = this.SHADOW_COLOR
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // Draw rounded rectangle
    ctx.beginPath()
    ctx.roundRect(key.x + 1, key.y + 1, key.width - 2, key.height - 2, radius)
    ctx.fillStyle = fillColor
    ctx.fill()

    // Reset shadow for border
    ctx.shadowColor = 'transparent'

    // Draw border
    ctx.strokeStyle = this.WHITE_KEY_BORDER
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw inner highlight for 3D effect
    const gradient = ctx.createLinearGradient(key.x, key.y, key.x, key.y + key.height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.restore()
  }

  private drawBlackKey(key: KeyLayout, highlightedKey?: string, highlightColor: string = '#22c55e'): void {
    const ctx = this.ctx
    const radius = 3

    ctx.save()

    // Determine key color based on highlight state
    let fillColor = this.BLACK_KEY_COLOR
    if (highlightedKey && key.note === highlightedKey) {
      fillColor = highlightColor
    }

    // Draw shadow
    ctx.shadowColor = this.SHADOW_COLOR
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 3

    // Draw rounded rectangle
    ctx.beginPath()
    ctx.roundRect(key.x, key.y + 1, key.width - 1, key.height - 1, radius)
    ctx.fillStyle = fillColor
    ctx.fill()

    // Reset shadow for border
    ctx.shadowColor = 'transparent'

    // Draw border
    ctx.strokeStyle = this.BLACK_KEY_BORDER
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw subtle highlight on top edge
    const gradient = ctx.createLinearGradient(key.x, key.y, key.x, key.y + key.height * 0.3)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.restore()
  }

  /**
   * Returns the note name at the given position, or null if no key is clicked
   * @param x X coordinate (relative to canvas)
   * @param y Y coordinate (relative to canvas)
   * @returns Note name (e.g., "C4", "D#4") or null if no key at position
   */
  getKeyAtPosition(x: number, y: number): string | null {
    // Check black keys first (they're on top)
    for (const key of this.blackKeys) {
      if (this.isPointInKey(x, y, key)) {
        return key.note
      }
    }

    // Then check white keys
    for (const key of this.whiteKeys) {
      if (this.isPointInKey(x, y, key)) {
        return key.note
      }
    }

    return null
  }

  private isPointInKey(x: number, y: number, key: KeyLayout): boolean {
    return x >= key.x && x <= key.x + key.width && y >= key.y && y <= key.y + key.height
  }

  /**
   * Updates dimensions and recalculates key layout
   */
  updateDimensions(width: number, height: number): void {
    this.width = width
    this.height = height
    this.calculateKeyDimensions()
    this.buildKeyLayout(this.startOctave, this.numOctaves)
  }

  /**
   * Gets the layout of all keys (useful for debugging or overlays)
   */
  getKeyLayout(): { whiteKeys: KeyLayout[], blackKeys: KeyLayout[] } {
    return {
      whiteKeys: [...this.whiteKeys],
      blackKeys: [...this.blackKeys]
    }
  }
}
