const NOTE_TO_SOLFEGE: Record<string, string> = {
  'C': 'do', 'C#': 'di', 'Db': 'ra',
  'D': 're', 'D#': 'ri', 'Eb': 'me',
  'E': 'mi',
  'F': 'fa', 'F#': 'fi', 'Gb': 'se',
  'G': 'sol', 'G#': 'si', 'Ab': 'le',
  'A': 'la', 'A#': 'li', 'Bb': 'te',
  'B': 'si'
}

const SOLFEGE_TO_NOTE: Record<string, string> = {
  'do': 'C', 'di': 'C#', 'ra': 'Db',
  're': 'D', 'ri': 'D#', 'me': 'Eb',
  'mi': 'E',
  'fa': 'F', 'fi': 'F#', 'se': 'Gb',
  'sol': 'G', 'le': 'Ab',
  'la': 'A', 'li': 'A#', 'te': 'Bb',
  'si': 'B'
}

function noteToSolfege(note: string): string {
  const noteName = note.replace(/\d+$/, '')
  return NOTE_TO_SOLFEGE[noteName] ?? noteName
}

function solfegeToNote(solfege: string): string {
  return SOLFEGE_TO_NOTE[solfege] ?? solfege
}

function getSolfegeForNoteName(noteName: string): string {
  return NOTE_TO_SOLFEGE[noteName] ?? noteName
}

export {
  NOTE_TO_SOLFEGE,
  SOLFEGE_TO_NOTE,
  noteToSolfege,
  solfegeToNote,
  getSolfegeForNoteName
}
