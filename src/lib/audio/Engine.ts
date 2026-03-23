import * as Tone from 'tone'

export class AudioEngine {
  private synth: Tone.Synth | null = null
  private metronome: Tone.MembraneSynth | null = null
  private volume: Tone.Volume | null = null
  private uiSynth: Tone.PolySynth | null = null
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

      this.loaded = true
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
      throw error
    }
  }

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

  getLoaded(): boolean {
    return this.loaded
  }
}

export const audioEngine = new AudioEngine()
