/**
* 测试数据模块 - 完整的测试列表、题目和结果配置
* 每个测试包含：基本信息、题目列表、结果类型配置
*/

const testsData = {
// ==================== MBTI性格测试 ====================
mbti: {
id: 'mbti',
name: 'MBTI性格测试',
emoji: '👥',
category: '性格测试',
categoryId: 'personality',
description: '基于荣格心理类型理论，发现你的性格类型，理解自己和他人的不同之处。',
participants: 125000,
rating: 4.8,
duration: '5-10',
tags: ['性格', '心理学', '热门'],
badge: '热门',

questions: [
{
question: '在聚会中，你通常是：',
options: [
{ text: '主动与陌生人交流，认识新朋友', scores: { E: 3 } },
{ text: '与熟悉的朋友聊天', scores: { E: 1, I: 1 } },
{ text: '安静地观察周围的人', scores: { I: 2 } },
{ text: '找机会早点离开', scores: { I: 3 } },
]
},
{
question: '当你需要做重要决定时，你更倾向于：',
options: [
{ text: '相信直觉和第一感觉', scores: { N: 3 } },
{ text: '收集所有相关信息后分析', scores: { S: 3 } },
{ text: '咨询朋友和家人的意见', scores: { F: 2 } },
{ text: '列出利弊清单理性分析', scores: { T: 2 } },
]
},
{
question: '面对一个复杂的问题，你通常会：',
options: [
{ text: '直接开始尝试各种解决方案', scores: { S: 2, P: 2 } },
{ text: '先花时间理解问题的本质', scores: { N: 2, J: 1 } },
{ text: '寻找类似问题的解决经验', scores: { S: 3 } },
{ text: '思考未来可能的发展趋势', scores: { N: 3 } },
]
},
{
question: '在团队合作中，你最擅长的是：',
options: [
{ text: '提出创意和新想法', scores: { N: 3 } },
{ text: '确保任务按时完成', scores: { J: 3 } },
{ text: '协调团队成员的关系', scores: { F: 3 } },
{ text: '分析数据和逻辑问题', scores: { T: 3 } },
]
},
{
question: '周末的时候，你更喜欢：',
options: [
{ text: '参加社交活动或聚会', scores: { E: 3 } },
{ text: '在家看书或追剧', scores: { I: 3 } },
{ text: '约一两个人喝咖啡', scores: { E: 1, I: 1 } },
{ text: '按计划完成待办事项', scores: { J: 2 } },
]
},
{
question: '当朋友向你倾诉烦恼时，你会：',
options: [
{ text: '给予情感支持和安慰', scores: { F: 3 } },
{ text: '帮助分析问题给出建议', scores: { T: 3 } },
{ text: '说说自己类似的经历', scores: { F: 1 } },
{ text: '鼓励他们采取行动解决', scores: { T: 1, J: 2 } },
]
},
{
question: '对于计划，你的态度是：',
options: [
{ text: '喜欢详细的计划并严格执行', scores: { J: 3 } },
{ text: '有大概的计划但保持灵活', scores: { P: 1 } },
{ text: '不喜欢太多计划，随遇而安', scores: { P: 3 } },
{ text: '计划赶不上变化，随机应变', scores: { P: 2 } },
]
},
{
question: '在学习新事物时，你更喜欢：',
options: [
{ text: '先了解整体概念和原理', scores: { N: 3 } },
{ text: '从具体细节和步骤开始', scores: { S: 3 } },
{ text: '通过实践来学习', scores: { S: 1, P: 2 } },
{ text: '先看理论再实践', scores: { N: 1, J: 2 } },
]
},
],

resultTypes: {
'INTJ': { emoji: '🎯', title: '建筑师', desc: '富有想象力和战略性的思想家，一切皆在计划之中。' },
'INTP': { emoji: '🧠', title: '逻辑学家', desc: '具有创造力的发明家，对知识有着永不满足的渴望。' },
'ENTJ': { emoji: '👑', title: '指挥官', desc: '大胆、富有想象力的领导者，总能找到解决方法。' },
'ENTP': { emoji: '💡', title: '辩论家', desc: '聪明好奇的思想家，无法抗拒智力上的挑战。' },
'INFJ': { emoji: '🌙', title: '提倡者', desc: '安静而趣味，但能深刻启发和感染他人。' },
'INFP': { emoji: '🌸', title: '调停者', desc: '富有诗意、善良的利他主义者，总是渴望帮助良善之事。' },
'ENFJ': { emoji: '⭐', title: '主人公', desc: '富有魅力的激励者，能够引领听众走向光明。' },
'ENFP': { emoji: '🌈', title: '竞选者', desc: '热情、有创造力的社交达人，总能找到微笑的理由。' },
'ISTJ': { emoji: '📋', title: '物流师', desc: '务实、专注于事实的个体，其可靠性不容置疑。' },
'ISFJ': { emoji: '🛡️', title: '守卫者', desc: '非常专注和温暖的守护者，时刻准备保护所爱之人。' },
'ESTJ': { emoji: '🏆', title: '总经理', desc: '出色的管理者，在管理事务和人员方面无与伦比。' },
'ESFJ': { emoji: '💝', title: '执政官', desc: '极具同情心、爱交际的人，总是热心帮助他人。' },
'ISTP': { emoji: '🔧', title: '鉴赏家', desc: '大胆而实际的实验家，善于使用各种工具。' },
'ISFP': { emoji: '🎨', title: '探险家', desc: '灵活而有魅力的艺术家，时刻准备探索新事物。' },
'ESTP': { emoji: '⚡', title: '企业家', desc: '聪明、精力充沛、善于感知的人，真正享受生活边缘。' },
'ESFP': { emoji: '🎉', title: '表演者', desc: '自发的、精力充沛的艺人，生活永远不会无聊。' },
},
},

// ==================== SBTCI 沙雕指数测试 ====================
sbtci: {
id: 'sbtci',
name: 'SBTCI沙雕指数',
emoji: '🤪',
category: '趣味测试',
categoryId: 'fun',
description: '测测你的沙雕指数！看看你是高冷男神/女神，还是隐藏的沙雕艺术家？',
participants: 186000,
rating: 4.9,
duration: '3-5',
tags: ['沙雕', '趣味', '热门'],
badge: '爆火',

questions: [
{
question: '朋友发了一张很丑的自拍，你会：',
options: [
{ text: '默默看过，心里吐槽', scores: { sb: 1, normal: 2 } },
{ text: '说一句"好美哦"再配个狗头表情', scores: { sb: 2, normal: 1 } },
{ text: '保存下来做成表情包备用', scores: { sb: 3 } },
{ text: '反手发一张更丑的怼回去', scores: { sb: 3 } },
]
},
{
question: '半夜突然想上厕所，但被窝太暖：',
options: [
{ text: '憋着，明天再说', scores: { normal: 2, sb: 1 } },
{ text: '在床上翻滚挣扎5分钟', scores: { sb: 2 } },
{ text: '做梦梦到自己已经去了', scores: { sb: 3 } },
{ text: '正常起来上厕所', scores: { normal: 3 } },
]
},
{
question: '领导/老师让你"简单说两句"：',
options: [
{ text: '真的只说两句', scores: { sb: 2, normal: 1 } },
{ text: '紧张到说不出话', scores: { normal: 2 } },
{ text: '讲了半小时还没停', scores: { sb: 1 } },
{ text: '大脑一片空白，开始胡言乱语', scores: { sb: 3 } },
]
},
{
question: '看到可爱的小狗，你的反应是：',
options: [
{ text: '微笑着走过去', scores: { normal: 3 } },
{ text: '蹲下来正常抚摸', scores: { normal: 2 } },
{ text: '发出奇怪的声音"啊呜呜呜"', scores: { sb: 2 } },
{ text: '趴地上跟狗对吼', scores: { sb: 3 } },
]
},
{
question: '一个人在家时，你会：',
options: [
{ text: '看书学习或工作', scores: { normal: 3 } },
{ text: '看剧刷手机', scores: { normal: 2, sb: 1 } },
{ text: '对着镜子练习表情包', scores: { sb: 2 } },
{ text: 'cosplay家里的物品（比如装台灯）', scores: { sb: 3 } },
]
},
{
question: '洗澡的时候发现没沐浴露了：',
options: [
{ text: '用洗发水代替', scores: { normal: 2, sb: 1 } },
{ text: '用水多冲几遍', scores: { normal: 3 } },
{ text: '用洗面奶从头洗到脚', scores: { sb: 2 } },
{ text: '干搓，顺便搓泥球玩', scores: { sb: 3 } },
]
},
{
question: '听到好笑的笑话但场合不对：',
options: [
{ text: '忍住，保持严肃', scores: { normal: 3 } },
{ text: '偷偷掐自己转移注意力', scores: { normal: 2 } },
{ text: '憋到内伤，发出奇怪声音', scores: { sb: 2 } },
{ text: '当场爆笑，管他什么场合', scores: { sb: 3 } },
]
},
{
question: '半夜饿了想吃东西：',
options: [
{ text: '忍着不吃', scores: { normal: 3 } },
{ text: '吃点水果垫垫', scores: { normal: 2 } },
{ text: '点外卖，开吃播模式', scores: { sb: 2 } },
{ text: '把冰箱翻个底朝天，做了顿大餐', scores: { sb: 3 } },
]
},
],

resultTypes: {
'sblevel5': { 
emoji: '👑', 
title: '沙雕之王', 
range: [24, 32], 
desc: '恭喜你！你是传说中的沙雕之王！你的沙雕指数已经突破天际，身边的朋友每天都在被你笑死和被你吓死之间反复横跳。建议你出道当搞笑艺人，不要浪费这惊人的天赋！',
suggestion: '继续保持！世界需要你这样的快乐源泉。'
},
'sblevel4': { 
emoji: '🎭', 
title: '沙雕艺术家', 
range: [18, 23], 
desc: '你是沙雕界的艺术家！沙雕对你来说不是一种状态，而是一种境界。你总能在不经意间创造出让人捧腹的经典场面，走到哪里都自带欢乐气氛。',
suggestion: '你的沙雕很有品味，继续保持这种高级幽默感！'
},
'sblevel3': { 
emoji: '🤡', 
title: '隐藏沙雕', 
range: [12, 17], 
desc: '表面上你是正常人，但实际上你体内封印着一个沙雕之魂。偶尔的放飞自我会让人大吃一惊，形成强烈的反差萌。',
suggestion: '适当释放你的沙雕能量吧，会更受欢迎哦！'
},
'sblevel2': { 
emoji: '😐', 
title: '伪高冷', 
range: [6, 11], 
desc: '你以为自己很高冷，但其实偶尔也会做些沙雕的事。你只是不太愿意表现出来而已，内心深处也有逗比的一面。',
suggestion: '放松一点，偶尔沙雕一下会更可爱！'
},
'sblevel1': { 
emoji: '🗿', 
title: '真正高冷', 
range: [0, 5], 
desc: '你是真正的高冷王者！稳如泰山，波澜不惊。周围的人都觉得你很有气场，但也有一点点距离感。沙雕？不存在的。',
suggestion: '高冷也是一种魅力，但偶尔也可以放松一下！'
},
},
},

// ==================== 恋人SBTI性格测试 ====================
loversbti: {
id: 'loversbti',
name: '恋人SBTI测试',
emoji: '💑',
category: '爱情测试',
categoryId: 'love',
description: '测测你恋爱时的真实性格！你是粘人小可爱还是高冷傲娇？发现你在感情中的独特魅力！',
participants: 203000,
rating: 4.8,
duration: '4-6',
tags: ['恋爱', '性格', '爆火'],
badge: '爆火',

questions: [
{
question: '恋爱中，你发消息给对方没回，你会：',
options: [
{ text: '正常等待，可能ta在忙', scores: { S: 1, N: 2 } },
{ text: '再发一条确认一下', scores: { S: 2 } },
{ text: '疯狂轰炸，电话视频轮番上阵', scores: { S: 3 } },
{ text: '不回就不回，我也不回', scores: { N: 3 } },
]
},
{
question: '和对象约会，你想去哪：',
options: [
{ text: '网红餐厅打卡拍照', scores: { B: 2, T: 1 } },
{ text: '安静的小众咖啡厅', scores: { T: 2 } },
{ text: '刺激的密室逃脱/游乐园', scores: { B: 3 } },
{ text: '宅家点外卖看电影', scores: { I: 2, T: 1 } },
]
},
{
question: '对象说"我没事"，你会：',
options: [
{ text: '好的，没事就好', scores: { I: 3 } },
{ text: '感觉不对，继续追问', scores: { S: 2 } },
{ text: '直接哄，不管有没有事', scores: { B: 2, S: 1 } },
{ text: '也回一句"我也没事"', scores: { N: 2, I: 1 } },
]
},
{
question: '看到对象和其他异性联系时，你会：',
options: [
{ text: '完全不在意，信任ta', scores: { I: 3, N: 2 } },
{ text: '嘴上不说，默默关注', scores: { S: 1, T: 1 } },
{ text: '开玩笑地酸一下', scores: { B: 2 } },
{ text: '认真要求解释清楚', scores: { S: 3 } },
]
},
{
question: '吵架后，你通常会：',
options: [
{ text: '主动道歉求和好', scores: { B: 3 } },
{ text: '等对方先低头', scores: { N: 2, S: 1 } },
{ text: '冷战，看谁撑得住', scores: { N: 3 } },
{ text: '直接翻篇当无事发生', scores: { I: 2, B: 1 } },
]
},
{
question: '对象想看你的手机，你会：',
options: [
{ text: '随便看，没什么可藏的', scores: { I: 3, B: 1 } },
{ text: '可以，但要当面一起看', scores: { T: 2 } },
{ text: '有点抗拒，需要隐私空间', scores: { T: 3 } },
{ text: '可以给，但要看ta的', scores: { S: 2, T: 1 } },
]
},
{
question: '过节送礼物，你的风格是：',
options: [
{ text: '精心挑选ta喜欢的', scores: { B: 2, T: 1 } },
{ text: '直接问ta想要什么', scores: { I: 2, T: 1 } },
{ text: '制造惊喜，创意礼物', scores: { B: 3 } },
{ text: '发红包最实在', scores: { I: 3 } },
]
},
{
question: '如果对象要异地一年，你会：',
options: [
{ text: '每天视频，保持密切联系', scores: { S: 3, B: 1 } },
{ text: '各自努力，定期联系', scores: { T: 2, I: 1 } },
{ text: '担心感情变淡，有点焦虑', scores: { S: 2, B: 1 } },
{ text: '正好享受独处时光', scores: { N: 2, I: 2 } },
]
},
],

resultTypes: {
'SBTI-SB': { 
emoji: '🥰', 
title: '粘人小宝贝 (S-B型)', 
scores: { S: '高', B: '高' },
desc: '你是恋爱中的粘人小甜心！对感情超级认真，需要时刻感受到对方的存在。你喜欢亲密互动，享受恋爱中的每一个小细节。虽然偶尔会让人觉得有点黏，但这正是你爱的表达方式！',
traits: ['超爱吃醋', '撒娇高手', '需要安全感', '恋爱脑满分'],
match: ['I-T型', 'N-T型'],
tip: '记得给对方一些空间，适度的距离会让感情更甜哦～'
},
'SBTI-SN': { 
emoji: '😤', 
title: '傲娇小公主 (S-N型)', 
scores: { S: '高', N: '高' },
desc: '你是典型的傲娇体质！表面上高冷不在意，内心却在意得要命。嘴上说着"随便"，心里已经盘算了一百遍。这种反差萌让人又爱又恨，但一旦被你认可，你就是最专一的守护者。',
traits: ['口是心非', '嘴硬心软', '隐藏的恋爱脑', '占有欲强'],
match: ['B-I型', 'T-S型'],
tip: '偶尔放下傲娇，直接表达爱意会让感情更顺利哦～'
},
'SBTI-ST': { 
emoji: '🧐', 
title: '谨慎观察者 (S-T型)', 
scores: { S: '高', T: '高' },
desc: '你在感情中很谨慎，不会轻易投入，但一旦认定就会很认真。你注重边界感和隐私，希望感情是两个独立个体的结合。你的理智让你避免很多感情陷阱，但有时也会让人觉得有点距离。',
traits: ['边界感强', '需要独立空间', '观察期长', '专一可靠'],
match: ['B-S型', 'I-B型'],
tip: '适当的脆弱和依赖，会让对方感受到被需要哦～'
},
'SBTI-SI': { 
emoji: '😅', 
title: '矛盾综合体 (S-I型)', 
scores: { S: '高', I: '高' },
desc: '你是感情中的矛盾体！既想亲密无间，又怕失去自我；既需要对方的存在，又害怕过度依赖。这种矛盾让你在感情中常常纠结，但也让你更懂得平衡与成长。',
traits: ['内心戏丰富', '容易患得患失', '需要安全感', '渴望被理解'],
match: ['T-S型', 'N-T型'],
tip: '相信自己值得被爱，也要相信对方会一直在～'
},
'SBTI-NB': { 
emoji: '🦊', 
title: '高段位撩人 (N-B型)', 
scores: { N: '高', B: '高' },
desc: '你是恋爱高手！表面上云淡风轻，实际撩人技能满级。你懂得什么时候该冷淡，什么时候该热情，把若即若离玩得炉火纯青。这种魅力让人欲罢不能！',
traits: ['套路满满', '撩完就跑', '收放自如', '恋爱大师'],
match: ['S-I型', 'T-S型'],
tip: '套路归套路，真心才是终极武器哦～'
},
'SBTI-NN': { 
emoji: '🧊', 
title: '高冷冰山 (N-N型)', 
scores: { N: '高', N2: '高' },
desc: '你是真正的高冷代表！在感情中保持着自己的节奏，不轻易被情绪左右。你的趣味感和独立气质很吸引人，但有时也会让对方感到距离感。其实你的内心深处，也有柔软的一面。',
traits: ['外冷内热', '独立自主', '不粘人', '需要被主动追'],
match: ['B-S型', 'S-B型'],
tip: '偶尔展现温柔的一面，会让感情升温哦～'
},
'SBTI-NT': { 
emoji: '👑', 
title: '理性王者 (N-T型)', 
scores: { N: '高', T: '高' },
desc: '你是感情中的理性担当！不卑不亢，有自己的原则和底线。你不会被爱情冲昏头脑，也不会轻易失去自我。这种成熟稳重的气质，让人觉得和你在一起很有安全感。',
traits: ['情绪稳定', '有原则', '独立自信', '成熟可靠'],
match: ['S-B型', 'B-S型'],
tip: '偶尔感性一下，会让感情更有温度哦～'
},
'SBTI-NI': { 
emoji: '🐱', 
title: '佛系猫系 (N-I型)', 
scores: { N: '高', I: '高' },
desc: '你是感情中的佛系代表！顺其自然，不强求也不拒绝。你给人的感觉很舒服，没有压力，但也可能让人觉得你不够在意。其实你只是相信：该来的总会来。',
traits: ['佛系随缘', '不争不抢', '自我满足', '相处舒适'],
match: ['S-B型', 'T-B型'],
tip: '偶尔主动一点，会让对方更确定你的心意～'
},
'SBTI-BI': { 
emoji: '🐰', 
title: '温柔佛系 (B-I型)', 
scores: { B: '高', I: '高' },
desc: '你是温柔的代表！在感情中充满包容和理解，不会给对方压力。你的温柔如春风，让人感到舒适自在。但也可能让人觉得你太好，而不懂得珍惜。',
traits: ['温柔体贴', '包容力强', '不给压力', '容易被忽视'],
match: ['S-N型', 'N-T型'],
tip: '温柔是优点，但也要学会表达自己的需求哦～'
},
'SBTI-BT': { 
emoji: '🦢', 
title: '优雅知性 (B-T型)', 
scores: { B: '高', T: '高' },
desc: '你是感情中的优雅代表！既有热情的温度，又有理智的分寸。你懂得如何经营感情，让爱情保鲜。这种平衡让你成为理想的伴侣类型！',
traits: ['情商高', '知进退', '会经营', '理想伴侣'],
match: ['S-I型', 'N-S型'],
tip: '你已经是恋爱高手了，继续发光吧～'
},
'SBTI-TI': { 
emoji: '🦉', 
title: '独立智者 (T-I型)', 
scores: { T: '高', I: '高' },
desc: '你是感情中的独立智者！看重个人空间，也需要感情的温度。你的独立性很强，不会因为恋爱而迷失自我。这种特质让你在感情中保持清醒和理性。',
traits: ['独立自主', '有自己的世界', '不粘不腻', '需要被理解'],
match: ['S-B型', 'B-S型'],
tip: '适当依赖对方，会让感情更亲密哦～'
},
'SBTI-TT': { 
emoji: '🐢', 
title: '慢热稳重型 (T-T型)', 
scores: { T: '高', T2: '高' },
desc: '你是典型的慢热型！在感情中需要时间来建立信任和亲密感。一旦认定，就会是最稳定可靠的存在。你的感情观很成熟，不急不躁，细水长流。',
traits: ['慢热长情', '稳重可靠', '信任感强', '值得等待'],
match: ['B-S型', 'S-B型'],
tip: '慢热没关系，重要的是让对方知道你在乎～'
},
},
},

// ==================== 爱情配对指数 ====================
love: {
id: 'love',
name: '爱情配对指数',
emoji: '💕',
category: '爱情测试',
categoryId: 'love',
description: '测测你和TA的缘分有多深，从性格、价值观、相处模式等多维度分析你们的配对指数。',
participants: 98000,
rating: 4.6,
duration: '8-12',
tags: ['爱情', '缘分', '配对'],
badge: '新推',

questions: [
{
question: '你理想中的约会方式是：',
options: [
{ text: '浪漫的烛光晚餐', scores: { romance: 3 } },
{ text: '一起看日出日落', scores: { romance: 2, nature: 1 } },
{ text: '宅家看电影打游戏', scores: { comfort: 3 } },
{ text: '户外探险运动', scores: { adventure: 3 } },
]
},
{
question: '对方哪个特质最能打动你：',
options: [
{ text: '幽默风趣，让我开心', scores: { fun: 3 } },
{ text: '温柔体贴，照顾我的感受', scores: { care: 3 } },
{ text: '独立自信，有自己的追求', scores: { independence: 3 } },
{ text: '聪明智慧，能深度交流', scores: { intellect: 3 } },
]
},
{
question: '遇到矛盾时，你希望对方：',
options: [
{ text: '立即沟通解决问题', scores: { communication: 3 } },
{ text: '给我一些空间冷静', scores: { space: 3 } },
{ text: '主动道歉哄我开心', scores: { care: 2 } },
{ text: '理性分析对错', scores: { intellect: 2 } },
]
},
{
question: '对于爱情，你更看重：',
options: [
{ text: '心动的感觉和激情', scores: { passion: 3 } },
{ text: '稳定的陪伴和安全感', scores: { stability: 3 } },
{ text: '精神上的理解和共鸣', scores: { soulmate: 3 } },
{ text: '共同的兴趣和话题', scores: { compatibility: 3 } },
]
},
{
question: '你认为理想的爱情节奏是：',
options: [
{ text: '一见钟情，快速发展', scores: { fast: 3 } },
{ text: '细水长流，慢慢了解', scores: { slow: 3 } },
{ text: '顺其自然，不强求', scores: { natural: 3 } },
{ text: '先做朋友再发展', scores: { friends: 3 } },
]
},
],

resultTypes: {
'lover1': {
emoji: '🐱',
title: '粘人小可爱',
range: [0, 8],
desc: '你是典型的粘人型恋人！恨不得24小时黏在对象身边，撒娇是你的必杀技。你的爱热烈而直接，让人感受到满满的被需要感。',
suggestion: '给对方一些独立空间，会让感情更健康哦！'
},
'lover2': {
emoji: '🦊',
title: '傲娇小公主',
range: [9, 16],
desc: '你是傲娇型恋人！嘴上说着"才不想你"，心里却甜得不行。你的反差萌让人又爱又恨，欲罢不能。',
suggestion: '偶尔坦诚表达心意，会让感情升温哦！'
},
'lover3': {
emoji: '🦁',
title: '霸道总裁',
range: [17, 24],
desc: '你是霸道型恋人！喜欢掌控全局，为对方安排一切。你的爱是保护性的，让人有安全感。',
suggestion: '多听听对方的想法，尊重TA的选择！'
},
'lover4': {
emoji: '🐰',
title: '温柔暖宝',
range: [25, 32],
desc: '你是温柔型恋人！细腻体贴，总能察觉对方的情绪变化。你的爱如春风般温暖，让人感到被珍视。',
suggestion: '适当表达自己的需求，别总是委屈自己！'
},
'lover5': {
emoji: '🦉',
title: '理性智者',
range: [33, 40],
desc: '你是理性型恋人！善于分析问题，给出建设性建议。你的爱是成熟稳重的，让人感到可靠。',
suggestion: '有时候感性一点，会让关系更浪漫！'
},
},
},

// ==================== 九型人格测试 ====================
enneagram: {
id: 'enneagram',
name: '九型人格测试',
emoji: '🔮',
category: '性格测试',
categoryId: 'personality',
description: '探索你内心深处的动机和恐惧，发现你的核心人格类型，找到成长方向。',
participants: 89000,
rating: 4.7,
duration: '8-15',
tags: ['性格', '心理学', '深度'],
badge: '深度',

questions: [
{
question: '面对压力时，你通常会：',
options: [
{ text: '更加努力工作，证明自己', scores: { type3: 3, type1: 1 } },
{ text: '退缩并怀疑自己', scores: { type4: 3, type6: 1 } },
{ text: '寻求他人的支持和建议', scores: { type6: 3, type2: 1 } },
{ text: '分析问题，制定解决方案', scores: { type5: 3, type1: 1 } },
]
},
{
question: '在人际关系中，你最在意的是：',
options: [
{ text: '被需要和感激', scores: { type2: 3 } },
{ text: '被认可和欣赏', scores: { type3: 3 } },
{ text: '被理解和接纳', scores: { type4: 3 } },
{ text: '被尊重和信任', scores: { type8: 3, type1: 1 } },
]
},
{
question: '你的决策风格是：',
options: [
{ text: '追求完美，反复权衡', scores: { type1: 3 } },
{ text: '跟随内心，凭感觉决定', scores: { type4: 3, type2: 1 } },
{ text: '收集信息，理性分析', scores: { type5: 3 } },
{ text: '快速行动，注重结果', scores: { type3: 3, type8: 1 } },
]
},
],

resultTypes: {
'type1': {
emoji: '⚖️',
title: '完美主义者',
range: [0, 6],
desc: '你追求完美，有强烈的内在准则。你希望一切都能做到最好，对自己和他人都有高标准。',
suggestion: '学会接受不完美，给自己和他人更多宽容。'
},
'type2': {
emoji: '💝',
title: '助人型',
range: [7, 13],
desc: '你关心他人，乐于助人。你的价值感来自于被需要和被感激。',
suggestion: '学会关注自己的需求，不要总是牺牲自己。'
},
'type3': {
emoji: '🏆',
title: '成就型',
range: [14, 20],
desc: '你追求成功和认可，充满干劲。你善于设定目标并努力达成。',
suggestion: '不要过度依赖外在成就来定义自我价值。'
},
'type4': {
emoji: '🎨',
title: '自我型',
range: [21, 27],
desc: '你追求独特和真实，情感丰富。你渴望被理解，害怕平凡。',
suggestion: '学会欣赏平凡之美，不要过度沉溺于情绪。'
},
'type5': {
emoji: '🔍',
title: '观察型',
range: [28, 34],
desc: '你追求知识和理解，喜欢独处思考。你善于分析，保持客观。',
suggestion: '适度走出思维世界，与他人建立更多连接。'
},
'type6': {
emoji: '🛡️',
title: '忠诚型',
range: [35, 41],
desc: '你追求安全和稳定，重视承诺。你忠诚可靠，但也容易焦虑。',
suggestion: '学会信任自己的判断，减少对他人的依赖。'
},
'type7': {
emoji: '🌈',
title: '活跃型',
range: [42, 48],
desc: '你追求快乐和自由，乐观开朗。你喜欢新鲜体验，讨厌被束缚。',
suggestion: '学会面对负面情绪，不要总是逃避。'
},
'type8': {
emoji: '🔥',
title: '领袖型',
range: [49, 55],
desc: '你追求掌控和公正，意志坚强。你直接坦率，保护弱者。',
suggestion: '学会适度示弱，不要总是强势。'
},
'type9': {
emoji: '☮️',
title: '和平型',
range: [56, 62],
desc: '你追求和谐与平静，善于调解。你包容随和，但可能缺乏主见。',
suggestion: '学会表达自己的立场，不要过度迁就他人。'
},
},
},
};

// 获取所有测试列表（用于测试列表页展示）
function getAllTests() {
  return Object.keys(testsData).map(key => {
    const test = testsData[key]
    return {
      id: test.id,
      name: test.name,
      emoji: test.emoji,
      category: test.category,
      categoryId: test.categoryId,
      description: test.description,
      participants: test.participants,
      rating: test.rating,
      duration: test.duration,
      tags: test.tags,
      badge: test.badge,
    }
  })
}

// 根据ID获取测试详情
function getTestById(id) {
  return testsData[id] || null
}

// 获取测试题目
function getQuestions(id) {
  const test = testsData[id]
  return test ? test.questions : []
}

// 计算测试结果
function calculateResult(id, answers) {
  const test = testsData[id]
  if (!test || !test.resultTypes) return null

  const scores = {}
  answers.forEach((answer, index) => {
    const question = test.questions[index]
    if (question && question.options[answer] && question.options[answer].scores) {
      Object.entries(question.options[answer].scores).forEach(([key, value]) => {
        scores[key] = (scores[key] || 0) + value
      })
    }
  })

  const firstType = Object.values(test.resultTypes)[0]

  if (firstType && firstType.range) {
    let totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
    for (const [typeKey, typeConfig] of Object.entries(test.resultTypes)) {
      const min = Array.isArray(typeConfig.range) ? typeConfig.range[0] : typeConfig.range.min
      const max = Array.isArray(typeConfig.range) ? typeConfig.range[1] : typeConfig.range.max
      if (totalScore >= min && totalScore <= max) {
        return { id: typeKey, ...typeConfig, scores, totalScore }
      }
    }
    return null
  }

  if (id === 'mbti') {
    const dimKeys = ['EI', 'SN', 'TF', 'JP']
    const dimPairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']]
    let mbtiType = ''
    dimPairs.forEach((pair) => {
      const a = scores[pair[0]] || 0
      const b = scores[pair[1]] || 0
      mbtiType += a >= b ? pair[0] : pair[1]
    })
    const typeConfig = test.resultTypes[mbtiType] || test.resultTypes['INFP']
    if (typeConfig) {
      return { id: mbtiType, ...typeConfig, scores, totalScore: Object.values(scores).reduce((a, b) => a + b, 0) }
    }
  }

  if (id === 'loversbti') {
    const dims = ['S', 'N', 'B', 'T', 'I']
    let maxDim = 'S'
    let maxScore = 0
    dims.forEach((d) => {
      if ((scores[d] || 0) > maxScore) {
        maxScore = scores[d]
        maxDim = d
      }
    })
    const typeConfig = test.resultTypes[maxDim]
    if (typeConfig) {
      return { id: maxDim, ...typeConfig, scores, totalScore: Object.values(scores).reduce((a, b) => a + b, 0) }
    }
  }

  let totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const typeKey = Object.keys(test.resultTypes)[0]
  const typeConfig = test.resultTypes[typeKey]
  return { id: typeKey, ...typeConfig, scores, totalScore }
}

// 获取推荐测试
function getRecommendedTests(currentId, limit = 3) {
  const allTests = getAllTests()
  return allTests
    .filter(t => t.id !== currentId)
    .sort((a, b) => b.participants - a.participants)
    .slice(0, limit)
}

module.exports = {
  testsData,
  getAllTests,
  getTestById,
  getQuestions,
  calculateResult,
  getRecommendedTests,
};
