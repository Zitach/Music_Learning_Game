# Learnings

## [2026-04-29] Initial Setup
- Tech stack: React 19 + TypeScript 5.7 + Vite 6 + Zustand 5 + Tone.js 15
- Pure CSS (no Tailwind, no component library), CSS variables drive theming
- 4 CSS sub-files: opening.css, map.css, chapter.css, lesson.css
- Canvas renderers: WorldMap, Piano, Staff, Metronome, Particles
- Test framework: Vitest + @testing-library/react
- Commands: `npm run test:run`, `npm run typecheck`, `npm run dev`

## [2026-04-29] AppRouter null-return bugfix
- Problem: `case 'chapter'` returned `null` when `selectedChapterId` was null, causing blank screen.
- Fix: Extracted `ChapterFallback` component that renders visible fallback text and calls `onBackToMap()` via `useEffect`.
- Why useEffect: Keeps component pure for SSR/testing; navigation is a side-effect.
- Test pattern: Mock `SkillPanel` to avoid lazy-load Suspense issues; use `waitFor` for async assertions.
- Verification: `npm run test:run` → 50/50 pass; `npm run typecheck` → 0 errors.

## Race Condition Fix - Black Screen After Assessment Completion

### Root Cause
When the last assessment question is answered, `advance()` timer fires `onComplete`, which triggers multiple state updates (setResult, completeSkill, resetGame). During the render before `result` is committed, `currentQuestion` becomes null because `questions[index]` is out of bounds (index unchanged, but session state is transitioning). `return null` on line 134 caused a black screen flash.

### Fixes Applied
1. **AssessView.tsx**: Replaced `return null` with a visible loading state (`加载中...`). This ensures users never see a blank screen during state transitions.
2. **useQuestionSession.ts useEffect**: Added ref-based content comparison (`prevQuestionsRef`) so index only resets when question IDs actually change, not on reference changes. Prevents unnecessary resets when `getShuffledQuestionsForSkill` creates a new array with identical content.
3. **useQuestionSession.ts advance()**: Extracted state update logic from inside `setCorrectCount` updater. Uses a `correctCountRef` to track count outside the updater, then calls `setIndex` and `onComplete` at the same level instead of nested inside another setState. Cleaner and avoids nested setState calls.

### Key Insight
React 19 batches ALL state updates (including those in setTimeout callbacks), so the transition should be near-instant. The loading state is a safety net for any edge case where the render cycle catches an intermediate state.
