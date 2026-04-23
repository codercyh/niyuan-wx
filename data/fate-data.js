/**
 * 缘分测试数据模块 v2.0
 * 设计理念：年轻化、游戏化、有梗
 */

// ==================== 星座工具 ====================
const ZODIAC_LIST = [
  { name: '白羊座', en: 'aries', range: '3/21-4/19', element: 'fire', emoji: '♈' },
  { name: '金牛座', en: 'taurus', range: '4/20-5/20', element: 'earth', emoji: '♉' },
  { name: '双子座', en: 'gemini', range: '5/21-6/21', element: 'air', emoji: '♊' },
  { name: '巨蟹座', en: 'cancer', range: '6/22-7/22', element: 'water', emoji: '♋' },
  { name: '狮子座', en: 'leo', range: '7/23-8/22', element: 'fire', emoji: '♌' },
  { name: '处女座', en: 'virgo', range: '8/23-9/22', element: 'earth', emoji: '♍' },
  { name: '天秤座', en: 'libra', range: '9/23-10/23', element: 'air', emoji: '♎' },
  { name: '天蝎座', en: 'scorpio', range: '10/24-11/22', element: 'water', emoji: '♏' },
  { name: '射手座', en: 'sagittarius', range: '11/23-12/21', element: 'fire', emoji: '♐' },
  { name: '摩羯座', en: 'capricorn', range: '12/22-1/19', element: 'earth', emoji: '♑' },
  { name: '水瓶座', en: 'aquarius', range: '1/20-2/18', element: 'air', emoji: '♒' },
  { name: '双鱼座', en: 'pisces', range: '2/19-3/20', element: 'water', emoji: '♓' },
]

function getZodiacByBirthday(month, day) {
  const dates = [
    [1, 20, '水瓶座'], [2, 19, '双鱼座'], [3, 21, '白羊座'], [4, 20, '金牛座'],
    [5, 21, '双子座'], [6, 22, '巨蟹座'], [7, 23, '狮子座'], [8, 23, '处女座'],
    [9, 23, '天秤座'], [10, 24, '天蝎座'], [11, 23, '射手座'], [12, 22, '摩羯座'],
  ]
  for (let i = dates.length - 1; i >= 0; i--) {
    if (month > dates[i][0] || (month === dates[i][0] && day >= dates[i][1])) {
      return ZODIAC_LIST.find(z => z.name === dates[i][2])
    }
  }
  return ZODIAC_LIST.find(z => z.name === '摩羯座')
}

// ==================== 星座配对矩阵 ====================
const ZODIAC_MATRIX = [
//   白羊  金牛  双子  巨蟹  狮子  处女  天秤  天蝎  射手  摩羯  水瓶  双鱼
  [  78,   55,   85,   50,   95,   58,   88,   65,   93,   52,   82,   62 ], // 白羊
  [  55,   82,   60,   90,   62,   92,   68,   88,   52,   95,   55,   85 ], // 金牛
  [  85,   60,   76,   58,   82,   62,   92,   55,   85,   48,   90,   65 ], // 双子
  [  50,   90,   58,   80,   55,   85,   60,   92,   48,   88,   52,   95 ], // 巨蟹
  [  95,   62,   82,   55,   78,   60,   90,   68,   92,   55,   85,   52 ], // 狮子
  [  58,   92,   62,   85,   60,   80,   65,   88,   55,   92,   58,   82 ], // 处女
  [  88,   68,   92,   60,   90,   65,   76,   72,   85,   58,   88,   60 ], // 天秤
  [  65,   88,   55,   92,   68,   88,   72,   82,   60,   85,   62,   90 ], // 天蝎
  [  93,   52,   85,   48,   92,   55,   85,   60,   78,   50,   88,   58 ], // 射手
  [  52,   95,   48,   88,   55,   92,   58,   85,   50,   82,   55,   90 ], // 摩羯
  [  82,   55,   90,   52,   85,   58,   88,   62,   88,   55,   78,   65 ], // 水瓶
  [  62,   85,   65,   95,   52,   82,   60,   90,   58,   90,   65,   80 ], // 双鱼
]

// ==================== 元素配对分析 ====================
const ELEMENT_MATCH = {
  'fire-fire': { label: '烈焰碰撞', shortDesc: '两个火象，邻居报警', desc: '你们看对眼的速度 = 0.1秒，吵架的速度 = 0.2秒。反正就是快。' },
  'earth-earth': { label: '稳如泰山', shortDesc: '两个土象，稳得一批', desc: '你们的组合是最务实的存在，一起规划未来从不空谈，但记得偶尔也要浪漫一下。' },
  'air-air': { label: '思想共鸣', shortDesc: '两个风象，聊到天亮', desc: '你们聊天永远不会冷场，灵魂交流满分，但有时也需要落地一点。' },
  'water-water': { label: '深海共鸣', shortDesc: '两个水象，情绪黑洞', desc: '你们最懂彼此的情绪波动，一起emo能emo到天亮，但别一起沉溺。' },
  'fire-air': { label: '风助火势', shortDesc: '越吹越旺', desc: '你们的组合充满创意和行动力，一个出主意一个去实现，是天生的搭档。' },
  'air-fire': { label: '风助火势', shortDesc: '灵感碰撞', desc: '你们互相激发，一个天马行空一个说干就干，最佳拍档。' },
  'earth-water': { label: '润物无声', shortDesc: '温润滋养', desc: '你们的关系像大地与河流，互相依存，安静而深远。' },
  'water-earth': { label: '润物无声', shortDesc: '找到安全港', desc: '你们的组合温馨而稳固，感情细水长流，是最好的避风港。' },
  'fire-water': { label: '水火交融', shortDesc: '相爱相杀', desc: '一个热烈一个含蓄，充满张力。学会欣赏彼此的不同是关键。' },
  'water-fire': { label: '水火交融', shortDesc: '互相制约', desc: '互相吸引又互相制约，火象能让水象勇敢，水象能让火象冷静。' },
  'fire-earth': { label: '星火燎原', shortDesc: '一个想飞一个要稳', desc: '你们需要找到冒险和安全的平衡点，火象带土象飞，土象帮火象落地。' },
  'earth-fire': { label: '星火燎原', shortDesc: '被点燃的可能性', desc: '火象能让土象走出舒适区，土象能让火象更有规划，互补成长。' },
  'air-water': { label: '云雨交汇', shortDesc: '理性遇上感性', desc: '你们需要学习对方的语言，风象学会感受，水象学会表达。' },
  'water-air': { label: '云雨交汇', shortDesc: '深沉遇上轻盈', desc: '互相学习：一个学会表达，一个学会感受，是很美的组合。' },
  'air-earth': { label: '天地之间', shortDesc: '天马行空遇上脚踏实地', desc: '互补的组合，土象带来稳定，风象带来新鲜，需要互相尊重对方的节奏。' },
  'earth-air': { label: '天地之间', shortDesc: '稳重遇上灵动', desc: '你们可以互相补充，一个负责稳定，一个负责精彩。' },
}

// ==================== 缘分类型（梗化命名） ====================
const FATE_TYPES = {
  // S级（90-100分）- 命运级
  'fire-fire-high': { name: '双火象地狱', emoji: '🔥', level: 'S', tagline: '你们俩在一起，邻居都得报警', hashtags: ['#火象CP', '#E人地狱', '#相爱相杀'] },
  'water-water-high': { name: '情绪黑洞', emoji: '🌊', level: 'S', tagline: '你们俩一起emo，能emo到天亮', hashtags: ['#水象CP', '#情绪黑洞', '#深情CP'] },
  'earth-earth-high': { name: '稳如老狗', emoji: '🏔️', level: 'S', tagline: '你们的感情比泰山还稳', hashtags: ['#土象CP', '#稳定输出', '#模范情侣'] },
  'air-air-high': { name: '脑洞双子星', emoji: '🧠', level: 'S', tagline: '你们的对话，别人听不懂', hashtags: ['#风象CP', '#智性恋', '#脑洞CP'] },
  'fire-air-high': { name: '风火轮转', emoji: '🌪️', level: 'S', tagline: '一个出点子，一个去实现', hashtags: ['#风火CP', '#行动派', '#最佳拍档'] },
  'earth-water-high': { name: '山水相依', emoji: '🏞️', level: 'S', tagline: '你们的感情像细水长流', hashtags: ['#土水CP', '#温润CP', '#细水长流'] },
  
  // A级（80-89分）- 珍惜级
  'fire-water-mid': { name: '烈火淬冰', emoji: '🔥❄️', level: 'A', tagline: '一个热情似火，一个冷静如冰', hashtags: ['#火水CP', '#需要磨合', '#挑战CP'] },
  'air-earth-mid': { name: '天地呼应', emoji: '☁️🏔️', level: 'A', tagline: '你的计划永远赶不上TA的变动', hashtags: ['#风土CP', '#节奏不同', '#互补CP'] },
  'high-score': { name: '灵魂契合', emoji: '💫', level: 'A', tagline: '你们的缘分，上天都羡慕', hashtags: ['#天作之合', '#灵魂伴侣', '#神仙眷侣'] },
  
  // B级（70-79分）- 成长级
  'earth-earth-mid': { name: '两个闷葫芦', emoji: '🤐', level: 'B', tagline: '你们吵架，全靠猜', hashtags: ['#土象CP', '#闷骚CP', '#需要表达'] },
  'fire-fire-mid': { name: '烈火燎原', emoji: '🔥', level: 'B', tagline: '你们的热情能融化一切', hashtags: ['#火象CP', '#热情似火', '#需要注意节奏'] },
  'mid-score': { name: '心心相印', emoji: '💗', level: 'B', tagline: '你们很适合彼此，继续加油', hashtags: ['#有缘分', '#需要经营', '#成长CP'] },
  
  // C级（50-69分）- 挑战级
  'fire-earth-low': { name: '火与石的战争', emoji: '🔥🪨', level: 'C', tagline: '一个要自由，一个要稳定', hashtags: ['#火土CP', '#价值观冲突', '#需要妥协'] },
  'water-air-low': { name: '想太多vs想太少', emoji: '🤔💭', level: 'C', tagline: '我说了一堆，TA回了个"哦"', hashtags: ['#水风CP', '#沟通障碍', '#需要理解'] },
  'low-score': { name: '考验之路', emoji: '🌀', level: 'C', tagline: '你们是来互相渡劫的', hashtags: ['#考验CP', '#需要修炼', '#成长之路'] },
}

// ==================== 关系状态（输入页用） ====================
const RELATIONSHIP_STATUS = [
  {
    value: 'crush', label: '暗恋中', emoji: '💕',
    desc: 'TA还不知道我喜欢TA',
    feedback: { title: '暗恋是最勇敢的秘密', quote: '你可能不知道，我在背后看了你很多次', hint: '测试完，也许能给你勇气' },
  },
  {
    value: 'ambiguous', label: '暧昧期', emoji: '🔥',
    desc: '朋友以上，恋人未满',
    feedback: { title: '暧昧是最甜蜜的折磨', quote: '我们不谈爱，却什么都做了', hint: '测试完，也许能帮你决定' },
  },
  {
    value: 'together', label: '在一起', emoji: '❤️',
    desc: '我们已经是情侣了',
    feedback: { title: '在一起是选择，也是幸运', quote: '从心动到心定，是一个漫长的旅程', hint: '测试完，也许会更懂彼此' },
    extraFields: ['duration'],
  },
  {
    value: 'married', label: '已婚', emoji: '💍',
    desc: '我们已经结婚了',
    feedback: { title: '婚姻是缘分，也是修行', quote: '从心动到相守，是一辈子的功课', hint: '测试完，也许会更珍惜彼此' },
    extraFields: ['duration'],
  },
  {
    value: 'breakup', label: '分手后', emoji: '💔',
    desc: '还是放不下TA',
    feedback: { title: '有些爱，还没结束', quote: '分开不代表结束，也许只是重新开始', hint: '测试完，也许能找到答案' },
    extraFields: ['breakup'],
  },
  {
    value: 'unrequited', label: '单相思', emoji: '🤔',
    desc: 'TA不喜欢我',
    feedback: { title: '单相思是最孤独的喜欢', quote: '我喜欢你，但你永远不会知道', hint: '测试完，也许能让你释怀' },
  },
]

// ==================== 关系状态特殊提示 ====================
const RELATION_SPECIAL_HINTS = {
  crush: {
    title: '💕 给暗恋的你',
    content: '你们的缘分不低！也许TA也对你有意思。',
    tips: ['多制造相处机会', '观察TA对你的态度', '缘分到了，就勇敢一点'],
    ending: '暗恋是最勇敢的秘密，但秘密终究要说出来',
  },
  ambiguous: {
    title: '🔥 给暧昧期的你们',
    content: '你们的缘分很高！暧昧是最甜蜜的折磨，但也是时候决定了。',
    tips: ['找个合适的时机表白', '或者制造机会让TA表白', '不要让暧昧拖太久'],
    ending: '暧昧是美好的，但确定关系更美好',
  },
  together: {
    title: '❤️ 给在一起的你们',
    content: '你们的缘分很高！在一起是选择，也是幸运。',
    tips: ['保持沟通，不要冷战', '定期制造惊喜', '一起成长，一起变好'],
    ending: '从心动到心定，你们已经走了很远',
  },
  married: {
    title: '💍 给已婚的你们',
    content: '婚姻是缘分的升华，你们已经走过了很多。',
    tips: ['珍惜每一个平凡的日子', '学会感恩对方的付出', '一起规划更远的未来'],
    ending: '执子之手，与子偕老',
  },
  breakup: {
    title: '💔 给分手后的你',
    content: '缘分还在，但能不能重来，要看你们自己。',
    tips: ['先冷静一段时间', '反思分手的原因', '真诚地沟通', '给彼此空间和时间'],
    ending: '如果还爱，就勇敢再试一次',
  },
  unrequited: {
    title: '🤔 给单相思的你',
    content: '单相思是一个人的兵荒马乱，但也是一段珍贵的记忆。',
    tips: ['允许自己难过', '专注自己，让自己变好', '时间会治愈一切'],
    ending: '有些爱，放下才是最好的结局',
  },
}

// ==================== 等级定义 ====================
function getScoreLevel(score) {
  if (score >= 90) return { label: '命运级缘分', emoji: '💖', level: 'S', color: '#FFD700', desc: '上辈子一定拯救了银河系！' }
  if (score >= 80) return { label: '珍惜级缘分', emoji: '💕', level: 'A', color: '#00D9FF', desc: '缘分真的很深呢！' }
  if (score >= 70) return { label: '成长级缘分', emoji: '💗', level: 'B', color: '#00FF87', desc: '你们很适合彼此！' }
  if (score >= 50) return { label: '挑战级缘分', emoji: '✨', level: 'C', color: '#A855F7', desc: '需要更多了解和磨合' }
  return { label: '缘分待定', emoji: '🌀', level: 'D', color: '#708090', desc: '缘分这东西，谁说得准呢' }
}

// ==================== 获取缘分类型 ====================
function getFateType(zodiacA, zodiacB, score) {
  const elementKey = `${zodiacA.element}-${zodiacB.element}`
  const reverseKey = `${zodiacB.element}-${zodiacA.element}`
  
  // 根据分数和元素组合选择类型
  if (score >= 90) {
    const highKey = `${elementKey}-high`
    if (FATE_TYPES[highKey]) return FATE_TYPES[highKey]
    const reverseHigh = `${reverseKey}-high`
    if (FATE_TYPES[reverseHigh]) return FATE_TYPES[reverseHigh]
    return FATE_TYPES['high-score']
  } else if (score >= 80) {
    const midKey = `${elementKey}-mid`
    if (FATE_TYPES[midKey]) return FATE_TYPES[midKey]
    const reverseMid = `${reverseKey}-mid`
    if (FATE_TYPES[reverseMid]) return FATE_TYPES[reverseMid]
    return FATE_TYPES['high-score']
  } else if (score >= 70) {
    return FATE_TYPES['mid-score']
  } else {
    const lowKey = `${elementKey}-low`
    if (FATE_TYPES[lowKey]) return FATE_TYPES[lowKey]
    const reverseLow = `${reverseKey}-low`
    if (FATE_TYPES[reverseLow]) return FATE_TYPES[reverseLow]
    return FATE_TYPES['low-score']
  }
}

// ==================== 生成日常对话 ====================
function generateDailyDialogue(zodiacA, zodiacB, nameA, nameB) {
  const dialogues = {
    'fire-fire': {
      lines: [
        { speaker: 'A', text: '我想吃火锅！' },
        { speaker: 'B', text: '走！' },
        { speaker: 'A', text: '我想吃日料！' },
        { speaker: 'B', text: '...能不能先吃完火锅？' },
        { speaker: 'A', text: '不行！' },
        { speaker: 'B', text: '...行吧，走。' },
      ],
      comment: '这就是你们的日常。一个变，一个宠。一个闹，一个陪。',
    },
    'water-water': {
      lines: [
        { speaker: 'A', text: '今天好难过...' },
        { speaker: 'B', text: '怎么了？我陪你' },
        { speaker: 'A', text: '就是觉得人生好难' },
        { speaker: 'B', text: '我也是，我们一起emo吧' },
        { speaker: 'A', text: '好...' },
      ],
      comment: '你们的日常就是互相治愈，一起感受这个世界的温柔。',
    },
    'air-air': {
      lines: [
        { speaker: 'A', text: '我有个想法！' },
        { speaker: 'B', text: '说！' },
        { speaker: 'A', text: '如果时间旅行是真的...' },
        { speaker: 'B', text: '那你最想去哪个时代？' },
        { speaker: 'A', text: '我想去看看未来100年后的世界' },
        { speaker: 'B', text: '我也是！我们可以聊一整晚' },
      ],
      comment: '你们的日常就是聊各种天马行空的话题，永远聊不完。',
    },
    'earth-earth': {
      lines: [
        { speaker: 'A', text: '周末怎么安排？' },
        { speaker: 'B', text: '我已经做了计划表' },
        { speaker: 'A', text: '给我看看' },
        { speaker: 'B', text: '上午收拾家，下午去超市，晚上看电影' },
        { speaker: 'A', text: '完美，按计划执行' },
      ],
      comment: '你们的日常就是按部就班，但也可以很踏实很温馨。',
    },
    'fire-air': {
      lines: [
        { speaker: 'A', text: '我有个疯狂的想法！' },
        { speaker: 'B', text: '说！' },
        { speaker: 'A', text: '我们去蹦极吧！' },
        { speaker: 'B', text: '走！' },
        { speaker: 'A', text: '现在！' },
        { speaker: 'B', text: '...能不能让我先把饭吃完？' },
      ],
      comment: '一个出主意，一个去实现。你们是最佳拍档。',
    },
    'earth-water': {
      lines: [
        { speaker: 'A', text: '今天累吗？' },
        { speaker: 'B', text: '还好，你呢？' },
        { speaker: 'A', text: '有点，但看到你就好了' },
        { speaker: 'B', text: '我也是，抱抱' },
      ],
      comment: '你们的日常很安静，但充满了温暖的默契。',
    },
    'fire-water': {
      lines: [
        { speaker: 'A', text: '我们去旅行吧！' },
        { speaker: 'B', text: '...这么突然？' },
        { speaker: 'A', text: '说走就走才刺激！' },
        { speaker: 'B', text: '让我想想...' },
        { speaker: 'A', text: '别想了，走就对了！' },
      ],
      comment: '一个冲动，一个犹豫。你们需要找到平衡。',
    },
    'air-earth': {
      lines: [
        { speaker: 'A', text: '我想辞职去环游世界' },
        { speaker: 'B', text: '...你有存款吗？' },
        { speaker: 'A', text: '没想那么多' },
        { speaker: 'B', text: '先做个计划吧，别冲动' },
        { speaker: 'A', text: '你就是不懂浪漫' },
        { speaker: 'B', text: '我是帮你落地' },
      ],
      comment: '一个天马行空，一个脚踏实地。互相补充，也需要互相理解。',
    },
  }
  
  const elementKey = `${zodiacA.element}-${zodiacB.element}`
  const reverseKey = `${zodiacB.element}-${zodiacA.element}`
  let dialogue = dialogues[elementKey] || dialogues[reverseKey] || {
    lines: [
      { speaker: 'A', text: '你在想什么？' },
      { speaker: 'B', text: '在想我们' },
      { speaker: 'A', text: '我也是' },
    ],
    comment: '你们的日常有独特的化学反应。',
  }
  
  // 替换名字
  dialogue.lines = dialogue.lines.map(line => ({
    ...line,
    name: line.speaker === 'A' ? nameA : nameB,
    zodiac: line.speaker === 'A' ? zodiacA : zodiacB,
  }))
  
  return dialogue
}

// ==================== 生成吵架TOP3 ====================
function generateConflictTopics(zodiacA, zodiacB) {
  const conflicts = {
    'fire-fire': [
      { rank: 1, title: '谁说了算', desc: '两个都想当老大，谁都不服谁' },
      { rank: 2, title: '谁先道歉', desc: '都觉得自己没错，都等对方先低头' },
      { rank: 3, title: '听谁的', desc: '决定什么都得抢着做主' },
    ],
    'water-water': [
      { rank: 1, title: '谁更敏感', desc: '都容易受伤，都不知道怎么哄' },
      { rank: 2, title: '谁先开口', desc: '都憋着不说，都等对方先开口' },
      { rank: 3, title: '情绪传染', desc: '一个不开心，另一个也跟着emo' },
    ],
    'air-air': [
      { rank: 1, title: '谁更有道理', desc: '都喜欢辩论，都能说一整天' },
      { rank: 2, title: '说好的计划', desc: '一个说一个忘，都觉得自己没错' },
      { rank: 3, title: '注意力', desc: '都容易被新鲜事吸引，都忘了对方' },
    ],
    'earth-earth': [
      { rank: 1, title: '谁做决定', desc: '都觉得自己更稳，都按自己的来' },
      { rank: 2, title: '钱怎么花', desc: '都很实际，但标准不一样' },
      { rank: 3, title: '表达方式', desc: '都不爱说，都让对方猜' },
    ],
    'fire-air': [
      { rank: 1, title: '谁先行动', desc: '一个想马上做，一个还在想' },
      { rank: 2, title: '细节问题', desc: '火象觉得风象不够落地，风象觉得火象太急' },
      { rank: 3, title: '安全感', desc: '风象需要空间，火象需要陪伴' },
    ],
    'fire-water': [
      { rank: 1, title: '表达方式', desc: '一个直接说，一个要你猜' },
      { rank: 2, title: '情绪处理', desc: '火象想解决问题，水象想被理解' },
      { rank: 3, title: '节奏不同', desc: '一个快一个慢，总对不上频道' },
    ],
    'earth-water': [
      { rank: 1, title: '情绪表达', desc: '土象觉得水象太敏感，水象觉得土象太冷' },
      { rank: 2, title: '浪漫程度', desc: '水象要浪漫，土象要实在' },
      { rank: 3, title: '安全感来源', desc: '一个要稳定，一个要情感确认' },
    ],
    'air-earth': [
      { rank: 1, title: '生活节奏', desc: '风象随性，土象要计划' },
      { rank: 2, title: '花钱方式', desc: '一个想花就花，一个精打细算' },
      { rank: 3, title: '承诺', desc: '风象随口说，土象当真记' },
    ],
  }
  
  const elementKey = `${zodiacA.element}-${zodiacB.element}`
  const reverseKey = `${zodiacB.element}-${zodiacA.element}`
  return conflicts[elementKey] || conflicts[reverseKey] || [
    { rank: 1, title: '沟通方式', desc: '你们需要找到共同语言' },
    { rank: 2, title: '生活习惯', desc: '细节决定成败' },
    { rank: 3, title: '未来规划', desc: '方向是否一致' },
  ]
}

// ==================== 生成相处秘籍 ====================
function generateAdvice(zodiacA, zodiacB, score) {
  const adviceMap = {
    'fire-fire': [
      { title: '轮流当老大', content: '今天你说了算，明天TA说了算' },
      { title: '吵架不过夜', content: '你们都是急性子，憋着难受' },
      { title: '一起做刺激的事', content: '把能量发泄出去，不然就在家里吵架' },
      { title: '互相当观众', content: '你们都需要舞台和掌声' },
    ],
    'water-water': [
      { title: '不要一起emo', content: '一个人难过就够了，另一个要负责拉一把' },
      { title: '学会表达需求', content: '不要让对方猜，直接说出来' },
      { title: '一起做治愈的事', content: '看日落、泡温泉、听音乐' },
      { title: '互相肯定', content: '你们都需要被看见和认可' },
    ],
    'air-air': [
      { title: '也要落地', content: '偶尔把想法变成行动' },
      { title: '给彼此空间', content: '你们都需要自由呼吸' },
      { title: '一起学新东西', content: '保持新鲜感，一起探索未知' },
      { title: '约定检查点', content: '定期确认你们的感情状态' },
    ],
    'earth-earth': [
      { title: '偶尔浪漫一下', content: '仪式感很重要' },
      { title: '表达爱意', content: '不要以为对方知道，要说出来' },
      { title: '一起做规划', content: '你们最擅长这个，享受一起计划的快乐' },
      { title: '放松一点', content: '不是所有事都要那么认真' },
    ],
    'fire-air': [
      { title: '一个想一个做', content: '发挥各自优势，最佳拍档' },
      { title: '风象要落地', content: '答应的事要做到' },
      { title: '火象要耐心', content: '给风象一点思考的时间' },
      { title: '一起冒险', content: '你们是最好的冒险伙伴' },
    ],
    'fire-water': [
      { title: '学会倾听', content: '火象要耐心听水象说' },
      { title: '学会表达', content: '水象要直接说出需求' },
      { title: '找到平衡', content: '热情和温柔可以共存' },
      { title: '互相欣赏', content: '欣赏彼此的不同' },
    ],
    'earth-water': [
      { title: '土象多表达', content: '水象需要情感确认' },
      { title: '水象多理解', content: '土象的爱在行动里' },
      { title: '一起做温馨的事', content: '做饭、看电影、散步' },
      { title: '稳定+情感', content: '你们的组合很完美' },
    ],
    'air-earth': [
      { title: '风象要靠谱', content: '说到做到，土象会安心' },
      { title: '土象要灵活', content: '偶尔接受一点即兴' },
      { title: '互相学习', content: '风象学落地，土象学开放' },
      { title: '找到节奏', content: '你们可以互补，也可以吵架' },
    ],
  }
  
  const elementKey = `${zodiacA.element}-${zodiacB.element}`
  const reverseKey = `${zodiacB.element}-${zodiacA.element}`
  return adviceMap[elementKey] || adviceMap[reverseKey] || [
    { title: '多沟通', content: '了解彼此的想法' },
    { title: '互相尊重', content: '接受彼此的不同' },
    { title: '一起成长', content: '让彼此变得更好' },
    { title: '珍惜当下', content: '缘分来之不易' },
  ]
}

// ==================== 生成朋友圈文案 ====================
function generateMomentsText(fateType, score, nameA, nameB) {
  const templates = {
    funny: [
      `测了和TA的缘分，${score}分，邻居报警的那种`,
      `缘分测试说${score}分，笑死，难怪天天吵架`,
      `随便测了一下${score}分，也就那样吧（骄傲脸）`,
    ],
    self: [
      `缘分${score}分，我们就是考验本考验`,
      `测试说我们是${fateType.name}，确实挺地狱的`,
      `${score}分的缘分，一半是爱一半是恨`,
    ],
    humble: [
      `随便测了下，${score}分，日常相爱相杀`,
      `缘分测试${score}分，也就一般般吧（偷笑）`,
      `测了缘分${score}分，看来是真爱没跑了`,
    ],
  }
  
  return [
    { style: '搞怪风', content: templates.funny[Math.floor(Math.random() * templates.funny.length)] },
    { style: '自嘲风', content: templates.self[Math.floor(Math.random() * templates.self.length)] },
    { style: '凡尔赛风', content: templates.humble[Math.floor(Math.random() * templates.humble.length)] },
  ]
}

// ==================== 维度定义 ====================
const DIMENSIONS = {
  constellation: { name: '星座匹配', emoji: '⭐', color: '#FF6B35' },
  name: { name: '姓名缘分', emoji: '✍️', color: '#FF006E' },
  numerology: { name: '数字缘分', emoji: '🔢', color: '#00D9FF' },
  personality: { name: '性格互补', emoji: '🧩', color: '#00FF87' },
  metaphysics: { name: '命理玄学', emoji: '🔮', color: '#A855F7' },
}

// ==================== 生命灵数 ====================
function getLifePathNumber(dateStr) {
  const digits = dateStr.replace(/-/g, '').split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0)
  }
  return sum
}

// ==================== 主计算函数 ====================
function calculateFate(personA, personB, relation, story, extra = {}) {
  // 星座信息
  const partsA = personA.birthday.split('-')
  const partsB = personB.birthday.split('-')
  const zodiacA = getZodiacByBirthday(parseInt(partsA[1]), parseInt(partsA[2]))
  const zodiacB = getZodiacByBirthday(parseInt(partsB[1]), parseInt(partsB[2]))
  
  // 1. 星座基础分
  const idxA = ZODIAC_LIST.findIndex(z => z.name === zodiacA.name)
  const idxB = ZODIAC_LIST.findIndex(z => z.name === zodiacB.name)
  const zodiacScore = ZODIAC_MATRIX[idxA][idxB]
  
  // 2. 姓名缘分分
  const nameHash = (personA.name + personB.name).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const nameScore = 50 + (nameHash % 50)
  
  // 3. 生命灵数
  const lifePathA = personA.lifePath || getLifePathNumber(personA.birthday)
  const lifePathB = personB.lifePath || getLifePathNumber(personB.birthday)
  const lifePathScore = 60 + Math.abs((lifePathA + lifePathB) % 40)
  
  // 4. 性格互补分
  const personalityScore = zodiacScore + Math.floor(Math.random() * 10) - 5
  
  // 5. 命理玄学分
  const metaScore = 55 + Math.floor(Math.random() * 40)
  
  // 综合分数
  const rawScore = (
    zodiacScore * 0.35 +
    nameScore * 0.2 +
    lifePathScore * 0.15 +
    personalityScore * 0.15 +
    metaScore * 0.15
  )
  
  // 加一些随机波动
  const bonus = Math.floor(Math.random() * 10) - 3
  const finalScore = Math.min(99, Math.max(15, Math.round(rawScore + bonus)))
  
  // 获取等级和类型
  const level = getScoreLevel(finalScore)
  const fateType = getFateType(zodiacA, zodiacB, finalScore)
  const elementMatch = ELEMENT_MATCH[`${zodiacA.element}-${zodiacB.element}`] || 
                       ELEMENT_MATCH[`${zodiacB.element}-${zodiacA.element}`] ||
                       { label: '奇妙组合', shortDesc: '独特组合', desc: '你们的组合独一无二。' }
  
  // 生成各种内容
  const dailyDialogue = generateDailyDialogue(zodiacA, zodiacB, personA.name, personB.name)
  const conflictTopics = generateConflictTopics(zodiacA, zodiacB)
  const adviceList = generateAdvice(zodiacA, zodiacB, finalScore)
  const momentsText = generateMomentsText(fateType, finalScore, personA.name, personB.name)
  
  // 维度列表
  const dimensionList = [
    { key: 'constellation', ...DIMENSIONS.constellation, score: zodiacScore, percentage: zodiacScore, desc: `${zodiacA.name}×${zodiacB.name}` },
    { key: 'name', ...DIMENSIONS.name, score: nameScore, percentage: nameScore, desc: '笔画互补' },
    { key: 'numerology', ...DIMENSIONS.numerology, score: lifePathScore, percentage: lifePathScore, desc: `灵数${lifePathA}×${lifePathB}` },
    { key: 'personality', ...DIMENSIONS.personality, score: personalityScore, percentage: personalityScore, desc: '性格互补' },
    { key: 'metaphysics', ...DIMENSIONS.metaphysics, score: metaScore, percentage: metaScore, desc: '命理玄学' },
  ]
  
  // 特殊提示（根据关系状态）
  const specialHint = RELATION_SPECIAL_HINTS[relation] || null
  
  // 为什么吸引
  const whyAttract = generateWhyAttract(zodiacA, zodiacB, elementMatch, finalScore)
  
  return {
    score: finalScore,
    level,
    fateType,
    zodiacA,
    zodiacB,
    lifePathA,
    lifePathB,
    elementMatch,
    dimensionList,
    whyAttract,
    dailyDialogue,
    conflictTopics,
    adviceList,
    momentsText,
    specialHint,
    personA,
    personB,
    relation,
    story,
  }
}

// ==================== 为什么吸引 ====================
function generateWhyAttract(zodiacA, zodiacB, elementMatch, score) {
  const templates = [
    `因为你们都是${zodiacA.element === zodiacB.element ? '同元素' : ''}星座啊！`,
    elementMatch.desc,
    `你们的缘分分数是${score}分，${score >= 80 ? '这是上天的安排' : score >= 60 ? '这是有趣的相遇' : '这是一种考验'}。`,
  ]
  return templates.join('\n\n')
}

module.exports = {
  ZODIAC_LIST,
  ZODIAC_MATRIX,
  ELEMENT_MATCH,
  FATE_TYPES,
  RELATIONSHIP_STATUS,
  RELATION_SPECIAL_HINTS,
  DIMENSIONS,
  getZodiacByBirthday,
  getLifePathNumber,
  getScoreLevel,
  getFateType,
  calculateFate,
  generateDailyDialogue,
  generateConflictTopics,
  generateAdvice,
  generateMomentsText,
}
