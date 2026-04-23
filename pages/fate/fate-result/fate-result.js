Page({
  data: {
    result: null,
    scoreAngle: 0,
  },

  onLoad(options) {
    const result = wx.getStorageSync('fate_latest_result')
    if (!result) {
      wx.showToast({ title: '数据丢失', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }

    const scoreAngle = Math.round(((result.score || 0) / 100) * 360)

    const levelBgMap = {
      'S': 'linear-gradient(135deg, #FFD700 0%, #FF6B35 50%, #FF006E 100%)',
      'A': 'linear-gradient(135deg, #00D9FF 0%, #0066FF 50%, #6366F1 100%)',
      'B': 'linear-gradient(135deg, #00FF87 0%, #00D9FF 50%, #6366F1 100%)',
      'C': 'linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #302B63 100%)',
      'D': 'linear-gradient(135deg, #6366F1 0%, #302B63 100%)',
    }

    if (result.level) {
      const levelKey = result.level.level || 'C'
      result.level.bgGradient = levelBgMap[levelKey] || levelBgMap['C']
    }

    this.setData({ result, scoreAngle })
  },

  onCopyText(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制', icon: 'success' }),
    })
  },

  onCopyResult() {
    const { result } = this.data
    if (!result) return

    const dims = (result.dimensionList || []).map(d => d.emoji + d.name + ': ' + d.score + '分').join('\n')
    const personAName = (result.personA && result.personA.name) || 'A'
    const personBName = (result.personB && result.personB.name) || 'B'
    const zodiacAEmoji = (result.zodiacA && result.zodiacA.emoji) || '✨'
    const zodiacBEmoji = (result.zodiacB && result.zodiacB.emoji) || '✨'
    const fateTypeName = (result.fateType && result.fateType.name) || '缘分'
    const hashtags = (result.fateType && result.fateType.hashtags) ? result.fateType.hashtags.join(' ') : '#缘分测试'

    const text = [
      '🔥 缘分测试结果',
      '',
      '「' + fateTypeName + '」',
      (result.level ? result.level.level + '级 · ' + result.level.label : ''),
      '',
      personAName + ' ' + zodiacAEmoji + ' × ' + personBName + ' ' + zodiacBEmoji,
      '缘分值：' + (result.score || 0) + '分',
      '',
      dims,
      '',
      hashtags,
      '',
      '—— 来自缘分测试小程序',
    ].filter(Boolean).join('\n')

    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制', icon: 'success' }),
    })
  },

  onSaveRecord() {
    wx.showToast({ title: '已保存到记录', icon: 'success' })
  },

  onGeneratePoster() {
    wx.navigateTo({ url: '/pages/fate/fate-poster/fate-poster' })
  },

  onRetry() {
    wx.navigateBack()
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  onShareAppMessage() {
    const { result } = this.data
    if (!result) return { title: '缘分测试', path: '/pages/fate/fate-input/fate-input' }
    const personBName = (result.personB && result.personB.name) || 'TA'
    return {
      title: '我和' + personBName + '的缘分是' + (result.score || 0) + '分',
      path: '/pages/fate/fate-input/fate-input',
    }
  },
})