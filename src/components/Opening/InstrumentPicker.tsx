import { usePlayerStore, Instrument } from '../../stores/playerStore'
import { audioEngine } from '../../lib/audio/Engine'

const INSTRUMENTS: { id: Instrument; emoji: string; label: string; description: string }[] = [
  { id: 'piano', emoji: '🎹', label: '钢琴', description: '音高关系更清晰，适合经典乐理学习。' },
  { id: 'guitar', emoji: '🎸', label: '吉他', description: '更温暖、更有旋律感的冒险氛围。' },
  { id: 'ukulele', emoji: '🪕', label: '尤克里里', description: '轻快、明亮，带一点俏皮的探索感。' },
]

export function InstrumentPicker({ onNext }: { onNext: () => void }) {
  const instrument = usePlayerStore(s => s.instrument)
  const setInstrument = usePlayerStore(s => s.setInstrument)

  return (
    <section className="opening-screen">
      <section className="opening-panel fade-up">
        <div className="step-layout">
          <div>
            <div className="eyebrow">第一步</div>
            <h2 className="hero-title" style={{ fontSize: 'clamp(34px, 5vw, 68px)' }}>
              选择你的
              <span className="accent">乐器风格</span>
            </h2>
            <p className="section-copy">选择最适合你旅程气质的乐器形象。它不会改变课程内容，但会决定冒险开始时的氛围。</p>
          </div>
          <div className="choice-grid">
            {INSTRUMENTS.map(({ id, emoji, label, description }) => (
              <button key={id} type="button" className={`choice-card${instrument === id ? ' is-selected' : ''}`} onClick={() => { setInstrument(id); audioEngine.playUiConfirm() }}>
                <div><div className="choice-emoji">{emoji}</div><div className="choice-title">{label}</div><div className="choice-copy">{description}</div></div>
              </button>
            ))}
          </div>
          <div className="step-actions"><button className="primary-button" onClick={instrument ? onNext : undefined} disabled={!instrument}>继续前进 →</button></div>
        </div>
      </section>
    </section>
  )
}
