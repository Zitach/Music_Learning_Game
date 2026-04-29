import { useEffect, useRef } from 'react'
import { useEffects } from './EffectsProvider'

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { particleSystem, screenShake } = useEffects()
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    particleSystem.setCanvas(canvas)

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = (timestamp: number) => {
      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16
      lastTimeRef.current = timestamp
      particleSystem.update(dt)
      screenShake.update(dt)
      particleSystem.draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [particleSystem, screenShake])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
