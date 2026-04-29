export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  alpha: number
}

export interface EmitterConfig {
  count: number
  spread: number
  speed: number
  size: [number, number]
  life: [number, number]
  colors: string[]
  gravity?: number
  angle?: number
  angleSpread?: number
}

export class ParticleSystem {
  particles: Particle[] = []
  private canvas: HTMLCanvasElement | null = null

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  emit(x: number, y: number, config: EmitterConfig) {
    const angle = config.angle ?? -Math.PI / 2
    const spread = config.angleSpread ?? Math.PI

    for (let i = 0; i < config.count; i++) {
      const a = angle + (Math.random() - 0.5) * spread
      const s = config.speed * (0.6 + Math.random() * 0.8)
      const life = config.life[0] + Math.random() * (config.life[1] - config.life[0])
      const size = config.size[0] + Math.random() * (config.size[1] - config.size[0])

      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life,
        maxLife: life,
        size,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        alpha: 1,
      })
    }
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life -= dt
      if (p.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }
      p.vy += (0.0003) * dt // gravity-like
      p.x += p.vx * (dt / 16)
      p.y += p.vy * (dt / 16)
      p.alpha = Math.max(0, p.life / p.maxLife)
    }
  }

  draw() {
    if (!this.canvas) return
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      // Star shape for visual appeal
      const spikes = 4
      const outerR = p.size
      const innerR = p.size * 0.4
      let rot = (p.x + p.y) * 0.1
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR
        const angle = (i * Math.PI) / spikes + rot
        const sx = p.x + Math.cos(angle) * r
        const sy = p.y + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }
}
