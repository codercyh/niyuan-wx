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
    this.startAnimation()
  },

  startAnimation() {
    let currentStep = 0

    // 进度条动画：3秒内从0到100（每60ms +2）
    const progressTimer = setInterval(() => {
      const newProgress = Math.min(100, this.data.progress + 2)
      this.setData({ progress: newProgress })
      if (newProgress >= 100) clearInterval(progressTimer)
    }, 60)
    this.timers.push(progressTimer)

    // 第一项立即设为 loading
    this.setData({ ['steps[0].status']: 'loading' })

    // 分析项逐个完成
    const stepTimer = setInterval(() => {
      if (currentStep >= this.data.steps.length) {
        clearInterval(stepTimer)
        this.finishAndNavigate()
        return
      }

      // 当前项完成
      this.setData({ [`steps[${currentStep}].status`]: 'done' })
      currentStep++

      if (currentStep < this.data.steps.length) {
        this.setData({ [`steps[${currentStep}].status`]: 'loading' })
      }
    }, 600)
    this.timers.push(stepTimer)
  },

  finishAndNavigate() {
    const { calculateFate } = require('../../../data/fate-data.js')
    const inputData = wx.getStorageSync('fate_input')

    if (!inputData) {
      wx.navigateBack()
      return
    }

    const result = calculateFate(inputData.personA, inputData.personB, inputData.relation, inputData.story, {
      durationYears: inputData.durationYears,
      durationMonths: inputData.durationMonths,
      breakupDuration: inputData.breakupDuration,
      breakupIntention: inputData.breakupIntention,
    })

    // 保存结果
    wx.setStorageSync('fate_latest_result', result)

    // 保存历史记录
    const records = wx.getStorageSync('fate_records') || []
    records.unshift({
      id: Date.now().toString(),
      personA: { name: inputData.personA.name, zodiac: inputData.personA.zodiac.name },
      personB: { name: inputData.personB.name, zodiac: inputData.personB.zodiac.name },
      score: result.score,
      level: result.level.level,
      fateType: result.fateType.name,
      relation: inputData.relation,
      createdAt: new Date().toISOString(),
    })
    wx.setStorageSync('fate_records', records.slice(0, 50))

    const navTimeout = setTimeout(() => {
      wx.redirectTo({ url: '/pages/fate/fate-result/fate-result' })
    }, 500)
    this.timers.push(navTimeout)
  },

  onUnload() {
    if (this.timers) {
      this.timers.forEach(t => clearInterval(t))
      this.timers = []
    }
  }
})
