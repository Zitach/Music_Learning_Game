import { EXTENDED_QUESTION_BANK } from './questionBankExtended'

export type QuestionMode = 'practice' | 'assessment'
export type QuestionType = 'piano' | 'choice'
export type AnswerMode = 'exact' | 'pitch_equivalent'
export type QuestionConcept =
  | 'note_name'
  | 'semitone_whole_tone'
  | 'accidental'
  | 'enharmonic'
  | 'rhythm_value'
  | 'rest'
  | 'time_signature'
  | 'rhythm_follow'
  | 'number_notation'
  | 'staff_reading'
  | 'major_scale'
  | 'minor_scale'
  | 'key_signature'
  | 'interval'
  | 'consonance_dissonance'
  | 'interval_inversion'
  | 'triad'
  | 'seventh_chord'
  | 'chord_symbol'
  | 'final_mixed_review'
export type QuestionDifficulty = 'intro' | 'basic' | 'intermediate'

export interface QuestionItem {
  skillId: string
  mode: QuestionMode
  type: QuestionType
  prompt: string
  answer: string
  options?: string[]
  answerMode: AnswerMode
  explanation?: string
  concept?: QuestionConcept
  difficulty?: QuestionDifficulty
}

export const CH1_QUESTION_BANK: QuestionItem[] = [
  { skillId: 'ch1-s1', mode: 'practice', type: 'piano', prompt: '请按下 C 键。', answer: 'C4', answerMode: 'exact', concept: 'note_name', difficulty: 'intro' },
  { skillId: 'ch1-s1', mode: 'practice', type: 'piano', prompt: '请按下 D 键。', answer: 'D4', answerMode: 'exact', concept: 'note_name', difficulty: 'intro' },
  { skillId: 'ch1-s1', mode: 'practice', type: 'piano', prompt: '请按下 E 键。', answer: 'E4', answerMode: 'exact', concept: 'note_name', difficulty: 'intro' },
  { skillId: 'ch1-s1', mode: 'practice', type: 'piano', prompt: '请按下 F 键。', answer: 'F4', answerMode: 'exact', concept: 'note_name', difficulty: 'intro' },
  { skillId: 'ch1-s1', mode: 'practice', type: 'piano', prompt: '请按下 G 键。', answer: 'G4', answerMode: 'exact', concept: 'note_name', difficulty: 'intro' },
  { skillId: 'ch1-s1', mode: 'practice', type: 'piano', prompt: '请按下 A 键。', answer: 'A4', answerMode: 'exact', concept: 'note_name', difficulty: 'intro' },
  { skillId: 'ch1-s1', mode: 'practice', type: 'piano', prompt: '请按下 B 键。', answer: 'B4', answerMode: 'exact', concept: 'note_name', difficulty: 'intro' },

  { skillId: 'ch1-s2', mode: 'practice', type: 'piano', prompt: '比 C 高一个全音的是哪个键？', answer: 'D4', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'intro' },
  { skillId: 'ch1-s2', mode: 'practice', type: 'piano', prompt: '比 E 高一个半音的是哪个键？', answer: 'F4', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'intro' },
  { skillId: 'ch1-s2', mode: 'practice', type: 'piano', prompt: '比 G 高一个全音的是哪个键？', answer: 'A4', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'basic' },
  { skillId: 'ch1-s2', mode: 'practice', type: 'piano', prompt: '比 B 高一个半音的是哪个键？', answer: 'C5', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'basic' },
  { skillId: 'ch1-s2', mode: 'practice', type: 'piano', prompt: '在这一组里，比 D 高一个全音的是哪个键？', answer: 'E4', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'basic' },

  { skillId: 'ch1-s3', mode: 'practice', type: 'piano', prompt: '请弹出 C 的升号音。', answer: 'C#4', answerMode: 'exact', explanation: '题目明确要求升号写法。', concept: 'accidental', difficulty: 'intro' },
  { skillId: 'ch1-s3', mode: 'practice', type: 'piano', prompt: '请弹出 F 的升号音。', answer: 'F#4', answerMode: 'exact', explanation: '题目明确要求升号写法。', concept: 'accidental', difficulty: 'intro' },
  { skillId: 'ch1-s3', mode: 'practice', type: 'piano', prompt: '这里与 Db 等音的是哪个黑键？', answer: 'C#4', answerMode: 'pitch_equivalent', explanation: 'Db 与 C# 是等音。', concept: 'enharmonic', difficulty: 'basic' },
  { skillId: 'ch1-s3', mode: 'practice', type: 'piano', prompt: '与 Ab 等音的升号音是什么？', answer: 'G#4', answerMode: 'exact', concept: 'enharmonic', difficulty: 'basic' },
  { skillId: 'ch1-s3', mode: 'practice', type: 'piano', prompt: '与 Eb 等音的升号音是什么？', answer: 'D#4', answerMode: 'exact', concept: 'enharmonic', difficulty: 'basic' },

  { skillId: 'ch1-s1', mode: 'assessment', type: 'piano', prompt: '请在键盘上按出 C。', answer: 'C4', answerMode: 'exact', concept: 'note_name', difficulty: 'basic' },
  { skillId: 'ch1-s1', mode: 'assessment', type: 'piano', prompt: '请在键盘上按出 G。', answer: 'G4', answerMode: 'exact', concept: 'note_name', difficulty: 'basic' },
  { skillId: 'ch1-s1', mode: 'assessment', type: 'piano', prompt: '请在键盘上按出 F。', answer: 'F4', answerMode: 'exact', concept: 'note_name', difficulty: 'basic' },

  { skillId: 'ch1-s2', mode: 'assessment', type: 'choice', prompt: 'C 到 D 是全音还是半音？', options: ['全音', '半音'], answer: '全音', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'basic' },
  { skillId: 'ch1-s2', mode: 'assessment', type: 'choice', prompt: 'E 到 F 是全音还是半音？', options: ['全音', '半音'], answer: '半音', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'basic' },
  { skillId: 'ch1-s2', mode: 'assessment', type: 'piano', prompt: '请弹出比 C 高一个全音的音。', answer: 'D4', answerMode: 'exact', concept: 'semitone_whole_tone', difficulty: 'basic' },

  { skillId: 'ch1-s3', mode: 'assessment', type: 'choice', prompt: '与 C# 等音的是哪个音？', options: ['Db', 'D', 'Eb'], answer: 'Db', answerMode: 'exact', concept: 'enharmonic', difficulty: 'basic' },
  { skillId: 'ch1-s3', mode: 'assessment', type: 'piano', prompt: '请在键盘上弹出 F#。', answer: 'F#4', answerMode: 'exact', concept: 'accidental', difficulty: 'basic' },
  { skillId: 'ch1-s3', mode: 'assessment', type: 'choice', prompt: '升号或降号会把音高改变多少？', options: ['全音', '半音', '八度'], answer: '半音', answerMode: 'exact', concept: 'accidental', difficulty: 'basic' },
]

const QUESTION_BANK: QuestionItem[] = [...CH1_QUESTION_BANK, ...EXTENDED_QUESTION_BANK]

function shuffleItems<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4,
  F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11,
}

function normalizeNoteParts(note: string): { pitchClass: string; octave: number } | null {
  const match = note.match(/^([A-G](?:#|b)?)(\d+)$/)
  if (!match) return null
  return {
    pitchClass: match[1],
    octave: Number(match[2]),
  }
}

function toMidiLikeValue(note: string): number | null {
  const parsed = normalizeNoteParts(note)
  if (!parsed) return null
  const semitone = NOTE_TO_SEMITONE[parsed.pitchClass]
  if (semitone === undefined) return null
  return parsed.octave * 12 + semitone
}

export function isAnswerCorrect(userAnswer: string, expectedAnswer: string, answerMode: AnswerMode): boolean {
  if (answerMode === 'exact') {
    return userAnswer === expectedAnswer
  }

  const actual = toMidiLikeValue(userAnswer)
  const expected = toMidiLikeValue(expectedAnswer)
  if (actual === null || expected === null) {
    return userAnswer === expectedAnswer
  }
  return actual === expected
}

export function getQuestionsForSkill(skillId: string, mode: QuestionMode): QuestionItem[] {
  return QUESTION_BANK.filter(question => question.skillId === skillId && question.mode === mode)
}

export function getShuffledQuestionsForSkill(skillId: string, mode: QuestionMode): QuestionItem[] {
  return shuffleItems(getQuestionsForSkill(skillId, mode))
}

