import { useEffect, useRef, useState, useCallback } from 'react'

export interface GameCanvasState {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  ctx: CanvasRenderingContext2D | null
  dimensions: { width: number; height: number }
  isPaused: boolean
  setPaused: (paused: boolean) => void
}

export function useGameCanvas(): GameCanvasState {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isPaused, setIsPaused] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const updateDimensions = useCallback(() => {
    if (!canvasRef.current) return

    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight

    // Set display size
    canvasRef.current.style.width = `${width}px`
    canvasRef.current.style.height = `${height}px`

    // Set actual canvas size in memory (scaled for retina)
    canvasRef.current.width = width * dpr
    canvasRef.current.height = height * dpr

    // Scale context to match devicePixelRatio
    const context = canvasRef.current.getContext('2d')
    if (context) {
      context.scale(dpr, dpr)
      setCtx(context)
    }

    setDimensions({ width, height })
  }, [])

  const loop = useCallback(() => {
    if (isPaused) return
    // Game loop logic will be added here
    animationFrameRef.current = requestAnimationFrame(loop)
  }, [isPaused])

  useEffect(() => {
    updateDimensions()

    // Setup ResizeObserver
    resizeObserverRef.current = new ResizeObserver(() => {
      updateDimensions()
    })

    if (canvasRef.current) {
      resizeObserverRef.current.observe(canvasRef.current)
    }

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(loop)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      resizeObserverRef.current?.disconnect()
    }
  }, [updateDimensions, loop])

  // Restart loop when unpaused
  useEffect(() => {
    if (!isPaused && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(loop)
    }
  }, [isPaused, loop])

  const setPaused = useCallback((paused: boolean) => {
    setIsPaused(paused)
    if (paused && animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  return { canvasRef, ctx, dimensions, isPaused, setPaused }
}

export function GameCanvas() {
  const { canvasRef } = useGameCanvas()

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    />
  )
}
