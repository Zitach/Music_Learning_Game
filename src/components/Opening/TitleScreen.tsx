export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="opening-screen">
      <section className="opening-panel fade-up">
        <div className="staff-lines" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => <span key={index} />)}
        </div>

        <div className="hero-grid">
          <div>
            <div className="eyebrow">互动音乐冒险</div>
            <h1 className="hero-title">
              像踏上史诗旅程一样
              <span className="accent">学习音乐理论</span>
            </h1>
            <p className="hero-copy">
              从节奏、音名、和声到听辨，像游戏一样逐步推进，让乐理学习既沉浸又富有成就感。
            </p>

            <div className="hero-actions">
              <button className="primary-button" onClick={onStart}>
                开始冒险 →
              </button>
              <button className="secondary-button" type="button">
                聆听旅程序曲
              </button>
            </div>

            <div className="feature-list">
              <div className="feature-item"><span className="feature-bullet">♪</span><span>章节式推进，学习路径更清晰</span></div>
              <div className="feature-item"><span className="feature-bullet">✦</span><span>更有舞台感的光影层次与通透质感</span></div>
              <div className="feature-item"><span className="feature-bullet">↺</span><span>更顺滑的按钮反馈与更柔和的过渡动画</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="vinyl" />
            <div className="note-trail" style={{ top: '14%', left: '18%' }}>♪</div>
            <div className="note-trail" style={{ top: '20%', right: '18%', animationDelay: '-1.5s' }}>♫</div>
            <div className="note-trail" style={{ bottom: '18%', left: '24%', animationDelay: '-3s' }}>♬</div>
            <div className="hero-badge" style={{ top: '10%', right: '10%' }}><strong>节奏</strong><span>感受律动脉搏</span></div>
            <div className="hero-badge" style={{ bottom: '12%', left: '10%' }}><strong>和声</strong><span>建立音乐直觉</span></div>
          </div>
        </div>
      </section>
    </section>
  )
}
