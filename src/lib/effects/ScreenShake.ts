export class ScreenShake {
  private intensity = 0
  private duration = 0
  private elapsed = 0
  private offsetX = 0
  private offsetY = 0

  shake(intensity: number, duration = 300) {
    this.intensity = Math.max(this.intensity, intensity)
    this.duration = Math.max(this.duration, duration)
    this.elapsed = 0
  }

  update(dt: number) {
    if (this.elapsed >= this.duration) {
      this.intensity = 0
      this.offsetX = 0
      this.offsetY = 0
      return
    }

    this.elapsed += dt
    const decay = 1 - this.elapsed / this.duration
    const currentIntensity = this.intensity * decay
    this.offsetX = (Math.random() - 0.5) * currentIntensity * 2
    this.offsetY = (Math.random() - 0.5) * currentIntensity * 2
  }

  getOffset(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY }
  }

  get isActive(): boolean {
    return this.elapsed < this.duration
  }
}
