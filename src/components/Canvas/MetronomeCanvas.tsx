import { useEffect, useRef, useCallback, useState } from 'react'
import { getCanvasTheme } from '../../lib/canvas/canvasTheme'

function useCurrentTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
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

export interface MetronomeCanvasProps {
  bpm?: number
  isPlaying?: boolean
  currentBeat?: number // 0-3 for 4/4 time
}

const BEAT_COUNT = 4
const BEAT_INDICATOR_SIZE = 20
const BEAT_INDICATOR_GAP = 16

export function MetronomeCanvas({
  bpm = 120,
  isPlaying = false,
  currentBeat = 0,
}: MetronomeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastBeatTimeRef = useRef<number>(0)
  const displayedBeatRef = useRef<number>(0)
  const currentTheme = useCurrentTheme()

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const theme = getCanvasTheme(currentTheme)
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr

      // Calculate total width needed for all beat indicators
      const totalWidth = BEAT_COUNT * BEAT_INDICATOR_SIZE + (BEAT_COUNT - 1) * BEAT_INDICATOR_GAP
      const startX = (width - totalWidth) / 2
      const centerY = height / 2

      // Update displayed beat based on timing when playing
      if (isPlaying) {
        const msPerBeat = 60000 / bpm
        const elapsed = timestamp - lastBeatTimeRef.current

        if (elapsed >= msPerBeat) {
          lastBeatTimeRef.current = timestamp - (elapsed % msPerBeat)
          displayedBeatRef.current = (displayedBeatRef.current + 1) % BEAT_COUNT
        }
      } else {
        displayedBeatRef.current = currentBeat
      }

      // Clear canvas and draw background
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = theme.bg
      ctx.fillRect(0, 0, width, height)

      // Draw beat indicators
      for (let i = 0; i < BEAT_COUNT; i++) {
        const x = startX + i * (BEAT_INDICATOR_SIZE + BEAT_INDICATOR_GAP)
        const isActive = isPlaying ? i === displayedBeatRef.current : i === currentBeat
        const isFirstBeat = i === 0

        // Draw beat indicator circle
        ctx.beginPath()
        ctx.arc(x + BEAT_INDICATOR_SIZE / 2, centerY, BEAT_INDICATOR_SIZE / 2, 0, Math.PI * 2)

        // Fill color
        ctx.fillStyle = isActive ? theme.metronomeActive : theme.metronomeInactive
        ctx.fill()

        // Border
        ctx.strokeStyle = isActive ? theme.metronomeActive : theme.textMuted
        ctx.lineWidth = isFirstBeat ? 3 : 2
        ctx.stroke()

        // Add glow effect for active beat
        if (isActive) {
          ctx.shadowColor = theme.metronomeActive
          ctx.shadowBlur = 15
          ctx.beginPath()
          ctx.arc(x + BEAT_INDICATOR_SIZE / 2, centerY, BEAT_INDICATOR_SIZE / 2, 0, Math.PI * 2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      // Draw BPM text
      ctx.font = '14px system-ui, sans-serif'
      ctx.fillStyle = theme.textMuted
      ctx.textAlign = 'center'
      ctx.fillText(`${bpm} BPM`, width / 2, centerY + BEAT_INDICATOR_SIZE + 20)

      animationRef.current = requestAnimationFrame(draw)
    },
    [bpm, isPlaying, currentBeat, currentTheme]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const width = 200
    const height = 80

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = width * dpr
    canvas.height = height * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    lastBeatTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '200px',
        height: '80px',
      }}
    />
  )
}
