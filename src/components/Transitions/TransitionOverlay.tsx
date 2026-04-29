import { useEffect, useState } from 'react'
import type { TransitionStyle } from '../../lib/ui/transitions'

interface TransitionOverlayProps {
  label: string | null
  style?: TransitionStyle
  onDismiss?: () => void
}

const STYLE_CLASS: Record<TransitionStyle, string> = {
  banner: 'transition-overlay--banner',
  fade: 'transition-overlay--fade',
  dissolve: 'transition-overlay--dissolve',
  levelUp: 'transition-overlay--levelUp',
}

export function TransitionOverlay({ label, style = 'banner', onDismiss }: TransitionOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (label) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [label])

  useEffect(() => {
    if (!label || !onDismiss) return
    const timer = window.setTimeout(onDismiss, style === 'levelUp' ? 1500 : style === 'fade' ? 400 : style === 'dissolve' ? 600 : 900)
    return () => window.clearTimeout(timer)
  }, [label, style, onDismiss])

  if (!label || !visible) return null

  return (
    <div className={`transition-overlay ${STYLE_CLASS[style]}`}>
      {style === 'levelUp' ? (
        <div className="transition-levelUp-content">
          <span className="transition-levelUp-icon">&#x2B50;</span>
          <span className="transition-levelUp-label">{label}</span>
          <span className="transition-levelUp-icon">&#x2B50;</span>
        </div>
      ) : style === 'fade' ? (
        <div className="transition-fade-label">{label}</div>
      ) : style === 'dissolve' ? (
        <div className="transition-dissolve-label">{label}</div>
      ) : (
        <div className="transition-banner-label">{label}</div>
      )}
    </div>
  )
}
