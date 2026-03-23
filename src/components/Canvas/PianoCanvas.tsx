import { useEffect, useRef, useState, useCallback } from 'react'
import { Piano } from '../../lib/canvas/Piano'
import { audioEngine } from '../../lib/audio/Engine'

export interface PianoCanvasProps {
  onKeyPress?: (note: string) => void
  initialHighlight?: string
}

export function PianoCanvas({ onKeyPress, initialHighlight }: PianoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pianoRef = useRef<Piano | null>(null)
  const [highlightedKey, setHighlightedKey] = useState<string | undefined>(initialHighlight)

  // Initialize Piano and audio on mount
  useEffect(() => {
    const initAudio = async () => {
      await audioEngine.load()
    }
    initAudio()
  }, [])

  // Handle canvas click
  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pianoRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * canvasRef.current.width
    const y = ((event.clientY - rect.top) / rect.height) * canvasRef.current.height

    const dpr = window.devicePixelRatio || 1
    const canvasX = x / dpr
    const canvasY = y / dpr

    // Get the key at position
    const note = pianoRef.current.getKeyAtPosition(canvasX, canvasY)
    
    if (note) {
      // Play the note
      audioEngine.playNote(note, '8n')
      
      // Update highlighted key
      setHighlightedKey(note)
      
      // Call onKeyPress callback if provided
      onKeyPress?.(note)

      // Redraw piano with highlight
      pianoRef.current.draw(note)
    }
  }, [onKeyPress])

  // Initialize canvas and Piano
  useEffect(() => {
    if (!canvasRef.current) return

    const dpr = window.devicePixelRatio || 1
    const width = 800
    const height = 200

    // Set display size
    canvasRef.current.style.width = `${width}px`
    canvasRef.current.style.height = `${height}px`

    // Set actual canvas size in memory (scaled for retina)
    canvasRef.current.width = width * dpr
    canvasRef.current.height = height * dpr

    // Scale context to match devicePixelRatio
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      
      // Initialize Piano instance
      pianoRef.current = new Piano(ctx, width, height)
      
      // Initial draw
      pianoRef.current.draw(highlightedKey)
    }
  }, [highlightedKey])

  // Redraw when highlight changes
  useEffect(() => {
    if (pianoRef.current) {
      pianoRef.current.draw(highlightedKey)
    }
  }, [highlightedKey])

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        display: 'block',
        cursor: 'pointer',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    />
  )
}
