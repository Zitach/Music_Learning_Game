import React from 'react'

interface TaskPromptProps {
  text: string
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '10px 14px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const textStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '15px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: 600,
  letterSpacing: '0.3px',
}

export function TaskPrompt({ text }: TaskPromptProps) {
  return (
    <div style={containerStyle}>
      <span style={textStyle}>{text}</span>
    </div>
  )
}

export default TaskPrompt
