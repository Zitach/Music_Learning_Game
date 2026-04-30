
## T5: Edge cases & BPM scaling (2026-04-30)

### accuracy.ts
- Added `getScaledThresholds(bpm)` to scale judgment windows based on BPM
- Formula: beatInterval = 60000 / bpm; perfect = min(100, beatInterval * 0.25); good = min(200, beatInterval * 0.5)
- This caps thresholds at default values (never scales UP), only scales DOWN for fast tempos
- `judgeAccuracy` now accepts optional `bpm` parameter; falls back to defaults if omitted
- At 120 BPM: beat=500ms → perfect=125ms (capped to 100), good=250ms (capped to 200) → defaults kept
- At 240 BPM: beat=250ms → perfect=62.5ms, good=125ms → scaled down
- At 60 BPM: beat=1000ms → perfect=250ms (capped to 100), good=500ms (capped to 200) → defaults kept

### FollowPractice.tsx
- Empty notes guard verified: start button disabled when `notes.length === 0` (line 251)
- Timeout cleanup on unmount verified: `useEffect` with cleanup function clears all timeouts from `timeoutIdsRef` (lines 62-68)
- Added double-tap prevention comment in `handleInput` to explain the second `completedNotesRef` check
- Leading rest notes auto-complete: in `handleStart`, loop through notes before first playable index and add rests to `completedNotesRef`, incrementing `notesCompleted` state
- This prevents leading rests from being penalized as misses when the animation passes them

### ScrollableStaff.tsx
- Animation cleanup on unmount verified: `useEffect` return callback cancels `animationRef` (lines 139-144)
- Animation stop when all notes pass verified: when `noteIndexAtCenter >= notes.length`, cancels animation frame and sets ref to null (lines 92-98)
- No changes needed — existing implementation already correct

### Verification
- `npm run typecheck` passes with zero errors
- All three files compile cleanly
