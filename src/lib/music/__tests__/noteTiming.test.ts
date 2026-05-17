import { describe, it, expect } from 'vitest'
import {
  getDurationBeats,
  getDurationWidth,
  getCumulativeBeatOffsets,
  getCumulativeWidthOffsets,
  getCurrentNoteIndex,
  getExpectedNoteTimeMs,
  isRestNote,
  getPlayableNoteIndices,
  type RhythmNote,
} from '../noteTiming'

describe('getDurationBeats', () => {
  it('returns correct beats for each duration', () => {
    expect(getDurationBeats('whole')).toBe(4)
    expect(getDurationBeats('half')).toBe(2)
    expect(getDurationBeats('quarter')).toBe(1)
    expect(getDurationBeats('eighth')).toBe(0.5)
  })
})

describe('getDurationWidth', () => {
  it('returns correct width multipliers for baseWidth=100', () => {
    expect(getDurationWidth('whole', 100)).toBe(400)
    expect(getDurationWidth('half', 100)).toBe(200)
    expect(getDurationWidth('quarter', 100)).toBe(100)
    expect(getDurationWidth('eighth', 100)).toBe(50)
  })

  it('works with different baseWidth values', () => {
    expect(getDurationWidth('quarter', 50)).toBe(50)
    expect(getDurationWidth('half', 60)).toBe(120)
    expect(getDurationWidth('eighth', 80)).toBe(40)
  })
})

describe('getCumulativeBeatOffsets', () => {
  it('returns [0] for single note', () => {
    const notes: RhythmNote[] = [{ number: 1, duration: 'quarter' }]
    expect(getCumulativeBeatOffsets(notes)).toEqual([0])
  })

  it('returns correct offsets for multiple notes', () => {
    const notes: RhythmNote[] = [
      { number: 1, duration: 'quarter' },
      { number: 2, duration: 'half' },
      { number: 3, duration: 'eighth' },
    ]
    expect(getCumulativeBeatOffsets(notes)).toEqual([0, 1, 3])
  })

  it('returns empty array for empty input', () => {
    expect(getCumulativeBeatOffsets([])).toEqual([])
  })

  it('handles all whole notes', () => {
    const notes: RhythmNote[] = [
      { number: 1, duration: 'whole' },
      { number: 2, duration: 'whole' },
    ]
    expect(getCumulativeBeatOffsets(notes)).toEqual([0, 4])
  })
})

describe('getCumulativeWidthOffsets', () => {
  it('returns [0] for single note', () => {
    const notes: RhythmNote[] = [{ number: 1, duration: 'quarter' }]
    expect(getCumulativeWidthOffsets(notes, 100)).toEqual([0])
  })

  it('returns correct pixel offsets', () => {
    const notes: RhythmNote[] = [
      { number: 1, duration: 'quarter' },
      { number: 2, duration: 'half' },
      { number: 3, duration: 'eighth' },
    ]
    expect(getCumulativeWidthOffsets(notes, 100)).toEqual([0, 100, 300])
  })

  it('returns empty array for empty input', () => {
    expect(getCumulativeWidthOffsets([], 100)).toEqual([])
  })
})

describe('getCurrentNoteIndex', () => {
  const offsets = [0, 1, 3, 3.5]
  const beatDurationMs = 500

  it('returns -1 for empty offsets', () => {
    expect(getCurrentNoteIndex(0, 500, [])).toBe(-1)
  })

  it('returns first note at exact start', () => {
    expect(getCurrentNoteIndex(0, beatDurationMs, offsets)).toBe(0)
  })

  it('returns correct note during playback', () => {
    expect(getCurrentNoteIndex(250, beatDurationMs, offsets)).toBe(0)
    expect(getCurrentNoteIndex(600, beatDurationMs, offsets)).toBe(1)
    expect(getCurrentNoteIndex(1500, beatDurationMs, offsets)).toBe(2)
    expect(getCurrentNoteIndex(1800, beatDurationMs, offsets)).toBe(3)
  })

  it('returns last note after sequence ends', () => {
    expect(getCurrentNoteIndex(10000, beatDurationMs, offsets)).toBe(3)
  })

  it('returns first note for very small elapsed time', () => {
    expect(getCurrentNoteIndex(1, beatDurationMs, offsets)).toBe(0)
  })
})

describe('getExpectedNoteTimeMs', () => {
  const offsets = [0, 1, 3, 3.5]
  const beatDurationMs = 500

  it('returns correct time for each note', () => {
    expect(getExpectedNoteTimeMs(0, beatDurationMs, offsets)).toBe(0)
    expect(getExpectedNoteTimeMs(1, beatDurationMs, offsets)).toBe(500)
    expect(getExpectedNoteTimeMs(2, beatDurationMs, offsets)).toBe(1500)
    expect(getExpectedNoteTimeMs(3, beatDurationMs, offsets)).toBe(1750)
  })

  it('returns -1 for out of bounds index', () => {
    expect(getExpectedNoteTimeMs(-1, beatDurationMs, offsets)).toBe(-1)
    expect(getExpectedNoteTimeMs(4, beatDurationMs, offsets)).toBe(-1)
  })

  it('returns -1 for empty offsets', () => {
    expect(getExpectedNoteTimeMs(0, beatDurationMs, [])).toBe(-1)
  })
})

describe('isRestNote', () => {
  it('returns true when isRest is true', () => {
    expect(isRestNote({ number: 1, duration: 'quarter', isRest: true })).toBe(true)
  })

  it('returns false when isRest is false', () => {
    expect(isRestNote({ number: 1, duration: 'quarter', isRest: false })).toBe(false)
  })

  it('returns false when isRest is undefined', () => {
    expect(isRestNote({ number: 1, duration: 'quarter' })).toBe(false)
  })
})

describe('getPlayableNoteIndices', () => {
  it('returns all indices for notes without rests', () => {
    const notes: RhythmNote[] = [
      { number: 1, duration: 'quarter' },
      { number: 2, duration: 'half' },
    ]
    expect(getPlayableNoteIndices(notes)).toEqual([0, 1])
  })

  it('returns empty array for all rests', () => {
    const notes: RhythmNote[] = [
      { number: 1, duration: 'quarter', isRest: true },
      { number: 2, duration: 'half', isRest: true },
    ]
    expect(getPlayableNoteIndices(notes)).toEqual([])
  })

  it('returns only non-rest indices for mixed notes', () => {
    const notes: RhythmNote[] = [
      { number: 1, duration: 'quarter' },
      { number: 2, duration: 'half', isRest: true },
      { number: 3, duration: 'eighth' },
      { number: 4, duration: 'whole', isRest: true },
    ]
    expect(getPlayableNoteIndices(notes)).toEqual([0, 2])
  })

  it('returns empty array for empty input', () => {
    expect(getPlayableNoteIndices([])).toEqual([])
  })

  it('handles single playable note', () => {
    const notes: RhythmNote[] = [{ number: 1, duration: 'whole' }]
    expect(getPlayableNoteIndices(notes)).toEqual([0])
  })

  it('handles single rest note', () => {
    const notes: RhythmNote[] = [{ number: 1, duration: 'whole', isRest: true }]
    expect(getPlayableNoteIndices(notes)).toEqual([])
  })
})
