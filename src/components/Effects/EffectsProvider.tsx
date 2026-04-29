import { createContext, useContext, useCallback, useRef } from 'react'
import { ParticleSystem } from '../../lib/effects/ParticleSystem'
import { ScreenShake } from '../../lib/effects/ScreenShake'
import { PARTICLE_PRESETS } from '../../lib/effects/particlePresets'

type PresetName = keyof typeof PARTICLE_PRESETS

interface EffectsContextValue {
  triggerParticles: (preset: PresetName, x?: number, y?: number) => void
  triggerShake: (intensity: number) => void
  particleSystem: ParticleSystem
  screenShake: ScreenShake
}

const EffectsContext = createContext<EffectsContextValue | null>(null)

export function EffectsProvider({ children }: { children: React.ReactNode }) {
  const particleSystemRef = useRef(new ParticleSystem())
  const screenShakeRef = useRef(new ScreenShake())

  const triggerParticles = useCallback((preset: PresetName, x?: number, y?: number) => {
    const config = PARTICLE_PRESETS[preset]
    const px = x ?? window.innerWidth / 2
    const py = y ?? window.innerHeight / 2
    particleSystemRef.current.emit(px, py, config)
  }, [])

  const triggerShake = useCallback((intensity: number) => {
    screenShakeRef.current.shake(intensity)
  }, [])

  return (
    <EffectsContext.Provider value={{
      triggerParticles,
      triggerShake,
      particleSystem: particleSystemRef.current,
      screenShake: screenShakeRef.current,
    }}>
      {children}
    </EffectsContext.Provider>
  )
}

export function useEffects() {
  const ctx = useContext(EffectsContext)
  if (!ctx) throw new Error('useEffects must be used within EffectsProvider')
  return ctx
}
