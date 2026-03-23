import { CHAPTERS } from '../../data/chapters'

// Connection edges: [fromChapterId, toChapterId]
export const MAP_EDGES: [string, string][] = [
  [CHAPTERS[0].id, CHAPTERS[1].id],  // ch1 → ch2
  [CHAPTERS[1].id, CHAPTERS[2].id],  // ch2 → ch3
  [CHAPTERS[2].id, CHAPTERS[3].id],  // ch3 → ch4
  [CHAPTERS[3].id, CHAPTERS[4].id],  // ch4 → ch5
  [CHAPTERS[3].id, CHAPTERS[5].id],  // ch4 → ch6 (branch)
  [CHAPTERS[4].id, CHAPTERS[6].id],  // ch5 → boss
  [CHAPTERS[5].id, CHAPTERS[6].id], // ch6 → boss
]

export const MAP_WIDTH = 900
export const MAP_HEIGHT = 700
export const NODE_RADIUS = 38
