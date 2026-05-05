import * as Tone from 'tone'

export class AudioEngine {
  private synth: Tone.Synth | null = null
  private metronome: Tone.MembraneSynth | null = null
  private volume: Tone.Volume | null = null
  private uiSynth: Tone.PolySynth | null = null
  private padSynth: Tone.PolySynth | null = null
  private lowSynth: Tone.Synth | null = null
  private loaded = false

  async load(): Promise<void> {
    if (this.loaded) return

    try {
      await Tone.start()
      this.volume = new Tone.Volume(-6).toDestination()

      this.synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 },
      }).connect(this.volume)

      this.metronome = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
      }).connect(this.volume)

      this.uiSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.08, sustain: 0.1, release: 0.25 },
      }).connect(this.volume)

      // Rich pad synth for chords and fanfares
      this.padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.08,
          decay: 0.2,
          sustain: 0.5,
          release: 1.0,
        },
      }).connect(this.volume)

      // Low-frequency synth for warning pulses
      this.lowSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.1,
          release: 0.3,
        },
      }).connect(this.volume)

      this.loaded = true
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
      throw error
    }
  }

  // ─── Existing methods (unchanged) ──────────────────────────────────────────

  playNote(note: string, duration: string = '8n'): void {
    if (!this.synth) return
    this.synth.triggerAttackRelease(note, duration)
  }

  playMetronome(): void {
    if (!this.metronome) return
    this.metronome.triggerAttackRelease('C2', '16n')
  }

  playUiConfirm(): void {
    if (!this.uiSynth) return
    this.uiSynth.triggerAttackRelease(['C5', 'E5'], '16n')
  }

  playUiCancel(): void {
    if (!this.uiSynth) return
    this.uiSynth.triggerAttackRelease(['A3', 'F3'], '16n')
  }

  playUiSuccess(): void {
    if (!this.uiSynth) return
    this.uiSynth.triggerAttackRelease(['C5', 'E5', 'G5'], '8n')
  }

  playUiLevelUp(): void {
    if (!this.uiSynth) return
    const now = Tone.now()
    this.uiSynth.triggerAttackRelease('C5', '16n', now)
    this.uiSynth.triggerAttackRelease('E5', '16n', now + 0.08)
    this.uiSynth.triggerAttackRelease('A5', '8n', now + 0.16)
  }

  setVolume(volume: number): void {
    if (!this.volume) return
    const dbValue = volume <= 0 ? -Infinity : Tone.gainToDb(volume)
    this.volume.volume.value = dbValue
  }

  /**
   * Dispose all Tone.js nodes and reset loaded state.
   * Safe to call on hot-reload or navigation.
   */
  dispose(): void {
    if (this.synth) { this.synth.dispose(); this.synth = null }
    if (this.metronome) { this.metronome.dispose(); this.metronome = null }
    if (this.uiSynth) { this.uiSynth.dispose(); this.uiSynth = null }
    if (this.padSynth) { this.padSynth.dispose(); this.padSynth = null }
    if (this.lowSynth) { this.lowSynth.dispose(); this.lowSynth = null }
    if (this.volume) { this.volume.dispose(); this.volume = null }
    this.loaded = false
  }

  getLoaded(): boolean {
    return this.loaded
  }

  // ─── New methods (additive, backward compatible) ────────────────────────────

  /**
   * Play two notes separated by the given interval (in semitones).
   * Plays the root first, then the root + semitones.
   */
  playInterval(root: string, semitones: number, duration: string = '8n'): void {
    if (!this.synth) return
    const now = Tone.now()
    const rootFreq = Tone.Frequency(root).toFrequency()
    const intervalFreq = rootFreq * Math.pow(2, semitones / 12)
    this.synth.triggerAttackRelease(rootFreq, duration, now)
    this.synth.triggerAttackRelease(intervalFreq, duration, now + 0.5)
  }

  /**
   * Play multiple notes simultaneously as a chord.
   */
  playChord(notes: string[], duration: string = '4n'): void {
    if (!this.uiSynth) return
    this.uiSynth.triggerAttackRelease(notes, duration)
  }

  /**
   * Play a sequence of chords (e.g., I-IV-V-I) at the given BPM.
   * Uses Tone.Transport for precise rhythmic scheduling.
   */
  playProgression(chords: string[][], bpm: number): void {
    const uiSynth = this.uiSynth
    if (!uiSynth || chords.length === 0) return

    const beatDuration = 60 / bpm
    const totalDuration = chords.length * beatDuration

    // Save current Transport state before hijacking it
    const prevBpm = Tone.Transport.bpm.value
    const prevPosition = Tone.Transport.position
    const wasPlaying = Tone.Transport.state === 'started'

    // Stop transport if running to reset position
    if (wasPlaying) {
      Tone.Transport.stop()
    }

    Tone.Transport.position = 0
    Tone.Transport.bpm.value = bpm

    const eventIds: number[] = []

    chords.forEach((chord, i) => {
      const id = Tone.Transport.schedule((time) => {
        uiSynth.triggerAttackRelease(chord, `${beatDuration * 0.9}s`, time)
      }, i * beatDuration)
      eventIds.push(id)
    })

    // Schedule cleanup after all chords have played, then restore previous state
    const cleanupId = Tone.Transport.schedule(() => {
      eventIds.forEach(id => Tone.Transport.clear(id))
      Tone.Transport.clear(cleanupId)
      Tone.Transport.stop()
      // Restore previous Transport state
      Tone.Transport.bpm.value = prevBpm
      Tone.Transport.position = prevPosition
      if (wasPlaying) {
        Tone.Transport.start()
      }
    }, totalDuration + 0.1)

    Tone.Transport.start()
  }

  /**
   * Bright ascending major arpeggio for correct answers.
   * Plays C5 - E5 - G5 - C6.
   */
  playAnswerCorrect(): void {
    if (!this.uiSynth) return
    const now = Tone.now()
    this.uiSynth.triggerAttackRelease('C5', '16n', now)
    this.uiSynth.triggerAttackRelease('E5', '16n', now + 0.08)
    this.uiSynth.triggerAttackRelease('G5', '16n', now + 0.16)
    this.uiSynth.triggerAttackRelease('C6', '8n', now + 0.24)
  }

  /**
   * Dissonant buzz for wrong answers.
   * Plays C3 and C#3 together briefly.
   */
  playAnswerWrong(): void {
    if (!this.uiSynth) return
    this.uiSynth.triggerAttackRelease(['C3', 'C#3'], '8n')
  }

  /**
   * Ascending arpeggio that gets higher with higher combo streaks.
   * The base pitch rises by one octave for every 5 combo.
   */
  playComboMilestone(combo: number): void {
    const uiSynth = this.uiSynth
    if (!uiSynth) return

    const octaveShift = Math.floor(combo / 5)
    const baseOctave = 4 + octaveShift
    const baseFreq = Tone.Frequency(`C${baseOctave}`).toFrequency()
    const now = Tone.now()

    // Major arpeggio: root, major third, fifth, octave
    const intervals = [0, 4, 7, 12]

    intervals.forEach((interval, i) => {
      const note = baseFreq * Math.pow(2, interval / 12)
      uiSynth.triggerAttackRelease(note, '32n', now + i * 0.06)
    })
  }

  /**
   * Triumphant fanfare for completing a chapter.
   * I - IV - V - I progression in C major with rich pad chords.
   */
  playChapterComplete(): void {
    const padSynth = this.padSynth
    if (!padSynth) return
    const now = Tone.now()

    const chords = [
      ['C4', 'E4', 'G4', 'C5'],
      ['F4', 'A4', 'C5', 'F5'],
      ['G4', 'B4', 'D5', 'G5'],
      ['C4', 'E4', 'G4', 'C5'],
    ]

    chords.forEach((chord, i) => {
      padSynth.triggerAttackRelease(chord, '2n', now + i * 0.6)
    })

    // Final resolution — sustained tonic
    padSynth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '1n', now + chords.length * 0.6)
  }

  /**
   * Subtle low-frequency pulse to warn the player when lives are low.
   * Produces a slow heartbeat-like thump at C2.
   */
  playLowLives(): void {
    if (!this.lowSynth) return
    const now = Tone.now()

    for (let i = 0; i < 3; i++) {
      this.lowSynth.triggerAttackRelease('C2', '8n', now + i * 0.85, 0.35)
    }
  }

  fadeOutAll(duration: number = 0.3): void {
    if (!this.volume) return
    this.volume.volume.cancelScheduledValues(Tone.now())
    this.volume.volume.rampTo(-Infinity, duration)
    setTimeout(() => {
      if (this.volume) this.volume.volume.value = -6
    }, duration * 1000 + 100)
  }

  resetVolume(): void {
    if (!this.volume) return
    this.volume.volume.cancelScheduledValues(Tone.now())
    this.volume.volume.value = -6
  }

  /**
   * Get the master Volume node, for connecting external audio chains
   * (e.g., the AmbientManager).
   */
  getVolume(): Tone.Volume | null {
    return this.volume
  }
}

export const audioEngine = new AudioEngine()
