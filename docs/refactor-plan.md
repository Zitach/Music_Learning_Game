# 乐理入门游戏 — 顶级重构方案

## Context

当前项目有不错的骨架（7章20技能、145道题库、Tone.js音频、Canvas渲染），但离"好玩的游戏"还很远。核心问题：
- **9个组件/模块是死代码**（音程/和弦/节奏/五线谱/演示动画等完全未接入主流程）
- **游戏感薄弱**（无粒子效果、无屏幕震动、反馈只是颜色变化）
- **交互单一**（只有"点击钢琴"和"选择题"两种模式）
- **音频简陋**（基础三角波合成器，无背景音乐，孤立模块用base64 WAV生成音频）
- **缺少游戏系统**（徽章存了但从不发放、无成就、无每日挑战、无连胜、无自适应难度）
- **测试稀疏**（~20条用例）

目标：在不引入额外依赖的前提下，重构为一个**沉浸、好玩、精致、有效**的乐理学习游戏。

---

## Phase 1：基础加固（音频引擎 + HUD统一 + 过渡系统）

### 1A：扩展音频引擎
**目标**：为所有后续阶段提供丰富的音频能力。

- 扩展 `src/lib/audio/Engine.ts`：
  - 添加 `playInterval(root, semitones, duration)` — 音程听辨
  - 添加 `playChord(notes[], duration)` — 和弦听辨
  - 添加 `playProgression(chords[][], bpm)` — 和弦进行
  - 添加 `playAnswerCorrect()` / `playAnswerWrong()` / `playComboMilestone(n)` / `playChapterComplete()`
  - 添加 `Tone.Sampler` 或更多合成器预设以获得更丰富的音色
- 新建 `src/lib/audio/instruments.ts` — 乐器预设（钢琴/吉他/尤克里里）
- 新建 `src/lib/audio/ambient.ts` — 背景环境音管理器（用Tone.Transport循环播放）
- 新建 `src/lib/audio/feedback.ts` — 对/错/升级音效配置

### 1B：统一HUD系统
- 弃用 `components/HUD/HUD.tsx`（旧版，加 @deprecated 标记）
- 将 `ComboCounter` 整合进 `GameHUD`，从 gameStore 读取 combo 值并添加动画
- 删除 `components/modules/NoteNames/TaskPrompt.tsx`（孤立副本）
- 删除 `components/HUD/TaskPrompt.tsx`（仅旧HUD使用）

### 1C：连接 gameStore 到主流程
- 精简 `src/lib/stores/gameStore.ts`：删除未使用的 `phase`/`currentTask`，保留 `combo`/`accuracy`/`totalHits`/`totalMisses`/`score`
- 在 `useQuestionSession` 的 `onAnswer` 回调中调用 `recordHit()`/`recordMiss()`
- `AssessView` 完成后重置 gameStore

### 1D：标准化过渡动画系统
- 新建 `src/lib/ui/transitions.ts` — 过渡类型与时间配置
- 新建 `src/components/Transitions/TransitionOverlay.tsx` — 支持 banner/fade/dissolve/levelUp 多种动画
- 扩展 `appState.ts` 的 `AppAction` 增加 `transitionStyle` 字段
- `AppShell` 使用新 TransitionOverlay

**Phase 1 交付**：音频引擎丰富、HUD统一、gameStore联动、过渡系统模块化。游戏功能不变。

---

## Phase 2：激活死代码（多样化玩法）

### 2A：扩展技能流程模型
- `src/domain/skills/skillTypes.ts` — SkillDefinition 增加 `practiceVariant` 字段：
  - `'choice'` — 选择题（默认）
  - `'piano'` — 钢琴按键
  - `'ear-training'` — 听辨
  - `'rhythm'` — 节奏打击
  - `'staff-reading'` — 五线谱识读
  - `'scale-playing'` — 音阶演奏
- `src/domain/chapters/chapters.ts` — 为每个技能配置 `practiceVariant`：
  - ch1: piano/choice
  - ch2-s4: rhythm（打拍子）
  - ch3-s2: staff-reading（五线谱）
  - ch4-s1: scale-playing
  - ch5: ear-training（音程听辨）
  - ch6: ear-training（和弦听辨）
- 新建练习变体组件 `src/components/SkillPanel/practiceVariants/`：
  - `PianoPractice.tsx` / `ChoicePractice.tsx` — 提取现有逻辑
  - `EarTrainingPractice.tsx` — 包装 IntervalsPractice/ChordsPractice
  - `RhythmPractice.tsx` — 包装 FollowPractice
  - `StaffReadingPractice.tsx` — 包装 StaffPractice
  - `ScalePlayingPractice.tsx` — 包装 ScalesPractice
- `SkillPanel.tsx` 重构为路由器，根据 `practiceVariant` 分发到对应组件

### 2B：用 Tone.js 替换孤立模块的 WAV 生成
- `IntervalsPractice.tsx` — 删除 `generateTone()`/`getFrequency()`，改用 `audioEngine.playInterval()`
- `ChordsPractice.tsx` — 改用 `audioEngine.playChord()`
- `ScalesPractice.tsx` — 改用 `audioEngine.playNote()`
- `ProgressionsPractice.tsx` — 实现存根的 `playProgression()` 方法

### 2C：集成 DemoAnimation 作为开场教程
- 在 opening-title 和 opening-instrument 之间插入全屏 C=do 演示动画
- `AppRouter` 增加 `opening-demo` 屏幕
- `DemoAnimation` 添加跳过按钮

**Phase 2 交付**：7种练习变体全部可用。每个章节有独特的交互方式。零死代码。

---

## Phase 3：游戏感与润色

### 3A：粒子效果和屏幕震动系统
- 新建 `src/lib/effects/ParticleSystem.ts` — 轻量 Canvas 2D 粒子发射器
- 新建 `src/lib/effects/particlePresets.ts` — 预设：correctBurst（绿星）/ wrongShake（红火花）/ comboRise（金尘）/ levelUpCelebration / skillComplete / chapterUnlock
- 新建 `src/lib/effects/ScreenShake.ts` — 屏幕震动管理器
- 新建 `src/components/Effects/ParticleCanvas.tsx` + `EffectsProvider.tsx` — React context 暴露 `triggerParticles(preset, x, y)` 和 `triggerShake(intensity)`
- 在 PracticeView/AssessView 答对/答错/combo/完成时触发对应粒子效果
- 在 WorldMapCanvas 章节解锁时触发 chapterUnlock 粒子

### 3B：动画过渡和微交互
- `styles.css` 新增关键帧：`comboPop` / `shake` / `unlockPulse` / `cardEnter`
- `styles/lesson.css` — 答案卡片的进入/退出过渡，选项按钮的 hover/press 动画
- `ComboCounter` — combo变化时 CSS scale 弹跳 + 金色发光
- `XPBar` — XP增加时填充条末端的脉冲发光
- `SkillPanel` — 技能节点交错的入场动画
- `LearnView` — 课程步骤间的 dissolve 过渡
- `PianoCanvas` — 按键高亮增加 CSS transition

### 3C：音效反馈闭环
- 所有操作连接对应音效：正确/错误/combo里程碑/低血量警告/章节完成
- Combo 音高随数值升高（每5级升一个半音）
- 低血量时播放低频脉冲提示

**Phase 3 交付**：每次互动都有粒子、震动、过渡和声音反馈。游戏在视听层面达到专业水准。

---

## Phase 4：世界地图与成就系统

### 4A：动画世界地图
- 完全重写 `src/lib/canvas/WorldMapRenderer.ts`：
  - 添加 `animate(timestamp)` 和 requestAnimationFrame 循环
  - 路径解锁动画（虚线→实线，按完成顺序）
  - 可解锁章节节点的呼吸/脉动效果
  - 节点内的进度环（已完成技能数/总技能数）
- 新建 `src/lib/canvas/WorldMapAnimator.ts` — 动画状态管理
- `src/lib/canvas/WorldMapData.ts` — 路径改为贝塞尔曲线，增加旅行者角色位置
- `WorldMapCanvas` — 切换到持续渲染循环，添加鼠标悬停跟踪
- 章节解锁时触发粒子 + 音效

### 4B：成就系统
- 新建 `src/domain/achievements/`：
  - `achievementTypes.ts` — 成就类型定义
  - `achievements.ts` — ~30个成就（章节完成/完美三星/combo达人/全部听力/零失误通关等）
  - `achievementChecker.ts` — 纯函数检查新解锁成就
- `progressStore` — badges 替换为 achievements 数组 + unlockAchievement() + achievementLog
- `BadgeCounter` 重新设计为成就入口
- 新建 `AchievementPanel.tsx` — 成就展示面板
- 解锁成就时弹出 toast 通知

**Phase 4 交付**：世界地图变成动态体验，成就系统驱动长期目标和探索欲。

---

## Phase 5：新手引导与辅助系统

### 5A：上下文教程系统
- 新建 `src/features/tutorial/`：
  - `TutorialProvider.tsx` — context，追踪教程完成状态
  - `TutorialOverlay.tsx` — 高亮UI元素 + 解释文字 + 箭头
  - `tutorialSteps.ts` — 各场景的教程步骤定义
- `playerStore` 增加 `completedTutorials: string[]`
- 首次进入地图/首次练习/首次听辨/首次节奏时弹出对应教程

### 5B：工具提示
- 新建 `src/components/UI/Tooltip.tsx` — 通用气泡工具提示
- 关键UI元素添加 tooltip（XP、血量、技能节点、成就）

### 5C：主题切换
- CSS 自定义属性组织为 `:root` 和 `:root[data-theme="light"]`
- `playerStore` 增加 `theme` 字段
- 新建 `ThemeToggle` 组件

**Phase 5 交付**：新玩家有完整引导，所有UI有解释，支持浅色主题。

---

## Phase 6：留存系统

### 6A：每日挑战与连胜
- 新建 `src/features/challenges/`：
  - `dailyChallenges.ts` — 基于日期哈希的确定性选题
  - `DailyChallengePanel.tsx` — 每日挑战面板
- 新建 `src/domain/streaks/streakTracker.ts`
- `playerStore` 增加 `lastPlayedDate` / `currentStreak` / `longestStreak` / `dailyChallengeCompleted`
- 主地图显示每日挑战入口，完成给予额外XP

### 6B：学习数据可视化
- 新建 `src/features/analytics/`：
  - `performanceTracker.ts` — 追踪每次评估的准确率/耗时/薄弱概念
  - `PerformancePanel.tsx` — 雷达图 + 趋势线展示
- 新建 `src/lib/canvas/RadarChart.ts` — Canvas 2D 雷达图
- `progressStore` 增加 `performanceStats` 字段

### 6C：自适应难度
- `getQuestionsForSkill` 升级为 `getAdaptiveQuestions` — 根据历史表现调整题目难度
- 表现好→难度提升，表现差→插入复习题

**Phase 6 交付**：每日回归动力、成长可见、难度自适应。

---

## Phase 7：测试覆盖

### 7A：Store 测试（3个新文件）
- `playerStore.test.ts` / `progressStore.test.ts` / `gameStore.test.ts`

### 7B：组件集成测试（7个新文件）
- `SkillPanel.test.tsx` / `LearnView.test.tsx` / `PracticeView.test.tsx` / `AssessView.test.tsx`
- `GameHUD.test.tsx` / `WorldMapCanvas.test.tsx` / `PianoCanvas.test.tsx`

### 7C：音频与渲染器测试（3个新文件）
- `Engine.test.ts` / `Piano.test.ts` / `WorldMapRenderer.test.ts`

### 7D：端到端测试扩充
- `AppRouter.test.tsx` / `useQuestionSession.test.tsx`

**目标**：从 ~20条 → ~100+条用例，覆盖所有关键路径。

---

## Phase 8：响应式与无障碍

- 移动端断点（768px/480px）适配所有屏幕
- 钢琴/MAP Canvas 在移动端缩放
- 所有交互元素添加 `aria-label` / `role` / `aria-live`
- Canvas 组件添加隐藏的描述文本供屏幕阅读器使用
- 地图添加键盘导航（方向键/Enter）

---

## 执行摘要

| 阶段 | 内容 | 新文件 | 修改文件 | 风险 |
|------|------|--------|----------|------|
| 1 | 基础加固 | ~10 | ~10 | 低 |
| 2 | 激活死代码 | ~8 | ~8 | 中 |
| 3 | 游戏感 | ~5 | ~15 | 低 |
| 4 | 地图+成就 | ~4 | ~6 | 中 |
| 5 | 引导+辅助 | ~8 | ~6 | 低 |
| 6 | 留存系统 | ~8 | ~6 | 中 |
| 7 | 测试 | ~14 | 0 | 低 |
| 8 | 响应式+A11y | 0 | ~15 | 低 |

**总计**：约 57 个新文件，66 个修改文件。每阶段可独立交付、审查、合并。

## 关键架构原则

1. **零新依赖** — Canvas 2D + Tone.js + Zustand + CSS Animations 完成一切
2. **音频单例** — 所有声音通过 AudioEngine 路由，永不使用 base64 WAV
3. **Store 职责分明** — playerStore（持久玩家数据）/ progressStore（技能+成就+统计）/ gameStore（瞬时会话状态）
4. **练习变体模式** — SkillDefinition.practiceVariant 驱动组件路由，SkillPanel 是分发器
5. **向后兼容** — 每阶段完成后游戏完全可运行

## 验证方式

- 每阶段完成后运行 `npm run typecheck && npm run test:run`
- 每阶段在浏览器中完整走一遍游戏流程（音频门→开场→地图→章节→学习→练习→考核→返回）
- Phase 2 重点验证所有 7 种练习变体均可正常完成
- Phase 3 重点验证粒子效果和音频反馈无误
- Phase 4 重点验证地图动画和成就解锁
- Phase 6 重点验证每日挑战和自适应难度
- Phase 7 确保覆盖率 > 60%
