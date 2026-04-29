# 视觉全面重设计 + 黑屏 Bug 修复

## TL;DR

> **核心目标**: 将音乐学习游戏从暗色系全面重设计为明亮游戏风格（类 Simply Piano），同时修复第一章通关后的黑屏致命 Bug。
> 
> **交付物**:
> - 修复 4 个导致黑屏的 Bug（Error Boundary + 竞态条件 + 空值回退）
> - 全部 CSS 变量翻新为明亮紫色主题
> - 40+ 组件全部重新适配明亮风格
> - Canvas 渲染器颜色更新
> - 回归测试覆盖所有 Bug 修复
> 
> **预估工作量**: Large
> **并行执行**: YES - 6 Waves
> **关键路径**: Bug Fix (Wave 1) → Design System (Wave 2) → Component Restyling (Waves 3-6) → Final Review

---

## Context

### Original Request
用户认为当前项目视觉效果很差，希望参考市面上优秀的音乐教育竞品重新设计外观。同时存在致命 Bug：第一章第一小关通过后直接黑屏。

### Interview Summary
**Key Discussions**:
- **视觉方向**: 用户选择"明亮游戏风"（类 Simply Piano — 白底紫主色调，亲和友好）
- **重设计范围**: 用户选择"全面重设计"（所有页面）
- **测试策略**: 用户选择"TDD 全面测试"
- **竞品参考**: Simply Piano（游戏化强）、Yousician（XP 系统）、Flowkey（干净专业）

**Research Findings**:
- 技术栈: React 19 + TypeScript + Vite 6 + Zustand + Tone.js + Canvas 2D
- 纯 CSS（无 Tailwind），CSS 变量驱动主题
- 40+ 自定义组件，4 个 CSS 文件
- 15+ 动画 keyframes
- 7 个 Canvas 渲染器

### Metis Review
**Identified Gaps** (addressed):
- **主题切换**: 保留明暗切换，明亮为默认。暗色主题同步更新为紫色暗色变体
- **共享 UI 原语**: 不新建 Button/Card 组件，仅通过 CSS 重样式化现有组件
- **Canvas 颜色桥**: 创建 `canvasTheme.ts` 统一管理 Canvas 渲染颜色常量
- **硬编码颜色**: FollowPractice、ScrollableStaff、TutorialOverlay 等有内联颜色，需逐一修复
- **音乐符号颜色**: 五线谱/音符的 `#000` 黑色笔画保持不变（这是音乐标准，非设计选择）
- **钢琴键颜色**: 黑白键在明暗主题下均保持自然黑白，无需修改

---

## Work Objectives

### Core Objective
修复致命黑屏 Bug，并将整个应用的视觉风格从暗色系全面转换为明亮游戏风（白底 + 紫色主色调 + 友好圆润的视觉语言）。

### Concrete Deliverables
- 修复后的 AssessView、useQuestionSession、AppRouter（无黑屏）
- 新增 ErrorBoundary 组件
- 更新后的 `src/styles.css` + 4 个子 CSS 文件
- 新增 `src/lib/canvas/canvasTheme.ts`（Canvas 颜色桥）
- 更新后的所有 Canvas 渲染器颜色
- 回归测试文件
- 更新后的 Google Fonts 引入（Poppins）

### Definition of Done
- [ ] `npm run test:run` 全部通过
- [ ] `npm run typecheck` 无错误
- [ ] 第一章 ch1-s1 通关后不再黑屏，正常返回章节列表
- [ ] 所有页面在明亮主题下视觉统一（白底紫主色）
- [ ] 暗色主题切换仍然可用
- [ ] 无硬编码的旧暗色值残留

### Must Have
- 黑屏 Bug 完全修复，有回归测试
- CSS 变量全面翻新为明亮紫色主题
- 所有组件在明亮主题下正确渲染
- Canvas 渲染器颜色与 CSS 主题同步
- 暗色主题保留且可用
- Error Boundary 兜底

### Must NOT Have (Guardrails)
- **Bug 修复波次禁止包含任何视觉变更** — 严格分离
- **不新建 UI 组件**（Button、Card 等）— 仅 CSS 重样式化
- **不修改 Zustand stores** — store 接口和数据结构不变
- **不修改音频引擎** — Tone.js 相关代码不触碰
- **不添加 Playwright/E2E 测试** — 单元测试 + Agent QA 足够
- **不修改音乐符号渲染逻辑** — `notation.ts`、`clef.ts` 中的 `#000` 笔画保持
- **不修改钢琴键黑白颜色** — 自然黑白是标准
- **不修改业务逻辑** — 章节结构、题目逻辑、评分规则不变

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + @testing-library/react)
- **Automated tests**: TDD (RED-GREEN-REFACTOR for bug fixes)
- **Framework**: Vitest

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Bug fixes**: Vitest regression tests + manual verification via Playwright
- **Visual restyling**: Playwright screenshots before/after comparison
- **Canvas updates**: Playwright canvas screenshot comparison
- **Full flow**: Playwright end-to-end flow test (opening → map → chapter → complete → no black screen)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Bug Fix — 零视觉变更，纯逻辑修复):
├── Task 1: Error Boundary 组件 [quick]
├── Task 2: AssessView + useQuestionSession 竞态条件修复 [deep]
└── Task 3: AppRouter 空值回退修复 [quick]

Wave 2 (Design System Foundation — 视觉基础):
├── Task 4: CSS 变量全面翻新 + 主题重构 [deep]
├── Task 5: Google Fonts + 排版系统更新 [quick]
└── Task 6: canvasTheme.ts Canvas 颜色桥 [quick]

Wave 3 (Core Shell + Opening — 并行):
├── Task 7: AppShell 重样式 [unspecified-high]
├── Task 8: HUD 组件重样式 [visual-engineering]
├── Task 9: Opening 流程重样式 (TitleScreen + InstrumentPicker + NicknameInput) [visual-engineering]
└── Task 10: DemoAnimation 重样式 [quick]

Wave 4 (Map + Chapter — Wave 3 完成后):
├── Task 11: WorldMapCanvas + ChapterListOverlay 重样式 [visual-engineering]
├── Task 12: WorldMapRenderer Canvas 颜色更新 [unspecified-high]
├── Task 13: SkillPanel + 技能时间线重样式 [visual-engineering]
└── Task 14: TransitionOverlay + EffectsProvider 重样式 [quick]

Wave 5 (Learning + Practice — Wave 4 完成后):
├── Task 15: LearnView + AssessView 视觉重样式 [visual-engineering]
├── Task 16: 练习变体重样式 (6 个 practiceVariants) [visual-engineering]
├── Task 17: 练习模块重样式 (Intervals + Chords + NoteNames) [visual-engineering]
├── Task 18: 练习模块重样式 (Scales + Staff + Rhythm + Progressions) [visual-engineering]
└── Task 19: Canvas 组件更新 (PianoCanvas + StaffCanvas + MetronomeCanvas) [unspecified-high]

Wave 6 (Polish — 硬编码颜色清扫):
├── Task 20: 硬编码颜色全量清扫 (FollowPractice + ScrollableStaff + TutorialOverlay + 其他) [deep]
├── Task 21: 粒子效果 + 粒子预设颜色更新 [quick]
└── Task 22: 明暗主题切换验证 + 最终润色 [unspecified-high]

Wave FINAL (ALL Waves 完成后 — 4 并行审查):
├── Task F1: 计划合规审计 (oracle)
├── Task F2: 代码质量审查 (unspecified-high)
├── Task F3: 真实手动 QA (unspecified-high + playwright)
└── Task F4: 范围保真度检查 (deep)
-> 呈交结果 -> 获取用户明确 "OK" 后完成

Critical Path: T1-T3 → T4-T6 → T7-T10 → T11-T14 → T15-T19 → T20-T22 → F1-F4 → user OK
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 4 (Waves 3-5)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | F1-F4 | 1 |
| 2 | — | F1-F4 | 1 |
| 3 | — | F1-F4 | 1 |
| 4 | 1,2,3 | 7-22 | 2 |
| 5 | 4 | 7-22 | 2 |
| 6 | 4 | 12, 19 | 2 |
| 7 | 4, 5 | F1-F4 | 3 |
| 8 | 4, 5 | F1-F4 | 3 |
| 9 | 4, 5 | F1-F4 | 3 |
| 10 | 4, 5 | F1-F4 | 3 |
| 11 | 4, 5, 6 | F1-F4 | 4 |
| 12 | 6 | F1-F4 | 4 |
| 13 | 4, 5 | F1-F4 | 4 |
| 14 | 4, 5 | F1-F4 | 4 |
| 15 | 4, 5, 13 | F1-F4 | 5 |
| 16 | 4, 5, 15 | F1-F4 | 5 |
| 17 | 4, 5, 15 | F1-F4 | 5 |
| 18 | 4, 5, 15 | F1-F4 | 5 |
| 19 | 6 | F1-F4 | 5 |
| 20 | 4, 7-19 | F1-F4 | 6 |
| 21 | 4 | F1-F4 | 6 |
| 22 | 4, 20, 21 | F1-F4 | 6 |
| F1-F4 | ALL | — | FINAL |

### Agent Dispatch Summary

- **Wave 1**: **3** — T1 → `quick`, T2 → `deep`, T3 → `quick`
- **Wave 2**: **3** — T4 → `deep`, T5 → `quick`, T6 → `quick`
- **Wave 3**: **4** — T7 → `unspecified-high`, T8 → `visual-engineering`, T9 → `visual-engineering`, T10 → `quick`
- **Wave 4**: **4** — T11 → `visual-engineering`, T12 → `unspecified-high`, T13 → `visual-engineering`, T14 → `quick`
- **Wave 5**: **5** — T15 → `visual-engineering`, T16 → `visual-engineering`, T17 → `visual-engineering`, T18 → `visual-engineering`, T19 → `unspecified-high`
- **Wave 6**: **3** — T20 → `deep`, T21 → `quick`, T22 → `unspecified-high`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Error Boundary 兜底组件

  **What to do**:
  - 在 `src/components/ErrorBoundary.tsx` 创建 React Error Boundary 类组件
  - 捕获子组件树中的任何未处理异常
  - 渲染友好的错误提示 UI（"出错了，请刷新页面重试"），而非空白屏幕
  - 在 `App.tsx` 中用 `<ErrorBoundary>` 包裹 `<AppShell>`
  - 编写回归测试：渲染一个会 throw 的子组件，验证 Error Boundary 捕获并显示错误 UI

  **Must NOT do**:
  - 不修改任何现有组件的视觉样式
  - 不修改任何 store 或业务逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 新建单个文件 + 一处包裹修改，逻辑简单
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-design`: 不涉及视觉设计

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/App.tsx:1-30` — App 入口组件结构，了解 Error Boundary 应插入的位置（包裹 `<AppShell>`）

  **API/Type References**:
  - `src/app/AppShell.tsx` — 被包裹的子组件，了解 props 和结构

  **WHY Each Reference Matters**:
  - `App.tsx` 是根组件，Error Boundary 必须在此处包裹整个应用树

  **Acceptance Criteria**:

  - [ ] 文件创建: `src/components/ErrorBoundary.tsx`
  - [ ] 测试文件创建: `src/components/__tests__/ErrorBoundary.test.tsx`
  - [ ] `npm run test:run` → Error Boundary 测试 PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Error Boundary 捕获渲染异常
    Tool: Bash (vitest)
    Preconditions: ErrorBoundary 组件已创建
    Steps:
      1. 编写测试：渲染一个会 throw new Error("test") 的子组件
      2. 断言：页面上出现包含"出错了"或"刷新页面"的错误提示文本
      3. 运行 `npm run test:run -- --reporter=verbose src/components/__tests__/ErrorBoundary.test.tsx`
    Expected Result: 测试 PASS，Error Boundary 成功捕获异常并渲染错误 UI
    Failure Indicators: 测试 FAIL，或子组件异常未被捕获导致测试崩溃
    Evidence: .sisyphus/evidence/task-1-error-boundary-catch.txt

  Scenario: Error Boundary 不影响正常渲染
    Tool: Bash (vitest)
    Preconditions: ErrorBoundary 组件已创建
    Steps:
      1. 编写测试：渲染一个正常子组件 `<div>Hello</div>`
      2. 断言：页面上显示 "Hello"，无错误提示
      3. 运行 `npm run test:run -- --reporter=verbose src/components/__tests__/ErrorBoundary.test.tsx`
    Expected Result: 测试 PASS，正常子组件正常渲染
    Failure Indicators: 测试 FAIL，或 Error Boundary 错误地显示错误 UI
    Evidence: .sisyphus/evidence/task-1-error-boundary-normal.txt
  ```

  **Commit**: YES (groups with Task 2, 3)
  - Message: `fix: add Error Boundary to prevent blank screen on unhandled errors`
  - Files: `src/components/ErrorBoundary.tsx`, `src/components/__tests__/ErrorBoundary.test.tsx`, `src/App.tsx`
  - Pre-commit: `npm run test:run`

- [x] 2. AssessView + useQuestionSession 竞态条件修复

  **What to do**:
  - **AssessView.tsx 第 134 行**: 将 `if (!currentQ) return null` 替换为显示加载/过渡状态（如"加载中..."提示面板），而非返回空
  - **useQuestionSession.ts 第 95-100 行**: `useEffect` 依赖 `[questions]` 会导致竞态条件。需要：
    - 将依赖改为 `[questions.length]` 或更稳定的内容标识（避免因数组引用变化触发重置）
    - 或者使用 `useRef` 来追踪 questions 是否真正发生了内容变化
  - **useQuestionSession.ts 第 41-56 行**: `advance()` 的 `onComplete` 回调在定时器中调用，确保所有状态更新在定时器回调中原子化执行
  - 编写回归测试：
    - 测试 1: 模拟 `session.currentQuestion` 为 null 时，组件不返回空白（返回加载状态）
    - 测试 2: 模拟完成最后一题后，组件正确进入 result 状态而非空白
    - 测试 3: 测试 questions 数组引用变化但内容相同时，useQuestionSession 不重置 index

  **Must NOT do**:
  - 不修改组件的视觉样式
  - 不修改 Zustand store 接口
  - 不修改题目逻辑或评分规则

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 涉及 React hooks 竞态条件分析、定时器回调状态管理、需要深入理解执行流
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `systematic-debugging`: 这是计划阶段，调试由执行代理负责

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/components/SkillPanel/AssessView.tsx:20-170` — 完整的评估视图组件，理解 result 状态管理和 currentQuestion 使用的完整流程
  - `src/features/practice/useQuestionSession.ts:25-112` — 问题会话 hook，理解 index 管理、advance() 定时器、useEffect 重置逻辑

  **API/Type References**:
  - `src/components/SkillPanel/SkillPanel.tsx:56-66` — handleStepComplete() 理解父组件如何响应完成事件
  - `src/domain/skills/skillTypes.ts:39-43` — skill flow 定义 (learn → practice → assessment)

  **Test References**:
  - `src/test/setup.ts` — 测试 setup，了解 mock 和配置

  **External References**:
  - React 19 batching: React 18+ 自动批处理所有状态更新

  **WHY Each Reference Matters**:
  - `AssessView.tsx` 是黑屏的直接触发点 — `return null` 在瞬态时渲染空白
  - `useQuestionSession.ts` 是根因 — useEffect 重置和定时器回调的竞态
  - `SkillPanel.tsx` 是父组件 — 理解 phase/currentSkillId 状态切换如何影响 AssessView 生命周期

  **Acceptance Criteria**:

  - [ ] 测试文件创建: `src/components/SkillPanel/__tests__/AssessView.test.tsx`
  - [ ] 测试文件创建: `src/features/practice/__tests__/useQuestionSession.test.ts`
  - [ ] AssessView.tsx 中无 `return null` 的空组件返回（改为渲染加载状态）
  - [ ] `npm run test:run` → 所有新增测试 PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: currentQuestion 为 null 时显示加载状态而非空白
    Tool: Bash (vitest)
    Preconditions: AssessView 组件已修改
    Steps:
      1. 编写测试：mock useQuestionSession 返回 { currentQuestion: null, ... }
      2. 渲染 AssessView，mock skill prop 为有效值
      3. 断言：渲染结果不为 null/空，包含可见文本内容
      4. 运行 `npm run test:run -- --reporter=verbose src/components/SkillPanel/__tests__/AssessView.test.tsx`
    Expected Result: 测试 PASS，组件渲染包含文本内容的 UI（如"加载中..."）
    Failure Indicators: 渲染结果为 null 或空 DOM
    Evidence: .sisyphus/evidence/task-2-assessview-no-null.txt

  Scenario: 完成最后一题后正确进入 result 状态
    Tool: Playwright
    Preconditions: 开发服务器运行中
    Steps:
      1. 打开应用，完成开场流程
      2. 进入 ch1-s1，完成 learn → practice 步骤
      3. 进入 assessment，回答所有题目（全部正确）
      4. 观察最后一题提交后的页面状态
      5. 截图保存
    Expected Result: 显示结果页面（正确数/总数 + 星级评价 + "返回章节"按钮），无黑屏
    Failure Indicators: 页面变黑/空白，或无限加载
    Evidence: .sisyphus/evidence/task-2-assessment-complete.png

  Scenario: questions 引用变化但内容不变时 index 不重置
    Tool: Bash (vitest)
    Preconditions: useQuestionSession 已修改
    Steps:
      1. 编写测试：渲染使用 useQuestionSession 的组件
      2. 使用 rerender 触发 questions prop 引用变化（但内容相同）
      3. 断言：index 没有被重置为 0
      4. 运行 `npm run test:run -- --reporter=verbose src/features/practice/__tests__/useQuestionSession.test.ts`
    Expected Result: 测试 PASS，index 保持不变
    Failure Indicators: index 被重置为 0
    Evidence: .sisyphus/evidence/task-2-session-stable.txt
  ```

  **Commit**: YES (groups with Task 1, 3)
  - Message: `fix: resolve race condition in level completion causing black screen`
  - Files: `src/components/SkillPanel/AssessView.tsx`, `src/features/practice/useQuestionSession.ts`, test files
  - Pre-commit: `npm run test:run`

- [x] 3. AppRouter 空值回退修复

  **What to do**:
  - **AppRouter.tsx 第 63 行**: 将 `return null` 替换为自动导航回地图或显示错误提示
  - 当 `screen === 'chapter'` 但 `selectedChapterId` 为 null 时，应：
    - 方案 A: 自动 dispatch `chapterBack` 动作返回地图
    - 方案 B: 渲染提示信息 "章节加载失败，返回地图..." 并自动回退
  - 编写回归测试：验证 `selectedChapterId` 为 null 时，不返回空白

  **Must NOT do**:
  - 不修改路由逻辑的屏幕类型定义
  - 不修改视觉样式

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件单行修改，逻辑简单
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/app/AppRouter.tsx:58-63` — 当前 `case 'chapter'` 分支，了解 return null 的上下文
  - `src/app/appReducer.ts:12-38` — reducer actions，了解 chapterBack 如何导航回地图

  **API/Type References**:
  - `src/app/appState.ts:1-31` — 状态类型定义，了解 Screen 类型

  **WHY Each Reference Matters**:
  - `AppRouter.tsx` 是空值回退的位置
  - `appReducer.ts` 定义了可用的导航动作（如 chapterBack）

  **Acceptance Criteria**:

  - [ ] AppRouter.tsx 中 `case 'chapter'` 分支无 `return null`
  - [ ] 测试文件: `src/app/__tests__/AppRouter.test.tsx`
  - [ ] `npm run test:run` → 新增测试 PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: selectedChapterId 为 null 时显示回退 UI
    Tool: Bash (vitest)
    Preconditions: AppRouter 已修改
    Steps:
      1. 测试：渲染 AppRouter，props = { screen: 'chapter', selectedChapterId: null }
      2. 断言：渲染结果不为 null，包含可见文本或自动触发了 chapterBack
      3. 运行 `npm run test:run -- --reporter=verbose src/app/__tests__/AppRouter.test.tsx`
    Expected Result: 测试 PASS，组件渲染回退 UI 或触发导航
    Failure Indicators: 渲染结果为 null
    Evidence: .sisyphus/evidence/task-3-router-no-null.txt

  Scenario: selectedChapterId 有效时正常渲染 SkillPanel
    Tool: Bash (vitest)
    Preconditions: AppRouter 已修改
    Steps:
      1. 测试：渲染 AppRouter，props = { screen: 'chapter', selectedChapterId: 'ch1' }
      2. 断言：SkillPanel 组件被渲染（不是 null 或回退 UI）
      3. 运行 `npm run test:run -- --reporter=verbose src/app/__tests__/AppRouter.test.tsx`
    Expected Result: 测试 PASS，SkillPanel 正常渲染
    Failure Indicators: 回退 UI 错误显示
    Evidence: .sisyphus/evidence/task-3-router-normal.txt
  ```

  **Commit**: YES (groups with Task 1, 2)
  - Message: `fix: prevent blank screen in AppRouter when chapter ID is null`
  - Files: `src/app/AppRouter.tsx`, `src/app/__tests__/AppRouter.test.tsx`
  - Pre-commit: `npm run test:run`

- [x] 4. CSS 变量全面翻新 — 明亮紫色主题

  **What to do**:
  - 在 `src/styles.css` 的 `:root` 中翻新所有 CSS 变量为明亮紫色主题：

  ```css
  :root {
    /* 背景层级 */
    --bg-0: #FFFFFF;
    --bg-1: #F5F3FF;        /* 极浅紫 */
    --bg-2: #EDE9FE;        /* 浅紫 */
    
    /* 面板 */
    --panel: rgba(255, 255, 255, 0.95);
    --panel-strong: rgba(255, 255, 255, 0.98);
    
    /* 线条 */
    --line: rgba(107, 78, 230, 0.12);
    
    /* 文字 */
    --text: #1E1B4B;        /* 深靛蓝 */
    --muted: rgba(30, 27, 75, 0.55);
    
    /* 强调色 */
    --gold: #F59E0B;        /* 琥珀 */
    --mint: #10B981;        /* 翡翠绿 */
    --violet: #8B5CF6;      /* 紫罗兰 */
    --danger: #EF4444;      /* 红色 */
    
    /* 主色（新增） */
    --primary: #6B4EE6;
    --primary-light: #8B6FF0;
    --primary-dark: #5B3ED6;
    
    /* 反馈色（新增） */
    --success: #10B981;
    --warning: #F59E0B;
    --error: #EF4444;
    
    /* 阴影 */
    --shadow: 0 4px 24px rgba(107, 78, 230, 0.10);
    --shadow-lg: 0 8px 40px rgba(107, 78, 230, 0.15);
  }
  ```

  - 同步更新 `[data-theme="dark"]` 为匹配的紫色暗色变体（保留暗色切换功能）：
  ```css
  [data-theme="dark"] {
    --bg-0: #0F0A1E;
    --bg-1: #1A1230;
    --bg-2: #251A45;
    --panel: rgba(20, 15, 40, 0.90);
    --panel-strong: rgba(15, 10, 30, 0.95);
    --line: rgba(139, 92, 246, 0.18);
    --text: #F5F3FF;
    --muted: rgba(245, 243, 255, 0.65);
    --gold: #FBBF24;
    --mint: #34D399;
    --violet: #A78BFA;
    --danger: #F87171;
    --shadow: 0 4px 24px rgba(0, 0, 0, 0.40);
    --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.50);
  }
  ```

  - 更新 4 个子 CSS 文件中引用旧颜色的硬编码值：
    - `src/styles/opening.css` — 开场页面样式
    - `src/styles/map.css` — 地图页面样式
    - `src/styles/chapter.css` — 章节页面样式
    - `src/styles/lesson.css` — 课程页面样式

  - 将极光球（aurora orbs）改为明亮的柔和渐变球（淡紫/淡蓝/淡粉）
  - 将星空背景改为柔和的浅色渐变或移除
  - 将所有毛玻璃面板改为白底 + 轻微阴影（更不透明）

  **Must NOT do**:
  - 不修改任何组件的 JSX 结构或逻辑
  - 不修改 Zustand stores
  - 不修改 Canvas 渲染器代码（那是 Task 6 的范围）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 大量 CSS 变量修改，需要理解整个主题系统，影响面广
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 7-22, F1-F4
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - `src/styles.css:1-542` — 主样式文件，包含所有 CSS 变量定义、极光球、星空背景、毛玻璃面板
  - `src/styles/opening.css:1-281` — 开场页面样式
  - `src/styles/map.css:1-207` — 地图页面样式
  - `src/styles/chapter.css:1-193` — 章节页面样式
  - `src/styles/lesson.css:1-192` — 课程页面样式
  - `src/domain/chapters/chapters.ts:9-103` — 章节颜色定义（需要更亮的变体）

  **WHY Each Reference Matters**:
  - `styles.css` 是所有 CSS 变量的集中定义位置 — 全部变量都在此修改
  - 4 个子 CSS 文件可能引用了 CSS 变量之外的颜色值 — 需要逐一排查
  - `chapters.ts` 定义了每个章节的主题色 — 需要更亮的变体以适应白底

  **Acceptance Criteria**:

  - [ ] `:root` CSS 变量已全部更新为明亮紫色主题
  - [ ] `[data-theme="dark"]` 已更新为紫色暗色变体
  - [ ] 4 个子 CSS 文件无旧暗色值硬编码残留
  - [ ] `npm run typecheck` → PASS（CSS 不影响类型）
  - [ ] 应用在浏览器中显示为白底紫主色

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 明亮主题渲染验证
    Tool: Playwright
    Preconditions: CSS 变量已更新，开发服务器运行
    Steps:
      1. 打开 http://localhost:5173
      2. 点击初始化音频
      3. 截图保存开场页面
      4. 检查 <html> 元素的 computed style，验证 --bg-0 为 #FFFFFF 或接近白色
      5. 验证 --primary 为 #6B4EE6 或接近紫色
    Expected Result: 页面显示白底紫色主题，非黑底
    Failure Indicators: 页面仍为暗色或颜色混乱
    Evidence: .sisyphus/evidence/task-4-bright-theme.png

  Scenario: 暗色主题切换验证
    Tool: Playwright
    Preconditions: CSS 变量已更新，开发服务器运行
    Steps:
      1. 打开应用，点击主题切换按钮（右上角）
      2. 等待 500ms 主题切换
      3. 截图保存
      4. 检查 <html> 元素是否有 data-theme="dark" 属性
      5. 验证背景色变暗
    Expected Result: 主题成功切换为紫色暗色变体
    Failure Indicators: 主题不变或颜色异常
    Evidence: .sisyphus/evidence/task-4-dark-theme.png

  Scenario: 无旧暗色值残留
    Tool: Bash (grep)
    Preconditions: CSS 文件已修改
    Steps:
      1. 运行 `grep -r "#07111f\|#0c1830\|#122544\|rgba(10, 18, 34" src/styles/`
      2. 验证无匹配结果
    Expected Result: grep 返回空（无旧暗色值）
    Failure Indicators: 找到旧颜色值
    Evidence: .sisyphus/evidence/task-4-no-old-colors.txt
  ```

  **Commit**: YES (groups with Task 5, 6)
  - Message: `style: overhaul CSS variables to bright purple game theme`
  - Files: `src/styles.css`, `src/styles/opening.css`, `src/styles/map.css`, `src/styles/chapter.css`, `src/styles/lesson.css`
  - Pre-commit: `npm run typecheck`

- [x] 5. Google Fonts + 排版系统更新

  **What to do**:
  - 在 `index.html` 中添加 Google Fonts CDN 引入：
    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
    ```
  - 在 `src/styles.css` 中更新全局字体变量：
    - 主字体: `Poppins, "Noto Sans SC", "PingFang SC", sans-serif`
    - 辅助/友好字体: `Quicksand, Poppins, sans-serif`
  - 更新 hero 标题样式：使用 Poppins Bold，保持 clamp 响应式
  - 更新正文样式：使用 Poppins Regular
  - 确保 CJK 字符（中文）仍回退到 Noto Sans SC / PingFang SC

  **Must NOT do**:
  - 不修改组件 JSX 中的 inline styles 引用的字体（如有）
  - 不修改 Canvas 渲染器中的字体（canvas 字体更新在 Task 19）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 仅修改 index.html 引入和 CSS font-family 声明
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Tasks 7-22
  - **Blocked By**: Task 4 (需要 CSS 文件存在)

  **References**:

  **Pattern References**:
  - `src/styles.css:1-20` — 当前字体定义位置
  - `index.html:1-20` — HTML head 区域，添加字体引入的位置

  **WHY Each Reference Matters**:
  - `styles.css` 开头定义了全局 font-family — 修改此处影响全局
  - `index.html` 是添加 CDN 字体链接的唯一位置

  **Acceptance Criteria**:

  - [ ] `index.html` 包含 Poppins 和 Quicksand 的 Google Fonts 链接
  - [ ] CSS 中 font-family 更新为 Poppins 优先
  - [ ] 中文文本仍正确渲染（Noto Sans SC 回退）
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 新字体加载并应用
    Tool: Playwright
    Preconditions: 字体已引入，开发服务器运行
    Steps:
      1. 打开 http://localhost:5173
      2. 检查 <h1> 或标题元素的 computed font-family
      3. 验证包含 "Poppins"
      4. 截图保存
    Expected Result: 标题使用 Poppins 字体渲染
    Failure Indicators: 回退到 system-ui 或 Inter
    Evidence: .sisyphus/evidence/task-5-fonts-loaded.png

  Scenario: 中文文本仍正确渲染
    Tool: Playwright
    Preconditions: 字体已引入
    Steps:
      1. 打开应用，完成开场到昵称输入
      2. 检查包含中文文本的元素（如"开始冒险"按钮）
      3. 验证中文文本可见且未出现方块字符
      4. 截图保存
    Expected Result: 中文文本正常渲染
    Failure Indicators: 出现方块/乱码字符
    Evidence: .sisyphus/evidence/task-5-chinese-text.png
  ```

  **Commit**: YES (groups with Task 4, 6)
  - Message: `style: add Poppins and Quicksand fonts, update typography`
  - Files: `index.html`, `src/styles.css`
  - Pre-commit: `npm run typecheck`

- [x] 6. canvasTheme.ts — Canvas 颜色桥

  **What to do**:
  - 创建 `src/lib/canvas/canvasTheme.ts`，导出 Canvas 渲染器使用的所有颜色常量
  - 颜色值从 CSS 变量映射，保持与 CSS 主题同步
  - 提供一个 `getCanvasTheme()` 函数，根据当前 `data-theme` 返回对应颜色集合
  - 颜色集包含：
    - 背景、节点、路径、锁定状态
    - 文字、强调色、成功/失败反馈色
    - 粒子颜色
  - 编写单元测试验证颜色值的完整性

  **Must NOT do**:
  - 不修改现有 Canvas 渲染器代码（那是后续 Task 的范围）
  - 不修改 CSS 文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 新建单文件，导出颜色常量映射
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 12, 19, 21
  - **Blocked By**: Task 4 (需要确认 CSS 变量的最终值)

  **References**:

  **Pattern References**:
  - `src/lib/canvas/WorldMapRenderer.ts` — 了解 Canvas 渲染器当前使用的硬编码颜色
  - `src/lib/canvas/Piano.ts` — 了解钢琴渲染器的颜色使用
  - `src/lib/effects/particlePresets.ts` — 了解粒子预设颜色

  **WHY Each Reference Matters**:
  - Canvas 渲染器使用硬编码颜色 — canvasTheme.ts 需要提供对应的明亮变体
  - particlePresets.ts 定义了粒子颜色 — 需要匹配新主题

  **Acceptance Criteria**:

  - [ ] 文件创建: `src/lib/canvas/canvasTheme.ts`
  - [ ] 导出 `getCanvasTheme()` 函数
  - [ ] 包含 light 和 dark 两套完整颜色
  - [ ] 测试文件: `src/lib/canvas/__tests__/canvasTheme.test.ts`
  - [ ] `npm run test:run` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: getCanvasTheme 返回完整的颜色集合
    Tool: Bash (vitest)
    Preconditions: canvasTheme.ts 已创建
    Steps:
      1. 测试：调用 getCanvasTheme('light')
      2. 断言返回对象包含所有必要字段（bg, node, path, text, accent, success, error, particle）
      3. 断言所有值为有效的 CSS 颜色格式
      4. 运行 `npm run test:run`
    Expected Result: 测试 PASS，颜色集完整
    Failure Indicators: 缺少字段或颜色格式无效
    Evidence: .sisyphus/evidence/task-6-canvas-theme.txt

  Scenario: light 和 dark 主题颜色集不同
    Tool: Bash (vitest)
    Steps:
      1. 测试：调用 getCanvasTheme('light') 和 getCanvasTheme('dark')
      2. 断言两者颜色值不同
      3. 运行 `npm run test:run`
    Expected Result: 两套颜色确实不同
    Failure Indicators: 两套颜色完全相同
    Evidence: .sisyphus/evidence/task-6-theme-diff.txt
  ```

  **Commit**: YES (groups with Task 4, 5)
  - Message: `feat: add canvasTheme bridge for Canvas renderer colors`
  - Files: `src/lib/canvas/canvasTheme.ts`, `src/lib/canvas/__tests__/canvasTheme.test.ts`
  - Pre-commit: `npm run test:run`

- [x] 7. AppShell 重样式

  **What to do**:
  - 更新 AppShell 的背景效果：移除暗色极光球效果，改为明亮的柔和渐变装饰球
  - 更新主题切换按钮样式：使用 --primary 紫色
  - 确保 HUD 区域在明亮背景下清晰可读
  - 更新 ShakeWrapper 和整体布局的间距/阴影
  - 将 `data-theme` 默认值改为 `"light"`（在 playerStore 中）

  **Must NOT do**:
  - 不修改 AppShell 的 JSX 结构和组件逻辑
  - 不修改 Zustand store 接口

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: AppShell 是全局壳组件，影响整个应用的视觉效果
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/app/AppShell.tsx:1-90` — AppShell 组件，了解极光球、HUD 布局、主题切换的完整结构
  - `src/styles.css` (极光球相关样式) — 当前极光球的 CSS 类和颜色

  **WHY Each Reference Matters**:
  - AppShell 是所有页面的容器 — 极光球和背景效果定义在此

  **Acceptance Criteria**:

  - [ ] AppShell 在明亮主题下显示柔和的装饰球（非暗色极光）
  - [ ] 主题切换按钮清晰可见
  - [ ] 默认主题为明亮
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: AppShell 明亮主题视觉效果
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 打开应用，完成音频初始化
      2. 截图保存开场页面
      3. 检查背景为白色/浅色，非黑色
      4. 检查装饰球为柔和浅色（非暗色极光）
    Expected Result: 白底 + 柔和渐变装饰球
    Failure Indicators: 黑色背景或暗色极光球
    Evidence: .sisyphus/evidence/task-7-appshell-bright.png

  Scenario: 默认主题为 light
    Tool: Bash (vitest)
    Steps:
      1. 检查 playerStore 的默认 theme 值
      2. 断言为 'light'
    Expected Result: 默认 theme 为 'light'
    Failure Indicators: 默认为 'dark'
    Evidence: .sisyphus/evidence/task-7-default-theme.txt
  ```

  **Commit**: YES (groups with Tasks 8, 9, 10)
  - Message: `style: restyle AppShell for bright game theme`
  - Files: `src/app/AppShell.tsx` (CSS classes only), `src/styles.css`, `src/stores/playerStore.ts`
  - Pre-commit: `npm run typecheck`

- [x] 8. HUD 组件重样式

  **What to do**:
  - 重样式化所有 HUD 组件为明亮紫色风格：
    - `GameHUD.tsx` — 容器布局，半透明白底
    - `XPBar.tsx` — 进度条使用 --primary 紫色渐变，等级徽章使用 --primary 背景
    - `BadgeCounter.tsx` — 奖杯图标使用 --gold 琥珀色
    - `LivesDisplay.tsx` — 心形使用 --danger 红色
    - `ComboCounter.tsx` — 连击数字使用 --primary 紫色，弹跳动画保留
  - 更新 `comboPop` keyframe 动画颜色

  **Must NOT do**:
  - 不修改 HUD 组件的 JSX 结构和逻辑
  - 不修改状态管理

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 纯视觉重样式，涉及多个组件的 CSS 修改
  - **Skills**: [`frontend-design`]
    - `frontend-design`: 确保视觉风格统一和专业

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/components/HUD/GameHUD.tsx` — HUD 容器
  - `src/components/HUD/XPBar.tsx` — XP 进度条
  - `src/components/HUD/BadgeCounter.tsx` — 徽章计数
  - `src/components/HUD/LivesDisplay.tsx` — 生命值显示
  - `src/components/HUD/ComboCounter.tsx` — 连击计数器

  **WHY Each Reference Matters**:
  - HUD 组件贯穿 map 和 chapter 页面 — 是用户最常见的 UI 元素

  **Acceptance Criteria**:

  - [ ] 所有 HUD 组件在明亮背景下清晰可读
  - [ ] XP 条使用紫色渐变
  - [ ] 心形为红色，奖杯为琥珀色
  - [ ] 连击数字为紫色
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: HUD 在明亮主题下清晰可读
    Tool: Playwright
    Preconditions: 开发服务器运行，已进入地图页面
    Steps:
      1. 完成开场流程进入地图页面
      2. 检查 HUD 区域（顶部）
      3. 验证 XP 条为紫色渐变
      4. 验证文字为深色（在白底上可读）
      5. 截图保存
    Expected Result: HUD 清晰可读，颜色符合明亮紫色主题
    Failure Indicators: 文字不可读，或颜色仍为暗色系
    Evidence: .sisyphus/evidence/task-8-hud-bright.png
  ```

  **Commit**: YES (groups with Tasks 7, 9, 10)
  - Message: `style: restyle HUD components for bright purple theme`
  - Files: `src/components/HUD/*.tsx` (CSS classes), `src/styles.css`
  - Pre-commit: `npm run typecheck`

- [x] 9. Opening 流程重样式 (TitleScreen + InstrumentPicker + NicknameInput)

  **What to do**:
  - **TitleScreen**: 白底/浅紫渐变背景，大标题使用 Poppins Bold + --primary 紫色，CTA 按钮使用 --primary 紫色填充，特性列表使用紫色图标
  - **InstrumentPicker**: 卡片式布局，白底 + 紫色边框，选中状态使用 --primary 背景，hover 效果
  - **NicknameInput**: 输入框白底 + 紫色聚焦边框，按钮使用 --primary 紫色
  - 移除暗色专属效果（如暗色辉光、深色阴影），替换为明亮的阴影和高光

  **Must NOT do**:
  - 不修改开场流程逻辑和状态管理
  - 不修改 InstrumentPicker 的乐器选项数据

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 3 个页面的完整视觉重设计
  - **Skills**: [`frontend-design`]
    - `frontend-design`: 确保明亮游戏风格的视觉一致性

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/components/Opening/TitleScreen.tsx` — 标题页组件
  - `src/components/Opening/InstrumentPicker.tsx` — 乐器选择组件
  - `src/components/Opening/NicknameInput.tsx` — 昵称输入组件
  - `src/styles/opening.css:1-281` — 开场页面所有 CSS 样式

  **WHY Each Reference Matters**:
  - Opening 是用户的第一印象 — 视觉风格必须立即传达"明亮游戏"感
  - `opening.css` 包含所有开场页面的样式 — 一次性修改最有效

  **Acceptance Criteria**:

  - [ ] TitleScreen 白底/浅紫背景，紫色标题和按钮
  - [ ] InstrumentPicker 卡片白底 + 紫色选中态
  - [ ] NicknameInput 紫色聚焦边框
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Opening 流程完整视觉验证
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 打开 http://localhost:5173
      2. 截图保存标题页 — 验证白底 + 紫色标题
      3. 点击"开始冒险"，等待 demo
      4. Demo 结束后截图乐器选择页 — 验证卡片白底 + 紫色边框
      5. 选择钢琴，截图昵称输入页 — 验证紫色聚焦效果
      6. 输入昵称并确认
    Expected Result: 每个页面都是明亮紫色主题，无暗色元素
    Failure Indicators: 任一页面仍为暗色或颜色不一致
    Evidence: .sisyphus/evidence/task-9-opening-01-title.png, task-9-opening-02-instruments.png, task-9-opening-03-nickname.png
  ```

  **Commit**: YES (groups with Tasks 7, 8, 10)
  - Message: `style: restyle opening flow for bright game theme`
  - Files: `src/components/Opening/*.tsx` (CSS), `src/styles/opening.css`
  - Pre-commit: `npm run typecheck`

- [x] 10. DemoAnimation 重样式

  **What to do**:
  - 将 DemoAnimation 的暗色全屏背景改为白底/浅紫背景
  - 钢琴键盘保持黑白键标准颜色
  - 浮动文字 "C = do" 使用 --primary 紫色
  - 更新过渡动画颜色

  **Must NOT do**:
  - 不修改音频播放逻辑
  - 不修改钢琴键颜色（标准黑白）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单组件样式修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/components/modules/NoteNames/DemoAnimation.tsx` — Demo 动画组件
  - `src/styles/opening.css` (demo 相关样式)

  **WHY Each Reference Matters**:
  - DemoAnimation 是开场演示 — 用户首次接触钢琴视觉

  **Acceptance Criteria**:

  - [ ] Demo 背景为白底/浅紫
  - [ ] 文字为紫色
  - [ ] 钢琴键保持标准黑白
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Demo 视觉验证
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 打开应用，点击初始化
      2. 点击"开始冒险"进入 demo
      3. 截图保存 demo 画面
      4. 验证背景为浅色，文字为紫色
    Expected Result: 白底/浅紫背景 + 紫色浮动文字
    Failure Indicators: 暗色背景
    Evidence: .sisyphus/evidence/task-10-demo-bright.png
  ```

  **Commit**: YES (groups with Tasks 7, 8, 9)
  - Message: `style: restyle DemoAnimation for bright theme`
  - Files: `src/components/modules/NoteNames/DemoAnimation.tsx` (CSS)
  - Pre-commit: `npm run typecheck`

- [ ] 11. WorldMapCanvas + ChapterListOverlay 重样式

  **What to do**:
  - **WorldMapCanvas**: 背景从暗色改为明亮浅色/白色，节点颜色更新，路径颜色更新
  - **ChapterListOverlay**: 侧边栏从暗色毛玻璃改为白底 + 轻阴影，文字为深色，选中/锁定状态使用紫色系
  - 更新章节节点为卡片式外观（白底 + 紫色边框 + 圆角）
  - 更新锁定状态为灰色 + 锁图标

  **Must NOT do**:
  - 不修改 Canvas 渲染逻辑（那是 Task 12）
  - 不修改章节解锁逻辑

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 地图页面是核心导航，需要精细的视觉设计
  - **Skills**: [`frontend-design`]
    - `frontend-design`: 确保地图页面的视觉吸引力

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13, 14)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5, 6

  **References**:

  **Pattern References**:
  - `src/components/Canvas/WorldMapCanvas.tsx` — Canvas 地图组件
  - `src/features/map/ChapterListOverlay.tsx` — 章节列表侧边栏
  - `src/styles/map.css:1-207` — 地图页面所有 CSS

  **WHY Each Reference Matters**:
  - WorldMapCanvas 是 Canvas 渲染 — 颜色由 Canvas API 控制
  - ChapterListOverlay 是 DOM 组件 — 由 CSS 控制

  **Acceptance Criteria**:

  - [ ] 地图背景为浅色/白色
  - [ ] 章节列表侧边栏为白底 + 深色文字
  - [ ] 选中/高亮状态为紫色
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 地图页面明亮主题验证
    Tool: Playwright
    Preconditions: 已进入地图页面
    Steps:
      1. 截图地图页面
      2. 验证背景为浅色
      3. 验证章节列表侧边栏为白底
      4. 验证文字为深色可读
    Expected Result: 地图为明亮风格
    Failure Indicators: 仍为暗色地图
    Evidence: .sisyphus/evidence/task-11-map-bright.png
  ```

  **Commit**: YES (groups with Tasks 12, 13, 14)
  - Message: `style: restyle world map and chapter list for bright theme`
  - Files: `src/components/Canvas/WorldMapCanvas.tsx` (CSS), `src/features/map/ChapterListOverlay.tsx`, `src/styles/map.css`
  - Pre-commit: `npm run typecheck`

- [ ] 12. WorldMapRenderer Canvas 颜色更新

  **What to do**:
  - 在 `src/lib/canvas/WorldMapRenderer.ts` 中引入 `canvasTheme.ts`
  - 替换所有硬编码颜色为 `getCanvasTheme()` 返回值
  - 更新以下渲染颜色：
    - 背景渐变
    - 路径/连线
    - 节点圆圈（已解锁、当前、锁定）
    - 文字标签
    - 锁定图标
  - 确保渲染在 `data-theme` 变化时重新绘制

  **Must NOT do**:
  - 不修改渲染逻辑和布局算法
  - 不修改 WorldMapData.ts 中的位置数据

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Canvas 渲染器代码需要仔细替换颜色，确保不破坏渲染逻辑
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 13, 14)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 6

  **References**:

  **Pattern References**:
  - `src/lib/canvas/WorldMapRenderer.ts` — Canvas 世界地图渲染器，包含所有硬编码颜色
  - `src/lib/canvas/canvasTheme.ts` — Task 6 创建的颜色桥

  **API/Type References**:
  - `src/lib/canvas/WorldMapData.ts` — 地图数据（位置、边缘）— 不修改但需要理解

  **WHY Each Reference Matters**:
  - WorldMapRenderer 是 Canvas 渲染的核心 — 所有颜色在此替换
  - canvasTheme.ts 提供了新颜色值 — 需要正确引入

  **Acceptance Criteria**:

  - [ ] WorldMapRenderer.ts 无硬编码颜色值
  - [ ] 所有颜色通过 `getCanvasTheme()` 获取
  - [ ] 地图在明亮主题下正确渲染
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Canvas 地图明亮主题渲染
    Tool: Playwright
    Preconditions: 已进入地图页面
    Steps:
      1. 截图 Canvas 地图区域
      2. 验证节点为明亮颜色（非暗色）
      3. 验证路径为可见颜色
    Expected Result: Canvas 地图在白底上正确渲染
    Failure Indicators: 节点不可见或颜色混乱
    Evidence: .sisyphus/evidence/task-12-canvas-map-bright.png
  ```

  **Commit**: YES (groups with Tasks 11, 13, 14)
  - Message: `style: update WorldMapRenderer canvas colors for bright theme`
  - Files: `src/lib/canvas/WorldMapRenderer.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 13. SkillPanel + 技能时间线重样式

  **What to do**:
  - **SkillPanel**: 章节页面容器从暗色改为白底 + 紫色强调
  - **技能时间线**: 时间线节点使用紫色（已完成=实心紫色，当前=紫色脉冲，锁定=灰色）
  - **技能卡片**: 白底 + 紫色边框，hover 效果
  - **步骤指示器**: 学习→练习→考核 使用紫色/绿色/金色
  - 更新 `src/styles/chapter.css`

  **Must NOT do**:
  - 不修改技能流程逻辑
  - 不修改步骤状态管理

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 章节页是核心交互页面，视觉设计重要
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 12, 14)
  - **Blocks**: Tasks 15-18, F1-F4
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/components/SkillPanel/SkillPanel.tsx` — 技能面板主组件
  - `src/styles/chapter.css:1-193` — 章节页面所有 CSS

  **WHY Each Reference Matters**:
  - SkillPanel 是用户在章节中花费时间最多的页面

  **Acceptance Criteria**:

  - [ ] 技能时间线节点为紫色系
  - [ ] 卡片白底 + 紫色边框
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 章节页面明亮主题验证
    Tool: Playwright
    Preconditions: 已进入 ch1 章节页面
    Steps:
      1. 点击 ch1 进入章节
      2. 截图保存技能列表
      3. 验证白底 + 紫色时间线 + 深色文字
    Expected Result: 章节页面为明亮紫色风格
    Failure Indicators: 暗色背景或不可读文字
    Evidence: .sisyphus/evidence/task-13-skill-panel-bright.png
  ```

  **Commit**: YES (groups with Tasks 11, 12, 14)
  - Message: `style: restyle SkillPanel and skill timeline for bright theme`
  - Files: `src/components/SkillPanel/SkillPanel.tsx` (CSS), `src/styles/chapter.css`
  - Pre-commit: `npm run typecheck`

- [ ] 14. TransitionOverlay + EffectsProvider 重样式

  **What to do**:
  - **TransitionOverlay**: 将过渡动画颜色从暗色改为紫色系
    - Banner 过渡使用 --primary 紫色背景
    - Fade 过渡使用半透明白色
    - LevelUp 庆祝使用 --gold 琥珀色 + --primary 紫色
  - **EffectsProvider**: 无直接样式变更（CSS 变量已更新）
  - 更新相关 keyframe 动画颜色

  **Must NOT do**:
  - 不修改过渡逻辑和时序

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 主要是 keyframe 颜色更新
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 12, 13)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/components/Transitions/TransitionOverlay.tsx` — 过渡动画组件
  - `src/styles.css` (transition keyframes) — transitionBannerIn, transitionFade, transitionLevelUpBg, levelUpPop 等

  **WHY Each Reference Matters**:
  - 过渡动画影响页面切换的视觉体验

  **Acceptance Criteria**:

  - [ ] 过渡动画使用紫色系颜色
  - [ ] LevelUp 庆祝使用金色+紫色
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 页面过渡动画视觉验证
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 完成开场流程，观察地图页面的过渡动画
      2. 截图过渡中间帧（如有）
      3. 验证过渡使用紫色/白色，非暗色
    Expected Result: 过渡动画为明亮风格
    Failure Indicators: 暗色过渡闪烁
    Evidence: .sisyphus/evidence/task-14-transitions.png
  ```

  **Commit**: YES (groups with Tasks 11, 12, 13)
  - Message: `style: restyle transitions and effects for bright theme`
  - Files: `src/components/Transitions/TransitionOverlay.tsx` (CSS), `src/styles.css`
  - Pre-commit: `npm run typecheck`

- [ ] 15. LearnView + AssessView 视觉重样式

  **What to do**:
  - **LearnView**: 课程内容面板白底 + 紫色强调，文本深色，代码/音符示例使用紫色背景块
  - **AssessView**: 题目面板白底，选项卡片白底 + 紫色边框，选中态紫色背景，正确/错误反馈使用绿/红
  - 结果页面：星级评价使用金色星星，XP 获得动画使用紫色，按钮使用 --primary
  - 更新 `src/styles/lesson.css`

  **Must NOT do**:
  - 不修改题目逻辑、评分规则
  - 不修改 useQuestionSession hook（已在 Task 2 修复）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 学习和评估是核心学习体验页面
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 16, 17, 18, 19)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5, 13

  **References**:

  **Pattern References**:
  - `src/components/SkillPanel/LearnView.tsx` — 学习内容视图
  - `src/components/SkillPanel/AssessView.tsx:107-170` — 评估结果页面渲染
  - `src/styles/lesson.css:1-192` — 课程/练习样式

  **WHY Each Reference Matters**:
  - LearnView 和 AssessView 是用户学习过程中的主要交互页面

  **Acceptance Criteria**:

  - [ ] 学习内容面板白底 + 深色文字 + 紫色强调
  - [ ] 选项卡片白底 + 紫色边框
  - [ ] 结果页金色星星 + 紫色 XP 动画
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 学习页面明亮主题验证
    Tool: Playwright
    Preconditions: 已进入 ch1-s1 的 learn 步骤
    Steps:
      1. 进入 ch1，选择第一个技能，进入 learn 步骤
      2. 截图保存
      3. 验证白底 + 深色文字 + 紫色强调元素
    Expected Result: 学习页面为明亮游戏风格
    Failure Indicators: 暗色背景
    Evidence: .sisyphus/evidence/task-15-learn-bright.png

  Scenario: 评估结果页面视觉验证
    Tool: Playwright
    Preconditions: 已完成 ch1-s1 评估
    Steps:
      1. 完成 ch1-s1 的 learn → practice → assessment 流程
      2. 在评估结果页面截图
      3. 验证金色星星 + 紫色 XP + 明亮背景
    Expected Result: 结果页面为明亮庆祝风格
    Failure Indicators: 暗色结果页面
    Evidence: .sisyphus/evidence/task-15-assess-result.png
  ```

  **Commit**: YES (groups with Tasks 16, 17, 18, 19)
  - Message: `style: restyle LearnView and AssessView for bright theme`
  - Files: `src/components/SkillPanel/LearnView.tsx` (CSS), `src/components/SkillPanel/AssessView.tsx` (CSS), `src/styles/lesson.css`
  - Pre-commit: `npm run typecheck`

- [ ] 16. 练习变体重样式 (6 个 practiceVariants)

  **What to do**:
  - 重样式化 6 个练习变体组件的 CSS：
    - `NoteNamesPractice.tsx` — 音名练习
    - `EarTrainingPractice.tsx` — 听力训练
    - `RhythmPractice.tsx` — 节奏练习
    - `StaffReadingPractice.tsx` — 五线谱阅读
    - `ScalesPractice.tsx` — 音阶练习
    - `ProgressionsPractice.tsx` — 和弦进行
  - 统一样式：白底面板 + 紫色选项卡片 + 绿/红反馈色
  - 这些组件主要是包装器 — 样式修改可能较少

  **Must NOT do**:
  - 不修改练习逻辑和题目生成
  - 不修改 `EarTrainingPractice.tsx:19` 和 `ProgressionsPractice.tsx:18` 的 `if (completed) return null` — 这些的 null 返回在父容器中是安全的

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 6 个组件的统一样式更新
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15, 17, 18, 19)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5, 15

  **References**:

  **Pattern References**:
  - `src/components/SkillPanel/practiceVariants/NoteNamesPractice.tsx`
  - `src/components/SkillPanel/practiceVariants/EarTrainingPractice.tsx`
  - `src/components/SkillPanel/practiceVariants/RhythmPractice.tsx`
  - `src/components/SkillPanel/practiceVariants/StaffReadingPractice.tsx`
  - `src/components/SkillPanel/practiceVariants/ScalesPractice.tsx`
  - `src/components/SkillPanel/practiceVariants/ProgressionsPractice.tsx`

  **WHY Each Reference Matters**:
  - 这 6 个变体组件是所有练习类型的入口 — 统一样式确保一致性

  **Acceptance Criteria**:

  - [ ] 所有 6 个练习变体在明亮主题下正确渲染
  - [ ] 选项/反馈颜色统一（紫/绿/红）
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 练习变体明亮主题验证
    Tool: Playwright
    Preconditions: 已进入 ch1 的 practice 步骤
    Steps:
      1. 进入 ch1-s1 的 practice 步骤
      2. 截图保存练习页面
      3. 验证白底 + 紫色选项 + 明亮风格
    Expected Result: 练习页面为明亮游戏风格
    Failure Indicators: 暗色背景或不可读文字
    Evidence: .sisyphus/evidence/task-16-practice-variants.png
  ```

  **Commit**: YES (groups with Tasks 15, 17, 18, 19)
  - Message: `style: restyle practice variants for bright theme`
  - Files: `src/components/SkillPanel/practiceVariants/*.tsx` (CSS)
  - Pre-commit: `npm run typecheck`

- [ ] 17. 练习模块重样式 — Intervals + Chords + NoteNames

  **What to do**:
  - 重样式化 3 个练习模块组件：
    - `src/components/modules/NoteNames/DemoAnimation.tsx` — 已在 Task 10 处理，跳过
    - `src/components/modules/Intervals/IntervalsPractice.tsx` — 音程练习
    - `src/components/modules/Chords/ChordsPractice.tsx` — 和弦练习
  - 白底面板 + 紫色强调 + 正确/错误反馈色

  **Must NOT do**:
  - 不修改音频播放逻辑
  - 不修改 DemoAnimation（已在 Task 10）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15, 16, 18, 19)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5, 15

  **References**:

  **Pattern References**:
  - `src/components/modules/Intervals/IntervalsPractice.tsx`
  - `src/components/modules/Chords/ChordsPractice.tsx`

  **WHY Each Reference Matters**:
  - 这些模块是具体练习的实现 — 需要与整体风格统一

  **Acceptance Criteria**:

  - [ ] IntervalsPractice 在明亮主题下正确渲染
  - [ ] ChordsPractice 在明亮主题下正确渲染
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 音程练习明亮主题验证
    Tool: Playwright
    Preconditions: 已进入包含音程练习的章节
    Steps:
      1. 进入 ch5（音程回廊）的练习
      2. 截图保存
      3. 验证明亮主题
    Expected Result: 音程练习为明亮风格
    Evidence: .sisyphus/evidence/task-17-intervals-bright.png
  ```

  **Commit**: YES (groups with Tasks 15, 16, 18, 19)
  - Message: `style: restyle Intervals and Chords modules for bright theme`
  - Files: `src/components/modules/Intervals/IntervalsPractice.tsx` (CSS), `src/components/modules/Chords/ChordsPractice.tsx` (CSS)
  - Pre-commit: `npm run typecheck`

- [ ] 18. 练习模块重样式 — Scales + Staff + Rhythm + Progressions

  **What to do**:
  - 重样式化 4 个练习模块组件：
    - `src/components/modules/Scales/ScalesPractice.tsx` — 音阶练习
    - `src/components/modules/Staff/StaffPractice.tsx` — 五线谱练习
    - `src/components/modules/Rhythm/FollowPractice.tsx` — 节奏跟随游戏
    - `src/components/modules/Rhythm/ScrollableStaff.tsx` — 滚动五线谱
    - `src/components/modules/Progressions/ProgressionsPractice.tsx` — 和弦进行
  - 白底面板 + 紫色强调
  - **特别注意 FollowPractice.tsx 和 ScrollableStaff.tsx** — 它们有硬编码的反馈颜色，在 Task 20 中处理

  **Must NOT do**:
  - 不修改 FollowPractice 和 ScrollableStaff 的硬编码颜色（Task 20 范围）
  - 不修改音频播放逻辑

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15, 16, 17, 19)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5, 15

  **References**:

  **Pattern References**:
  - `src/components/modules/Scales/ScalesPractice.tsx`
  - `src/components/modules/Staff/StaffPractice.tsx`
  - `src/components/modules/Rhythm/FollowPractice.tsx`
  - `src/components/modules/Rhythm/ScrollableStaff.tsx`
  - `src/components/modules/Progressions/ProgressionsPractice.tsx`

  **WHY Each Reference Matters**:
  - 这些模块涵盖音阶、五线谱、节奏、和弦进行 — 是高级练习内容

  **Acceptance Criteria**:

  - [ ] 所有 5 个组件在明亮主题下正确渲染
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 节奏游戏明亮主题验证
    Tool: Playwright
    Preconditions: 已进入节奏练习
    Steps:
      1. 进入 ch2（拍子河流）的练习
      2. 截图保存
      3. 验证明亮主题
    Expected Result: 节奏游戏为明亮风格
    Evidence: .sisyphus/evidence/task-18-rhythm-bright.png
  ```

  **Commit**: YES (groups with Tasks 15, 16, 17, 19)
  - Message: `style: restyle Scales, Staff, Rhythm, Progressions modules for bright theme`
  - Files: `src/components/modules/Scales/ScalesPractice.tsx` (CSS), `src/components/modules/Staff/StaffPractice.tsx` (CSS), `src/components/modules/Rhythm/FollowPractice.tsx` (CSS), `src/components/modules/Rhythm/ScrollableStaff.tsx` (CSS), `src/components/modules/Progressions/ProgressionsPractice.tsx` (CSS)
  - Pre-commit: `npm run typecheck`

- [ ] 19. Canvas 组件更新 (PianoCanvas + StaffCanvas + MetronomeCanvas)

  **What to do**:
  - **PianoCanvas / Piano.ts**: 引入 `canvasTheme.ts`，更新钢琴容器背景色（浅色），键标签颜色（深色文字）— 钢琴键本身保持黑白
  - **StaffCanvas**: 更新五线谱背景、线条颜色（深灰而非纯黑）、音符颜色
  - **MetronomeCanvas**: 更新节拍指示器颜色 — 当前拍紫色高亮，非当前拍灰色
  - 所有颜色通过 `getCanvasTheme()` 获取

  **Must NOT do**:
  - 不修改音乐符号的 `#000` 笔画（这是音乐标准）
  - 不修改钢琴键的黑白颜色

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Canvas 渲染器需要仔细替换颜色，涉及 fillStyle/strokeStyle 等
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15, 16, 17, 18)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 6

  **References**:

  **Pattern References**:
  - `src/components/Canvas/PianoCanvas.tsx` — 钢琴 Canvas 组件
  - `src/components/Canvas/StaffCanvas.tsx` — 五线谱 Canvas 组件
  - `src/components/Canvas/MetronomeCanvas.tsx` — 节拍器 Canvas 组件
  - `src/lib/canvas/Piano.ts` — 钢琴渲染器（核心渲染逻辑）
  - `src/lib/canvas/canvasTheme.ts` — Task 6 创建的颜色桥

  **WHY Each Reference Matters**:
  - 这些 Canvas 组件渲染了钢琴键盘、五线谱、节拍器 — 是核心音乐学习视觉元素

  **Acceptance Criteria**:

  - [ ] PianoCanvas 背景为浅色，键标签深色可读
  - [ ] StaffCanvas 线条为深灰
  - [ ] MetronomeCanvas 当前拍紫色高亮
  - [ ] 无硬编码颜色残留
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Canvas 组件明亮主题渲染
    Tool: Playwright
    Preconditions: 已进入包含 Canvas 组件的页面
    Steps:
      1. 进入 ch1-s1 的 learn 步骤（包含 PianoCanvas 和 StaffCanvas）
      2. 截图保存
      3. 验证钢琴背景浅色 + 五线谱线条可见 + 节拍器紫色高亮
    Expected Result: Canvas 组件在白底上正确渲染
    Failure Indicators: Canvas 不可见或颜色混乱
    Evidence: .sisyphus/evidence/task-19-canvas-components-bright.png
  ```

  **Commit**: YES (groups with Tasks 15, 16, 17, 18)
  - Message: `style: update PianoCanvas, StaffCanvas, MetronomeCanvas for bright theme`
  - Files: `src/components/Canvas/PianoCanvas.tsx`, `src/components/Canvas/StaffCanvas.tsx`, `src/components/Canvas/MetronomeCanvas.tsx`, `src/lib/canvas/Piano.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 20. 硬编码颜色全量清扫

  **What to do**:
  - 使用 `grep -r` 搜索所有 `src/` 下的硬编码颜色值：
    - 十六进制: `#07111f`, `#0c1830`, `#122544`, `#0a1222` 等
    - `rgba(10, 18, 34`, `rgba(9, 16, 31`, `rgba(0, 0, 0` 等
  - 逐一替换为 CSS 变量或 canvasTheme 引用
  - **重点关注文件**（Metis 标记的）:
    - `src/components/modules/Rhythm/FollowPractice.tsx` — 硬编码反馈颜色 `#4ade80`, `#facc15`, `#f87171`
    - `src/components/modules/Rhythm/ScrollableStaff.tsx` — 容器渐变背景
    - `src/features/tutorial/TutorialOverlay.tsx` — 10+ 内联暗色主题颜色
  - 验证清扫完整性：grep 无残留

  **Must NOT do**:
  - 不修改 `notation.ts` 和 `clef.ts` 中的 `#000` 音乐符号笔画
  - 不修改钢琴键的黑白颜色
  - 不修改第三方库代码

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 全量搜索+替换，需要仔细判断每个颜色值的用途
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 21, 22)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 7-19

  **References**:

  **Pattern References**:
  - `src/components/modules/Rhythm/FollowPractice.tsx` — 硬编码 `#4ade80`, `#facc15`, `#f87171`
  - `src/components/modules/Rhythm/ScrollableStaff.tsx` — 硬编码渐变背景
  - `src/features/tutorial/TutorialOverlay.tsx` — 10+ 内联暗色颜色

  **WHY Each Reference Matters**:
  - 这些文件被 Metis 标记为包含硬编码颜色 — 容易遗漏

  **Acceptance Criteria**:

  - [ ] `grep -rn "#07111f\|#0c1830\|#122544\|#0a1222\|rgba(10, 18, 34\|rgba(9, 16, 31" src/` 返回空
  - [ ] FollowPractice 反馈颜色替换为 CSS 变量
  - [ ] ScrollableStaff 渐变替换
  - [ ] TutorialOverlay 内联颜色替换
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 硬编码暗色值完全清除
    Tool: Bash (grep)
    Preconditions: 所有修改完成
    Steps:
      1. 运行 `grep -rn "#07111f\|#0c1830\|#122544\|rgba(10, 18, 34\|rgba(9, 16, 31" src/`
      2. 验证输出为空
      3. 运行 `grep -rn "#4ade80\|#facc15\|#f87171" src/components/modules/Rhythm/FollowPractice.tsx`
      4. 验证输出为空
    Expected Result: 所有旧暗色值已替换
    Failure Indicators: 发现残留的硬编码颜色
    Evidence: .sisyphus/evidence/task-20-no-hardcoded-colors.txt

  Scenario: TutorialOverlay 明亮主题渲染
    Tool: Playwright
    Preconditions: 新用户首次进入
    Steps:
      1. 打开应用，完成开场到地图
      2. 如果有教程提示，截图保存
      3. 验证教程覆盖层为明亮风格
    Expected Result: 教程覆盖层为明亮紫色风格
    Failure Indicators: 暗色教程覆盖层
    Evidence: .sisyphus/evidence/task-20-tutorial-bright.png
  ```

  **Commit**: YES (groups with Tasks 21, 22)
  - Message: `style: sweep all hardcoded dark-theme colors across codebase`
  - Files: FollowPractice.tsx, ScrollableStaff.tsx, TutorialOverlay.tsx, and others found by grep
  - Pre-commit: `npm run typecheck`

- [ ] 21. 粒子效果 + 粒子预设颜色更新

  **What to do**:
  - 更新 `src/lib/effects/particlePresets.ts` 中的粒子颜色：
    - 成功粒子：金色 → 保持金色（在白底上也很醒目）
    - 错误粒子：红色 → 保持红色
    - 升级粒子：紫色 → 使用 --primary 紫色
    - 通用粒子：使用紫色系
  - 更新 `src/components/Effects/ParticleCanvas.tsx` 背景透明度
  - 更新 `src/lib/effects/ParticleSystem.ts` 默认颜色
  - 所有颜色通过 `canvasTheme.ts` 获取

  **Must NOT do**:
  - 不修改粒子运动逻辑
  - 不修改 ScreenShake 效果

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 主要替换颜色常量值
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 20, 22)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `src/lib/effects/particlePresets.ts` — 粒子预设颜色配置
  - `src/lib/effects/ParticleSystem.ts` — 粒子系统核心
  - `src/components/Effects/ParticleCanvas.tsx` — 粒子 Canvas 组件

  **WHY Each Reference Matters**:
  - 粒子效果是视觉反馈的重要部分 — 颜色需要匹配新主题

  **Acceptance Criteria**:

  - [ ] 粒子预设颜色使用 canvasTheme 引用
  - [ ] 粒子在白底上可见且美观
  - [ ] `npm run typecheck` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 粒子效果在明亮主题下可见
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 完成 ch1-s1 评估（触发成功粒子）
      2. 截图保存粒子效果帧
      3. 验证粒子在白底上可见
    Expected Result: 粒子效果在白底上清晰可见且美观
    Evidence: .sisyphus/evidence/task-21-particles-bright.png
  ```

  **Commit**: YES (groups with Tasks 20, 22)
  - Message: `style: update particle effects colors for bright theme`
  - Files: `src/lib/effects/particlePresets.ts`, `src/lib/effects/ParticleSystem.ts`, `src/components/Effects/ParticleCanvas.tsx`
  - Pre-commit: `npm run typecheck`

- [ ] 22. 明暗主题切换验证 + 最终润色

  **What to do**:
  - 测试明暗主题切换在所有页面的效果
  - 修复切换时的视觉不一致：
    - 检查是否有 CSS 规则只更新了 `:root` 而未更新 `[data-theme="dark"]`
    - 检查是否有 Canvas 组件未监听 theme 变化
  - 确保 Canvas 渲染器在主题切换时重新渲染
  - 微调细节：边距、对齐、过渡平滑度
  - 最终视觉审查，确保整体一致性

  **Must NOT do**:
  - 不添加新功能
  - 不修改业务逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 最终润色需要全面检查和精细调整
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 20, 21)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 20, 21

  **References**:

  **Pattern References**:
  - `src/app/AppShell.tsx` — 主题切换逻辑
  - `src/stores/playerStore.ts` — theme 状态

  **WHY Each Reference Matters**:
  - AppShell 管理主题切换 — 需要确保所有子组件响应 theme 变化

  **Acceptance Criteria**:

  - [ ] 明亮→暗色切换在所有页面流畅
  - [ ] 暗色→明亮切换在所有页面流畅
  - [ ] Canvas 组件在主题切换后正确重渲染
  - [ ] `npm run typecheck` → PASS
  - [ ] `npm run test:run` → ALL PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 主题切换全流程验证
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 打开应用，完成开场到地图
      2. 截图明亮主题地图页
      3. 点击主题切换按钮
      4. 等待 500ms
      5. 截图暗色主题地图页
      6. 再次点击切换回明亮
      7. 截图验证
      8. 进入 ch1 章节页
      9. 重复切换主题，截图验证
    Expected Result: 所有页面在两种主题下都正确渲染，切换流畅
    Failure Indicators: 切换后颜色异常或 Canvas 不更新
    Evidence: .sisyphus/evidence/task-22-theme-toggle-map-light.png, task-22-theme-toggle-map-dark.png, task-22-theme-toggle-chapter-light.png, task-22-theme-toggle-chapter-dark.png

  Scenario: 完整通关流程无黑屏
    Tool: Playwright
    Preconditions: 清空 localStorage，开发服务器运行
    Steps:
      1. 打开 http://localhost:5173
      2. 完成完整开场流程
      3. 进入 ch1-s1
      4. 完成 learn → practice → assessment
      5. 在结果页点击"返回章节"
      6. 验证返回章节列表，无黑屏
      7. 截图保存
    Expected Result: 完整流程无黑屏，章节列表正常显示
    Failure Indicators: 任一阶段出现黑屏
    Evidence: .sisyphus/evidence/task-22-full-flow-no-blackscreen.png
  ```

  **Commit**: YES (groups with Tasks 20, 21)
  - Message: `style: final polish and theme toggle verification`
  - Files: various
  - Pre-commit: `npm run test:run && npm run typecheck`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run test:run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test full flow: opening → map → chapter → complete ch1-s1 → verify NO black screen. Test both light and dark themes. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Wave | Commit Message | Files | Pre-commit |
|------|---------------|-------|------------|
| 1 | `fix: resolve black screen after level completion` | AssessView, useQuestionSession, AppRouter, ErrorBoundary | `npm run test:run` |
| 2 | `style: bright game design system foundation` | styles.css, opening.css, map.css, chapter.css, lesson.css, canvasTheme.ts, index.html | `npm run typecheck` |
| 3 | `style: restyle app shell, HUD, and opening flow` | AppShell, HUD/*, Opening/*, DemoAnimation | `npm run typecheck` |
| 4 | `style: restyle map, chapter, and transitions` | WorldMapCanvas, ChapterListOverlay, WorldMapRenderer, SkillPanel, TransitionOverlay, EffectsProvider | `npm run typecheck` |
| 5 | `style: restyle learning, practice, and canvas components` | LearnView, AssessView, practiceVariants/*, modules/*, PianoCanvas, StaffCanvas, MetronomeCanvas | `npm run typecheck` |
| 6 | `style: hardcoded color sweep and final polish` | FollowPractice, ScrollableStaff, TutorialOverlay, particlePresets, appTheme | `npm run test:run && npm run typecheck` |

---

## Success Criteria

### Verification Commands
```bash
npm run test:run      # Expected: ALL tests pass (including new regression tests)
npm run typecheck     # Expected: 0 errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] No hardcoded old dark-theme colors remain
- [ ] Bright theme renders correctly on all pages
- [ ] Dark theme toggle still works
- [ ] ch1-s1 completion → no black screen → returns to skill list
