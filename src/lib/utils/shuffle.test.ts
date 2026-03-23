import { describe, expect, test } from 'vitest'
import { shuffleItems } from './shuffle'

describe('shuffleItems', () => {
  test('keeps same elements and length', () => {
    const items = [1, 2, 3, 4, 5]
    const shuffled = shuffleItems(items)
    expect(shuffled).toHaveLength(items.length)
    expect([...shuffled].sort()).toEqual([...items].sort())
  })
})

