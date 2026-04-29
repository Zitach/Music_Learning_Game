export interface CanvasTheme {
  bg: string
  bgGradient: string[]
  nodeDefault: string
  nodeCurrent: string
  nodeLocked: string
  nodeCompleted: string
  nodeText: string
  nodeBorder: string
  pathDefault: string
  pathActive: string
  pianoWhiteKey: string
  pianoBlackKey: string
  pianoKeyLabel: string
  pianoHighlight: string
  pianoBackground: string
  staffLine: string
  staffNote: string
  staffNoteHighlight: string
  staffBackground: string
  metronomeActive: string
  metronomeInactive: string
  success: string
  error: string
  warning: string
  text: string
  textMuted: string
  particleSuccess: string[]
  particleError: string[]
  particleLevelUp: string[]
}

export function getCanvasTheme(theme: 'light' | 'dark'): CanvasTheme {
  if (theme === 'light') {
    return {
      bg: '#FFFFFF',
      bgGradient: ['#FFFFFF', '#F8F5FF'],
      nodeDefault: '#8B5CF6',
      nodeCurrent: '#7C3AED',
      nodeLocked: '#D1D5DB',
      nodeCompleted: '#10B981',
      nodeText: '#374151',
      nodeBorder: '#E5E7EB',
      pathDefault: 'rgba(200, 192, 176, 0.5)',
      pathActive: '#a0c0a0',
      pianoWhiteKey: '#f8f8f8',
      pianoBlackKey: '#1a1a1a',
      pianoKeyLabel: '#374151',
      pianoHighlight: '#22c55e',
      pianoBackground: '#FFFFFF',
      staffLine: '#D1D5DB',
      staffNote: '#374151',
      staffNoteHighlight: '#8B5CF6',
      staffBackground: '#FFFFFF',
      metronomeActive: '#8B5CF6',
      metronomeInactive: '#D1D5DB',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      text: '#111827',
      textMuted: '#6B7280',
      particleSuccess: ['#7ce0c3', '#aef8e1', '#f8d27a', '#ffffff'],
      particleError: ['#ff8f8f', '#ff6b6b', '#ffaaaa'],
      particleLevelUp: ['#f8d27a', '#7ce0c3', '#8e7dff', '#ff8f8f', '#ffffff', '#aef8e1'],
    }
  }

  return {
    bg: '#0F0A1E',
    bgGradient: ['#0F0A1E', '#1A1033'],
    nodeDefault: '#A78BFA',
    nodeCurrent: '#8B5CF6',
    nodeLocked: '#4B5563',
    nodeCompleted: '#34D399',
    nodeText: '#E5E7EB',
    nodeBorder: '#374151',
    pathDefault: 'rgba(100, 90, 120, 0.5)',
    pathActive: '#6B8E6B',
    pianoWhiteKey: '#E5E7EB',
    pianoBlackKey: '#111827',
    pianoKeyLabel: '#E5E7EB',
    pianoHighlight: '#34D399',
    pianoBackground: '#0F0A1E',
    staffLine: '#4B5563',
    staffNote: '#E5E7EB',
    staffNoteHighlight: '#A78BFA',
    staffBackground: '#0F0A1E',
    metronomeActive: '#A78BFA',
    metronomeInactive: '#4B5563',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    text: '#F9FAFB',
    textMuted: '#9CA3AF',
    particleSuccess: ['#7ce0c3', '#aef8e1', '#f8d27a', '#ffffff'],
    particleError: ['#ff8f8f', '#ff6b6b', '#ffaaaa'],
    particleLevelUp: ['#f8d27a', '#7ce0c3', '#8e7dff', '#ff8f8f', '#ffffff', '#aef8e1'],
  }
}
