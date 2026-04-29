import { useEffect, useRef, useCallback, useState } from 'react'
import { WorldMapRenderer } from '../../lib/canvas/WorldMapRenderer'
import { MAP_WIDTH, MAP_HEIGHT } from '../../lib/canvas/WorldMapData'
import { useProgressStore } from '../../stores/progressStore'
import { CHAPTERS } from '../../data/chapters'
import { ChapterListOverlay } from '../../features/map/ChapterListOverlay'

function useCurrentTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  )
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => {
      setTheme(el.dataset.theme === 'dark' ? 'dark' : 'light')
    })
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return theme
}

export interface WorldMapCanvasProps {
  onChapterClick: (chapterId: string) => void
}

export function WorldMapCanvas({ onChapterClick }: WorldMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<WorldMapRenderer | null>(null)
  const rafRef = useRef(0)
  const scaleRef = useRef(1)
  const dprRef = useRef(1)
  const currentTheme = useCurrentTheme()
  const skillProgress = useProgressStore(s => s.skillProgress)
  const completedChapters = new Set(
    CHAPTERS.filter(c => c.skills.every(s => skillProgress[s.id]?.status === 'completed')).map(c => c.id)
  )
  const availableChapterId = CHAPTERS.find(c => !completedChapters.has(c.id))?.id ?? null

  const chapterProgress = new Map(
    CHAPTERS.map(c => {
      const total = c.skills.length
      const completed = c.skills.filter(s => skillProgress[s.id]?.status === 'completed').length
      return [c.id, { completedSkills: completed, totalSkills: total }]
    })
  )

  useEffect(() => {
    const updateScale = () => {
      scaleRef.current = Math.min(
        (window.innerWidth * 0.92) / MAP_WIDTH,
        (window.innerHeight * 0.84) / MAP_HEIGHT,
        1.28
      )
      dprRef.current = window.devicePixelRatio || 1
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = dprRef.current
    canvas.width = MAP_WIDTH * dpr
    canvas.height = MAP_HEIGHT * dpr
    canvas.style.width = `${MAP_WIDTH * scaleRef.current}px`
    canvas.style.height = `${MAP_HEIGHT * scaleRef.current}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const renderer = new WorldMapRenderer(ctx)
    renderer.refreshTheme()
    renderer.setProgress(completedChapters, availableChapterId, chapterProgress)
    renderer.startAnimation()
    rendererRef.current = renderer

    const loop = (timestamp: number) => {
      renderer.animate(timestamp)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [availableChapterId, skillProgress, completedChapters, chapterProgress, currentTheme])

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !rendererRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const canvasX = ((event.clientX - rect.left) / rect.width) * MAP_WIDTH
    const canvasY = ((event.clientY - rect.top) / rect.height) * MAP_HEIGHT
    const chapterId = rendererRef.current.getChapterAtPosition(canvasX, canvasY)
    if (chapterId) onChapterClick(chapterId)
  }, [onChapterClick])

  return (
    <div className="world-map-wrap">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            // Select first available chapter on Enter/Space
            const ch = CHAPTERS.find(c => rendererRef.current?.getChapterAtPosition(
              c.position.x * MAP_WIDTH, c.position.y * MAP_HEIGHT
            ) === c.id)
            if (ch) onChapterClick(ch.id)
          }
        }}
        tabIndex={0}
        role="img"
        aria-label="音乐学习世界地图。共7个章节，点击节点进入学习。"
        className="world-map-canvas"
      />
      <ChapterListOverlay onChapterClick={onChapterClick} />
    </div>
  )
}
