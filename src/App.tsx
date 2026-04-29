import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { AppRouter } from './app/AppRouter'
import { AppShell } from './app/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { appReducer, createInitialAppUiState } from './app/appReducer'
import { usePlayerStore } from './stores/playerStore'
import { useProgressStore } from './stores/progressStore'
import { audioEngine } from './lib/audio/Engine'
import { useAudioPolicy } from './lib/audio/audioPolicy'
import { useStreakStore } from './domain/streaks/streakTracker'
import type { TransitionStyle } from './lib/ui/transitions'

export default function App() {
  const hasCompletedOpening = usePlayerStore(state => state.hasCompletedOpening)
  const nickname = usePlayerStore(state => state.nickname)
  const level = usePlayerStore(state => state.level)
  const isChapterUnlocked = useProgressStore(state => state.isChapterUnlocked)
  const checkIn = useStreakStore(state => state.checkIn)
  const { initError } = useAudioPolicy()
  const [state, dispatch] = useReducer(appReducer, hasCompletedOpening, createInitialAppUiState)
  const previousLevelRef = useRef(level)

  useEffect(() => {
    checkIn()
  }, [checkIn])

  useEffect(() => {
    if (hasCompletedOpening && state.screen === 'audio-gate') {
      dispatch({ type: 'audioGateDismissed' })
      dispatch({ type: 'nicknameDone' })
    }
  }, [hasCompletedOpening, state.screen])

  useEffect(() => {
    if (!state.mapMessage) return
    const timer = window.setTimeout(() => dispatch({ type: 'clearMapMessage' }), 2200)
    return () => window.clearTimeout(timer)
  }, [state.mapMessage])

  useEffect(() => {
    if (level > previousLevelRef.current) {
      audioEngine.playUiLevelUp()
      dispatch({ type: 'showTransition', label: `等级提升 · LV ${level}`, style: 'levelUp' })
    }
    previousLevelRef.current = level
  }, [level])

  const showTransition = useCallback((label: string, style?: TransitionStyle) => {
    dispatch({ type: 'showTransition', label, style })
  }, [])

  const clearTransition = useCallback(() => {
    dispatch({ type: 'clearTransition' })
  }, [])

  const handleDismissAudioGate = useCallback(() => {
    audioEngine.playUiConfirm()
    dispatch({ type: 'audioGateDismissed' })
  }, [])

  const handleTitleStart = useCallback(() => {
    audioEngine.playUiConfirm()
    showTransition('旅程开始', 'fade')
    dispatch({ type: 'startOpening' })
  }, [showTransition])

  const handleDemoDone = useCallback(() => {
    audioEngine.playUiConfirm()
    showTransition('选择你的乐器', 'fade')
    dispatch({ type: 'demoDone' })
  }, [showTransition])

  const handleInstrumentNext = useCallback(() => {
    audioEngine.playUiConfirm()
    showTransition('选择乐器', 'banner')
    dispatch({ type: 'selectInstrumentDone' })
  }, [showTransition])

  const handleNicknameComplete = useCallback(() => {
    audioEngine.playUiSuccess()
    showTransition('进入音乐世界', 'fade')
    dispatch({ type: 'nicknameDone' })
  }, [showTransition])

  const handleChapterClick = useCallback((chapterId: string) => {
    if (!isChapterUnlocked(chapterId)) {
      audioEngine.playUiCancel()
      dispatch({ type: 'showMapMessage', message: '该章节尚未解锁，请先完成前面的课程。' })
      return
    }
    audioEngine.playUiConfirm()
    showTransition('进入章节', 'banner')
    dispatch({ type: 'chapterSelected', chapterId })
  }, [isChapterUnlocked, showTransition])

  const handleBackToMap = useCallback(() => {
    audioEngine.playUiConfirm()
    showTransition('返回地图', 'banner')
    dispatch({ type: 'chapterBack' })
  }, [showTransition])

  const showHud = useMemo(() => state.screen === 'map' || state.screen === 'chapter', [state.screen])

  return (
    <ErrorBoundary>
      <AppShell
        showHud={showHud}
        transitionLabel={state.transitionLabel}
        transitionStyle={state.transitionStyle}
        onTransitionDismiss={clearTransition}
      >
        <AppRouter
          screen={state.screen}
          selectedChapterId={state.selectedChapterId}
          nickname={nickname}
          level={level}
          mapMessage={state.mapMessage}
          initError={initError}
          onDismissAudioGate={handleDismissAudioGate}
          onTitleStart={handleTitleStart}
          onDemoDone={handleDemoDone}
          onInstrumentNext={handleInstrumentNext}
          onNicknameComplete={handleNicknameComplete}
          onChapterClick={handleChapterClick}
          onBackToMap={handleBackToMap}
        />
      </AppShell>
    </ErrorBoundary>
  )
}
