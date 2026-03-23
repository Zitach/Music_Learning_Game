import React, { useEffect, useState } from 'react'

interface NoteNamesTaskPromptProps {
  taskText: string
  feedback: 'correct' | 'incorrect' | null
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 18px',
  background: 'linear-gradient(180deg, rgba(15, 27, 49, 0.86), rgba(8, 15, 27, 0.76))',
  borderRadius: '18px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(16px)',
  minWidth: '220px',
  boxShadow: '0 16px 34px rgba(0, 0, 0, 0.28)',
}

const textStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: 600,
  letterSpacing: '0.4px',
}

const feedbackContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '999px',
}

const feedbackIconStyle = (_feedback: 'correct' | 'incorrect' | null, isAnimating: boolean): React.CSSProperties => ({
  fontSize: '24px',
  opacity: isAnimating ? 1 : 0,
  transform: isAnimating ? 'scale(1)' : 'scale(0.5)',
  transition: 'opacity 0.26s ease-out, transform 0.26s ease-out',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export function NoteNamesTaskPrompt({ taskText, feedback }: NoteNamesTaskPromptProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (feedback !== null) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 600)
      return () => clearTimeout(timer)
    }
    setIsAnimating(false)
  }, [feedback])

  const getFeedbackIcon = () => {
    if (feedback === 'correct') {
      return (
        <span style={{ ...feedbackIconStyle(feedback, isAnimating), filter: 'drop-shadow(0 0 8px rgba(76, 175, 80, 0.8))' }}>
          ✓
        </span>
      )
    }
    if (feedback === 'incorrect') {
      return (
        <span style={{ ...feedbackIconStyle(feedback, isAnimating), filter: 'drop-shadow(0 0 8px rgba(244, 67, 54, 0.8))' }}>
          ✕
        </span>
      )
    }
    return <span style={feedbackIconStyle(null, false)} />
  }

  return (
    <div style={containerStyle}>
      <span style={textStyle}>{taskText}</span>
      <div style={feedbackContainerStyle}>{getFeedbackIcon()}</div>
    </div>
  )
}

export default NoteNamesTaskPrompt
