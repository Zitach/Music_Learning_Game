import React from 'react'

interface ComboCounterProps {
  combo: number
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const labelStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.72)',
  fontSize: '14px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const valueStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: 700,
  transition: 'transform 0.18s ease, color 0.24s ease, text-shadow 0.24s ease',
}

const activeStyle: React.CSSProperties = {
  color: '#f8d27a',
  textShadow: '0 0 14px rgba(248, 210, 122, 0.45)',
}

export function ComboCounter({ combo }: ComboCounterProps) {
  const isActive = combo > 0

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>连击</span>
      <span style={{ ...valueStyle, ...(isActive ? activeStyle : {}), transform: isActive ? 'scale(1.06)' : 'scale(1)' }}>
        {combo}
      </span>
    </div>
  )
}

export default ComboCounter
