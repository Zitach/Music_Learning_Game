import { useState } from 'react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 12px',
            borderRadius: 8,
            background: 'var(--panel-strong)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
            fontSize: 12,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>
      )}
    </div>
  )
}
