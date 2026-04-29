import { useEffect, useRef, useState } from 'react'
import { audioEngine } from '../../lib/audio/Engine'

interface ComboCounterProps {
  combo: number
}

export function ComboCounter({ combo }: ComboCounterProps) {
  const [popKey, setPopKey] = useState(0)
  const prevComboRef = useRef(combo)

  useEffect(() => {
    if (combo !== prevComboRef.current && combo > 0) {
      setPopKey(k => k + 1)
      if (combo % 5 === 0 && combo > prevComboRef.current) {
        audioEngine.playComboMilestone(combo)
      }
    }
    prevComboRef.current = combo
  }, [combo])

  const isActive = combo > 0

  return (
    <div className={`hud-chip combo-chip${isActive ? ' is-active' : ''}`} key={popKey}>
      <span className="combo-label">连击</span>
      <span className={`combo-value${isActive ? ' combo-pop' : ''}`}>
        {combo}
      </span>
    </div>
  )
}

export default ComboCounter
