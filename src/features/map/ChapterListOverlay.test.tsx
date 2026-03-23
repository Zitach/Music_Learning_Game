import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ChapterListOverlay } from './ChapterListOverlay'

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: (selector: (state: { isChapterUnlocked: (chapterId: string) => boolean }) => unknown) => selector({
    isChapterUnlocked: (chapterId: string) => chapterId === 'ch1',
  }),
}))

describe('ChapterListOverlay', () => {
  test('keeps chapter list collapsed by default and toggles open', () => {
    render(<ChapterListOverlay onChapterClick={() => undefined} />)
    expect(screen.queryByRole('button', { name: /十二音阶塔/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /章节目录/i }))
    expect(screen.getByRole('button', { name: /十二音阶塔/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /拍子河流/i })).toBeDisabled()
  })
})
