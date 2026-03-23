# Music Theory Quest — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP of Music Theory Quest — an RPG-style music theory learning game with a hand-drawn watercolor world map, opening flow, and Chapter 1 (十二音阶塔) fully playable.

**Architecture:** Canvas 2D for the world map (hand-drawn watercolor nodes + connecting paths); React components for UI overlays (opening screen, HUD, skill panel, learning/practice/assessment modals); Zustand stores for game state (player progress, XP, lives, badges). Tone.js audio engine from existing code powers all listening exercises.

**Tech Stack:** React 19, Vite, TypeScript, Canvas 2D, Zustand, Tone.js, localStorage persistence

---

## File Map

```
src/
├── App.tsx                              # Refactor: route between opening flow ↔ game map
├── data/
│   └── chapters.ts                      # NEW: chapter + skill definitions (JSON-like)
├── stores/
│   ├── playerStore.ts                   # NEW: lives, XP, level, nickname, instrument
│   ├── progressStore.ts                 # NEW: skill unlock/complete state, badges
│   └── gameStore.ts                     # MODIFY: add phase = 'map' | 'skill' | 'assess'
├── components/
│   ├── Canvas/
│   │   ├── WorldMapCanvas.tsx           # NEW: full-screen map renderer
│   │   └── PianoCanvas.tsx              # EXISTING: minor refactor for new use
│   ├── Opening/
│   │   ├── TitleScreen.tsx              # NEW: logo + "开始冒险" button
│   │   ├── InstrumentPicker.tsx         # NEW: choose instrument icon
│   │   └── NicknameInput.tsx            # NEW: text input + confirm
│   ├── Map/
│   │   └── PlayerIcon.tsx               # NEW: animated player dot/ping on map
│   ├── HUD/
│   │   ├── HUD.tsx                      # MODIFY: add XP bar, badge counter
│   │   ├── XPBar.tsx                    # NEW: XP progress bar + level display
│   │   └── BadgeCounter.tsx             # NEW: badge count display
│   ├── SkillPanel/
│   │   ├── SkillPanel.tsx               # NEW: skill list within a chapter node
│   │   ├── LearnView.tsx                # NEW: animation + interactive demo
│   │   ├── PracticeView.tsx             # NEW: free practice with feedback
│   │   └── AssessView.tsx               # NEW: 3-question quiz + star rating
│   └── modules/
│       └── NoteNames/                   # EXISTING: integrate into SkillPanel flow
└── lib/
    ├── canvas/
    │   ├── WorldMapRenderer.ts           # NEW: draws watercolor map nodes + paths
    │   └── WorldMapData.ts              # NEW: node positions, colors, connections
    ├── game/
    │   ├── phaseRouter.tsx              # NEW: decides which view to show based on phase
    │   └── skillFlow.ts                 # NEW: learn → practice → assess state machine
    └── audio/
        └── Engine.ts                    # EXISTING: extend with chord/interval samples
```

---

## Phase 1: Foundation — Data + Stores

### Task 1: Define chapter and skill data

**Files:**
- Create: `src/data/chapters.ts`

```typescript
// src/data/chapters.ts

export type SkillId = string

export interface Skill {
  id: SkillId
  title: string           // e.g. "认识音名"
  description: string     // one-line description
  chapterId: string
  // phases: which sub-phases exist for this skill
  practiceCount: number   // how many practice rounds before assessment unlocks
  assessmentCount: number // questions in assessment (always 3 for MVP)
  starsToPass: number     // stars needed to "pass" (1-3)
}

export interface Chapter {
  id: string
  title: string           // e.g. "十二音阶塔"
  emoji: string           // e.g. "🌱"
  color: string           // watercolor hex e.g. "#8faa8a"
  position: { x: number; y: number }  // normalized 0-1 position on map
  skills: Skill[]
}

export const CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    title: "十二音阶塔",
    emoji: "🌱",
    color: "#8faa8a",
    position: { x: 0.5, y: 0.88 },
    skills: [
      {
        id: "ch1-s1",
        title: "认识音名",
        description: "认识 C D E F G A B",
        chapterId: "ch1",
        practiceCount: 5,
        assessmentCount: 3,
        starsToPass: 1,
      },
      {
        id: "ch1-s2",
        title: "全音与半音",
        description: "理解音高之间的距离",
        chapterId: "ch1",
        practiceCount: 5,
        assessmentCount: 3,
        starsToPass: 1,
      },
      {
        id: "ch1-s3",
        title: "升降号与黑键",
        description: "# ♭ 与十二平均律",
        chapterId: "ch1",
        practiceCount: 5,
        assessmentCount: 3,
        starsToPass: 1,
      },
    ],
  },
  {
    id: "ch2",
    title: "拍子河流",
    emoji: "🥁",
    color: "#7a9aaa",
    position: { x: 0.5, y: 0.70 },
    skills: [
      { id: "ch2-s1", title: "音符时值", description: "四分/二分/全音符", chapterId: "ch2", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch2-s2", title: "休止符", description: "无声的节奏", chapterId: "ch2", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch2-s3", title: "常见拍号", description: "2/4 3/4 4/4 6/8", chapterId: "ch2", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch2-s4", title: "打拍子", description: "跟打节拍练习", chapterId: "ch2", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
    ],
  },
  {
    id: "ch3",
    title: "五线谱星空",
    emoji: "📖",
    color: "#6a7aaa",
    position: { x: 0.5, y: 0.54 },
    skills: [
      { id: "ch3-s1", title: "简谱基础", description: "数字简谱入门", chapterId: "ch3", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch3-s2", title: "五线谱入门", description: "高音低音谱号", chapterId: "ch3", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
    ],
  },
  {
    id: "ch4",
    title: "调式山脉",
    emoji: "🏔️",
    color: "#8aaa7a",
    position: { x: 0.5, y: 0.38 },
    skills: [
      { id: "ch4-s1", title: "大调音阶", description: "全全半全全全半", chapterId: "ch4", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch4-s2", title: "自然小调", description: "关系大小调", chapterId: "ch4", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch4-s3", title: "常用调号", description: "G F bB 等", chapterId: "ch4", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
    ],
  },
  {
    id: "ch5",
    title: "音程回廊",
    emoji: "🌌",
    color: "#5a7aaa",
    position: { x: 0.28, y: 0.24 },
    skills: [
      { id: "ch5-s1", title: "二度到八度", description: "音程的距离", chapterId: "ch5", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch5-s2", title: "协和与不协和", description: "音程的色彩", chapterId: "ch5", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch5-s3", title: "音程转位", description: "转位的规律", chapterId: "ch5", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
    ],
  },
  {
    id: "ch6",
    title: "和弦圣殿",
    emoji: "🏛️",
    color: "#8a6aaa",
    position: { x: 0.72, y: 0.24 },
    skills: [
      { id: "ch6-s1", title: "三和弦", description: "大三 小三 增三 减三", chapterId: "ch6", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch6-s2", title: "七和弦", description: "属七 大七 小七 半减七", chapterId: "ch6", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
      { id: "ch6-s3", title: "和弦标记", description: "C Am Fmaj7 G7", chapterId: "ch6", practiceCount: 5, assessmentCount: 3, starsToPass: 1 },
    ],
  },
  {
    id: "boss",
    title: "终章",
    emoji: "👑",
    color: "#aa5a5a",
    position: { x: 0.5, y: 0.08 },
    skills: [
      { id: "boss-final", title: "乐理大师", description: "综合听音考核", chapterId: "boss", practiceCount: 0, assessmentCount: 1, starsToPass: 1 },
    ],
  },
]

export const SKILL_MAP = CHAPTERS.flatMap(c => c.skills).reduce((acc, s) => {
  acc[s.id] = s
  return acc
}, {} as Record<SkillId, Skill>)

export function getNextSkill(currentSkillId: string): Skill | null {
  const allSkills = CHAPTERS.flatMap(c => c.skills)
  const idx = allSkills.findIndex(s => s.id === currentSkillId)
  return idx >= 0 && idx < allSkills.length - 1 ? allSkills[idx + 1] : null
}
```

- [ ] **Step 1: Create `src/data/chapters.ts`** with the full chapter + skill definitions above.

- [ ] **Step 2: Commit**

```bash
git add src/data/chapters.ts
git commit -m "feat: add chapter and skill data definitions"
```

---

### Task 2: Player store (lives, XP, level, nickname, instrument)

**Files:**
- Create: `src/stores/playerStore.ts`

```typescript
// src/stores/playerStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Instrument = 'piano' | 'guitar' | 'ukulele' | null

export interface PlayerState {
  nickname: string
  instrument: Instrument
  lives: number
  maxLives: number
  xp: number
  level: number
  hasCompletedOpening: boolean
}

interface PlayerActions {
  setNickname: (name: string) => void
  setInstrument: (inst: Instrument) => void
  completeOpening: () => void
  addXP: (amount: number) => void
  loseLife: () => void
  healLife: () => void
  reset: () => void
}

const XP_PER_LEVEL = 100

const initialState: PlayerState = {
  nickname: '',
  instrument: null,
  lives: 5,
  maxLives: 5,
  xp: 0,
  level: 1,
  hasCompletedOpening: false,
}

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setNickname: (name) => set({ nickname: name }),
      setInstrument: (inst) => set({ instrument: inst }),
      completeOpening: () => set({ hasCompletedOpening: true }),

      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount
          const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
          return { xp: newXP, level: newLevel }
        }),

      loseLife: () =>
        set((state) => ({
          lives: Math.max(0, state.lives - 1),
          combo: 0,
        })),

      healLife: () =>
        set((state) => ({
          lives: Math.min(state.maxLives, state.lives + 1),
        })),

      reset: () => set({ ...initialState, hasCompletedOpening: true }),
    }),
    {
      name: 'music-quest-player',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

- [ ] **Step 1: Create `src/stores/playerStore.ts`**

- [ ] **Step 2: Commit**

```bash
git add src/stores/playerStore.ts
git commit -m "feat: add player store (lives, XP, level, nickname, instrument)"
```

---

### Task 3: Progress store (skill unlock, completion, badges)

**Files:**
- Create: `src/stores/progressStore.ts`

```typescript
// src/stores/progressStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CHAPTERS } from '../data/chapters'

export type SkillStatus = 'locked' | 'available' | 'completed'

export interface SkillProgress {
  status: SkillStatus
  stars: number       // 0-3
  practiceCount: number
  lastPlayed: string | null
}

export interface ProgressState {
  skillProgress: Record<string, SkillProgress>
  badges: string[]    // skill IDs that earned a badge
}

interface ProgressActions {
  unlockSkill: (skillId: string) => void
  completeSkill: (skillId: string, stars: number) => void
  incrementPractice: (skillId: string) => void
  isChapterUnlocked: (chapterId: string) => boolean
  isSkillUnlocked: (skillId: string) => boolean
  reset: () => void
}

function buildInitialProgress(): Record<string, SkillProgress> {
  const map: Record<string, SkillProgress> = {}
  for (const chapter of CHAPTERS) {
    for (let i = 0; i < chapter.skills.length; i++) {
      const skill = chapter.skills[i]
      map[skill.id] = {
        status: i === 0 && chapter.id === CHAPTERS[0].id ? 'available' : 'locked',
        stars: 0,
        practiceCount: 0,
        lastPlayed: null,
      }
    }
  }
  return map
}

const initialState: ProgressState = {
  skillProgress: buildInitialProgress(),
  badges: [],
}

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      unlockSkill: (skillId) =>
        set((state) => ({
          skillProgress: {
            ...state.skillProgress,
            [skillId]: {
              ...state.skillProgress[skillId],
              status: state.skillProgress[skillId].status === 'locked' ? 'available' : state.skillProgress[skillId].status,
            },
          },
        })),

      completeSkill: (skillId, stars) =>
        set((state) => {
          const current = state.skillProgress[skillId]
          const newStars = Math.max(current.stars, stars)
          const badges = state.badges.includes(skillId) ? state.badges : [...state.badges, skillId]
          return {
            skillProgress: { ...state.skillProgress, [skillId]: { ...current, status: 'completed', stars: newStars } },
            badges,
          }
        }),

      incrementPractice: (skillId) =>
        set((state) => ({
          skillProgress: {
            ...state.skillProgress,
            [skillId]: {
              ...state.skillProgress[skillId],
              practiceCount: (state.skillProgress[skillId]?.practiceCount ?? 0) + 1,
              lastPlayed: new Date().toISOString(),
            },
          },
        })),

      isChapterUnlocked: (chapterId) => {
        const chapter = CHAPTERS.find(c => c.id === chapterId)
        if (!chapter) return false
        if (chapter.id === CHAPTERS[0].id) return true
        // unlocked if previous chapter's last skill is completed
        const prevChapter = CHAPTERS[CHAPTERS.findIndex(c => c.id === chapterId) - 1]
        if (!prevChapter) return false
        const lastSkill = prevChapter.skills[prevChapter.skills.length - 1]
        return get().skillProgress[lastSkill.id]?.status === 'completed'
      },

      isSkillUnlocked: (skillId) => {
        const state = get()
        const skill = CHAPTERS.flatMap(c => c.skills).find(s => s.id === skillId)
        if (!skill) return false
        const chapter = CHAPTERS.find(c => c.id === skill.chapterId)
        const skillIndex = chapter!.skills.findIndex(s => s.id === skillId)
        if (skillIndex === 0) return true
        const prevSkill = chapter!.skills[skillIndex - 1]
        return state.skillProgress[prevSkill.id]?.status === 'completed'
      },

      reset: () =>
        set({
          skillProgress: buildInitialProgress(),
          badges: [],
        }),
    }),
    {
      name: 'music-quest-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

- [ ] **Step 1: Create `src/stores/progressStore.ts`**

- [ ] **Step 2: Commit**

```bash
git add src/stores/progressStore.ts
git commit -m "feat: add progress store (skill unlock, completion, badges)"
```

---

## Phase 2: World Map

### Task 4: World map Canvas renderer (watercolor nodes + tree paths)

**Files:**
- Create: `src/lib/canvas/WorldMapData.ts`
- Create: `src/lib/canvas/WorldMapRenderer.ts`
- Create: `src/components/Canvas/WorldMapCanvas.tsx`

```typescript
// src/lib/canvas/WorldMapData.ts
import { CHAPTERS } from '../../data/chapters'

// Connection edges: [fromChapterId, toChapterId]
export const MAP_EDGES: [string, string][] = [
  [CHAPTERS[0].id, CHAPTERS[1].id],   // ch1 → ch2
  [CHAPTERS[1].id, CHAPTERS[2].id],   // ch2 → ch3
  [CHAPTERS[2].id, CHAPTERS[3].id],   // ch3 → ch4
  [CHAPTERS[3].id, CHAPTERS[4].id],  // ch4 → ch5
  [CHAPTERS[3].id, CHAPTERS[5].id],  // ch4 → ch6 (branch)
  [CHAPTERS[4].id, CHAPTERS[6].id],  // ch5 → boss
  [CHAPTERS[5].id, CHAPTERS[6].id], // ch6 → boss
]

export const MAP_WIDTH = 900
export const MAP_HEIGHT = 700

export function chapterPos(chapterId: string): { x: number; y: number } {
  const ch = CHAPTERS.find(c => c.id === chapterId)!
  return {
    x: ch.position.x * MAP_WIDTH,
    y: ch.position.y * MAP_HEIGHT,
  }
}
```

```typescript
// src/lib/canvas/WorldMapRenderer.ts
import { CHAPTERS } from '../../data/chapters'
import { MAP_EDGES, chapterPos } from './WorldMapData'

const NODE_RADIUS = 38

export class WorldMapRenderer {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private completedChapters: Set<string>
  private availableChapterId: string | null

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx
    this.width = width
    this.height = height
    this.completedChapters = new Set()
    this.availableChapterId = null
  }

  setProgress(completedChapters: Set<string>, availableChapterId: string) {
    this.completedChapters = completedChapters
    this.availableChapterId = availableChapterId
  }

  private scaleX(norm: number) { return norm * this.width }
  private scaleY(norm: number) { return norm * this.height }

  draw() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)

    // Draw connections first
    for (const [from, to] of MAP_EDGES) {
      this.drawEdge(from, to)
    }

    // Draw chapter nodes
    for (const chapter of CHAPTERS) {
      const completed = this.completedChapters.has(chapter.id)
      const available = chapter.id === this.availableChapterId
      this.drawNode(chapter, completed, available)
    }
  }

  private drawEdge(fromId: string, toId: string) {
    const ctx = this.ctx
    const from = CHAPTERS.find(c => c.id === fromId)!
    const to = CHAPTERS.find(c => c.id === toId)!
    const x1 = this.scaleX(from.position.x)
    const y1 = this.scaleY(from.position.y)
    const x2 = this.scaleX(to.position.x)
    const y2 = this.scaleY(to.position.y)

    const fromDone = this.completedChapters.has(fromId)
    const toAvail = toId === this.availableChapterId
    const toDone = this.completedChapters.has(toId)

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x1, y1 + NODE_RADIUS)
    ctx.lineTo(x2, y2 - NODE_RADIUS)
    ctx.strokeStyle = fromDone ? '#a0c0a0' : '#c8c0b0'
    ctx.lineWidth = fromDone ? 3 : 2
    ctx.setLineDash(fromDone ? [] : [6, 4])
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.restore()
  }

  private drawNode(chapter: typeof CHAPTERS[0], completed: boolean, available: boolean) {
    const ctx = this.ctx
    const cx = this.scaleX(chapter.position.x)
    const cy = this.scaleY(chapter.position.y)

    ctx.save()

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 4

    // Node background (watercolor circle)
    const baseColor = chapter.color
    ctx.beginPath()
    ctx.arc(cx, cy, NODE_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = completed ? baseColor : available ? baseColor : '#d8d0c8'
    ctx.globalAlpha = completed ? 0.85 : available ? 0.65 : 0.35
    ctx.fill()

    ctx.globalAlpha = 1
    ctx.shadowColor = 'transparent'

    // Border
    ctx.strokeStyle = completed ? '#ffffff88' : available ? baseColor : '#aaa8a0'
    ctx.lineWidth = completed ? 3 : available ? 2.5 : 1.5
    ctx.stroke()

    // Emoji
    ctx.font = '26px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(chapter.emoji, cx, cy - 6)

    // Chapter name below node
    ctx.font = '11px "Noto Sans SC", sans-serif'
    ctx.fillStyle = completed ? '#3a4a3a' : available ? '#5a5a4a' : '#9a9a8a'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(chapter.title, cx, cy + NODE_RADIUS + 16)

    ctx.restore()
  }

  getChapterAtPosition(x: number, y: number): string | null {
    for (const chapter of CHAPTERS) {
      const cx = this.scaleX(chapter.position.x)
      const cy = this.scaleY(chapter.position.y)
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= (NODE_RADIUS + 10) ** 2) {
        return chapter.id
      }
    }
    return null
  }
}
```

```tsx
// src/components/Canvas/WorldMapCanvas.tsx
import { useEffect, useRef, useCallback, useState } from 'react'
import { WorldMapRenderer } from '../../lib/canvas/WorldMapRenderer'
import { useProgressStore } from '../../stores/progressStore'
import { CHAPTERS } from '../../data/chapters'

export interface WorldMapCanvasProps {
  onChapterClick: (chapterId: string) => void
}

export function WorldMapCanvas({ onChapterClick }: WorldMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<WorldMapRenderer | null>(null)
  const skillProgress = useProgressStore(s => s.skillProgress)

  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null)

  const completedChapters = new Set(
    CHAPTERS.filter(c => c.skills.every(s => skillProgress[s.id]?.status === 'completed')).map(c => c.id)
  )

  // First non-completed chapter is "available"
  const availableChapterId = CHAPTERS.find(c => !completedChapters.has(c.id))?.id ?? null

  // Map dimensions
  const mapW = 900
  const mapH = 700

  // Scale to fit viewport
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / mapW
      const scaleY = window.innerHeight / mapH
      setScale(Math.min(scaleX, scaleY, 1.2))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const dpr = window.devicePixelRatio || 1
    canvasRef.current.width = mapW * dpr
    canvasRef.current.height = mapH * dpr
    canvasRef.current.style.width = `${mapW * scale}px`
    canvasRef.current.style.height = `${mapH * scale}px`

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const renderer = new WorldMapRenderer(ctx, mapW, mapH)
    renderer.setProgress(completedChapters, availableChapterId ?? '')
    renderer.draw()
    rendererRef.current = renderer
  }, [skillProgress, scale, completedChapters, availableChapterId])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !rendererRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const x = (e.clientX - rect.left) / scale * dpr
    const y = (e.clientY - rect.top) / scale * dpr
    const chapterId = rendererRef.current.getChapterAtPosition(x, y)
    if (chapterId) {
      setCurrentChapterId(chapterId)
      onChapterClick(chapterId)
    }
  }, [scale, onChapterClick])

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        display: 'block',
        cursor: 'pointer',
        borderRadius: '12px',
        position: 'relative',
        zIndex: 10,
      }}
    />
  )
}
```

- [ ] **Step 1: Create `src/lib/canvas/WorldMapData.ts`**

- [ ] **Step 2: Commit**

```bash
git add src/lib/canvas/WorldMapData.ts
git commit -m "feat: add world map edge and position data"
```

- [ ] **Step 3: Create `src/lib/canvas/WorldMapRenderer.ts`**

- [ ] **Step 4: Commit**

```bash
git add src/lib/canvas/WorldMapRenderer.ts
git commit -m "feat: add world map canvas renderer with watercolor nodes"
```

- [ ] **Step 5: Create `src/components/Canvas/WorldMapCanvas.tsx`**

- [ ] **Step 6: Commit**

```bash
git add src/components/Canvas/WorldMapCanvas.tsx
git commit -m "feat: add WorldMapCanvas React component"
```

---

### Task 5: Opening flow (TitleScreen → InstrumentPicker → NicknameInput)

**Files:**
- Create: `src/components/Opening/TitleScreen.tsx`
- Create: `src/components/Opening/InstrumentPicker.tsx`
- Create: `src/components/Opening/NicknameInput.tsx`

```tsx
// src/components/Opening/TitleScreen.tsx
import { usePlayerStore } from '../../stores/playerStore'

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        width: '100vw', height: '100vh',
        background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 50%, #ddd5c5 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
      }}
    >
      {/* Decorative music staff lines */}
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0,
          top: `${35 + i * 7}%`,
          height: '1.5px', background: '#c8b89a',
          opacity: 0.5,
        }} />
      ))}

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎵</div>
        <h1 style={{
          fontSize: '48px', fontWeight: 700,
          color: '#4a3a2a', margin: 0, letterSpacing: '2px',
          textShadow: '2px 2px 0 rgba(0,0,0,0.08)',
        }}>
          Music Theory Quest
        </h1>
        <p style={{
          fontSize: '18px', color: '#7a6a5a',
          marginTop: '12px', fontStyle: 'italic',
        }}>
          从零开始的乐理冒险
        </p>
      </div>

      <button
        onClick={onStart}
        style={{
          marginTop: '64px',
          padding: '16px 48px',
          fontSize: '20px',
          fontWeight: 600,
          background: '#8faa8a',
          color: '#fff',
          border: 'none',
          borderRadius: '32px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
          letterSpacing: '1px',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
      >
        开始冒险 →
      </button>
    </div>
  )
}
```

```tsx
// src/components/Opening/InstrumentPicker.tsx
import { usePlayerStore, Instrument } from '../../stores/playerStore'

const INSTRUMENTS: { id: Instrument; emoji: string; label: string }[] = [
  { id: 'piano', emoji: '🎹', label: '钢琴' },
  { id: 'guitar', emoji: '🎸', label: '吉他' },
  { id: 'ukulele', emoji: '🪕', label: '尤克里里' },
]

export function InstrumentPicker({ onNext }: { onNext: () => void }) {
  const { instrument, setInstrument } = usePlayerStore()

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
    }}>
      <h2 style={{ fontSize: '28px', color: '#4a3a2a', margin: 0, marginBottom: '8px' }}>
        选择你的乐器背景
      </h2>
      <p style={{ fontSize: '14px', color: '#8a7a6a', marginBottom: '40px', fontStyle: 'italic' }}>
        不影响游戏内容，只改变你的冒险形象
      </p>

      <div style={{ display: 'flex', gap: '24px' }}>
        {INSTRUMENTS.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => setInstrument(id)}
            style={{
              width: '120px', height: '120px',
              borderRadius: '50%',
              border: instrument === id ? '4px solid #8faa8a' : '3px solid #d8d0c0',
              background: instrument === id ? '#d0e0d0' : '#f8f4e8',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              boxShadow: instrument === id ? '0 4px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: '40px' }}>{emoji}</span>
            <span style={{ fontSize: '13px', color: '#5a4a3a' }}>{label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={instrument ? onNext : undefined}
        disabled={!instrument}
        onClick={!instrument ? undefined : onNext}
        style={{
          marginTop: '48px',
          padding: '14px 40px',
          fontSize: '18px',
          background: instrument ? '#8faa8a' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '28px',
          cursor: instrument ? 'pointer' : 'not-allowed',
          opacity: instrument ? 1 : 0.6,
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        下一步 →
      </button>
    </div>
  )
}
```

```tsx
// src/components/Opening/NicknameInput.tsx
import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'

export function NicknameInput({ onComplete }: { onComplete: () => void }) {
  const { nickname, setNickname, setNickname: setNick, completeOpening } = usePlayerStore()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!input.trim()) {
      setError('请输入你的名字')
      return
    }
    if (input.trim().length > 12) {
      setError('名字太长啦（最多12字）')
      return
    }
    setNickname(input.trim())
    completeOpening()
    onComplete()
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
    }}>
      <h2 style={{ fontSize: '28px', color: '#4a3a2a', margin: 0, marginBottom: '8px' }}>
        你叫什么名字？
      </h2>
      <p style={{ fontSize: '14px', color: '#8a7a6a', marginBottom: '32px', fontStyle: 'italic' }}>
        起个昵称，开始你的乐理冒险
      </p>

      <input
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value); setError('') }}
        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
        placeholder="输入昵称..."
        maxLength={12}
        autoFocus
        style={{
          width: '280px',
          padding: '14px 20px',
          fontSize: '18px',
          border: error ? '2px solid #e55' : '2px solid #c8b89a',
          borderRadius: '12px',
          outline: 'none',
          background: '#fff',
          fontFamily: 'inherit',
          textAlign: 'center',
          color: '#4a3a2a',
        }}
      />
      {error && <p style={{ color: '#c44', fontSize: '13px', marginTop: '8px' }}>{error}</p>}

      <button
        onClick={handleConfirm}
        style={{
          marginTop: '32px',
          padding: '14px 40px',
          fontSize: '18px',
          background: '#8faa8a',
          color: '#fff',
          border: 'none',
          borderRadius: '28px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}
      >
        进入冒险世界 🎵
      </button>
    </div>
  )
}
```

- [ ] **Step 1: Create `src/components/Opening/TitleScreen.tsx`**
- [ ] **Step 2: Create `src/components/Opening/InstrumentPicker.tsx`**
- [ ] **Step 3: Create `src/components/Opening/NicknameInput.tsx`**

- [ ] **Step 4: Commit**

```bash
git add src/components/Opening/
git commit -m "feat: add opening flow screens (title, instrument picker, nickname)"
```

---

## Phase 3: App Router + HUD

### Task 6: Phase router + HUD refactor

**Files:**
- Modify: `src/App.tsx` — route between opening/game map/skill panel
- Create: `src/components/HUD/XPBar.tsx`
- Create: `src/components/HUD/BadgeCounter.tsx`
- Modify: `src/components/HUD/HUD.tsx` — integrate XP bar + badge counter

```tsx
// src/components/HUD/XPBar.tsx
import { usePlayerStore } from '../../stores/playerStore'

const XP_PER_LEVEL = 100

export function XPBar() {
  const xp = usePlayerStore(s => s.xp)
  const level = usePlayerStore(s => s.level)
  const progress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '20px',
      padding: '6px 12px',
    }}>
      <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>
        LV.{level}
      </span>
      <div style={{ width: '80px', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: '4px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}
```

```tsx
// src/components/HUD/BadgeCounter.tsx
import { useProgressStore } from '../../stores/progressStore'
import { CHAPTERS } from '../../data/chapters'

export function BadgeCounter() {
  const badges = useProgressStore(s => s.badges)
  const totalSkills = CHAPTERS.flatMap(c => c.skills).length

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '20px',
      padding: '6px 12px',
    }}>
      <span style={{ fontSize: '14px' }}>🏅</span>
      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
        {badges.length}/{totalSkills}
      </span>
    </div>
  )
}
```

```tsx
// src/components/HUD/HUD.tsx  (augmented)
import { LivesDisplay } from './LivesDisplay'
import { XPBar } from './XPBar'
import { BadgeCounter } from './BadgeCounter'

export function HUD({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{
      position: 'fixed', top: '16px', left: '16px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <XPBar />
        <BadgeCounter />
        <LivesDisplay />
      </div>
    </div>
  )
}
```

```tsx
// src/App.tsx — full refactor
import { useEffect, useState, useCallback } from 'react'
import { TitleScreen } from './components/Opening/TitleScreen'
import { InstrumentPicker } from './components/Opening/InstrumentPicker'
import { NicknameInput } from './components/Opening/NicknameInput'
import { WorldMapCanvas } from './components/Canvas/WorldMapCanvas'
import { HUD } from './components/HUD/HUD'
import { SkillPanel } from './components/SkillPanel/SkillPanel'
import { usePlayerStore } from './stores/playerStore'
import { useProgressStore } from './stores/progressStore'
import { useGameStore } from './stores/gameStore'
import { audioEngine } from './lib/audio/Engine'

type AppPhase = 'opening-title' | 'opening-instrument' | 'opening-nickname' | 'map' | 'chapter'

export default function App() {
  const hasCompletedOpening = usePlayerStore(s => s.hasCompletedOpening)
  const nickname = usePlayerStore(s => s.nickname)
  const [phase, setPhase] = useState<AppPhase>(
    hasCompletedOpening ? 'map' : 'opening-title'
  )
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [audioReady, setAudioReady] = useState(false)
  const [needsInteraction, setNeedsInteraction] = useState(!hasCompletedOpening)

  // Init audio
  useEffect(() => {
    const init = async () => {
      try {
        await audioEngine.load()
        setAudioReady(true)
      } catch (e) {
        console.error('Audio init failed:', e)
      }
    }
    init()
  }, [])

  const handleTitleStart = useCallback(() => {
    setPhase('opening-instrument')
  }, [])

  const handleInstrumentNext = useCallback(() => {
    setPhase('opening-nickname')
  }, [])

  const handleNicknameComplete = useCallback(() => {
    setPhase('map')
    setNeedsInteraction(false)
  }, [])

  const handleChapterClick = useCallback((chapterId: string) => {
    const isUnlocked = useProgressStore.getState().isChapterUnlocked(chapterId)
    if (!isUnlocked) return
    setSelectedChapterId(chapterId)
    setPhase('chapter')
  }, [])

  const handleBackToMap = useCallback(() => {
    setSelectedChapterId(null)
    setPhase('map')
  }, [])

  // Opening: needs audio interaction gate
  if (needsInteraction) {
    return (
      <div onClick={() => setNeedsInteraction(false)} style={{
        width: '100vw', height: '100vh', overflow: 'hidden',
        background: 'linear-gradient(160deg, #f0ebe0, #e8e0d0)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        fontFamily: '"Noto Sans SC", sans-serif',
      }}>
        <p style={{ color: '#7a6a5a', fontSize: '14px', fontStyle: 'italic' }}>
          点击任意位置开启音乐之旅 🎵
        </p>
      </div>
    )
  }

  if (phase === 'opening-title') {
    return <TitleScreen onStart={handleTitleStart} />
  }

  if (phase === 'opening-instrument') {
    return <InstrumentPicker onNext={handleInstrumentNext} />
  }

  if (phase === 'opening-nickname') {
    return <NicknameInput onComplete={handleNicknameComplete} />
  }

  if (phase === 'chapter' && selectedChapterId) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <HUD />
        <SkillPanel chapterId={selectedChapterId} onBack={handleBackToMap} />
      </div>
    )
  }

  // map
  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 50%, #ddd5c5 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
    }}>
      {/* Welcome banner */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000 }}>
        <HUD />
      </div>

      {/* Chapter name above map */}
      <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <p style={{ color: '#5a4a3a', fontSize: '15px', fontStyle: 'italic', margin: 0 }}>
          {nickname ? `欢迎，${nickname}` : 'Music Theory Quest'}
        </p>
      </div>

      <WorldMapCanvas onChapterClick={handleChapterClick} />

      {/* Bottom hint */}
      <p style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: '#9a8a7a', fontSize: '12px', fontStyle: 'italic' }}>
        点击地点开始学习
      </p>
    </div>
  )
}
```

- [ ] **Step 1: Create `src/components/HUD/XPBar.tsx`**
- [ ] **Step 2: Create `src/components/HUD/BadgeCounter.tsx`**
- [ ] **Step 3: Modify `src/components/HUD/HUD.tsx`** to include XPBar + BadgeCounter
- [ ] **Step 4: Create `src/components/SkillPanel/SkillPanel.tsx`** (stub with chapter + skill list)
- [ ] **Step 5: Full refactor of `src/App.tsx`** with all phases wired

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/HUD/
git commit -m "feat: refactor App router with opening flow and map phase"
```

---

## Phase 4: Skill Panel + Learn/Practice/Assess Flow

### Task 7: SkillPanel component with skill list

**Files:**
- Create: `src/components/SkillPanel/SkillPanel.tsx`

```tsx
// src/components/SkillPanel/SkillPanel.tsx
import { useState } from 'react'
import { CHAPTERS } from '../../data/chapters'
import { useProgressStore } from '../../stores/progressStore'
import { usePlayerStore } from '../../stores/playerStore'
import { LearnView } from './LearnView'
import { PracticeView } from './PracticeView'
import { AssessView } from './AssessView'

type SkillPhase = 'list' | 'learn' | 'practice' | 'assess'

interface SkillPanelProps {
  chapterId: string
  onBack: () => void
}

export function SkillPanel({ chapterId, onBack }: SkillPanelProps) {
  const chapter = CHAPTERS.find(c => c.id === chapterId)!
  const skillProgress = useProgressStore(s => s.skillProgress)
  const isSkillUnlocked = useProgressStore(s => s.isSkillUnlocked)

  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null)
  const [phase, setPhase] = useState<SkillPhase>('list')
  const [skillStars, setSkillStars] = useState(0)

  const handleSkillClick = (skillId: string) => {
    if (!isSkillUnlocked(skillId)) return
    setCurrentSkillId(skillId)
    setPhase('learn')
  }

  const handleLearnComplete = () => setPhase('practice')
  const handlePracticeComplete = () => setPhase('assess')
  const handleAssessComplete = (stars: number) => {
    setSkillStars(stars)
    setPhase('list')
    setCurrentSkillId(null)
  }

  if (phase !== 'list' && currentSkillId) {
    const skill = chapter.skills.find(s => s.id === currentSkillId)!
    if (phase === 'learn') return <LearnView skill={skill} onComplete={handleLearnComplete} />
    if (phase === 'practice') return <PracticeView skill={skill} onComplete={handlePracticeComplete} />
    if (phase === 'assess') return <AssessView skill={skill} onComplete={handleAssessComplete} />
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 100%)',
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: '16px',
        borderBottom: '1px solid #d8d0c0',
        background: 'rgba(255,255,255,0.5)',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '20px', padding: '4px', color: '#5a4a3a',
        }}>←</button>
        <span style={{ fontSize: '28px' }}>{chapter.emoji}</span>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#4a3a2a' }}>{chapter.title}</h2>
      </div>

      {/* Skill list — milestone path */}
      <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ color: '#8a7a6a', fontSize: '14px', fontStyle: 'italic', marginBottom: '32px' }}>
          选择一个技能开始学习
        </p>

        {/* Vertical milestone path */}
        <div style={{ position: 'relative', width: '320px' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: '28px', top: '20px', bottom: '20px',
            width: '2px', background: '#c8b89a',
          }} />

          {chapter.skills.map((skill, i) => {
            const progress = skillProgress[skill.id]
            const unlocked = isSkillUnlocked(skill.id)
            const completed = progress?.status === 'completed'
            const stars = progress?.stars ?? 0

            return (
              <div key={skill.id} style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                gap: '16px', marginBottom: i < chapter.skills.length - 1 ? '24px' : 0,
              }}>
                {/* Node */}
                <div style={{
                  width: '58px', height: '58px', borderRadius: '50%',
                  background: completed ? chapter.color : unlocked ? '#d0e0d0' : '#e8e0d8',
                  border: completed ? `3px solid ${chapter.color}` : unlocked ? `2px solid ${chapter.color}` : '2px solid #c8b89a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.5,
                  boxShadow: completed ? `0 4px 12px ${chapter.color}44` : 'none',
                  zIndex: 1,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }} onClick={() => handleSkillClick(skill.id)}>
                  {completed ? '✓' : unlocked ? skill.title[0] : '🔒'}
                </div>

                {/* Label */}
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: unlocked ? '#4a3a2a' : '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {skill.title}
                    {completed && <span style={{ fontSize: '12px' }}>{'★'.repeat(stars)}</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a7a6a', marginTop: '2px' }}>{skill.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 1: Create `src/components/SkillPanel/SkillPanel.tsx`**

- [ ] **Step 2: Commit**

```bash
git add src/components/SkillPanel/SkillPanel.tsx
git commit -m "feat: add SkillPanel with milestone path UI"
```

---

### Task 8: LearnView — animation + interactive demo (Chapter 1 skills)

**Files:**
- Create: `src/components/SkillPanel/LearnView.tsx`

```tsx
// src/components/SkillPanel/LearnView.tsx
import { useState, useEffect, useCallback } from 'react'
import { Skill } from '../../data/chapters'
import { PianoCanvas } from '../Canvas/PianoCanvas'
import { audioEngine } from '../../lib/audio/Engine'
import { useProgressStore } from '../../stores/progressStore'

interface LearnViewProps {
  skill: Skill
  onComplete: () => void
}

const SKILL_CONTENT: Record<string, { title: string; steps: { text: string; highlight?: string; playNote?: string }[] }> = {
  'ch1-s1': {
    title: '认识 C D E F G A B',
    steps: [
      { text: '钢琴上有 7 个白键循环重复：C - D - E - F - G - A - B', highlight: 'C4' },
      { text: '每个白键对应一个音名 do - re - mi - fa - sol - la - si', highlight: 'D4' },
      { text: '试试点击下面的钢琴键，感受每个音！', playNote: 'E4' },
    ],
  },
  'ch1-s2': {
    title: '全音与半音',
    steps: [
      { text: '半音是钢琴上最近的相邻音，如 E 到 F。', highlight: 'E4' },
      { text: '全音 = 两个半音，如 C 到 D。C→#C→D。', highlight: 'C4', playNote: 'C4' },
      { text: '黑键就是升降半音的音。按下感受！', playNote: 'Db4' },
    ],
  },
  'ch1-s3': {
    title: '升降号与黑键',
    steps: [
      { text: '# = 升号，把音提高半音。C# 是 C 右边最近的黑键。', highlight: 'Db4' },
      { text: '♭ = 降号，把音降低半音。D♭ 就是 C#（等音）。', highlight: 'C4' },
      { text: '十二平均律把一个八度分成 12 个半音，这就是全部的音了！', playNote: 'C4' },
    ],
  },
}

export function LearnView({ skill, onComplete }: LearnViewProps) {
  const content = SKILL_CONTENT[skill.id] ?? {
    title: skill.title,
    steps: [{ text: skill.description }],
  }
  const [step, setStep] = useState(0)
  const incrementPractice = useProgressStore(s => s.incrementPractice)

  useEffect(() => {
    incrementPractice(skill.id)
  }, [skill.id])

  const handleNext = () => {
    if (step < content.steps.length - 1) {
      setStep(s => s + 1)
    } else {
      onComplete()
    }
  }

  const currentStep = content.steps[step]

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 100%)',
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#4a3a2a' }}>{content.title}</h2>
        <p style={{ margin: '8px 0 0', color: '#8a7a6a', fontSize: '13px' }}>
          {step + 1} / {content.steps.length}
        </p>
      </div>

      {/* Step dots */}
      <div style={{ position: 'absolute', top: '120px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
        {content.steps.map((_, i) => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i === step ? '#8faa8a' : i < step ? '#c8b89a' : '#d8d0c0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Text card */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px 40px',
        maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        <p style={{ fontSize: '18px', color: '#4a3a2a', lineHeight: 1.6, margin: 0 }}>
          {currentStep.text}
        </p>
      </div>

      {/* Piano (show for step 0 and 2 of ch1-s1, others hide) */}
      {(skill.id === 'ch1-s1' || skill.id === 'ch1-s2' || skill.id === 'ch1-s3') && (
        <div style={{ marginBottom: '24px' }}>
          <PianoCanvas />
        </div>
      )}

      <button
        onClick={handleNext}
        style={{
          padding: '14px 40px',
          fontSize: '16px',
          background: '#8faa8a',
          color: '#fff',
          border: 'none',
          borderRadius: '28px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {step < content.steps.length - 1 ? '下一步 →' : '开始练习 →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 1: Create `src/components/SkillPanel/LearnView.tsx`**

- [ ] **Step 2: Commit**

```bash
git add src/components/SkillPanel/LearnView.tsx
git commit -m "feat: add LearnView with Chapter 1 content"
```

---

### Task 9: PracticeView — free practice with grid feedback

**Files:**
- Create: `src/components/SkillPanel/PracticeView.tsx`

```tsx
// src/components/SkillPanel/PracticeView.tsx
import { useState, useCallback } from 'react'
import { Skill } from '../../data/chapters'
import { PianoCanvas } from '../Canvas/PianoCanvas'

interface PracticeViewProps {
  skill: Skill
  onComplete: () => void
}

// Practice task generators per skill
function getCh1S1Tasks() {
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
  const labels: Record<string, string> = { C4: 'C', D4: 'D', E4: 'E', F4: 'F', G4: 'G', A4: 'A', B4: 'B' }
  const pool = notes.map(n => ({ note: n, answer: labels[n] }))
  return pool.sort(() => Math.random() - 0.5).slice(0, 5)
}

function getCh1S2Tasks() {
  // Practice: pick note higher by whole/half step
  return [
    { note: 'C4', expected: 'D4', label: '比 C 高一个全音的键是？', type: 'whole' },
    { note: 'E4', expected: 'F4', label: '比 E 高一个半音的键是？', type: 'half' },
    { note: 'G4', expected: 'A4', label: '比 G 高一个全音的键是？', type: 'whole' },
    { note: 'B4', expected: 'C5', label: '比 B 高一个半音的键是？', type: 'half' },
    { note: 'D4', expected: 'F4', label: '比 D 高一个全音的键是？', type: 'whole' },
  ]
}

function getCh1S3Tasks() {
  return [
    { note: 'C4', expected: 'Db4', label: 'C 的升号音是？', type: 'sharp' },
    { note: 'F4', expected: 'Gb4', label: 'F 的升号音是？', type: 'sharp' },
    { note: 'Db4', expected: 'C4', label: 'D♭ 的等音是？', type: 'flat' },
    { note: 'Ab4', expected: 'G#4', label: 'A♭ 的等音是？', type: 'flat' },
    { note: 'Eb4', expected: 'D#4', label: 'E♭ 的等音是？', type: 'flat' },
  ]
}

interface PracticeViewProps {
  skill: Skill
  onComplete: () => void
}

export function PracticeView({ skill, onComplete }: PracticeViewProps) {
  const [taskIndex, setTaskIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hint, setHint] = useState('')
  const totalCount = 5

  const tasks = skill.id === 'ch1-s1' ? getCh1S1Tasks()
    : skill.id === 'ch1-s2' ? getCh1S2Tasks()
    : getCh1S3Tasks()

  const currentTask = tasks[taskIndex]

  const handleKeyPress = useCallback((note: string) => {
    if (feedback) return

    const expected = (currentTask as any).expected ?? (currentTask as any).note
    if (note === expected || (skill.id === 'ch1-s1' && note === currentTask.note)) {
      setFeedback('correct')
      setCorrectCount(c => c + 1)
      setTimeout(() => {
        setFeedback(null)
        if (taskIndex < totalCount - 1) {
          setTaskIndex(i => i + 1)
        } else {
          onComplete()
        }
      }, 700)
    } else {
      setFeedback('wrong')
      setHint(`提示：答案是 ${expected}`)
      setTimeout(() => {
        setFeedback(null)
        setHint('')
      }, 1500)
    }
  }, [feedback, currentTask, taskIndex, skill.id, onComplete])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 100%)',
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Progress grid */}
      <div style={{
        position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '8px',
      }}>
        {Array.from({ length: totalCount }).map((_, i) => (
          <div key={i} style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: i < taskIndex ? '#8faa8a' : i === taskIndex && feedback === 'correct' ? '#8faa8a' : '#d8d0c0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <p style={{ color: '#8a7a6a', fontSize: '13px', marginBottom: '8px' }}>
        {taskIndex + 1} / {totalCount}
      </p>

      {/* Task card */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '28px 36px',
        maxWidth: '440px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        textAlign: 'center',
        marginBottom: '20px',
        border: feedback === 'correct' ? '3px solid #8faa8a' : feedback === 'wrong' ? '3px solid #e55' : '3px solid transparent',
        transition: 'border-color 0.2s',
      }}>
        <p style={{ fontSize: '18px', color: '#4a3a2a', margin: 0, fontWeight: 500 }}>
          {(currentTask as any).label ?? `按下 ${(currentTask as any).answer ?? (currentTask as any).note} 键`}
        </p>
        {feedback === 'correct' && (
          <p style={{ color: '#8faa8a', fontSize: '15px', marginTop: '10px' }}>✓ 对了！</p>
        )}
        {feedback === 'wrong' && (
          <p style={{ color: '#e55', fontSize: '15px', marginTop: '10px' }}>{hint}</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <PianoCanvas onKeyPress={handleKeyPress} />
      </div>

      <p style={{ color: '#b0a898', fontSize: '12px', fontStyle: 'italic' }}>
        自由练习，随便试，不扣命 ❤️
      </p>
    </div>
  )
}
```

- [ ] **Step 1: Create `src/components/SkillPanel/PracticeView.tsx`**

- [ ] **Step 2: Commit**

```bash
git add src/components/SkillPanel/PracticeView.tsx
git commit -m "feat: add PracticeView with Chapter 1 tasks"
```

---

### Task 10: AssessView — 3-question quiz + star rating

**Files:**
- Create: `src/components/SkillPanel/AssessView.tsx`

```tsx
// src/components/SkillPanel/AssessView.tsx
import { useState, useCallback } from 'react'
import { Skill } from '../../data/chapters'
import { PianoCanvas } from '../Canvas/PianoCanvas'
import { useProgressStore } from '../../stores/progressStore'
import { usePlayerStore } from '../../stores/playerStore'
import { audioEngine } from '../../lib/audio/Engine'

interface AssessViewProps {
  skill: Skill
  onComplete: (stars: number) => void
}

// Assessment questions per skill
const QUESTIONS: Record<string, { question: string; type: 'piano' | 'choice'; options?: string[]; answer: string | ((note: string) => boolean) }[]> = {
  'ch1-s1': [
    { question: '请按下 C 键', type: 'piano', answer: 'C4' },
    { question: '请按下 G 键', type: 'piano', answer: 'G4' },
    { question: '请按下 F 键', type: 'piano', answer: 'F4' },
  ],
  'ch1-s2': [
    { question: 'C 到 D 是全音还是半音？', type: 'choice', options: ['全音', '半音'], answer: '全音' },
    { question: 'E 到 F 是全音还是半音？', type: 'choice', options: ['全音', '半音'], answer: '半音' },
    { question: '比 C 高一个全音的音是？', type: 'piano', answer: 'D4' },
  ],
  'ch1-s3': [
    { question: 'C# 的等音是什么？', type: 'choice', options: ['Db', 'D', 'Eb'], answer: 'Db' },
    { question: '请按下 F# 键（Gb）', type: 'piano', answer: 'Gb4' },
    { question: '升降号把音改变多少？', type: 'choice', options: ['一个全音', '一个半音', '一个八度'], answer: '一个半音' },
  ],
}

function shuffleQuestions(skillId: string) {
  const qs = QUESTIONS[skillId] ?? [
    { question: '按下 C 键', type: 'piano' as const, answer: 'C4' },
  ]
  return [...qs].sort(() => Math.random() - 0.5).slice(0, 3)
}

export function AssessView({ skill, onComplete }: AssessViewProps) {
  const [qIndex, setQIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [feedbackState, setFeedbackState] = useState<'correct' | 'wrong' | null>(null)
  const completeSkill = useProgressStore(s => s.completeSkill)
  const addXP = usePlayerStore(s => s.addXP)
  const loseLife = usePlayerStore(s => s.loseLife)
  const healLife = usePlayerStore(s => s.healLife)
  const lives = usePlayerStore(s => s.lives)

  const questions = shuffleQuestions(skill.id)
  const currentQ = questions[qIndex]

  const handleKeyPress = useCallback((note: string) => {
    if (feedbackState || showResult) return
    const answer = (currentQ as any).answer as string
    if (note === answer) {
      setFeedbackState('correct')
      setCorrect(c => c + 1)
    } else {
      setFeedbackState('wrong')
      setWrong(w => w + 1)
      loseLife()
    }
    setTimeout(() => {
      setFeedbackState(null)
      setSelectedChoice(null)
      if (qIndex < questions.length - 1) {
        setQIndex(i => i + 1)
      } else {
        // Assessment done
        const finalCorrect = feedbackState === 'correct' ? correct + 1 : correct
        const stars = Math.min(3, Math.ceil((finalCorrect / questions.length) * 3))
        completeSkill(skill.id, stars)
        addXP(stars * 20)
        if (lives > 0) healLife()
        setShowResult(true)
      }
    }, 1000)
  }, [feedbackState, qIndex, currentQ, questions.length, correct, completeSkill, skill.id, addXP, loseLife, healLife, lives])

  const handleChoice = useCallback((choice: string) => {
    if (feedbackState || selectedChoice) return
    const answer = (currentQ as any).answer as string
    setSelectedChoice(choice)
    if (choice === answer) {
      setFeedbackState('correct')
      setCorrect(c => c + 1)
    } else {
      setFeedbackState('wrong')
      setWrong(w => w + 1)
      loseLife()
    }
    setTimeout(() => {
      setFeedbackState(null)
      setSelectedChoice(null)
      if (qIndex < questions.length - 1) {
        setQIndex(i => i + 1)
      } else {
        const finalCorrect = correct + (feedbackState === 'correct' ? 1 : 0)
        const stars = Math.min(3, Math.ceil((finalCorrect / questions.length) * 3))
        completeSkill(skill.id, stars)
        addXP(stars * 20)
        if (lives > 0) healLife()
        setShowResult(true)
      }
    }, 1200)
  }, [feedbackState, selectedChoice, qIndex, currentQ, questions.length, correct, completeSkill, skill.id, addXP, loseLife, healLife, lives])

  if (showResult) {
    const stars = Math.min(3, Math.ceil((correct / questions.length) * 3))
    const passed = stars >= 1
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
        position: 'absolute', inset: 0, zIndex: 500,
      }}>
        <div style={{
          background: '#fff', borderRadius: '24px',
          padding: '40px 48px', textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {passed ? '🎉' : '💪'}
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', color: '#4a3a2a' }}>
            {passed ? '技能已解锁！' : '再试一次！'}
          </h2>
          <div style={{ fontSize: '32px', margin: '12px 0', color: '#fbbf24' }}>
            {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <p style={{ color: '#8a7a6a', fontSize: '14px', margin: '0 0 24px' }}>
            正确 {correct}/{questions.length} 题
          </p>
          <button
            onClick={() => onComplete(stars)}
            style={{
              padding: '14px 36px', fontSize: '16px',
              background: passed ? '#8faa8a' : '#e55',
              color: '#fff', border: 'none', borderRadius: '28px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {passed ? '返回技能列表' : '重新考核'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e0d0 100%)',
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Question counter */}
      <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <p style={{ color: '#e55', fontSize: '13px', margin: '0 0 4px' }}>❤️ {lives}</p>
        <p style={{ color: '#8a7a6a', fontSize: '13px', margin: 0 }}>
          考核 · {qIndex + 1}/{questions.length}
        </p>
      </div>

      {/* Question card */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '28px 40px', maxWidth: '440px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        textAlign: 'center', marginBottom: '24px',
        border: feedbackState === 'correct' ? '3px solid #8faa8a'
          : feedbackState === 'wrong' ? '3px solid #e55'
          : '3px solid transparent',
        transition: 'border-color 0.2s',
      }}>
        <p style={{ fontSize: '18px', color: '#4a3a2a', margin: 0 }}>
          {currentQ.question}
        </p>
      </div>

      {/* Choice buttons */}
      {currentQ.type === 'choice' && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {(currentQ as any).options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleChoice(opt)}
              disabled={!!feedbackState || !!selectedChoice}
              style={{
                padding: '14px 32px', fontSize: '16px',
                background: selectedChoice === opt
                  ? ((selectedChoice === (currentQ as any).answer) ? '#8faa8a' : '#e55')
                  : 'rgba(255,255,255,0.8)',
                color: selectedChoice === opt ? '#fff' : '#4a3a2a',
                border: `2px solid ${selectedChoice === opt ? 'transparent' : '#d8d0c0'}`,
                borderRadius: '12px', cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {currentQ.type === 'piano' && (
        <div style={{ marginBottom: '16px' }}>
          <PianoCanvas onKeyPress={handleKeyPress} />
        </div>
      )}

      <p style={{ color: '#c0b0a0', fontSize: '12px', fontStyle: 'italic' }}>
        答错会扣命 ❤️ 连击可回血
      </p>
    </div>
  )
}
```

- [ ] **Step 1: Create `src/components/SkillPanel/AssessView.tsx`**

- [ ] **Step 2: Commit**

```bash
git add src/components/SkillPanel/AssessView.tsx
git commit -m "feat: add AssessView with 3-question quiz and star rating"
```

---

## Phase 5: Integration + Polish

### Task 11: Connect skill completion → next skill unlock

**Files:**
- Modify: `src/stores/progressStore.ts` — after completing a skill, unlock the next one

```typescript
// Add to progressStore after completeSkill action:
// After completing a skill, unlock the next one
import { getNextSkill } from '../../data/chapters'

// In completeSkill action, add after setting status to completed:
const next = getNextSkill(skillId)
if (next) {
  const nextStatus = state.skillProgress[next.id]
  if (nextStatus?.status === 'locked') {
    updatedProgress[next.id] = { ...nextStatus, status: 'available' }
  }
}
```

- [ ] **Step 1: Modify `src/stores/progressStore.ts`** to add next-skill unlock logic

- [ ] **Step 2: Commit**

```bash
git add src/stores/progressStore.ts
git commit -m "feat: auto-unlock next skill on completion"
```

---

### Task 12: Final integration test — run the app

- [ ] **Step 1: Run `cd music-learning-game && npm run dev`**
- [ ] **Step 2: Verify:**
  - Title screen renders → instrument picker → nickname → world map
  - Chapter 1 node clickable → SkillPanel with 3 skills
  - Skill 1 click → LearnView → PracticeView → AssessView → back to SkillPanel
  - After passing skill 1, skill 2 becomes available
  - XP bar and badge counter update
  - Lives system works

- [ ] **Step 3: Fix any TypeScript / runtime errors**

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: MVP complete — Chapter 1 fully playable"
```

---

## Summary of Deliverables

| Task | File | Description |
|------|------|-------------|
| 1 | `src/data/chapters.ts` | Full chapter + skill data |
| 2 | `src/stores/playerStore.ts` | Lives, XP, level, nickname |
| 3 | `src/stores/progressStore.ts` | Skill unlock, completion, badges |
| 4 | `src/lib/canvas/WorldMapData.ts` | Node positions + edges |
| 5 | `src/lib/canvas/WorldMapRenderer.ts` | Canvas renderer |
| 6 | `src/components/Canvas/WorldMapCanvas.tsx` | React map component |
| 7 | `src/components/Opening/TitleScreen.tsx` | Title page |
| 8 | `src/components/Opening/InstrumentPicker.tsx` | Instrument selection |
| 9 | `src/components/Opening/NicknameInput.tsx` | Nickname input |
| 10 | `src/components/HUD/XPBar.tsx` | XP bar |
| 11 | `src/components/HUD/BadgeCounter.tsx` | Badge counter |
| 12 | `src/components/HUD/HUD.tsx` | HUD integration |
| 13 | `src/App.tsx` | Full phase router |
| 14 | `src/components/SkillPanel/SkillPanel.tsx` | Skill milestone panel |
| 15 | `src/components/SkillPanel/LearnView.tsx` | Learn phase |
| 16 | `src/components/SkillPanel/PracticeView.tsx` | Practice phase |
| 17 | `src/components/SkillPanel/AssessView.tsx` | Assess phase |
| 18 | (modify) `src/stores/progressStore.ts` | Next skill unlock |
