# 第二章「拍子河流」节奏玩法 Bug 修复 + 增强

## TL;DR

> **核心目标**: 修复第二章节奏跟随玩法的多个致命 Bug（currentNoteIndex 不同步、动画不停止、判定窗口过紧、准确率计算错误），并为四个技能添加真正的音符时值差异（四分/八分/二分/全音符、休止符、拍号）。
> 
> **交付物**:
> - 修复后的判定系统（Perfect 100ms / Good 200ms）
> - 新的 noteTiming 辅助模块
> - 重写 FollowPractice 核心计时逻辑
> - 重写 ScrollableStaff 滚动渲染（支持可变间距 + 动画停止）
> - 四个技能的差异化音符数据（时值、休止符、拍号）
> - 练习结果展示界面
> - 完整的单元测试覆盖
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: T1/T2 → T3 → T6 → F1-F4

---

## Context

### Original Request
用户测试发现第二章「打拍子」存在两个问题：
1. 打到后面五线谱上没有东西了（音符消失）
2. 判定感觉有问题（命中检测不准）

### Interview Summary
**Key Discussions**:
- 判定窗口宽度：用户确认放宽到 Perfect 100ms / Good 200ms
- 音符时值差异化：用户要求四个技能（音符时值、休止符、常见拍号、打拍子）在视觉和节奏上有真正区别
- 练习结束行为：打完一轮显示结果，不做循环

**Research Findings**:
- `noteValues.ts` 已有 `drawNote()` / `drawRest()` 函数，可绘制标准音符形状
- `ScrollableStaff` 已有 `timeSignature` prop 但从未被传入
- `rhythmInput.ts` 存在但 FollowPractice 未使用，有自己的计时实现
- 项目已有 vitest 测试框架（jsdom 环境）

### Metis Review
**Identified Gaps** (addressed):
- `getExpectedNoteTime` 有副作用（在 getter 中设置 startTimeRef）→ 改为纯函数
- `ScrollableStaff.animate` 中 `currentNoteIndex` 使用 state 导致闭包陈旧和动画重启 → 改用 ref
- 变长音符需要累计偏移量计算，不能简单 `index * NOTE_WIDTH`
- 休止符需要特殊处理：自动通过，用户不做任何操作=正确
- 组件卸载时 setTimeout 未清理
- 视觉风格：保持数字（简谱）+ 添加时长指示器（不切换到西方音符形状，避免抢第三章内容）

---

## Work Objectives

### Core Objective
修复第二章节奏跟随玩法的所有已知 Bug，使玩家可以正确地逐个击打所有音符并获得准确的判定反馈；同时为四个技能添加真正的节奏差异。

### Concrete Deliverables
- `src/lib/game/accuracy.ts` — 放宽判定窗口
- `src/lib/music/noteTiming.ts` — 新增：音符时值类型定义和计时辅助函数
- `src/components/modules/Rhythm/FollowPractice.tsx` — 重写核心计时逻辑 + 结果展示
- `src/components/modules/Rhythm/ScrollableStaff.tsx` — 重写滚动渲染（变长间距 + 停止 + 时长指示器）
- `src/components/SkillPanel/practiceVariants/RhythmPractice.tsx` — 更新音符数据
- `src/lib/game/__tests__/accuracy.test.ts` — 新增：判定系统测试
- `src/lib/music/__tests__/noteTiming.test.ts` — 新增：计时辅助测试

### Definition of Done
- [ ] `npm run typecheck` 通过
- [ ] `npm run test:run` 通过（包含新增测试）
- [ ] `npm run build` 成功
- [ ] 四个技能均可正常游玩，判定准确，打完显示结果

### Must Have
- FollowPractice 能正确追踪当前音符索引（从流逝时间计算）
- 所有音符均可被玩家击打（不仅第一个）
- ScrollableStaff 在所有音符滚过后停止动画
- 判定窗口 Perfect=100ms / Good=200ms
- 准确率反映实际命中质量（非永远 100%）
- 结果展示（得分、准确率、最大连击、继续按钮）
- 四个技能有不同的音符模式：
  - ch2-s1（音符时值）：纯四分音符
  - ch2-s2（休止符）：包含休止符（自动通过）
  - ch2-s3（常见拍号）：3/4 拍号显示
  - ch2-s4（打拍子）：混合时值（八分/四分/二分）

### Must NOT Have (Guardrails)
- ❌ 不修改非第二章文件（domain/chapters、lessonContent、其他练习变体）
- ❌ 不修改 AssessView — 评估流程不在范围内
- ❌ 不引入新 npm 依赖
- ❌ 不添加新路由或页面 — 结果展示是 FollowPractice 内组件
- ❌ 不创建新 Zustand store
- ❌ 不切换到西方标准音符形状渲染 — 保持简谱数字 + 时长指示器
- ❌ 不添加音频反馈（节拍器/音符声音）
- ❌ 不创建精美结果屏幕（无图表、动画、评级）
- ❌ 不修改 skillTypes 或章节定义文件

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (vitest + jsdom)
- **Automated tests**: YES (Tests-after)
- **Framework**: vitest

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Library/Module**: Use Bash (node/vitest) — Import, call functions, assert results
- **Component**: Use vitest (jsdom) — Render, simulate events, assert state

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation):
├── T1: Fix accuracy.ts judgment windows + tests [quick]
└── T2: Create noteTiming helper module [quick]

Wave 2 (After Wave 1 — core rewrites, MAX PARALLEL):
├── T3: Rewrite FollowPractice timing core (depends: T1, T2) [deep]
├── T4: Rewrite ScrollableStaff rendering (depends: T2) [unspecified-high]
└── T5: Update RhythmPractice note data (depends: T2) [quick]

Wave 3 (After Wave 2 — polish + integration):
├── T6: Add result screen to FollowPractice (depends: T3) [unspecified-high]
└── T7: Edge cases + unmount cleanup (depends: T3, T4) [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1/T2 → T3 → T6 → F1-F4
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 3 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1 | - | T3 | 1 |
| T2 | - | T3, T4, T5 | 1 |
| T3 | T1, T2 | T6, T7 | 2 |
| T4 | T2 | T7 | 2 |
| T5 | T2 | - | 2 |
| T6 | T3 | - | 3 |
| T7 | T3, T4 | - | 3 |
| F1-F4 | ALL | - | FINAL |

### Agent Dispatch Summary

- **Wave 1**: **2** — T1 → `quick`, T2 → `quick`
- **Wave 2**: **3** — T3 → `deep`, T4 → `unspecified-high`, T5 → `quick`
- **Wave 3**: **2** — T6 → `unspecified-high`, T7 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Fix accuracy.ts judgment windows + unit tests

  **What to do**:
  - In `src/lib/game/accuracy.ts`:
    - Change `PERFECT_WINDOW_MS` from 50 to 100
    - Change `GOOD_WINDOW_MS` from 100 to 200
    - Keep everything else (scoring, combo bonus) unchanged
  - Create `src/lib/game/__tests__/accuracy.test.ts`:
    - Test `judgeAccuracy` at boundary values: 0ms, 99ms, 100ms, 150ms, 199ms, 200ms, 201ms
    - Test negative offsets (early hits): -99ms, -100ms, -200ms, -201ms
    - Test `calculateScore` for each level with combo 0, 1, 5, 10

  **Must NOT do**:
  - Do not change scoring values or combo multiplier
  - Do not change the AccuracyLevel type
  - Do not change the function signatures

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2)
  - **Blocks**: T3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/lib/game/accuracy.ts` — Current judgment logic to modify. Lines 9-10 contain the threshold constants to change.

  **Acceptance Criteria**:
  - [ ] `PERFECT_WINDOW_MS === 100` and `GOOD_WINDOW_MS === 200` in accuracy.ts
  - [ ] `judgeAccuracy(80)` returns `{ level: 'perfect', ... }`
  - [ ] `judgeAccuracy(150)` returns `{ level: 'good', ... }`
  - [ ] `judgeAccuracy(250)` returns `{ level: 'miss', ... }`
  - [ ] `npm run test:run` passes (including new tests)

  **QA Scenarios**:

  ```
  Scenario: Boundary values for judgment
    Tool: Bash (npx vitest run)
    Preconditions: accuracy.test.ts exists with boundary tests
    Steps:
      1. Run `npx vitest run src/lib/game/__tests__/accuracy.test.ts`
      2. Assert all tests pass — check for "Tests  X passed" with 0 failures
    Expected Result: All tests pass, covering ±99ms/±100ms/±199ms/±200ms/±201ms boundaries
    Failure Indicators: Any test failure, or "FAIL" in output
    Evidence: .sisyphus/evidence/task-1-accuracy-tests.txt

  Scenario: TypeCheck passes after change
    Tool: Bash
    Preconditions: accuracy.ts modified
    Steps:
      1. Run `npm run typecheck`
      2. Assert exit code 0, no errors
    Expected Result: Clean typecheck with 0 errors
    Failure Indicators: Non-zero exit code or error messages
    Evidence: .sisyphus/evidence/task-1-typecheck.txt
  ```

  **Commit**: YES
  - Message: `fix(rhythm): widen judgment windows to 100ms/200ms`
  - Files: `src/lib/game/accuracy.ts`, `src/lib/game/__tests__/accuracy.test.ts`
  - Pre-commit: `npx vitest run src/lib/game/__tests__/accuracy.test.ts`

- [x] 2. Create noteTiming helper module + unit tests

  **What to do**:
  - Create new file `src/lib/music/noteTiming.ts`:
    - Define types:
      ```typescript
      export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth'
      export type RhythmNote = {
        number: number           // pitch (1-7, for 简谱)
        duration: NoteDuration   // note duration type
        isRest?: boolean         // true = rest note (user does nothing)
      }
      ```
    - Export helper functions:
      - `getDurationBeats(duration: NoteDuration): number` — returns beat count (whole=4, half=2, quarter=1, eighth=0.5)
      - `getDurationWidth(duration: NoteDuration, baseWidth: number): number` — returns pixel width for scroll spacing (whole=4×, half=2×, quarter=1×, eighth=0.75× — eighth notes slightly wider than 0.5× for readability)
      - `getCumulativeBeatOffsets(notes: RhythmNote[]): number[]` — returns array where index i = sum of beats for notes[0..i-1]. Element 0 = 0.
      - `getCumulativeWidthOffsets(notes: RhythmNote[], baseWidth: number): number[]` — returns pixel offsets for canvas positioning
      - `getCurrentNoteIndex(elapsedMs: number, beatDurationMs: number, cumulativeBeatOffsets: number[]): number` — returns index of the note the player should currently be hitting. Returns -1 if not started. Iterates from end to find last note whose offset <= elapsedBeats.
      - `getExpectedNoteTimeMs(noteIndex: number, beatDurationMs: number, cumulativeBeatOffsets: number[]): number` — PURE function, returns expected hit time for note at index. `cumulativeBeatOffsets[noteIndex] * beatDurationMs`.
      - `isRestNote(note: RhythmNote): boolean` — checks `note.isRest === true`
      - `getPlayableNoteIndices(notes: RhythmNote[]): number[]` — returns indices of non-rest notes (for scoring)
  - Create `src/lib/music/__tests__/noteTiming.test.ts`:
    - Test `getDurationBeats` for all duration types
    - Test `getCumulativeBeatOffsets` with mixed durations
    - Test `getCurrentNoteIndex` at various elapsed times
    - Test `getExpectedNoteTimeMs` at various indices
    - Test `getPlayableNoteIndices` with rest notes mixed in
    - Test edge case: empty array, single note, all rests

  **Must NOT do**:
  - Do not modify any existing files
  - Do not import from React or DOM APIs
  - Do not add npm dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1)
  - **Blocks**: T3, T4, T5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/lib/music/noteValues.ts` — Existing NoteType definition (uses 'whole'|'half'|'quarter'|'eighth'|'sixteenth'). Our NoteDuration aligns with this but excludes 'sixteenth' for ch2 scope.
  - `src/components/modules/Rhythm/FollowPractice.tsx:42-47` — Current `getExpectedNoteTime` logic with side-effect bug. New helper replaces this pattern.
  - `src/components/modules/Rhythm/ScrollableStaff.tsx:79` — Current `noteIndexAtCenter` calculation assumes uniform spacing. New `getCumulativeWidthOffsets` replaces this.

  **Acceptance Criteria**:
  - [ ] `noteTiming.ts` exports all listed types and functions
  - [ ] `getDurationBeats('whole') === 4`, `getDurationBeats('quarter') === 1`
  - [ ] `getCumulativeBeatOffsets([{duration:'quarter'},{duration:'half'},{duration:'quarter'}])` returns `[0, 1, 3]`
  - [ ] `getCurrentNoteIndex` correctly identifies current note from elapsed time
  - [ ] `npm run test:run` passes

  **QA Scenarios**:

  ```
  Scenario: All noteTiming functions work correctly
    Tool: Bash (npx vitest run)
    Preconditions: noteTiming.test.ts exists
    Steps:
      1. Run `npx vitest run src/lib/music/__tests__/noteTiming.test.ts`
      2. Assert all tests pass
    Expected Result: All tests pass covering all functions and edge cases
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-2-notetiming-tests.txt

  Scenario: TypeCheck passes for new module
    Tool: Bash
    Preconditions: noteTiming.ts created
    Steps:
      1. Run `npm run typecheck`
      2. Assert exit code 0
    Expected Result: Clean typecheck
    Evidence: .sisyphus/evidence/task-2-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(rhythm): add noteTiming helper module`
  - Files: `src/lib/music/noteTiming.ts`, `src/lib/music/__tests__/noteTiming.test.ts`
  - Pre-commit: `npx vitest run src/lib/music/__tests__/noteTiming.test.ts`

- [x] 3. Rewrite FollowPractice timing core

  **What to do**:
  In `src/components/modules/Rhythm/FollowPractice.tsx`, rewrite the core timing logic:

  1. **Import new helpers** from `noteTiming.ts`:
     - `RhythmNote`, `getCurrentNoteIndex`, `getExpectedNoteTimeMs`, `getCumulativeBeatOffsets`, `isRestNote`, `getPlayableNoteIndices`
     - `judgeAccuracy`, `calculateScore` from accuracy (keep)

  2. **Update props interface** — change `notes` type from `Array<{ number: number; duration?: string }` to `RhythmNote[]`

  3. **Fix currentNoteIndex tracking**:
     - REMOVE `useState<number>(-1)` for currentNoteIndex
     - ADD a computed `currentNoteIndex` derived from elapsed time using `getCurrentNoteIndex()`
     - Use `useRef` to store `cumulativeBeatOffsets` (precomputed in useEffect on notes change)
     - In `handleInput`, calculate currentNoteIndex from `performance.now() - startTimeRef.current`

  4. **Fix getExpectedNoteTime** — remove the side-effect (setting startTimeRef in getter):
     - Replace with pure function call: `getExpectedNoteTimeMs(currentNoteIndex, beatIntervalRef.current, cumulativeBeatOffsetsRef.current)`
     - `startTimeRef` is ONLY set in `handleStart`, nowhere else

  5. **Handle rest notes**:
     - In `handleInput`: if current note is a rest (`isRestNote(notes[currentNoteIndex])`), return early (do nothing)
     - In `handleNoteComplete` callback: if the completed note is a rest, still increment `notesCompleted` but do NOT reset combo, do NOT show "miss" feedback — just silently advance

  6. **Fix accuracy calculation**:
     - Track `hitQualityRef = useRef({ perfect: 0, good: 0, miss: 0 })`
     - On hit: increment `hitQualityRef.current[result.level]++`
     - On auto-miss: increment `hitQualityRef.current.miss++` (but NOT for rest notes)
     - In completion effect: `accuracy = (hitQuality.perfect + hitQuality.good) / totalPlayableNotes * 100`
     - Use `getPlayableNoteIndices(notes).length` for totalPlayableNotes

  7. **Fix completion detection**:
     - Completion triggers when `notesCompleted === notes.length` (unchanged)
     - Before calling `onComplete`, show result state (see T6)
     - Do NOT call `onComplete` until user clicks "Continue" on result screen

  **Must NOT do**:
  - Do not add new component files — all changes in FollowPractice.tsx
  - Do not change the visual rendering (that's T4)
  - Do not modify ScrollableStaff
  - Do not add audio feedback

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
    - Reason: Complex state management rewrite with timing logic, requires deep understanding

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T4, T5)
  - **Parallel Group**: Wave 2
  - **Blocks**: T6, T7
  - **Blocked By**: T1, T2

  **References**:

  **Pattern References**:
  - `src/components/modules/Rhythm/FollowPractice.tsx` — THE file to rewrite. Lines 20-195 contain all current logic.
  - `src/components/modules/Rhythm/FollowPractice.tsx:22` — `currentNoteIndex` useState to REMOVE (replace with computed value)
  - `src/components/modules/Rhythm/FollowPractice.tsx:42-47` — `getExpectedNoteTime` with side-effect bug to FIX
  - `src/components/modules/Rhythm/FollowPractice.tsx:49-72` — `handleInput` to REWRITE (use computed currentNoteIndex)
  - `src/components/modules/Rhythm/FollowPractice.tsx:74-85` — `handleNoteComplete` to REWRITE (handle rest notes)
  - `src/components/modules/Rhythm/FollowPractice.tsx:99-105` — completion detection to FIX (accuracy calc + don't auto-call onComplete)

  **API/Type References**:
  - `src/lib/music/noteTiming.ts` (T2) — New `RhythmNote` type, `getCurrentNoteIndex`, `getExpectedNoteTimeMs`, `getCumulativeBeatOffsets`, `isRestNote`, `getPlayableNoteIndices`
  - `src/lib/game/accuracy.ts` — `judgeAccuracy`, `calculateScore`, `AccuracyLevel` (unchanged API)

  **Acceptance Criteria**:
  - [ ] `currentNoteIndex` is computed from elapsed time, not stored in useState
  - [ ] `getExpectedNoteTime` has no side effects (pure function)
  - [ ] All notes can be hit (not just the first one)
  - [ ] Rest notes are auto-skipped without penalizing the player
  - [ ] Accuracy reflects actual hit quality, not always 100%
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Multi-note hit detection works
    Tool: Bash (npx vitest run)
    Preconditions: FollowPractice rewritten
    Steps:
      1. Write a test that renders FollowPractice with 4 quarter notes at 120 BPM
      2. Call handleStart
      3. Advance fake timers to simulate each beat (500ms intervals)
      4. Simulate spacebar press at each beat
      5. Assert each note gets judged (not just the first)
    Expected Result: All 4 notes receive judgment feedback, notesCompleted reaches 4
    Failure Indicators: notesCompleted stuck at 1, or only first note judged
    Evidence: .sisyphus/evidence/task-3-multi-note-hit.txt

  Scenario: Rest notes don't penalize player
    Tool: Bash (npx vitest run)
    Preconditions: Notes array contains rest notes
    Steps:
      1. Render FollowPractice with notes: [quarter, rest, quarter, quarter]
      2. Start playing, hit spacebar only on non-rest beats
      3. Let rest auto-pass
      4. Assert combo is NOT reset by the rest note
    Expected Result: Rest note auto-completes silently, combo continues
    Failure Indicators: Combo resets on rest note, or "miss" feedback shown for rest
    Evidence: .sisyphus/evidence/task-3-rest-notes.txt

  Scenario: TypeCheck passes
    Tool: Bash
    Steps:
      1. Run `npm run typecheck`
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task-3-typecheck.txt
  ```

  **Commit**: YES
  - Message: `fix(rhythm): rewrite FollowPractice timing to track all notes`
  - Files: `src/components/modules/Rhythm/FollowPractice.tsx`
  - Pre-commit: `npm run typecheck`

- [x] 4. Rewrite ScrollableStaff rendering

  **What to do**:
  In `src/components/modules/Rhythm/ScrollableStaff.tsx`, fix the rendering and animation:

  1. **Update imports and types**:
     - Import `RhythmNote`, `getDurationWidth`, `getCumulativeWidthOffsets`, `isRestNote` from noteTiming
     - Update `ScrollableStaffProps.notes` type to `RhythmNote[]`
     - Update `Note` interface to match `RhythmNote`

  2. **Variable note spacing**:
     - Precompute `widthOffsets` using `getCumulativeWidthOffsets(notes, NOTE_WIDTH)` (in useEffect on notes change)
     - Store in `useRef` (not state — doesn't need to trigger re-render)
     - Replace all `notesStartX + index * NOTE_WIDTH` with `notesStartX + widthOffsets[index]`
     - Update `noteIndexAtCenter` calculation in `animate` to use cumulative offsets
     - Calculate total canvas width as `notesStartX + widthOffsets[lastIndex] + getDurationWidth(lastNote.duration, NOTE_WIDTH) + STAVE_PADDING`

  3. **Fix animate callback stale closure**:
     - Change `currentNoteIndex` tracking from `useState` to `useRef` inside animate
     - Remove `currentNoteIndex` from animate's dependency array
     - Only use state for `displayCurrentNoteIndex` (set via setState outside the animation loop, or skip entirely and compute during render)

  4. **Stop animation when complete**:
     - In animate, after all notes have scrolled past center, call `cancelAnimationFrame` and return without requesting next frame
     - Condition: `noteIndexAtCenter >= notes.length` and all notes are in `completedNotesRef`
     - Set `animationRef.current = null`

  5. **Cap canvas width growth**:
     - Canvas width = `Math.min(totalContentWidth, width + offset + NOTE_WIDTH * 2)` — don't grow beyond what's needed
     - Actually use: fixed `totalContentWidth` (precomputed), viewport shows `width` pixels, transform handles scrolling

  6. **Duration-based visual rendering** in CanvasWithOffset:
     - Keep number rendering (简谱 style) as current
     - Add duration indicator BELOW each number:
       - Quarter note: small solid circle below (●)
       - Half note: small hollow circle below (○)
       - Whole note: wider hollow rectangle below (▢)
       - Eighth note: small solid circle with short line (flag indicator)
     - For rest notes: draw a small "休" text or rest symbol instead of number
     - Use `ctx.fillText()` for all visual indicators (no need for drawNote/drawRest functions since we keep 简谱 style)

  7. **Update staff line drawing**:
     - Draw staff lines across the full canvas width (not just viewport)
     - Ensure lines extend to cover all notes

  **Must NOT do**:
  - Do not switch to Western notation rendering (drawNote/drawRest shapes)
  - Do not change the container/viewport dimensions
  - Do not add new CSS or external styles

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - Reason: Complex canvas rendering rewrite with variable spacing math

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T3, T5)
  - **Parallel Group**: Wave 2
  - **Blocks**: T7
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `src/components/modules/Rhythm/ScrollableStaff.tsx` — THE file to rewrite. Full file 352 lines.
  - `src/components/modules/Rhythm/ScrollableStaff.tsx:61-109` — `animate` callback to fix (stale closure, no stop condition)
  - `src/components/modules/Rhythm/ScrollableStaff.tsx:71-104` — offset/noteIndexAtCenter logic to rewrite with cumulative offsets
  - `src/components/modules/Rhythm/ScrollableStaff.tsx:179-196` — Canvas container with growing width to cap
  - `src/components/modules/Rhythm/ScrollableStaff.tsx:284-340` — Note drawing loop to add duration indicators

  **API/Type References**:
  - `src/lib/music/noteTiming.ts` (T2) — `RhythmNote`, `getDurationWidth`, `getCumulativeWidthOffsets`, `isRestNote`
  - `src/lib/canvas/canvasTheme.ts` — `getCanvasTheme('light')` for colors (already used)

  **Acceptance Criteria**:
  - [ ] Variable note spacing: whole notes visually wider than quarter notes
  - [ ] Animation stops after last note scrolls past center
  - [ ] `currentNoteIndex` uses ref (not state) inside animate to prevent restarts
  - [ ] Canvas width is bounded (no unbounded growth)
  - [ ] Duration indicators visible below each number
  - [ ] Rest notes show distinct visual (not regular number)
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Variable spacing renders correctly
    Tool: Bash (dev server + playwright)
    Preconditions: Dev server running, ch2-s1 skill opened
    Steps:
      1. Navigate to ch2-s1 practice in browser
      2. Click "开始" to start
      3. Take screenshot of scrolling staff
      4. Verify all notes are visible and scrolling
    Expected Result: Notes visible on staff, scrolling left at correct speed
    Failure Indicators: No notes visible, or notes overlapping, or staff empty
    Evidence: .sisyphus/evidence/task-4-variable-spacing.png

  Scenario: Animation stops after last note
    Tool: Bash (dev server + playwright)
    Preconditions: Playing ch2-s4 (16 notes)
    Steps:
      1. Start ch2-s4 practice
      2. Wait 15 seconds for all notes to scroll past
      3. Check that staff is not consuming CPU (no endless animation)
    Expected Result: Staff shows empty state or result screen, animation stopped
    Failure Indicators: Staff keeps scrolling into empty space indefinitely
    Evidence: .sisyphus/evidence/task-4-animation-stop.png

  Scenario: TypeCheck passes
    Tool: Bash
    Steps:
      1. Run `npm run typecheck`
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task-4-typecheck.txt
  ```

  **Commit**: YES
  - Message: `fix(rhythm): rewrite ScrollableStaff with variable spacing and animation stop`
  - Files: `src/components/modules/Rhythm/ScrollableStaff.tsx`
  - Pre-commit: `npm run typecheck`

- [x] 5. Update RhythmPractice note data with real durations

  **What to do**:
  In `src/components/SkillPanel/practiceVariants/RhythmPractice.tsx`:

  1. **Update imports**: Import `RhythmNote` from noteTiming, replace old note type

  2. **Rewrite `getRhythmNotesForSkill`** — return `RhythmNote[]` with proper durations:

     - **ch2-s1 (音符时值)**: Pure quarter notes, introduce half note at end
       ```
       [quarter, quarter, quarter, quarter, quarter, quarter, half, quarter, quarter]
       ```
     
     - **ch2-s2 (休止符)**: Mix of notes and rests
       ```
       [quarter, rest(quarter), quarter, quarter, rest(quarter), quarter, half, rest(quarter)]
       ```
     
     - **ch2-s3 (常见拍号)**: 3/4 time signature feel, varied durations
       ```
       [quarter, quarter, quarter, quarter, quarter, half, quarter, quarter, half]
       ```
     
     - **ch2-s4 (打拍子)**: Mixed durations (eighth notes + quarter notes)
       ```
       [eighth, eighth, quarter, quarter, eighth, eighth, quarter, quarter, half, quarter]
       ```

  3. **Pass timeSignature to FollowPractice**:
     - For ch2-s3, pass `timeSignature={{ top: 3, bottom: 4 }}`
     - For other skills, keep default (no timeSignature displayed)
     - Update RhythmPractice to pass timeSignature prop through to FollowPractice → ScrollableStaff

  4. **Update FollowPractice props forwarding**:
     - In RhythmPractice.tsx, pass `timeSignature` prop to FollowPractice
     - FollowPractice must forward it to ScrollableStaff (if not already)

  **Must NOT do**:
  - Do not modify FollowPractice.tsx logic (that's T3/T6)
  - Do not change BPM (keep 120 for all skills)
  - Do not add new skill IDs or modify chapter definitions

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T3, T4)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `src/components/SkillPanel/practiceVariants/RhythmPractice.tsx` — THE file to modify. Lines 9-42 contain `getRhythmNotesForSkill` to rewrite.
  - `src/components/SkillPanel/practiceVariants/RhythmPractice.tsx:61-67` — FollowPractice rendering, need to add timeSignature prop.

  **API/Type References**:
  - `src/lib/music/noteTiming.ts` (T2) — `RhythmNote` type to use
  - `src/components/modules/Rhythm/ScrollableStaff.tsx:12-14` — `TimeSignature` interface (already exists)

  **Acceptance Criteria**:
  - [ ] Each skill returns `RhythmNote[]` with correct `duration` field
  - [ ] ch2-s2 has notes with `isRest: true`
  - [ ] ch2-s3 passes `timeSignature={{ top: 3, bottom: 4 }}`
  - [ ] ch2-s4 includes eighth notes
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Note data has correct durations
    Tool: Bash (node)
    Preconditions: RhythmPractice.tsx updated
    Steps:
      1. Run typecheck to verify no type errors
      2. Verify getRhythmNotesForSkill returns RhythmNote[] type
    Expected Result: TypeCheck passes
    Failure Indicators: Type errors in RhythmPractice.tsx
    Evidence: .sisyphus/evidence/task-5-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(rhythm): add real note durations and rests to chapter 2 skills`
  - Files: `src/components/SkillPanel/practiceVariants/RhythmPractice.tsx`
  - Pre-commit: `npm run typecheck`

- [ ] 6. Add result screen to FollowPractice

  **What to do**:
  In `src/components/modules/Rhythm/FollowPractice.tsx`, add a result overlay after all notes complete:

  1. **Add result state**:
     - `const [showResult, setShowResult] = useState(false)`
     - `const maxComboRef = useRef(0)` — track highest combo reached
     - `const hitQualityRef = useRef({ perfect: 0, good: 0, miss: 0 })`

  2. **Track max combo**: In `handleInput`, `maxComboRef.current = Math.max(maxComboRef.current, combo + 1)`

  3. **Track hit quality**: Increment `hitQualityRef.current[result.level]++` on each judgment

  4. **Completion flow**:
     - When `notesCompleted === notes.length`: set `showResult = true`, `isPlaying = false`
     - Do NOT call `onComplete` yet
     - Calculate accuracy: `(hitQuality.perfect + hitQuality.good) / getPlayableNoteIndices(notes).length * 100`

  5. **Result overlay UI** (simple div, no new component file):
     ```
     ┌─────────────────────────────┐
     │       练习完成！             │
     │                             │
     │   得分: 1200                │
     │   准确率: 85%               │
     │   最大连击: 8               │
     │   完美: 10  不错: 4  漏拍: 2│
     │                             │
     │      [继续]                 │
     └─────────────────────────────┘
     ```
     - Simple overlay div with absolute positioning inside module-shell
     - Use existing CSS classes where possible
     - "继续" button calls `onComplete?.(totalScore, accuracy)`

  6. **Styling**: Use inline styles matching existing design (floating-panel aesthetic, green/yellow/red colors for perfect/good/miss counts)

  **Must NOT do**:
  - Do not create a new component file — keep it inline in FollowPractice
  - Do not add charts, animations, or star ratings
  - Do not add a "再来一次" (retry) button

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T7)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T3

  **References**:

  **Pattern References**:
  - `src/components/modules/Rhythm/FollowPractice.tsx:144-192` — JSX return section where result overlay will be added
  - `src/styles/practice.css` — Existing practice styles
  - `src/components/SkillPanel/PracticeView.tsx:57-67` — Pattern for lesson-dots/lesson-card styling to follow

  **Acceptance Criteria**:
  - [ ] After all notes complete, result overlay appears with score, accuracy %, max combo
  - [ ] Accuracy reflects actual hit quality (not always 100%)
  - [ ] "继续" button calls `onComplete`
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Result screen shows after practice
    Tool: Bash (dev server + playwright)
    Preconditions: Dev server running, ch2-s1 opened
    Steps:
      1. Navigate to ch2-s1 practice
      2. Click "开始"
      3. Wait for all notes to scroll through (~5 seconds)
      4. Assert result overlay is visible
      5. Assert text contains "得分", "准确率", "最大连击"
      6. Assert "继续" button exists
    Expected Result: Result overlay visible with all stats and continue button
    Failure Indicators: No overlay, missing stats, or onComplete called automatically
    Evidence: .sisyphus/evidence/task-6-result-screen.png

  Scenario: Continue button triggers completion
    Tool: Bash (dev server + playwright)
    Preconditions: Result screen visible
    Steps:
      1. Click "继续" button
      2. Assert skill flow advances (onComplete was called)
    Expected Result: Practice view closes, skill flow continues
    Failure Indicators: Nothing happens on click, or skill doesn't advance
    Evidence: .sisyphus/evidence/task-6-continue-button.png
  ```

  **Commit**: YES
  - Message: `feat(rhythm): add result screen after rhythm practice`
  - Files: `src/components/modules/Rhythm/FollowPractice.tsx`
  - Pre-commit: `npm run typecheck`

- [ ] 7. Edge cases + unmount cleanup

  **What to do**:
  Fix remaining edge cases in FollowPractice.tsx and ScrollableStaff.tsx:

  1. **Empty notes guard** (FollowPractice):
     - If `notes.length === 0`, disable "开始" button and show "暂无练习内容"
     - Add early return in handleStart if notes is empty

  2. **setTimeout cleanup on unmount** (FollowPractice):
     - Store feedback timeout IDs in a `useRef<Set<ReturnType<typeof setTimeout>>>`
     - In `handleInput` and `handleNoteComplete`, add setTimeout return value to the set
     - In cleanup useEffect: clear all pending timeouts from the set

  3. **Double-tap prevention** (FollowPractice):
     - The existing `completedNotesRef.current.has(currentNoteIndex)` check handles this
     - Add a comment explaining the guard

  4. **Starting note is a rest** (FollowPractice):
     - If `notes[0].isRest`, the first beat should auto-pass
     - In `handleStart`, check and process leading rest notes or let the timing loop handle them

  5. **BPM-based judgment window scaling** (accuracy.ts):
     - Add a `getScaledThresholds(bpm: number)` function that caps Good window at 50% of beat interval
     - At 120 BPM: beat = 500ms, Good cap = 250ms → our 200ms is fine
     - At 240 BPM: beat = 250ms, Good cap = 125ms → scale down from 200ms
     - Update `judgeAccuracy` to accept optional `bpm` parameter for scaling

  **Must NOT do**:
  - Do not over-engineer — keep fixes minimal
  - Do not change the core timing algorithm (that's T3)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T6)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T3, T4

  **References**:

  **Pattern References**:
  - `src/components/modules/Rhythm/FollowPractice.tsx:69-71` — setTimeout for feedback display, needs cleanup ref
  - `src/components/modules/Rhythm/FollowPractice.tsx:82-84` — Another setTimeout, needs cleanup ref
  - `src/components/modules/Rhythm/ScrollableStaff.tsx:130-136` — Existing animation cleanup

  **API/Type References**:
  - `src/lib/game/accuracy.ts` — `judgeAccuracy` to add optional bpm scaling

  **Acceptance Criteria**:
  - [ ] Empty notes array shows disabled start button
  - [ ] No React state update on unmounted component warnings
  - [ ] Leading rest notes auto-pass without penalizing player
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Empty notes handled gracefully
    Tool: Bash (dev server + playwright)
    Preconditions: Code deployed
    Steps:
      1. If somehow notes are empty, verify start button is disabled
    Expected Result: Button disabled, message shown
    Evidence: .sisyphus/evidence/task-7-empty-notes.png

  Scenario: TypeCheck + Tests all pass
    Tool: Bash
    Steps:
      1. Run `npm run typecheck && npm run test:run && npm run build`
    Expected Result: All pass
    Evidence: .sisyphus/evidence/task-7-final-check.txt
  ```

  **Commit**: YES
  - Message: `fix(rhythm): edge cases and cleanup`
  - Files: `src/components/modules/Rhythm/FollowPractice.tsx`, `src/components/modules/Rhythm/ScrollableStaff.tsx`, `src/lib/game/accuracy.ts`
  - Pre-commit: `npm run typecheck`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run test:run` + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | TypeCheck [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Test all 4 Chapter 2 skills: verify notes appear and scroll correctly, hit detection works for ALL notes (not just first), judgment feedback displays correctly, result screen shows after completion. Test edge cases: rapid clicks, very early/late hits, rest notes auto-pass. Save screenshots.
  Output: `Skills [4/4 pass] | Scenarios [N/N pass] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Verify no non-ch2 files were modified (except test files). Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1**: `fix(rhythm): widen judgment windows to 100ms/200ms` — accuracy.ts, accuracy.test.ts
- **T2**: `feat(rhythm): add noteTiming helper module` — noteTiming.ts, noteTiming.test.ts
- **T3**: `fix(rhythm): rewrite FollowPractice timing to track all notes` — FollowPractice.tsx
- **T4**: `fix(rhythm): rewrite ScrollableStaff with variable spacing and animation stop` — ScrollableStaff.tsx
- **T5**: `feat(rhythm): add real note durations and rests to chapter 2 skills` — RhythmPractice.tsx
- **T6**: `feat(rhythm): add result screen after rhythm practice` — FollowPractice.tsx
- **T7**: `fix(rhythm): edge cases and cleanup` — FollowPractice.tsx, ScrollableStaff.tsx

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck          # Expected: 0 errors
npm run test:run           # Expected: all tests pass (existing + new)
npm run build              # Expected: successful build
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Four ch2 skills playable with correct timing
- [ ] Result screen displays after completion
