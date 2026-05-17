export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth'

export interface RhythmNote {
  number: number
  duration: NoteDuration
  isRest?: boolean
  dotsAbove?: number
  dotsBelow?: number
}

export function getDurationBeats(duration: NoteDuration): number {
  switch (duration) {
    case 'whole':
      return 4
    case 'half':
      return 2
    case 'quarter':
      return 1
    case 'eighth':
      return 0.5
  }
}

export function getDurationWidth(duration: NoteDuration, baseWidth: number): number {
  switch (duration) {
    case 'whole':
      return baseWidth * 4
    case 'half':
      return baseWidth * 2
    case 'quarter':
      return baseWidth * 1
    case 'eighth':
      return baseWidth * 0.5
  }
}

export function getCumulativeBeatOffsets(notes: RhythmNote[]): number[] {
  const offsets: number[] = []
  let current = 0
  for (const note of notes) {
    offsets.push(current)
    current += getDurationBeats(note.duration)
  }
  return offsets
}

export function getCumulativeWidthOffsets(notes: RhythmNote[], baseWidth: number): number[] {
  const offsets: number[] = []
  let current = 0
  for (const note of notes) {
    offsets.push(current)
    current += getDurationWidth(note.duration, baseWidth)
  }
  return offsets
}

export function getCurrentNoteIndex(
  elapsedMs: number,
  beatDurationMs: number,
  cumulativeBeatOffsets: number[]
): number {
  if (cumulativeBeatOffsets.length === 0) {
    return -1
  }
  const elapsedBeats = elapsedMs / beatDurationMs
  for (let i = cumulativeBeatOffsets.length - 1; i >= 0; i--) {
    if (elapsedBeats >= cumulativeBeatOffsets[i]) {
      return i
    }
  }
  return -1
}

export function getExpectedNoteTimeMs(
  noteIndex: number,
  beatDurationMs: number,
  cumulativeBeatOffsets: number[]
): number {
  if (noteIndex < 0 || noteIndex >= cumulativeBeatOffsets.length) {
    return -1
  }
  return cumulativeBeatOffsets[noteIndex] * beatDurationMs
}

export function isRestNote(note: RhythmNote): boolean {
  return note.isRest === true
}

export function getPlayableNoteIndices(notes: RhythmNote[]): number[] {
  const indices: number[] = []
  for (let i = 0; i < notes.length; i++) {
    if (!isRestNote(notes[i])) {
      indices.push(i)
    }
  }
  return indices
}
