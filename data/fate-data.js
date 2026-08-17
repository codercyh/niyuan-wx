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
  'high-score': { name: '灵魂契合', emoji: '💫', level: 'A', tagline: '你们这么合拍，上天都羡慕', hashtags: ['#天作之合', '#灵魂伴侣', '#神仙眷侣'] },
  
  // B级（70-79分）- 成长级
  'earth-earth-mid': { name: '两个闷葫芦', emoji: '🤐', level: 'B', tagline: '你们吵架，全靠猜', hashtags: ['#土象CP', '#闷骚CP', '#需要表达'] },
  'fire-fire-mid': { name: '烈火燎原', emoji: '🔥', level: 'B', tagline: '你们的热情能融化一切', hashtags: ['#火象CP', '#热情似火', '#需要注意节奏'] },
  'mid-score': { name: '心心相印', emoji: '💗', level: 'B', tagline: '你们很适合彼此，继续加油', hashtags: ['#很合拍', '#需要经营', '#成长CP'] },
  
  // C级（50-69分）- 挑战级
  'fire-earth-low': { name: '火与石的战争', emoji: '🔥🪨', level: 'C', tagline: '一个要自由，一个要稳定', hashtags: ['#火土CP', '#价值观冲突', '#需要妥协'] },
  'water-air-low': { name: '想太多vs想太少', emoji: '🤔💭', level: 'C', tagline: '我说了一堆，TA回了个"哦"', hashtags: ['#水风CP', '#沟通障碍', '#需要理解'] },
  'low-score': { name: '考验之路', emoji: '🌀', level: 'C', tagline: '你们是来互相成就的', hashtags: ['#考验CP', '#多点耐心', '#成长之路'] },
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
    feedback: { title: '婚姻是选择，也是修行', quote: '从心动到相守，是一辈子的功课', hint: '测试完，也许会更珍惜彼此' },
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
    content: '你们的互动很甜！也许TA也对你有意思。',
    tips: ['多制造相处机会', '观察TA对你的态度', '时机到了，就勇敢一点'],
    ending: '暗恋是最勇敢的秘密，但秘密终究要说出来',
  },
  ambiguous: {
    title: '🔥 给暧昧期的你们',
    content: '你们的互动很甜！暧昧是最甜蜜的折磨，但也是时候决定了。',
    tips: ['找个合适的时机表白', '或者制造机会让TA表白', '不要让暧昧拖太久'],
    ending: '暧昧是美好的，但确定关系更美好',
  },
  together: {
    title: '❤️ 给在一起的你们',
    content: '你们的互动很甜！在一起是选择，也是幸运。',
    tips: ['保持沟通，不要冷战', '定期制造惊喜', '一起成长，一起变好'],
    ending: '从心动到心定，你们已经走了很远',
  },
  married: {
    title: '💍 给已婚的你们',
    content: '婚姻是感情的升华，你们已经走过了很多。',
    tips: ['珍惜每一个平凡的日子', '学会感恩对方的付出', '一起规划更远的未来'],
    ending: '执子之手，与子偕老',
  },
  breakup: {
    title: '💔 给分手后的你',
    content: '感情还在，但能不能重来，要看你们自己。',
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
  if (score >= 90) return { label: '梦幻级合拍', emoji: '💖', level: 'S', color: '#E8B878', desc: '上辈子一定拯救了银河系！' }
  if (score >= 80) return { label: '心动级合拍', emoji: '💕', level: 'A', color: '#E89AB2', desc: '你们真的很合拍！' }
  if (score >= 70) return { label: '成长级搭档', emoji: '💗', level: 'B', color: '#7CC4A0', desc: '你们很适合彼此！' }
  if (score >= 50) return { label: '挑战级磨合', emoji: '✨', level: 'C', color: '#C9A0C8', desc: '需要更多了解和磨合' }
  return { label: '互动类型待定', emoji: '🌀', level: 'D', color: '#B0A8AE', desc: '互动这事，谁说得准呢' }
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
    { title: '珍惜当下', content: '相遇来之不易' },
  ]
}

// ==================== 生成朋友圈文案 ====================
function generateMomentsText(fateType, score, nameA, nameB) {
  const templates = {
    funny: [
      `生成了和TA的互动报告，${score}分，邻居报警的那种`,
      `互动报告说${score}分，笑死，难怪天天吵架`,
      `随便测了一下${score}分，也就那样吧（骄傲脸）`,
    ],
    self: [
      `互动参考${score}分，我们就是考验本考验`,
      `测试说我们是${fateType.name}，确实挺地狱的`,
      `${score}分的默契，一半是爱一半是恨`,
    ],
    humble: [
      `随便测了下，${score}分，日常相爱相杀`,
      `互动报告${score}分，也就一般般吧（偷笑）`,
      `测完互动${score}分，看来是很合拍没跑了`,
    ],
  }

  // 基于分数确定性选择文案（相同分数总是选择相同文案）
  const selectIndex = score % 3

  return [
    { style: '搞怪风', content: templates.funny[selectIndex] },
    { style: '自嘲风', content: templates.self[selectIndex] },
    { style: '凡尔赛风', content: templates.humble[selectIndex] },
  ]
}

// ==================== 维度定义 ====================
const DIMENSIONS = {
  constellation: { name: '相处节奏', emoji: '⭐', color: '#DC8DA8' },
  name: { name: '表达方式', emoji: '✍️', color: '#7CC4A0' },
  numerology: { name: '日常习惯', emoji: '🔢', color: '#98B8D8' },
  personality: { name: '性格互补', emoji: '🧩', color: '#E8B878' },
  metaphysics: { name: '互动观察', emoji: '💬', color: '#C9A0C8' },
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

// ==================== 姓名缘分计算（确定性、对称） ====================
function calculateNameScore(nameA, nameB) {
  // 排序后计算，确保 A+B = B+A（结果一致）
  const sortedNames = [nameA, nameB].sort()
  const combined = sortedNames[0] + sortedNames[1]

  // 使用稳定哈希：字符码之和 + 字符码之积（混合计算）
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const code = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + code  // djb2 哈希变体
    hash = hash & hash  // Convert to 32bit integer
  }

  // 映射到 60-95 分数区间（提高下限，降低上限，减少波动）
  return 60 + (Math.abs(hash) % 36)
}

// ==================== 性格互补分（确定性，基于星座元素） ====================
function calculatePersonalityScore(zodiacA, zodiacB, zodiacScore) {
  // 元素互补性权重矩阵
  const ELEMENT_SYNERGY = {
    'fire-fire': 0.95,   // 同元素，高互补但易冲突
    'earth-earth': 0.98, // 同元素，稳定
    'air-air': 0.92,     // 同元素，思想共鸣
    'water-water': 0.96, // 同元素，情感共鸣
    'fire-air': 1.08,    // 风助火势，最佳互补
    'air-fire': 1.08,
    'earth-water': 1.10, // 土水相依，最佳互补
    'water-earth': 1.10,
    'fire-water': 0.85,  // 相克，需磨合
    'water-fire': 0.85,
    'fire-earth': 0.88,  // 需要平衡
    'earth-fire': 0.88,
    'air-water': 0.87,   // 理性vs感性
    'water-air': 0.87,
    'air-earth': 0.90,   // 天地之间
    'earth-air': 0.90,
  }

  const elementKey = `${zodiacA.element}-${zodiacB.element}`
  const synergy = ELEMENT_SYNERGY[elementKey] || 1.0

  // 基于星座分数和元素协同系数计算
  const baseScore = zodiacScore * synergy

  // 加入确定性微调：基于星座索引差值
  const idxA = ZODIAC_LIST.findIndex(z => z.name === zodiacA.name)
  const idxB = ZODIAC_LIST.findIndex(z => z.name === zodiacB.name)
  const idxDiff = Math.abs(idxA - idxB)
  const idxBonus = (idxDiff <= 2 || idxDiff >= 10) ? 5 : 0  // 相邻或对宫星座加成

  return Math.min(99, Math.max(40, Math.round(baseScore + idxBonus)))
}

// ==================== 命理玄学分（确定性，基于生日数字特征） ====================
function calculateMetaphysicsScore(birthdayA, birthdayB, lifePathA, lifePathB) {
  // 1. 生命灵数匹配度（调整分数范围至 55-85）
  const LIFE_PATH_MATCH = {
    '1-1': 65, '1-2': 72, '1-3': 78, '1-4': 60, '1-5': 82, '1-6': 70, '1-7': 75, '1-8': 58, '1-9': 72,
    '2-2': 68, '2-3': 72, '2-4': 75, '2-5': 65, '2-6': 80, '2-7': 73, '2-8': 78, '2-9': 74,
    '3-3': 70, '3-4': 62, '3-5': 78, '3-6': 75, '3-7': 82, '3-8': 65, '3-9': 76,
    '4-4': 60, '4-5': 55, '4-6': 82, '4-7': 65, '4-8': 85, '4-9': 70,
    '5-5': 72, '5-6': 65, '5-7': 78, '5-8': 74, '5-9': 76,
    '6-6': 72, '6-7': 75, '6-8': 80, '6-9': 82,
    '7-7': 68, '7-8': 70, '7-9': 80,
    '8-8': 70, '8-9': 74,
    '9-9': 72,
    '11-11': 78, '11-22': 82,
    '22-22': 75,
  }

  // 获取灵数配对分数（排序 key 确保对称）
  const sortedLP = [lifePathA, lifePathB].sort((a, b) => a - b)
  const lpKey = `${sortedLP[0]}-${sortedLP[1]}`
  const lpScore = LIFE_PATH_MATCH[lpKey] || 70

  // 2. 生日数字特征匹配
  const dateA = new Date(birthdayA)
  const dateB = new Date(birthdayB)

  // 月份差值影响
  const monthA = dateA.getMonth() + 1
  const monthB = dateB.getMonth() + 1
  const monthDiff = Math.abs(monthA - monthB)
  // 月份相同+10，相邻+5，对冲+6
  let monthBonus = 0
  if (monthDiff === 0) monthBonus = 10
  else if (monthDiff <= 2) monthBonus = 5
  else if (monthDiff === 6) monthBonus = 6

  // 日期差值影响
  const dayA = dateA.getDate()
  const dayB = dateB.getDate()
  const dayDiff = Math.abs(dayA - dayB)
  let dayBonus = 0
  if (dayDiff === 0) dayBonus = 12
  else if (dayDiff <= 3) dayBonus = 6
  else if (dayDiff >= 14) dayBonus = -2

  // 3. 季节匹配（春夏秋冬）
  const getSeason = (month) => {
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }
  const seasonA = getSeason(monthA)
  const seasonB = getSeason(monthB)
  // 同季节+8，对角季节+4
  let seasonBonus = 0
  if (seasonA === seasonB) seasonBonus = 8
  else if ((seasonA === 'spring' && seasonB === 'autumn') || (seasonA === 'autumn' && seasonB === 'spring')) seasonBonus = 4
  else if ((seasonA === 'summer' && seasonB === 'winter') || (seasonA === 'winter' && seasonB === 'summer')) seasonBonus = 4

  // 4. 年份差值影响
  const yearA = dateA.getFullYear()
  const yearB = dateB.getFullYear()
  const yearDiff = Math.abs(yearA - yearB)
  let yearBonus = 0
  if (yearDiff === 0) yearBonus = 6
  else if (yearDiff <= 3) yearBonus = 3
  else if (yearDiff >= 12) yearBonus = -3

  // 5. 数字能量
  const sumA = (birthdayA.replace(/-/g, '').split('').reduce((s, c) => s + parseInt(c), 0)) % 2
  const sumB = (birthdayB.replace(/-/g, '').split('').reduce((s, c) => s + parseInt(c), 0)) % 2
  const numEnergyBonus = sumA === sumB ? 4 : 0

  // 综合计算（提高基础分）
  const rawScore = lpScore * 0.45 + (60 + monthBonus + dayBonus + seasonBonus + yearBonus + numEnergyBonus) * 0.55

  return Math.min(92, Math.max(50, Math.round(rawScore)))
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

  // 2. 姓名缘分分（确定性、对称）
  const nameScore = calculateNameScore(personA.name, personB.name)

  // 3. 生命灵数
  const lifePathA = personA.lifePath || getLifePathNumber(personA.birthday)
  const lifePathB = personB.lifePath || getLifePathNumber(personB.birthday)

  // 灵数配对分数（确定性）- 整体下调，增加区分度
  const sortedLP = [lifePathA, lifePathB].sort((a, b) => a - b)
  const lpKey = `${sortedLP[0]}-${sortedLP[1]}`
  const LIFE_PATH_SCORES = {
    // 范围调整至 50-85
    '1-1': 60, '1-2': 70, '1-3': 75, '1-4': 55, '1-5': 80, '1-6': 65, '1-7': 72, '1-8': 50, '1-9': 68, '1-11': 72, '1-22': 70,
    '2-2': 62, '2-3': 68, '2-4': 72, '2-5': 60, '2-6': 78, '2-7': 70, '2-8': 75, '2-9': 70, '2-11': 75, '2-22': 72,
    '3-3': 65, '3-4': 58, '3-5': 76, '3-6': 72, '3-7': 82, '3-8': 60, '3-9': 74, '3-11': 76, '3-22': 70,
    '4-4': 55, '4-5': 50, '4-6': 80, '4-7': 62, '4-8': 85, '4-9': 65, '4-11': 68, '4-22': 78,
    '5-5': 68, '5-6': 60, '5-7': 75, '5-8': 70, '5-9': 72, '5-11': 75, '5-22': 70,
    '6-6': 70, '6-7': 72, '6-8': 78, '6-9': 82, '6-11': 78, '6-22': 75,
    '7-7': 62, '7-8': 65, '7-9': 78, '7-11': 82, '7-22': 70,
    '8-8': 65, '8-9': 70, '8-11': 72, '8-22': 78,
    '9-9': 68, '9-11': 75, '9-22': 72,
    '11-11': 75, '11-22': 80,
    '22-22': 72,
  }
  const lifePathScore = LIFE_PATH_SCORES[lpKey] || 65

  // 4. 性格互补分（确定性）
  const personalityScore = calculatePersonalityScore(zodiacA, zodiacB, zodiacScore)

  // 5. 命理玄学分（确定性）
  const metaScore = calculateMetaphysicsScore(personA.birthday, personB.birthday, lifePathA, lifePathB)

  // 综合分数（完全确定性，无随机）
  // 权重调整：星座35% + 姓名18% + 灵数12% + 性格20% + 玄学15%
  const rawScore = (
    zodiacScore * 0.35 +
    nameScore * 0.18 +
    lifePathScore * 0.12 +
    personalityScore * 0.20 +
    metaScore * 0.15
  )

  // 对低分星座配对进行适度补偿
  // 星座分<60时+4，<70时+2
  const zodiacCompensation = zodiacScore < 60 ? 4 : (zodiacScore < 70 ? 2 : 0)

  // 最终分数
  const adjustedScore = rawScore + 5 + zodiacCompensation
  const finalScore = Math.min(99, Math.max(35, Math.round(adjustedScore)))
  
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
    { key: 'numerology', ...DIMENSIONS.numerology, score: lifePathScore, percentage: lifePathScore, desc: '日常习惯' },
    { key: 'personality', ...DIMENSIONS.personality, score: personalityScore, percentage: personalityScore, desc: '性格互补' },
    { key: 'metaphysics', ...DIMENSIONS.metaphysics, score: metaScore, percentage: metaScore, desc: '互动观察' },
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
    `你们的互动参考是${score}分，${score >= 80 ? '这是很棒的相遇' : score >= 60 ? '这是有趣的相遇' : '这是一种考验'}。`,
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
  calculateNameScore,
  calculatePersonalityScore,
  calculateMetaphysicsScore,
  generateDailyDialogue,
  generateConflictTopics,
  generateAdvice,
  generateMomentsText,
}
