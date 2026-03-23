/**
 * Rhythm Input Handler Utility
 * Handles spacebar and click input for rhythm practice
 * Tracks timing of user inputs and calculates accuracy
 */

export type RhythmInputHandler = {
  onBeat: (callback: (timestamp: number) => void) => void
  onMiss: (callback: () => void) => void
  start: (bpm: number) => void
  stop: () => void
  getLastInputTime: () => number | null
  getTimingOffset: () => number | null  // difference from expected beat
}

type BeatCallback = (timestamp: number) => void
type MissCallback = () => void

// Accuracy thresholds in milliseconds
const PERFECT_THRESHOLD_MS = 50
const GOOD_THRESHOLD_MS = 100

/**
 * Creates a rhythm input handler for tracking user input timing
 * @returns RhythmInputHandler instance
 */
export function createRhythmInputHandler(): RhythmInputHandler {
  let beatInterval = 0
  let startTime = 0
  let isRunning = false
  let lastInputTime: number | null = null
  let lastTimingOffset: number | null = null

  let onBeatCallback: BeatCallback | null = null
  let onMissCallback: MissCallback | null = null

  // Track current beat number for expected time calculation
  let currentBeatNumber = 0

  /**
   * Calculate the expected time for a given beat number
   */
  const getExpectedBeatTime = (beatNumber: number): number => {
    return startTime + beatNumber * beatInterval
  }

  /**
   * Handle input event (spacebar or click)
   * Calculates timing offset and fires appropriate callback
   */
  const handleInput = (event: Event): void => {
    if (!isRunning) return

    const inputTime = performance.now()
    lastInputTime = inputTime

    // Calculate expected beat time for current beat
    const expectedTime = getExpectedBeatTime(currentBeatNumber)
    
    // Calculate offset: positive = late, negative = early
    const offset = inputTime - expectedTime
    lastTimingOffset = offset

    // Determine if hit or miss based on accuracy thresholds
    const absOffset = Math.abs(offset)
    
    if (absOffset <= PERFECT_THRESHOLD_MS || absOffset <= GOOD_THRESHOLD_MS) {
      // Hit - within good threshold
      if (onBeatCallback) {
        onBeatCallback(inputTime)
      }
    } else {
      // Miss - beyond good threshold
      if (onMissCallback) {
        onMissCallback()
      }
    }

    // Prevent default for spacebar to avoid page scroll
    if (event.type === 'keydown' && (event as KeyboardEvent).code === 'Space') {
      event.preventDefault()
    }
  }

  /**
   * Handle keydown event for spacebar
   */
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'Space' && !event.repeat) {
      handleInput(event)
    }
  }

  /**
   * Handle click event
   */
  const handleClick = (event: MouseEvent): void => {
    handleInput(event)
  }

  return {
    /**
     * Register callback for successful beat hits
     */
    onBeat(callback: BeatCallback): void {
      onBeatCallback = callback
    },

    /**
     * Register callback for misses
     */
    onMiss(callback: MissCallback): void {
      onMissCallback = callback
    },

    /**
     * Start listening for inputs at the specified BPM
     * @param bpm - Beats per minute
     */
    start(bpm: number): void {
      if (isRunning) return

      beatInterval = 60000 / bpm
      startTime = performance.now()
      currentBeatNumber = 0
      isRunning = true

      // Add event listeners
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('click', handleClick)
    },

    /**
     * Stop listening for inputs
     */
    stop(): void {
      if (!isRunning) return

      isRunning = false

      // Remove event listeners
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClick)
    },

    /**
     * Get the timestamp of the last input
     * @returns Timestamp in milliseconds or null if no input yet
     */
    getLastInputTime(): number | null {
      return lastInputTime
    },

    /**
     * Get the timing offset of the last input
     * @returns Offset in milliseconds or null if no input yet
     *          Positive = late, Negative = early
     */
    getTimingOffset(): number | null {
      return lastTimingOffset
    }
  }
}

/**
 * Calculate timing accuracy level from offset
 * @param offsetMs - Timing offset in milliseconds
 * @returns 'perfect' | 'good' | 'miss'
 */
export function getTimingAccuracy(offsetMs: number): 'perfect' | 'good' | 'miss' {
  const absOffset = Math.abs(offsetMs)
  
  if (absOffset <= PERFECT_THRESHOLD_MS) {
    return 'perfect'
  } else if (absOffset <= GOOD_THRESHOLD_MS) {
    return 'good'
  }
  return 'miss'
}

/**
 * Calculate beat interval from BPM
 * @param bpm - Beats per minute
 * @returns Beat interval in milliseconds
 */
export function getBeatInterval(bpm: number): number {
  return 60000 / bpm
}
