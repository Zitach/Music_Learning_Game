import { describe, expect, test } from 'vitest'
import { CHAPTERS, getNextSkill, SKILL_MAP } from './chapters'

describe('chapters', () => {
  test('assigns default flow to skills', () => {
    expect(CHAPTERS[0].skills[0].flow.map(step => step.type)).toEqual(['learn', 'practice', 'assessment'])
  })

  test('returns next skill and unique skill ids', () => {
    expect(getNextSkill('ch1-s1')?.id).toBe('ch1-s2')
    expect(new Set(Object.keys(SKILL_MAP)).size).toBe(Object.keys(SKILL_MAP).length)
  })
})
