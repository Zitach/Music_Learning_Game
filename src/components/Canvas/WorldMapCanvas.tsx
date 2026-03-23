import { useEffect, useRef, useCallback } from 'react'
import { WorldMapRenderer } from '../../lib/canvas/WorldMapRenderer'
import { MAP_WIDTH, MAP_HEIGHT } from '../../lib/canvas/WorldMapData'
import { useProgressStore } from '../../stores/progressStore'
import { CHAPTERS } from '../../data/chapters'
import { ChapterListOverlay } from '../../features/map/ChapterListOverlay'

export interface WorldMapCanvasProps {
  onChapterClick: (chapterId: string) => void
}

export function WorldMapCanvas({ onChapterClick }: WorldMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<WorldMapRenderer | null>(null)
  const scaleRef = useRef(1)
  const dprRef = useRef(1)
  const skillProgress = useProgressStore(s => s.skillProgress)
  const completedChapters = new Set(CHAPTERS.filter(c => c.skills.every(s => skillProgress[s.id]?.status === 'completed')).map(c => c.id))
  const availableChapterId = CHAPTERS.find(c => !completedChapters.has(c.id))?.id ?? null

  useEffect(() => {
    const updateScale = () => {
      scaleRef.current = Math.min((window.innerWidth * 0.92) / MAP_WIDTH, (window.innerHeight * 0.84) / MAP_HEIGHT, 1.28)
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
    renderer.setProgress(completedChapters, availableChapterId)
    renderer.draw()
    rendererRef.current = renderer
  }, [availableChapterId, skillProgress, completedChapters])

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
      <canvas ref={canvasRef} onClick={handleClick} aria-hidden="true" className="world-map-canvas" />
      <ChapterListOverlay onChapterClick={onChapterClick} />
    </div>
  )
}

