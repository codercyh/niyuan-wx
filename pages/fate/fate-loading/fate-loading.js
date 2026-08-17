const api = require('../../../utils/api.js')

// 把后端 record 转换成 fate-result 页面期望的结构
function buildResultView(record) {
  if (!record) return null

  // 五维度列表（外露维度名，内部计算逻辑不变）
  const dimensionList = [
    { key: 'constellation', name: '相处节奏', emoji: '⭐', color: '#DC8DA8', score: record.scores?.zodiac || 0, percentage: record.scores?.zodiac || 0, desc: '日常节奏' },
    { key: 'name', name: '表达方式', emoji: '✍️', color: '#7CC4A0', score: record.scores?.name || 0, percentage: record.scores?.name || 0, desc: '表达方式' },
    { key: 'numerology', name: '日常习惯', emoji: '🔢', color: '#98B8D8', score: record.scores?.lifePath || 0, percentage: record.scores?.lifePath || 0, desc: '日常习惯' },
    { key: 'personality', name: '性格互补', emoji: '🧩', color: '#E8B878', score: record.scores?.personality || 0, percentage: record.scores?.personality || 0, desc: '性格互补' },
    { key: 'metaphysics', name: '互动观察', emoji: '💬', color: '#C9A0C8', score: record.scores?.mystical || 0, percentage: record.scores?.mystical || 0, desc: '互动观察' },
  ]

  return {
    recordId: record._id || record.id,
    score: record.totalScore || 0,
    level: record.level || { level: 'C', label: '互动类型待定', emoji: '✨', color: '#C9A0C8', desc: '' },
    fateType: record.fateType || { name: '互动', emoji: '✨', level: 'C', tagline: '', hashtags: [] },
    zodiacA: record.zodiacA || { name: '未知', emoji: '✨', element: 'unknown' },
    zodiacB: record.zodiacB || { name: '未知', emoji: '✨', element: 'unknown' },
    lifePathA: record.myInfo?.lifePath || 0,
    lifePathB: record.partnerInfo?.lifePath || 0,
    elementMatch: record.elementMatch || { label: '互动', shortDesc: '', desc: '' },
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
    myName: '你',
    taName: 'TA',
    steps: [
      { label: '双方信息已整理', status: 'waiting' },
      { label: '基础内容已整理', status: 'waiting' },
      { label: '互动特点已整理', status: 'waiting' },
      { label: '相处建议已生成', status: 'waiting' },
      { label: '报告排版已完成', status: 'waiting' },
    ],
  },

  onLoad() {
    this.timers = []
    this.apiDone = false
    this.animDone = false
    this.apiResult = null
    this.apiError = null

    // 双卡动画展示双方昵称
    const inputData = wx.getStorageSync('fate_input')
    if (inputData) {
      this.setData({
        myName: (inputData.personA && inputData.personA.name || '').slice(0, 4) || '你',
        taName: (inputData.personB && inputData.personB.name || '').slice(0, 4) || 'TA',
      })
    }

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
        title: (this.apiError && this.apiError.message === '数据丢失') ? '信息丢失，请重新填写' : '生成失败，请重试',
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
