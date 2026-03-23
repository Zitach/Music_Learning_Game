import type { AnswerMode } from './questionTypes'

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4,
  F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11,
}

export function normalizeNoteParts(note: string): { pitchClass: string; octave: number } | null {
  const match = note.match(/^([A-G](?:#|b)?)(\d+)$/)
  if (!match) return null
  return {
    pitchClass: match[1],
    octave: Number(match[2]),
  }
}

export function toMidiLikeValue(note: string): number | null {
  const parsed = normalizeNoteParts(note)
  if (!parsed) return null
  const semitone = NOTE_TO_SEMITONE[parsed.pitchClass]
  if (semitone === undefined) return null
  return parsed.octave * 12 + semitone
}

export function isAnswerCorrect(userAnswer: string, expectedAnswer: string, answerMode: AnswerMode): boolean {
  if (answerMode === 'exact') return userAnswer === expectedAnswer

  const actual = toMidiLikeValue(userAnswer)
  const expected = toMidiLikeValue(expectedAnswer)
  if (actual === null || expected === null) return userAnswer === expectedAnswer
  return actual === expected
}
