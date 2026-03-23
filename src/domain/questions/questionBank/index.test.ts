import { describe, expect, test } from 'vitest'
import { isAnswerCorrect, normalizeNoteParts, toMidiLikeValue } from './index'

describe('question evaluators', () => {
  test('matches exact answers', () => {
    expect(isAnswerCorrect('C4', 'C4', 'exact')).toBe(true)
    expect(isAnswerCorrect('C4', 'D4', 'exact')).toBe(false)
  })

  test('matches pitch equivalent answers', () => {
    expect(isAnswerCorrect('C#4', 'Db4', 'pitch_equivalent')).toBe(true)
  })

  test('parses note parts and midi-like values', () => {
    expect(normalizeNoteParts('Bb3')).toEqual({ pitchClass: 'Bb', octave: 3 })
    expect(toMidiLikeValue('C4')).toBe(48)
    expect(toMidiLikeValue('X4')).toBeNull()
  })
})

