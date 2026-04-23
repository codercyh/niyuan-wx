const { generateMomentsText } = require('../../../data/fate-data.js')

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

    // 计算分数角度
    const scoreAngle = Math.round((result.score / 100) * 360)
    
    // 为等级添加背景渐变
    const levelBgMap = {
      'S': 'linear-gradient(135deg, #FFD700 0%, #FF6B35 50%, #FF006E 100%)',
      'A': 'linear-gradient(135deg, #00D9FF 0%, #0066FF 50%, #6366F1 100%)',
      'B': 'linear-gradient(135deg, #00FF87 0%, #00D9FF 50%, #6366F1 100%)',
      'C': 'linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #302B63 100%)',
      'D': 'linear-gradient(135deg, #6366F1 0%, #302B63 100%)',
    }
    result.level.bgGradient = levelBgMap[result.level.level] || levelBgMap['C']

    this.setData({ result, scoreAngle })
  },

  // 复制分享文案
  onCopyText(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制 ✓', icon: 'success' })
      }
    })
  },

  // 复制完整结果
  onCopyResult() {
    const { result } = this.data
    if (!result) return

    const dims = result.dimensionList.map(d => `${d.emoji}${d.name}: ${d.score}分`).join('\n')

    const text = [
      `🔥 缘分测试结果`,
      ``,
      `「${result.fateType.name}」`,
      `${result.level.level}级 · ${result.level.label}`,
      ``,
      `${result.personA.name} ${result.zodiacA.emoji} × ${result.personB.name} ${result.zodiacB.emoji}`,
      `缘分值：${result.score}分`,
      ``,
      `"${result.fateType.tagline}"`,
      ``,
      `📊 各维度得分：`,
      dims,
      ``,
      `${result.fateType.hashtags.join(' ')}`,
      ``,
      `—— 来自缘分测试小程序`,
    ].join('\n')

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  },

  // 保存记录
  onSaveRecord() {
    const { result } = this.data
    if (!result) return
    
    // 已在 loading 页保存，这里提示即可
    wx.showToast({ title: '已保存到记录', icon: 'success' })
  },

  // 生成分享海报
  onGeneratePoster() {
    wx.navigateTo({ url: '/pages/fate/fate-poster/fate-poster' })
  },

  // 重新测试
  onRetry() {
    wx.navigateBack()
  },

  // 返回首页
  onBackHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  // 分享
  onShareAppMessage() {
    const { result } = this.data
    return {
      title: `我和${result.personB.name}的缘分是${result.score}分，「${result.fateType.name}」`,
      path: '/pages/fate/fate-input/fate-input',
    }
  },
})
