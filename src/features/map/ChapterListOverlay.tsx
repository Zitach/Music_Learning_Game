import { useState } from 'react'
import { CHAPTERS } from '../../data/chapters'
import { useProgressStore } from '../../stores/progressStore'

export function ChapterListOverlay({ onChapterClick }: { onChapterClick: (chapterId: string) => void }) {
  const isChapterUnlocked = useProgressStore(state => state.isChapterUnlocked)
  const [open, setOpen] = useState(false)

  return (
    <div className="chapter-overlay-shell">
      <button type="button" className="chapter-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        章节目录
      </button>
      {open && (
        <div className="chapter-list-overlay" aria-label="章节列表">
          {CHAPTERS.map(chapter => {
            const unlocked = isChapterUnlocked(chapter.id)
            return (
              <button
                key={chapter.id}
                type="button"
                className="chapter-list-item"
                onClick={() => onChapterClick(chapter.id)}
                disabled={!unlocked}
                aria-label={`${chapter.title}${unlocked ? '' : '（未解锁）'}`}
              >
                <span>{chapter.emoji} {chapter.title}</span>
                <small>{unlocked ? '进入' : '锁定'}</small>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
