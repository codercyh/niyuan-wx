const api = require('../../../utils/api.js')

// 把后端 record 转换成 fate-result 页面期望的结构
function buildResultView(record) {
  if (!record) return null

  // 五维度列表
  const dimensionList = [
    { key: 'constellation', name: '星座匹配', emoji: '⭐', color: '#DC8DA8', score: record.scores?.zodiac || 0, percentage: record.scores?.zodiac || 0, desc: `${record.zodiacA?.name || '未知'}×${record.zodiacB?.name || '未知'}` },
    { key: 'name', name: '姓名缘分', emoji: '✍️', color: '#7CC4A0', score: record.scores?.name || 0, percentage: record.scores?.name || 0, desc: '笔画互补' },
    { key: 'numerology', name: '数字缘分', emoji: '🔢', color: '#00D9FF', score: record.scores?.lifePath || 0, percentage: record.scores?.lifePath || 0, desc: `灵数${record.myInfo?.lifePath || 0}×${record.partnerInfo?.lifePath || 0}` },
    { key: 'personality', name: '性格互补', emoji: '🧩', color: '#00FF87', score: record.scores?.personality || 0, percentage: record.scores?.personality || 0, desc: '性格互补' },
    { key: 'metaphysics', name: '命理玄学', emoji: '🔮', color: '#A855F7', score: record.scores?.mystical || 0, percentage: record.scores?.mystical || 0, desc: '命理玄学' },
  ]

  return {
    recordId: record._id || record.id,
    score: record.totalScore || 0,
    level: record.level || { level: 'C', label: '缘分待定', emoji: '✨', color: '#A855F7', desc: '' },
    fateType: record.fateType || { name: '缘分', emoji: '✨', level: 'C', tagline: '', hashtags: [] },
    zodiacA: record.zodiacA || { name: '未知', emoji: '✨', element: 'unknown' },
    zodiacB: record.zodiacB || { name: '未知', emoji: '✨', element: 'unknown' },
    lifePathA: record.myInfo?.lifePath || 0,
    lifePathB: record.partnerInfo?.lifePath || 0,
    elementMatch: record.elementMatch || { label: '缘分', shortDesc: '', desc: '' },
    dimensionList,
    whyAttract: record.whyAttract || '',
    dailyDialogue: record.dailyDialogue || { lines: [], comment: '' },
    conflictTopics: record.conflictTopics || [],
    adviceList: record.adviceList || [],
    momentsText: record.momentsText || [],
    specialHint: record.specialHint || null,
    personA: { name: record.myInfo?.name || '', birthday: record.myInfo?.birthDate || '' },
    personB: { name: record.partnerInfo?.name || '', birthday: record.partnerInfo?.birthDate || '' },
    relation: record.relationType,
    story: record.story || '',
  }
}

Page({
  data: {
    progress: 0,
    steps: [
      { label: '元素匹配分析', status: 'waiting' },
      { label: '姓名缘分分析', status: 'waiting' },
      { label: '数字缘分分析', status: 'waiting' },
      { label: '性格互补分析', status: 'waiting' },
      { label: '综合缘分分析', status: 'waiting' },
    ],
    loadingText: '正在测算你们的缘分...',
  },

  onLoad() {
    this.timers = []
    this.apiDone = false
    this.animDone = false
    this.apiResult = null
    this.apiError = null
    this.startApiCall()
    this.startAnimation()
  },

  startApiCall() {
    const inputData = wx.getStorageSync('fate_input')
    if (!inputData) {
      this.apiError = new Error('数据丢失')
      this.apiDone = true
      this.tryFinish()
      return
    }

    const personA = inputData.personA || {}
    const personB = inputData.personB || {}
    const myInfo = {
      name: personA.name || '',
      birthDate: personA.birthday || '',
      zodiacSign: (personA.zodiac && personA.zodiac.name) || '',
      lifePath: personA.lifePath || 0,
    }
    const partnerInfo = {
      name: personB.name || '',
      birthDate: personB.birthday || '',
      zodiacSign: (personB.zodiac && personB.zodiac.name) || '',
      lifePath: personB.lifePath || 0,
    }
    const relationType = inputData.relation || 'love'
    const tags = []
    if (inputData.story) tags.push(inputData.story.slice(0, 20))
    const story = inputData.story || ''

    // 调用后端API，后端会保存记录并返回完整数据
    api.analyzeNiyuan(myInfo, partnerInfo, relationType, tags, story)
      .then((res) => {
        // 后端返回的 data 就是完整的 NiyuanRecord
        this.apiResult = (res && res.data) || null
        this.apiDone = true
        this.tryFinish()
      })
      .catch((err) => {
        console.error('[fate-loading] analyze failed', err)
        this.apiError = err
        this.apiDone = true
        this.tryFinish()
      })
  },

  startAnimation() {
    let currentStep = 0

    const progressTimer = setInterval(() => {
      const newProgress = Math.min(100, this.data.progress + 2)
      this.setData({ progress: newProgress })
      if (newProgress >= 100) clearInterval(progressTimer)
    }, 60)
    this.timers.push(progressTimer)

    this.setData({ ['steps[0].status']: 'loading' })

    const stepTimer = setInterval(() => {
      if (currentStep >= this.data.steps.length) {
        clearInterval(stepTimer)
        this.animDone = true
        this.tryFinish()
        return
      }
      this.setData({ [`steps[${currentStep}].status`]: 'done' })
      currentStep++
      if (currentStep < this.data.steps.length) {
        this.setData({ [`steps[${currentStep}].status`]: 'loading' })
      }
    }, 600)
    this.timers.push(stepTimer)
  },

  tryFinish() {
    if (!(this.apiDone && this.animDone)) return
    if (this.finished) return
    this.finished = true

    if (this.apiError) {
      wx.showToast({
        title: (this.apiError && this.apiError.message) || '分析失败',
        icon: 'none',
      })
      const back = setTimeout(() => wx.navigateBack(), 1200)
      this.timers.push(back)
      return
    }

    // 使用后端返回的完整数据构建视图
    const view = buildResultView(this.apiResult)
    if (view) {
      wx.setStorageSync('fate_latest_result', view)
    }

    const navTimeout = setTimeout(() => {
      wx.redirectTo({ url: '/pages/fate/fate-result/fate-result' })
    }, 300)
    this.timers.push(navTimeout)
  },

  onUnload() {
    if (this.timers) {
      this.timers.forEach(t => {
        clearTimeout(t)
        clearInterval(t)
      })
      this.timers = []
    }
  },
})
