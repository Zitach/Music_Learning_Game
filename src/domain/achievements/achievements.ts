import type { Achievement } from './achievementTypes'

export const ACHIEVEMENTS: Achievement[] = [
  // Chapter completion
  { id: 'complete-ch1', title: '音阶学徒', description: '完成第一章：十二音阶塔', icon: '🎼', category: 'chapter' },
  { id: 'complete-ch2', title: '节奏大师', description: '完成第二章：拍子河流', icon: '🥁', category: 'chapter' },
  { id: 'complete-ch3', title: '星空读者', description: '完成第三章：五线谱星空', icon: '🎵', category: 'chapter' },
  { id: 'complete-ch4', title: '登山者', description: '完成第四章：调式山脉', icon: '🏔️', category: 'chapter' },
  { id: 'complete-ch5', title: '走廊漫步', description: '完成第五章：音程回廊', icon: '🎯', category: 'chapter' },
  { id: 'complete-ch6', title: '圣殿守护者', description: '完成第六章：和弦圣殿', icon: '🏛️', category: 'chapter' },
  { id: 'complete-boss', title: '乐理大师', description: '完成最终章：终章', icon: '👑', category: 'chapter' },

  // Perfect stars
  { id: 'perfect-ch1', title: '完美音阶', description: '第一章所有技能获得三星', icon: '⭐', category: 'mastery' },
  { id: 'perfect-ch2', title: '完美节奏', description: '第二章所有技能获得三星', icon: '⭐', category: 'mastery' },

  // Combo
  { id: 'combo-10', title: '连击新手', description: '达到10连击', icon: '🔥', category: 'challenge' },
  { id: 'combo-20', title: '连击高手', description: '达到20连击', icon: '💥', category: 'challenge' },

  // Streak / perfection
  { id: 'flawless-skill', title: '零失误', description: '在任意考核中答对所有题目', icon: '💎', category: 'mastery' },
  { id: 'first-skill', title: '初出茅庐', description: '完成第一个技能', icon: '🌱', category: 'skill' },
  { id: 'all-skills', title: '全知全能', description: '完成全部20个技能', icon: '🏆', category: 'mastery' },

  // Ear training
  { id: 'ear-training-master', title: '金耳朵', description: '完成所有听力练习章节', icon: '👂', category: 'mastery' },
  { id: 'rhythm-ace', title: '节拍王牌', description: '完成节奏练习并获得两星以上', icon: '⏱️', category: 'challenge' },
]
