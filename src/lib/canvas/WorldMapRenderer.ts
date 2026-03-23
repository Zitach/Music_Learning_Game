import { CHAPTERS } from '../../data/chapters'
import { MAP_EDGES, MAP_WIDTH, MAP_HEIGHT, NODE_RADIUS } from './WorldMapData'

export class WorldMapRenderer {
  private ctx: CanvasRenderingContext2D
  private completedChapters: Set<string> = new Set()
  private availableChapterId: string | null = null

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  setProgress(completedChapters: Set<string>, availableChapterId: string | null) {
    this.completedChapters = completedChapters
    this.availableChapterId = availableChapterId
  }

  private scaleX(norm: number) { return norm * MAP_WIDTH }
  private scaleY(norm: number) { return norm * MAP_HEIGHT }

  draw() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT)

    for (const [from, to] of MAP_EDGES) {
      this.drawEdge(from, to)
    }

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

    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 4

    ctx.beginPath()
    ctx.arc(cx, cy, NODE_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = completed ? chapter.color : available ? chapter.color : '#d8d0c8'
    ctx.globalAlpha = completed ? 0.85 : available ? 0.65 : 0.35
    ctx.fill()

    ctx.globalAlpha = 1
    ctx.shadowColor = 'transparent'
    ctx.strokeStyle = completed ? '#ffffff88' : available ? chapter.color : '#aaa8a0'
    ctx.lineWidth = completed ? 3 : available ? 2.5 : 1.5
    ctx.stroke()

    ctx.font = '26px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(chapter.emoji, cx, cy - 6)

    ctx.font = '11px "Noto Sans SC", "PingFang SC", sans-serif'
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
