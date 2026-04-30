# ch2-rhythm-fix Learnings

## noteTiming module (2026-04-30)
- Pure utility module with no React/DOM dependencies
- NoteDuration aligns with NoteType but excludes 'sixteenth'
- All functions are pure (no side effects)
- Type exports: NoteDuration, RhythmNote
- 8 helper functions for beat/width calculations and playback timing

## Testing patterns
- Used vitest with standard describe/it/expect
- Edge cases covered: empty arrays, single notes, all rests, mixed notes, out-of-bounds indices
- No mocking needed for pure functions


## ScrollableStaff refactor (2026-04-30)
- Replaced fixed NOTE_WIDTH spacing with variable spacing via getCumulativeWidthOffsets
- currentNoteIndex now tracked in useRef (not state) inside animate to prevent stale closures and animation restarts
- Canvas width is now precomputed and fixed (totalContentWidthRef), no unbounded growth
- Animation stops when noteIndexAtCenter >= notes.length
- Added duration indicators below each number: quarter (●), half (○), whole (▢), eighth (● with line)
- Rest notes render as "休" text instead of number
- Staff lines now span full canvas width (0 to width)
- Removed Note interface; ScrollableStaffProps.notes now uses RhythmNote[]
- Added dotsAbove/dotsBelow optional fields to RhythmNote interface
- FollowPractice.scheduleFeedbackClear signature simplified to single timestamp arg

## FollowPractice rewrite (2026-04-30)
- Removed useState for currentNoteIndex — now computed from elapsed time via getCurrentNoteIndex()
- cumulativeBeatOffsets stored in useRef, precomputed on notes/bpm change
- getExpectedNoteTime is now pure (no startTimeRef side effect)
- Rest notes: handleInput skips them, handleNoteComplete auto-completes silently
- Accuracy: (perfect + good) / playableNotes * 100 instead of allNotes/allNotes
- Added showResult state for result screen
- Added timeoutIdsRef for cleanup on unmount/stop
- Empty notes guard: start button disabled when notes.length === 0
- Must keep timeSignature prop — RhythmPractice.tsx passes it through
- ScrollableStaff already imports RhythmNote from noteTiming.ts
- NoteDuration is a subtype of string, so RhythmNote[] is compatible with ScrollableStaff's notes prop
- comboRef tracked alongside combo useState for synchronous reads in handleInput
- maxComboRef tracks highest combo achieved
