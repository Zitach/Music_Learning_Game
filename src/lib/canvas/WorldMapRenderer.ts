import { CHAPTERS } from '../../data/chapters'
import { MAP_EDGES, MAP_WIDTH, MAP_HEIGHT, NODE_RADIUS } from './WorldMapData'
import { getCanvasTheme, type CanvasTheme } from './canvasTheme'

interface ChapterProgress {
  completedSkills: number
  totalSkills: number
}

function detectTheme(): 'light' | 'dark' {
  const attr = document.documentElement.dataset.theme
  if (attr === 'dark') return 'dark'
  return 'light'
}

export class WorldMapRenderer {
  private ctx: CanvasRenderingContext2D
  private completedChapters: Set<string> = new Set()
  private availableChapterId: string | null = null
  private chapterProgress: Map<string, ChapterProgress> = new Map()
  private animationStart = 0
  private theme: CanvasTheme = getCanvasTheme(detectTheme())

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  setProgress(
    completedChapters: Set<string>,
    availableChapterId: string | null,
    chapterProgress: Map<string, ChapterProgress>
  ) {
    this.completedChapters = completedChapters
    this.availableChapterId = availableChapterId
    this.chapterProgress = chapterProgress
  }

  startAnimation() {
    this.animationStart = performance.now()
  }

  refreshTheme() {
    this.theme = getCanvasTheme(detectTheme())
  }

  private scaleX(norm: number) { return norm * MAP_WIDTH }
  private scaleY(norm: number) { return norm * MAP_HEIGHT }

  animate(timestamp: number) {
    const elapsed = timestamp - this.animationStart
    this.draw(elapsed)
  }

  draw(elapsed: number = 0) {
    const ctx = this.ctx
    const t = this.theme
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT)

    // Draw edges with animation
    for (const [from, to] of MAP_EDGES) {
      this.drawEdge(from, to, elapsed, t)
    }

    // Draw nodes
    for (const chapter of CHAPTERS) {
      const completed = this.completedChapters.has(chapter.id)
      const available = chapter.id === this.availableChapterId
      const progress = this.chapterProgress.get(chapter.id)
      this.drawNode(chapter, completed, available, progress, elapsed, t)
    }
  }

  private drawEdge(fromId: string, toId: string, elapsed: number, t: CanvasTheme) {
    const ctx = this.ctx
    const from = CHAPTERS.find(c => c.id === fromId)!
    const to = CHAPTERS.find(c => c.id === toId)!
    const x1 = this.scaleX(from.position.x)
    const y1 = this.scaleY(from.position.y)
    const x2 = this.scaleX(to.position.x)
    const y2 = this.scaleY(to.position.y)

    const fromDone = this.completedChapters.has(fromId)

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x1, y1 + NODE_RADIUS)
    ctx.lineTo(x2, y2 - NODE_RADIUS)
    ctx.lineWidth = fromDone ? 3 : 2
    ctx.lineCap = 'round'

    if (fromDone) {
      ctx.strokeStyle = t.pathActive
      ctx.setLineDash([])
    } else {
      ctx.strokeStyle = t.pathDefault
      ctx.setLineDash([6, 4])
      // Animate dash offset for "flowing" effect
      ctx.lineDashOffset = -elapsed * 0.03
    }

    ctx.stroke()
    ctx.restore()
  }

  private drawNode(
    chapter: typeof CHAPTERS[0],
    completed: boolean,
    available: boolean,
    progress: ChapterProgress | undefined,
    elapsed: number,
    t: CanvasTheme
  ) {
    const ctx = this.ctx
    const cx = this.scaleX(chapter.position.x)
    const cy = this.scaleY(chapter.position.y)

    ctx.save()

    // Pulse glow for available chapters
    if (available && !completed) {
      const pulse = Math.sin(elapsed * 0.003) * 0.5 + 0.5
      ctx.shadowColor = t.nodeCurrent + '66'
      ctx.shadowBlur = 8 + pulse * 12
    }

    ctx.shadowOffsetY = 4
    ctx.shadowColor = 'rgba(0,0,0,0.12)'

    // Main circle
    ctx.beginPath()
    ctx.arc(cx, cy, NODE_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = completed ? t.nodeCompleted : available ? t.nodeCurrent : t.nodeLocked
    ctx.globalAlpha = completed ? 0.9 : available ? 0.7 : 0.35
    ctx.fill()

    // Progress ring for in-progress chapters
    if (progress && !completed && progress.completedSkills > 0) {
      const ratio = progress.completedSkills / progress.totalSkills
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(cx, cy, NODE_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
      ctx.strokeStyle = t.warning
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.shadowColor = 'transparent'
    ctx.strokeStyle = completed ? '#ffffff88' : available ? t.nodeCurrent : t.nodeBorder
    ctx.lineWidth = completed ? 3 : available ? 2.5 : 1.5
    ctx.stroke()

    // Emoji
    ctx.font = '26px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(chapter.emoji, cx, cy - 6)

    // Title
    ctx.font = '11px "Noto Sans SC", "PingFang SC", sans-serif'
    ctx.fillStyle = completed ? t.success : available ? t.text : t.textMuted
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
