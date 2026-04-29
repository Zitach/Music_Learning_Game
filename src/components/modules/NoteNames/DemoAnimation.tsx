import { useEffect, useRef, useState, useCallback } from 'react'
import { Piano } from '../../../lib/canvas/Piano'
import { audioEngine } from '../../../lib/audio/Engine'
import { getCanvasTheme } from '../../../lib/canvas/canvasTheme'

interface DemoAnimationProps {
  onComplete: () => void
  onSkip?: () => void
}

type AnimationPhase = 'idle' | 'keyDown' | 'floating' | 'complete'

const DEMO_DURATION = 3000
const KEY_PRESS_DELAY = 500
const KEY_PRESS_DURATION = 800

export function DemoAnimation({ onComplete, onSkip }: DemoAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pianoRef = useRef<Piano | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [phase, setPhase] = useState<AnimationPhase>('idle')
  const [floatingText, setFloatingText] = useState(false)
  const startTimeRef = useRef<number>(0)

  const handleSkip = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setPhase('complete')
    if (onSkip) {
      onSkip()
    } else {
      onComplete()
    }
  }, [onSkip, onComplete])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const piano = pianoRef.current
    if (!canvas || !piano) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const theme = getCanvasTheme('light')
    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight

    // Set display size
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Set actual canvas size in memory (scaled for retina)
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Scale context to match devicePixelRatio
    ctx.scale(dpr, dpr)

    // Clear canvas with light purple gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, theme.bgGradient[0])
    gradient.addColorStop(0.5, theme.bgGradient[1])
    gradient.addColorStop(1, theme.bgGradient[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Update piano with new dimensions
    piano.updateDimensions(width, height * 0.7)

    // Determine highlighted key based on phase
    let highlightedKey: string | undefined
    if (phase === 'keyDown' || phase === 'floating') {
      highlightedKey = 'C4'
    }

    // Draw piano
    piano.draw(highlightedKey, theme.pianoHighlight)

    // Continue animation loop
    if (phase !== 'complete') {
      animationFrameRef.current = requestAnimationFrame(draw)
    }
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Initialize piano
    pianoRef.current = new Piano(ctx, width, height * 0.7)

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(draw)

    // Start the demo sequence
    startTimeRef.current = Date.now()

    // Load audio engine
    audioEngine.load().then(() => {
      // Phase 1: Key goes down after delay
      setTimeout(() => {
        setPhase('keyDown')
        audioEngine.playNote('C4', '4n')
      }, KEY_PRESS_DELAY)
    })

    // Phase 2: Floating text appears
    setTimeout(() => {
      setFloatingText(true)
      setPhase('floating')
    }, KEY_PRESS_DELAY + KEY_PRESS_DURATION)

    // Phase 3: Complete
    setTimeout(() => {
      setPhase('complete')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      onComplete()
    }, DEMO_DURATION)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [draw, onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-0)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Floating text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: floatingText ? '50%' : '10%',
          left: '50%',
          transform: 'translateX(-50%) translateY(50%)',
          transition: 'bottom 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            animation: floatingText ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          <span
            style={{
              fontSize: '72px',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: 'var(--primary)',
              textShadow: '0 0 30px rgba(107, 78, 230, 0.3), 0 4px 20px rgba(0, 0, 0, 0.1)',
              letterSpacing: '0.05em',
            }}
          >
            C
          </span>
          <span
            style={{
              fontSize: '36px',
              fontFamily: "'Inter', -apple-system, sans-serif",
              color: 'var(--primary)',
              opacity: 0.7,
              fontWeight: 300,
            }}
          >
            =
          </span>
          <span
            style={{
              fontSize: '72px',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: 'var(--primary)',
              textShadow: '0 0 30px rgba(107, 78, 230, 0.3), 0 4px 20px rgba(0, 0, 0, 0.1)',
              letterSpacing: '0.05em',
            }}
          >
            do
          </span>
        </div>
      </div>

      {/* Glow effect behind floating text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: floatingText ? '400px' : '100px',
          height: floatingText ? '200px' : '100px',
          background: 'radial-gradient(ellipse, rgba(107, 78, 230, 0.12) 0%, transparent 70%)',
          transition: 'all 1s ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          padding: '10px 20px',
          background: 'rgba(107, 78, 230, 0.08)',
          border: '1px solid rgba(107, 78, 230, 0.2)',
          borderRadius: '8px',
          color: 'rgba(107, 78, 230, 0.7)',
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(107, 78, 230, 0.14)'
          e.currentTarget.style.color = 'rgba(107, 78, 230, 0.9)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(107, 78, 230, 0.08)'
          e.currentTarget.style.color = 'rgba(107, 78, 230, 0.7)'
        }}
      >
        跳过 →
      </button>

      {/* Key indicator */}
      {phase === 'keyDown' || phase === 'floating' ? (
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            background: 'rgba(107, 78, 230, 0.12)',
            border: '1px solid rgba(107, 78, 230, 0.3)',
            borderRadius: '8px',
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: '14px',
            color: 'var(--primary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          C4 — Middle C
        </div>
      ) : null}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400&display=swap');

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
