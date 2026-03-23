import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'

export function NicknameInput({ onComplete }: { onComplete: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const setNickname = usePlayerStore(s => s.setNickname)
  const completeOpening = usePlayerStore(s => s.completeOpening)

  const handleConfirm = () => {
    if (!input.trim()) {
      setError('请输入你的昵称。')
      return
    }
    if (input.trim().length > 12) {
      setError('昵称长度不能超过 12 个字符。')
      return
    }
    setNickname(input.trim())
    completeOpening()
    onComplete()
  }

  return (
    <section className="opening-screen">
      <section className="opening-panel fade-up">
        <div className="step-layout">
          <div>
            <div className="eyebrow">第二步</div>
            <h2 className="hero-title" style={{ fontSize: 'clamp(34px, 5vw, 68px)' }}>
              为你的
              <span className="accent">冒险者命名</span>
            </h2>
            <p className="section-copy">你的昵称会显示在世界地图中，让这场音乐冒险真正属于你。</p>
          </div>
          <div>
            <input type="text" value={input} onChange={event => { setInput(event.target.value); setError('') }} onKeyDown={event => event.key === 'Enter' && handleConfirm()} placeholder="输入你的昵称..." maxLength={12} autoFocus className={`text-input${error ? ' is-error' : ''}`} />
            <p className={error ? 'error-text' : 'helper-text'} style={{ marginTop: '10px' }}>{error || '简短好记的昵称会更适合显示在地图和 HUD 中。'}</p>
          </div>
          <div className="step-actions"><button className="primary-button" onClick={handleConfirm}>进入世界 →</button></div>
        </div>
      </section>
    </section>
  )
}
