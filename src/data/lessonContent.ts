export interface LessonStep {
  text: string
  note?: string
}

export interface LessonContent {
  skillId: string
  title: string
  steps: LessonStep[]
}

export const LESSON_CONTENT: LessonContent[] = [
  {
    skillId: 'ch1-s1',
    title: '认识 C D E F G A B',
    steps: [
      { text: '钢琴白键会循环出现 7 个音名：C、D、E、F、G、A、B。', note: 'C4' },
      { text: '它们也对应唱名 do、re、mi、fa、sol、la、si。', note: 'E4' },
      { text: '试着点击下方钢琴，把听到的声音和音名建立联系。' },
    ],
  },
  {
    skillId: 'ch1-s2',
    title: '全音与半音',
    steps: [
      { text: '半音是键盘上最邻近的一步，例如 E 到 F。', note: 'E4' },
      { text: '全音等于两个半音，例如 C 到 D。', note: 'C4' },
      { text: '记住：白键中只有 E-F 和 B-C 是天然半音关系。' },
    ],
  },
  {
    skillId: 'ch1-s3',
    title: '升降号与黑键',
    steps: [
      { text: '升号会把音提高半音，C# 就是 C 右边最近的黑键。', note: 'C#4' },
      { text: '降号会把音降低半音，Db 和 C# 是等音。', note: 'Db4' },
      { text: '12 个半音构成一个八度，这就是十二平均律的基础。' },
    ],
  },
  {
    skillId: 'ch2-s1',
    title: '认识音符时值',
    steps: [
      { text: '全音符通常持续 4 拍，二分音符持续 2 拍，四分音符持续 1 拍。' },
      { text: '时值越长，音符在一小节中占据的时间越多。' },
      { text: '先理解“一个音能持续多久”，再去看它在节拍中的位置。' },
    ],
  },
  {
    skillId: 'ch2-s2',
    title: '认识休止符',
    steps: [
      { text: '休止符表示“停下来不发声”，但依然占据节拍时间。' },
      { text: '全休止符、二分休止符、四分休止符分别对应不同静默时长。' },
      { text: '音乐中的停顿和发声一样重要，它们共同构成节奏。' },
    ],
  },
  {
    skillId: 'ch2-s3',
    title: '理解常见拍号',
    steps: [
      { text: '拍号上面的数字表示每小节有几拍。' },
      { text: '拍号下面的数字表示以哪种音符为一拍，例如 4 代表四分音符。' },
      { text: '2/4、3/4、4/4 与 6/8 是最常见的基础拍号。' },
    ],
  },
  {
    skillId: 'ch2-s4',
    title: '开始打拍子',
    steps: [
      { text: '打拍子训练的目标，是在正确的时间点完成击打。' },
      { text: '当音符到达中心线附近时，按下空格或点击，就是一次节拍输入。' },
      { text: '越接近正确时点，判定就越好，连击也会更高。' },
    ],
  },
  {
    skillId: 'ch3-s1',
    title: '简谱基础',
    steps: [
      { text: '简谱使用 1 到 7 表示音级，对应 do 到 si。' },
      { text: '数字本身表示音级，高低可通过点或上下文来区分。' },
      { text: '先把数字和唱名对应起来，再去理解它们在旋律中的作用。' },
    ],
  },
  {
    skillId: 'ch3-s2',
    title: '五线谱入门',
    steps: [
      { text: '五线谱通过线与间的位置来表示音高。' },
      { text: '高音谱号和低音谱号分别适合不同音域。' },
      { text: '识谱时先认清谱号，再判断音符在线上还是间里。' },
    ],
  },
  {
    skillId: 'ch4-s1',
    title: '大调音阶结构',
    steps: [
      { text: '大调音阶的结构公式是：全全半全全全半。' },
      { text: '从主音出发，按这个顺序排列，就能构成自然大调。' },
      { text: 'C 大调没有升降号，是理解大调最好的起点。', note: 'C4' },
    ],
  },
  {
    skillId: 'ch4-s2',
    title: '自然小调',
    steps: [
      { text: '自然小调有自己的音阶结构和情绪色彩。' },
      { text: '每个大调通常都对应一个关系小调，它们使用相同调号。' },
      { text: '学会比较大调和小调，是理解调式的重要一步。' },
    ],
  },
  {
    skillId: 'ch4-s3',
    title: '常用调号',
    steps: [
      { text: '调号写在谱号后面，用来提示整首音乐固定出现的升降记号。' },
      { text: 'G 大调常见一个升号，F 大调常见一个降号。' },
      { text: '认识调号，可以更快判断作品的调性。' },
    ],
  },
  {
    skillId: 'ch5-s1',
    title: '认识基础音程',
    steps: [
      { text: '音程表示两个音之间的距离。' },
      { text: '从二度到八度，名称会随着跨度增加而变化。' },
      { text: '先学会数级数，再判断它的听觉距离。' },
    ],
  },
  {
    skillId: 'ch5-s2',
    title: '协和与不协和',
    steps: [
      { text: '协和音程听起来更稳定、融合，不协和音程更紧张。' },
      { text: '纯五度、八度通常较协和，增减音程常带来不稳定感。' },
      { text: '理解这种“稳定与张力”，有助于听辨和作曲。' },
    ],
  },
  {
    skillId: 'ch5-s3',
    title: '音程转位',
    steps: [
      { text: '把音程中的一个音移高或移低一个八度，就会得到转位。' },
      { text: '原音程与转位音程在数字和性质上存在对应关系。' },
      { text: '掌握转位规律，能更快分析旋律与和声。' },
    ],
  },
  {
    skillId: 'ch6-s1',
    title: '认识三和弦',
    steps: [
      { text: '三和弦由三个音叠置而成，最常见的是大三和弦与小三和弦。' },
      { text: '增三和弦和减三和弦会带来不同的紧张感。' },
      { text: '听辨和弦色彩，是和声学习的重要起点。' },
    ],
  },
  {
    skillId: 'ch6-s2',
    title: '认识七和弦',
    steps: [
      { text: '七和弦是在三和弦基础上再叠加一个音形成的。' },
      { text: '属七、大七、小七、半减七都是常见的七和弦类型。' },
      { text: '七和弦比三和弦拥有更丰富的色彩与功能。' },
    ],
  },
  {
    skillId: 'ch6-s3',
    title: '理解和弦标记',
    steps: [
      { text: '和弦标记是把和弦名称浓缩成符号，例如 C、Am、G7。' },
      { text: '大写字母通常表示根音，小写 m 常代表小三和弦。' },
      { text: '读懂标记后，你就能更快理解和演奏和弦进行。' },
    ],
  },
  {
    skillId: 'boss-final',
    title: '终章综合试炼',
    steps: [
      { text: '终章不会引入全新概念，而是考查你是否真的掌握前面的内容。' },
      { text: '你将综合面对音名、节奏、拍号、识谱、音程与和弦相关问题。' },
      { text: '别急，稳定判断、逐题作答，就是最好的通关方式。' },
    ],
  },
]

export function getLessonContent(skillId: string): LessonContent | null {
  return LESSON_CONTENT.find(content => content.skillId === skillId) ?? null
}
