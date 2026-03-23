import React from 'react'
import TaskPrompt from './TaskPrompt'
import LivesDisplay from './LivesDisplay'
import ComboCounter from './ComboCounter'

interface HUDProps {
  taskText?: string
  lives: number
  maxLives?: number
  combo: number
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  left: '16px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minWidth: '180px',
  zIndex: 1000,
}

const dividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  margin: '4px 0',
}

export function HUD({ taskText, lives, maxLives = 5, combo }: HUDProps) {
  return (
    <div style={containerStyle}>
      {taskText !== undefined && (
        <>
          <TaskPrompt text={taskText} />
          <div style={dividerStyle} />
        </>
      )}
      <LivesDisplay lives={lives} maxLives={maxLives} />
      <div style={dividerStyle} />
      <ComboCounter combo={combo} />
    </div>
  )
}

export { TaskPrompt, LivesDisplay, ComboCounter }
export default HUD
