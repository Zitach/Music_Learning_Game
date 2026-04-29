import { ChapterDefinition, SkillDefinition, DEFAULT_SKILL_FLOW } from '../skills/skillTypes'

export type Skill = SkillDefinition
export type Chapter = ChapterDefinition
export type SkillId = string

const withFlow = (skill: Omit<SkillDefinition, 'flow'>): SkillDefinition => ({ ...skill, flow: DEFAULT_SKILL_FLOW })

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    title: '十二音阶塔',
    emoji: '🎼',
    color: '#7C5CE0',
    position: { x: 0.5, y: 0.80 },
    skills: [
      withFlow({ id: 'ch1-s1', title: '认识音名', description: '认识 C D E F G A B', chapterId: 'ch1', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'note-names' }),
      withFlow({ id: 'ch1-s2', title: '全音与半音', description: '理解音高之间的距离', chapterId: 'ch1', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'note-names' }),
      withFlow({ id: 'ch1-s3', title: '升降号与黑键', description: '#、b 与十二平均律', chapterId: 'ch1', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'note-names' }),
    ],
  },
  {
    id: 'ch2',
    title: '拍子河流',
    emoji: '🥁',
    color: '#3B82F6',
    position: { x: 0.34, y: 0.66 },
    skills: [
      withFlow({ id: 'ch2-s1', title: '音符时值', description: '四分、二分、全音符', chapterId: 'ch2', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'rhythm' }),
      withFlow({ id: 'ch2-s2', title: '休止符', description: '无声的节奏单位', chapterId: 'ch2', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'rhythm' }),
      withFlow({ id: 'ch2-s3', title: '常见拍号', description: '2/4、3/4、4/4、6/8', chapterId: 'ch2', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'rhythm' }),
      withFlow({ id: 'ch2-s4', title: '打拍子', description: '跟随节奏练习', chapterId: 'ch2', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'rhythm' }),
    ],
  },
  {
    id: 'ch3',
    title: '五线谱星空',
    emoji: '🎵',
    color: '#8B5CF6',
    position: { x: 0.5, y: 0.54 },
    skills: [
      withFlow({ id: 'ch3-s1', title: '简谱基础', description: '数字简谱入门', chapterId: 'ch3', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'staff-reading' }),
      withFlow({ id: 'ch3-s2', title: '五线谱入门', description: '高音谱号与低音谱号', chapterId: 'ch3', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'staff-reading' }),
    ],
  },
  {
    id: 'ch4',
    title: '调式山脉',
    emoji: '🏔️',
    color: '#10B981',
    position: { x: 0.66, y: 0.42 },
    skills: [
      withFlow({ id: 'ch4-s1', title: '大调音阶', description: '全全半全全全半', chapterId: 'ch4', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'scales' }),
      withFlow({ id: 'ch4-s2', title: '自然小调', description: '关系大小调', chapterId: 'ch4', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'scales' }),
      withFlow({ id: 'ch4-s3', title: '常用调号', description: 'G、F、bB 等调号', chapterId: 'ch4', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'scales' }),
    ],
  },
  {
    id: 'ch5',
    title: '音程回廊',
    emoji: '🎯',
    color: '#6366F1',
    position: { x: 0.34, y: 0.28 },
    skills: [
      withFlow({ id: 'ch5-s1', title: '二度到八度', description: '音程的距离', chapterId: 'ch5', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'ear-training' }),
      withFlow({ id: 'ch5-s2', title: '协和与不协和', description: '音程的色彩', chapterId: 'ch5', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'ear-training' }),
      withFlow({ id: 'ch5-s3', title: '音程转位', description: '转位的规律', chapterId: 'ch5', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'ear-training' }),
    ],
  },
  {
    id: 'ch6',
    title: '和弦圣殿',
    emoji: '🏛️',
    color: '#A855F7',
    position: { x: 0.66, y: 0.28 },
    skills: [
      withFlow({ id: 'ch6-s1', title: '三和弦', description: '大三、小三、增三、减三', chapterId: 'ch6', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'ear-training' }),
      withFlow({ id: 'ch6-s2', title: '七和弦', description: '属七、大七、小七、半减七', chapterId: 'ch6', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'ear-training' }),
      withFlow({ id: 'ch6-s3', title: '和弦标记', description: 'C、Am、Fmaj7、G7', chapterId: 'ch6', practiceCount: 5, assessmentCount: 3, starsToPass: 1, practiceVariant: 'progressions' }),
    ],
  },
  {
    id: 'boss',
    title: '终章',
    emoji: '👑',
    color: '#F59E0B',
    position: { x: 0.5, y: 0.12 },
    skills: [
      withFlow({ id: 'boss-final', title: '乐理大师', description: '综合听辨考核', chapterId: 'boss', practiceCount: 0, assessmentCount: 1, starsToPass: 1, practiceVariant: 'note-names' }),
    ],
  },
]

export const SKILL_MAP: Record<SkillId, Skill> = CHAPTERS.flatMap(chapter => chapter.skills).reduce((accumulator, skill) => {
  accumulator[skill.id] = skill
  return accumulator
}, {} as Record<SkillId, Skill>)

export function getNextSkill(currentSkillId: string): Skill | null {
  const allSkills = CHAPTERS.flatMap(chapter => chapter.skills)
  const index = allSkills.findIndex(skill => skill.id === currentSkillId)
  return index >= 0 && index < allSkills.length - 1 ? allSkills[index + 1] : null
}
