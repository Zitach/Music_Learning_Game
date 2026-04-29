import type { TutorialStep } from './TutorialProvider'

export const TUTORIALS: Record<string, TutorialStep[]> = {
  'map-first-visit': [
    {
      targetSelector: '.world-map-canvas',
      title: '欢迎来到音乐世界!',
      description: '这是你的学习地图。每个圆点代表一个章节，点击可以进入学习。章节需要按顺序解锁。',
      position: 'bottom',
    },
    {
      targetSelector: '.hud-cluster',
      title: '你的状态面板',
      description: '这里显示你的等级、经验值、成就数量和生命值。生命值在考核中答错会减少。',
      position: 'bottom',
    },
  ],
  'first-skill': [
    {
      targetSelector: '.chapter-node.is-unlocked',
      title: '开始你的第一个技能',
      description: '点击解锁的技能节点开始学习。学习流程：先学知识，再练习，最后考核!',
      position: 'right',
    },
  ],
  'first-practice': [
    {
      targetSelector: '.lesson-main',
      title: '练习模式',
      description: '在这里你可以放心尝试，答错不会扣血。仔细看题目，选择或弹奏正确答案。',
      position: 'top',
    },
  ],
  'first-assessment': [
    {
      targetSelector: '.assessment-status',
      title: '考核模式',
      description: '这是最终检验！答错会扣除生命值，答对越多星级越高。加油!',
      position: 'top',
    },
  ],
}
