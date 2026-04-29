import type { EmitterConfig } from './ParticleSystem'
import { getCanvasTheme } from '../canvas/canvasTheme'

const theme = getCanvasTheme('light')

type PresetName = 'correctBurst' | 'wrongShake' | 'comboRise' | 'levelUpCelebration' | 'skillComplete' | 'chapterUnlock'

export const PARTICLE_PRESETS: Record<PresetName, EmitterConfig> = {
  correctBurst: {
    count: 12,
    spread: 0,
    speed: 4,
    size: [4, 8],
    life: [400, 700],
    colors: theme.particleSuccess,
    angleSpread: Math.PI * 0.6,
    angle: -Math.PI / 2,
  },
  wrongShake: {
    count: 6,
    spread: 0,
    speed: 3,
    size: [2, 5],
    life: [300, 500],
    colors: theme.particleError,
    angleSpread: Math.PI,
    angle: 0,
  },
  comboRise: {
    count: 15,
    spread: 0,
    speed: 3,
    size: [2, 6],
    life: [500, 900],
    colors: theme.particleSuccess,
    angleSpread: Math.PI * 0.4,
    angle: -Math.PI / 2,
  },
  levelUpCelebration: {
    count: 40,
    spread: 0,
    speed: 8,
    size: [4, 10],
    life: [600, 1200],
    colors: theme.particleLevelUp,
    angleSpread: Math.PI * 2,
    angle: 0,
  },
  skillComplete: {
    count: 50,
    spread: 0,
    speed: 7,
    size: [3, 8],
    life: [800, 1500],
    colors: [...theme.particleLevelUp, ...theme.particleSuccess],
    angleSpread: Math.PI * 1.5,
    angle: -Math.PI / 2,
  },
  chapterUnlock: {
    count: 30,
    spread: 0,
    speed: 5,
    size: [3, 7],
    life: [700, 1400],
    colors: [...theme.particleLevelUp, '#F59E0B'],
    angleSpread: Math.PI,
    angle: -Math.PI / 2,
  },
}
