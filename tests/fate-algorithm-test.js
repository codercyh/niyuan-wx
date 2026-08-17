/**
 * 缘分算法测试脚本
 * 模拟50组不同年龄段、不同状态的用户群体进行测试
 */

const {
  calculateFate,
  calculateNameScore,
  calculatePersonalityScore,
  calculateMetaphysicsScore,
  getLifePathNumber,
  getZodiacByBirthday,
  ZODIAC_LIST,
  ZODIAC_MATRIX,
} = require('../data/fate-data.js')

// ==================== 测试数据生成 ====================

// 常见姓氏
const SURNAMES = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗']
// 常见名字（单字）
const NAME_CHARS = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '华', '慧', '建', '文', '玲', '平', '红', '梅', '鑫', '浩', '宇', '轩', '怡']

// 关系状态
const RELATIONS = ['crush', 'ambiguous', 'together', 'married', 'breakup', 'unrequited']

// 年龄段配置
const AGE_GROUPS = [
  { range: [18, 22], label: '大学生' },
  { range: [23, 28], label: '职场新人' },
  { range: [29, 35], label: '而立之年' },
  { range: [36, 45], label: '中年群体' },
]

// 生成随机名字
function randomName() {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
  const nameChar = NAME_CHARS[Math.floor(Math.random() * NAME_CHARS.length)]
  const twoChars = Math.random() > 0.5
  if (twoChars) {
    const nameChar2 = NAME_CHARS[Math.floor(Math.random() * NAME_CHARS.length)]
    return surname + nameChar + nameChar2
  }
  return surname + nameChar
}

// 生成随机生日（指定年龄段）
function randomBirthday(ageRange) {
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - ageRange[1]
  const maxYear = currentYear - ageRange[0]
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// 生成测试用例
function generateTestCase(index) {
  const ageGroupIndex = index % AGE_GROUPS.length
  const ageGroup = AGE_GROUPS[ageGroupIndex]
  const relationIndex = index % RELATIONS.length
  const relation = RELATIONS[relationIndex]

  return {
    id: index + 1,
    personA: {
      name: randomName(),
      birthday: randomBirthday(ageGroup.range),
    },
    personB: {
      name: randomName(),
      birthday: randomBirthday(ageGroup.range),
    },
    relation,
    ageGroup: ageGroup.label,
  }
}

// ==================== 测试执行 ====================

console.log('========================================')
console.log('   缘分算法合理性测试报告')
console.log('   测试样本: 50组不同特征用户')
console.log('========================================\n')

// 生成50组测试数据
const testCases = []
for (let i = 0; i < 50; i++) {
  testCases.push(generateTestCase(i))
}

// 执行测试
const results = testCases.map(tc => {
  const result = calculateFate(tc.personA, tc.personB, tc.relation, '')
  // 从 dimensionList 提取分数
  const scores = {}
  result.dimensionList.forEach(d => {
    scores[d.key] = d.score
  })
  return {
    ...tc,
    score: result.score,
    level: result.level.level,
    levelLabel: result.level.label,
    scores,
    zodiacA: result.zodiacA.name,
    zodiacB: result.zodiacB.name,
    elementA: result.zodiacA.element,
    elementB: result.zodiacB.element,
    dimensionList: result.dimensionList,
  }
})

// ==================== 分析报告 ====================

console.log('【一、分数分布分析】\n')

// 分数区间统计
const scoreRanges = {
  '90-99 (命运级)': 0,
  '80-89 (珍惜级)': 0,
  '70-79 (成长级)': 0,
  '50-69 (挑战级)': 0,
  '50以下': 0,
}

results.forEach(r => {
  if (r.score >= 90) scoreRanges['90-99 (命运级)']++
  else if (r.score >= 80) scoreRanges['80-89 (珍惜级)']++
  else if (r.score >= 70) scoreRanges['70-79 (成长级)']++
  else if (r.score >= 50) scoreRanges['50-69 (挑战级)']++
  else scoreRanges['50以下']++
})

console.log('分数区间分布:')
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percent = (count / 50 * 100).toFixed(1)
  const bar = '█'.repeat(Math.round(count / 2))
  console.log(`  ${range}: ${count}组 (${percent}%) ${bar}`)
})

// 统计指标
const allScores = results.map(r => r.score)
const avgScore = (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
const minScore = Math.min(...allScores)
const maxScore = Math.max(...allScores)
const stdDev = Math.sqrt(allScores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / allScores.length).toFixed(1)

console.log(`\n统计指标:`)
console.log(`  平均分: ${avgScore}`)
console.log(`  最低分: ${minScore}`)
console.log(`  最高分: ${maxScore}`)
console.log(`  标准差: ${stdDev}`)

console.log('\n【二、等级分布分析】\n')

const levelCounts = { S: 0, A: 0, B: 0, C: 0, D: 0 }
results.forEach(r => levelCounts[r.level]++)
Object.entries(levelCounts).forEach(([level, count]) => {
  const percent = (count / 50 * 100).toFixed(1)
  const bar = '█'.repeat(Math.round(count / 2))
  console.log(`  ${level}级: ${count}组 (${percent}%) ${bar}`)
})

console.log('\n【三、五维度分数分析】\n')

const dimensions = ['constellation', 'name', 'numerology', 'personality', 'metaphysics']
const dimNames = {
  constellation: '相处节奏',
  name: '表达方式',
  numerology: '日常习惯',
  personality: '性格互补',
  metaphysics: '互动观察',
}

dimensions.forEach(dim => {
  const dimScores = results.map(r => r.scores[dim] || 0)
  const avg = (dimScores.reduce((a, b) => a + b, 0) / dimScores.length).toFixed(1)
  const min = Math.min(...dimScores)
  const max = Math.max(...dimScores)
  console.log(`  ${dimNames[dim]}: 平均${avg}分 (范围: ${min}-${max})`)
})

console.log('\n【四、年龄段分析】\n')

AGE_GROUPS.forEach(ag => {
  const groupResults = results.filter(r => r.ageGroup === ag.label)
  if (groupResults.length > 0) {
    const avg = (groupResults.reduce((sum, r) => sum + r.score, 0) / groupResults.length).toFixed(1)
    console.log(`  ${ag.label}: ${groupResults.length}组, 平均${avg}分`)
  }
})

console.log('\n【五、关系状态分析】\n')

RELATIONS.forEach(rel => {
  const relResults = results.filter(r => r.relation === rel)
  if (relResults.length > 0) {
    const avg = (relResults.reduce((sum, r) => sum + r.score, 0) / relResults.length).toFixed(1)
    console.log(`  ${rel}: ${relResults.length}组, 平均${avg}分`)
  }
})

console.log('\n【六、元素组合分析】\n')

const elementCombos = {}
results.forEach(r => {
  const combo = `${r.elementA}-${r.elementB}`
  elementCombos[combo] = (elementCombos[combo] || 0) + 1
})

Object.entries(elementCombos)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .forEach(([combo, count]) => {
    console.log(`  ${combo}: ${count}组`)
  })

console.log('\n【七、算法稳定性验证】\n')

// 随机选取5组进行稳定性测试
const stabilityTestCases = testCases.slice(0, 5)
let stabilityPassed = 0

stabilityTestCases.forEach((tc, idx) => {
  // 计算10次，验证结果一致性
  const scores = []
  for (let i = 0; i < 10; i++) {
    const result = calculateFate(tc.personA, tc.personB, tc.relation, '')
    scores.push(result.score)
  }
  const allSame = scores.every(s => s === scores[0])
  if (allSame) {
    stabilityPassed++
    console.log(`  测试组${idx + 1}: ✓ 通过 (${scores[0]}分)`)
  } else {
    console.log(`  测试组${idx + 1}: ✗ 失败 (${scores.join(', ')})`)
  }
})

console.log(`\n稳定性测试: ${stabilityPassed}/5 通过`)

console.log('\n【八、对称性验证】\n')

// 验证 A+B = B+A
let symmetryPassed = 0
const symmetryTests = testCases.slice(0, 10)

symmetryTests.forEach((tc, idx) => {
  const resultAB = calculateFate(tc.personA, tc.personB, tc.relation, '')
  const resultBA = calculateFate(tc.personB, tc.personA, tc.relation, '')

  const scoreMatch = resultAB.score === resultBA.score
  const nameMatch = JSON.stringify(resultAB.dimensionList[1]) === JSON.stringify(resultBA.dimensionList[1])

  if (scoreMatch && nameMatch) {
    symmetryPassed++
    console.log(`  测试组${idx + 1}: ✓ 通过 (${resultAB.score}分)`)
  } else {
    console.log(`  测试组${idx + 1}: ✗ 失败 (AB:${resultAB.score}, BA:${resultBA.score})`)
  }
})

console.log(`\n对称性测试: ${symmetryPassed}/10 通过`)

console.log('\n【九、详细测试数据（前10组）】\n')

results.slice(0, 10).forEach((r, idx) => {
  console.log(`组${idx + 1}: ${r.personA.name}(${r.zodiacA}) × ${r.personB.name}(${r.zodiacB})`)
  console.log(`  年龄段: ${r.ageGroup} | 关系: ${r.relation}`)
  console.log(`  总分: ${r.score}分 (${r.level}级 - ${r.levelLabel})`)
  console.log(`  五维度: 星座${r.scores.constellation} | 姓名${r.scores.name} | 灵数${r.scores.numerology} | 性格${r.scores.personality} | 玄学${r.scores.metaphysics}`)
  console.log('')
})

// ==================== 结论 ====================

console.log('========================================')
console.log('   测试结论')
console.log('========================================\n')

// 评估分数分布合理性
const highScoreRatio = (scoreRanges['90-99 (命运级)'] + scoreRanges['80-89 (珍惜级)']) / 50
const midScoreRatio = scoreRanges['70-79 (成长级)'] / 50
const lowScoreRatio = (scoreRanges['50-69 (挑战级)'] + scoreRanges['50以下']) / 50

console.log('分数分布评估:')
if (avgScore >= 65 && avgScore <= 80) {
  console.log('  ✓ 平均分在合理区间 (65-80)')
} else {
  console.log('  ⚠ 平均分可能需要调整')
}

if (stdDev >= 8 && stdDev <= 15) {
  console.log('  ✓ 标准差合理，分数有区分度')
} else {
  console.log('  ⚠ 标准差异常，分数区分度可能不足')
}

console.log('\n等级分布评估:')
const idealDistribution = { S: 10, A: 20, B: 30, C: 30, D: 10 } // 理想占比
const totalDeviations = Object.entries(levelCounts).reduce((sum, [level, count]) => {
  const ideal = idealDistribution[level] / 100 * 50
  return sum + Math.abs(count - ideal)
}, 0)

if (totalDeviations < 20) {
  console.log('  ✓ 等级分布接近理想状态')
} else {
  console.log('  ⚠ 等级分布可能需要调整')
}

console.log('\n算法稳定性:')
if (stabilityPassed === 5) {
  console.log('  ✓ 算法完全稳定，相同输入产生相同输出')
} else {
  console.log('  ✗ 算法存在随机性，需要修复')
}

console.log('\n算法对称性:')
if (symmetryPassed === 10) {
  console.log('  ✓ 算法对称，A+B = B+A')
} else {
  console.log('  ✗ 算法不对称，需要修复')
}

console.log('\n========================================')
console.log('   测试完成')
console.log('========================================')
