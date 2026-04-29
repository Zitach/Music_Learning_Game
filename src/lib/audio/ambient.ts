/**
 * AmbientManager — manages background ambient audio.
 * Provides subtle looping pad sounds that change mood per chapter.
 */

import * as Tone from 'tone'

/** Ambient configuration per chapter */
interface ChapterAmbient {
  /** Base note for the pad chord */
  chord: string[]
  /** Volume offset (0 = normal, negative = quieter) */
  volumeDb: number
}

const CHAPTER_AMBIENTS: Record<string, ChapterAmbient> = {
  ch1: { chord: ['C3', 'E3', 'G3', 'B3'], volumeDb: -14 },  // Cmaj7 — bright
  ch2: { chord: ['F3', 'A3', 'C4'], volumeDb: -16 },         // Fmaj — steady pulse
  ch3: { chord: ['G3', 'B3', 'D4', 'F#4'], volumeDb: -14 }, // Gmaj7 — dreamy
  ch4: { chord: ['D3', 'F3', 'A3'], volumeDb: -14 },         // Dmin — mysterious
  ch5: { chord: ['A3', 'C4', 'E4', 'G4'], volumeDb: -15 },   // Am7 — reflective
  ch6: { chord: ['E3', 'G#3', 'B3', 'D#4'], volumeDb: -14 }, // Emaj7 — rich
  boss: { chord: ['C3', 'Eb3', 'G3'], volumeDb: -12 },       // Cmin — tense
  default: { chord: ['C3', 'E3', 'G3', 'B3'], volumeDb: -16 },
}

export class AmbientManager {
  private pad: Tone.PolySynth | null = null
  private volumeNode: Tone.Volume | null = null
  private filterNode: Tone.Filter | null = null
  private isPlaying = false
  private currentChapterId: string | null = null
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly masterVolume: Tone.Volume) {}

  /**
   * Start ambient pad for the given chapter.
   * If already playing the same chapter, does nothing.
   */
  startAmbient(chapterId?: string): void {
    const id = chapterId ?? 'default'

    // If same chapter already playing, skip
    if (this.isPlaying && this.currentChapterId === id) return

    // Stop current ambient first
    if (this.isPlaying) {
      this.stopAmbientImmediate()
    }

    const config = CHAPTER_AMBIENTS[id] ?? CHAPTER_AMBIENTS['default']

    // Create volume node connected to master
    this.volumeNode = new Tone.Volume(config.volumeDb).connect(this.masterVolume)

    // Create a soft pad synth with long attack/release
    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 1.5,
        decay: 0.5,
        sustain: 0.6,
        release: 2.0,
      },
    }).connect(this.volumeNode)

    // Apply a low-pass filter for warmth
    this.filterNode = new Tone.Filter(600, 'lowpass').connect(this.volumeNode)
    this.pad.disconnect(this.volumeNode)
    this.pad.connect(this.filterNode)

    // Trigger the chord as a sustained pad
    this.pad.triggerAttack(config.chord, Tone.now())

    this.isPlaying = true
    this.currentChapterId = id
  }

  /**
   * Fade out and stop ambient audio gracefully.
   */
  stopAmbient(): void {
    if (!this.isPlaying) return

    // Cancel any pending fade timeout from a previous stop
    if (this.fadeTimeout !== null) {
      clearTimeout(this.fadeTimeout)
      this.fadeTimeout = null
    }

    const pad = this.pad
    const vol = this.volumeNode
    const filter = this.filterNode

    if (pad && vol) {
      // Release the notes with a fade
      pad.triggerRelease(Tone.now())

      // Ramp volume down for smooth fade
      vol.volume.rampTo(-Infinity, 1.5)

      // Clean up after fade — capture references directly to avoid
      // race conditions with immediate stop/dispose
      this.fadeTimeout = setTimeout(() => {
        pad.dispose()
        filter?.dispose()
        vol.dispose()
      }, 2000)
    } else {
      this.disposeNodes()
    }

    this.isPlaying = false
    this.currentChapterId = null
  }

  /**
   * Set ambient volume (0-1 range, mapped to dB).
   */
  setAmbientVolume(volume: number): void {
    if (!this.volumeNode) return
    const dbValue = volume <= 0 ? -Infinity : Tone.gainToDb(volume)
    this.volumeNode.volume.rampTo(dbValue, 0.3)
  }

  /**
   * Immediately stop and clean up without fade.
   */
  public stopAmbientImmediate(): void {
    // Cancel any pending fade timeout
    if (this.fadeTimeout !== null) {
      clearTimeout(this.fadeTimeout)
      this.fadeTimeout = null
    }

    if (this.pad) {
      this.pad.triggerRelease(Tone.now())
    }
    this.disposeNodes()
    this.isPlaying = false
    this.currentChapterId = null
  }

  /**
   * Fully dispose all resources and stop ambient immediately.
   * Safe to call on hot-reload or navigation.
   */
  public dispose(): void {
    this.stopAmbientImmediate()
  }

  /**
   * Dispose Tone.js nodes and free resources.
   */
  private disposeNodes(): void {
    if (this.pad) {
      this.pad.dispose()
      this.pad = null
    }
    if (this.filterNode) {
      this.filterNode.dispose()
      this.filterNode = null
    }
    if (this.volumeNode) {
      this.volumeNode.dispose()
      this.volumeNode = null
    }
  }
}
