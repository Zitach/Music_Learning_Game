import { useEffect, useState } from 'react'
import { audioEngine } from './Engine'

export interface AudioPolicyState {
  initialized: boolean
  initError: string | null
}

export function useAudioPolicy() {
  const [state, setState] = useState<AudioPolicyState>({ initialized: audioEngine.getLoaded(), initError: null })

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (audioEngine.getLoaded()) {
        if (mounted) setState({ initialized: true, initError: null })
        return
      }
      try {
        await audioEngine.load()
        if (mounted) setState({ initialized: true, initError: null })
      } catch (error) {
        if (mounted) setState({ initialized: false, initError: error instanceof Error ? error.message : '音频初始化失败' })
      }
    }
    void init()
    return () => {
      mounted = false
    }
  }, [])

  return state
}
