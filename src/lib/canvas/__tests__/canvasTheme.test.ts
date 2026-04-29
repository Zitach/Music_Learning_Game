import { describe, it, expect } from 'vitest'
import { getCanvasTheme, type CanvasTheme } from '../canvasTheme'

const REQUIRED_FIELDS: (keyof CanvasTheme)[] = [
  'bg',
  'bgGradient',
  'nodeDefault',
  'nodeCurrent',
  'nodeLocked',
  'nodeCompleted',
  'nodeText',
  'nodeBorder',
  'pathDefault',
  'pathActive',
  'pianoWhiteKey',
  'pianoBlackKey',
  'pianoKeyLabel',
  'pianoHighlight',
  'pianoBackground',
  'staffLine',
  'staffNote',
  'staffNoteHighlight',
  'staffBackground',
  'metronomeActive',
  'metronomeInactive',
  'success',
  'error',
  'warning',
  'text',
  'textMuted',
  'particleSuccess',
  'particleError',
  'particleLevelUp',
]

function isValidColor(value: string): boolean {
  if (typeof value !== 'string') return false
  const hex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
  const rgb = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/
  return hex.test(value) || rgb.test(value)
}

function isValidColorArray(arr: string[]): boolean {
  return Array.isArray(arr) && arr.length > 0 && arr.every(isValidColor)
}

describe('getCanvasTheme', () => {
  it('returns all required fields for light theme', () => {
    const theme = getCanvasTheme('light')
    for (const field of REQUIRED_FIELDS) {
      expect(theme[field]).toBeDefined()
    }
  })

  it('returns all required fields for dark theme', () => {
    const theme = getCanvasTheme('dark')
    for (const field of REQUIRED_FIELDS) {
      expect(theme[field]).toBeDefined()
    }
  })

  it('light and dark themes have different values', () => {
    const light = getCanvasTheme('light')
    const dark = getCanvasTheme('dark')
    expect(light.bg).not.toBe(dark.bg)
    expect(light.nodeDefault).not.toBe(dark.nodeDefault)
    expect(light.text).not.toBe(dark.text)
  })

  it('all color values in light theme are valid CSS colors', () => {
    const theme = getCanvasTheme('light')
    for (const field of REQUIRED_FIELDS) {
      const value = theme[field]
      if (field.startsWith('particle')) {
        expect(isValidColorArray(value as string[])).toBe(true)
      } else if (field === 'bgGradient') {
        expect(isValidColorArray(value as string[])).toBe(true)
      } else {
        expect(isValidColor(value as string)).toBe(true)
      }
    }
  })

  it('all color values in dark theme are valid CSS colors', () => {
    const theme = getCanvasTheme('dark')
    for (const field of REQUIRED_FIELDS) {
      const value = theme[field]
      if (field.startsWith('particle')) {
        expect(isValidColorArray(value as string[])).toBe(true)
      } else if (field === 'bgGradient') {
        expect(isValidColorArray(value as string[])).toBe(true)
      } else {
        expect(isValidColor(value as string)).toBe(true)
      }
    }
  })
})
