const userMgr = require('../../../utils/user.js')

Page({
  data: {
    result: null,
    scoreAngle: 0,
    // 付费状态
    unlocked: true,        // 当前结果是否已解锁完整解读
    hasPaidOnce: false,    // 是否曾经单次付费
    isVip: false,          // 是否会员
    showStickyUpgrade: true, // 底部常驻升级条是否显示
    // 弹窗
    showUpgradeModal: false,
    showRetestModal: false,
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

    // 状态判定：?locked=1 强制走未解锁视图（用于设计预览/调试）
    const isVip = userMgr.isVipMember()
    const hasPaidOnce = userMgr.hasPaidOnce()
    const forceLocked = options && options.locked === '1'
    // 已解锁条件：会员 / 当前结果显式标记 unlocked / 已付费过但未强制锁定
    let unlocked
    if (forceLocked) {
      unlocked = false
    } else if (isVip) {
      unlocked = true
    } else if (result.unlocked === true) {
      unlocked = true
    } else {
      // 默认：未付费用户进入即未解锁；已单次付费用户视为本次已解锁
      unlocked = hasPaidOnce
    }

    this.setData({
      result,
      scoreAngle,
      unlocked,
      hasPaidOnce,
      isVip,
      showStickyUpgrade: hasPaidOnce && !isVip,
    })
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
    // 单次付费用户重新测试时弹出"专属优惠"重测弹窗（场景2 → 重测）
    if (this.data.hasPaidOnce && !this.data.isVip) {
      this.setData({ showRetestModal: true })
      return
    }
    wx.navigateBack()
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  // ===== 解锁交互 =====

  // 看广告解锁
  onWatchAd() {
    wx.showLoading({ title: '加载广告...' })
    setTimeout(() => {
      wx.hideLoading()
      const result = this.data.result || {}
      result.unlocked = true
      wx.setStorageSync('fate_latest_result', result)
      this.setData({ result, unlocked: true })
      wx.showToast({ title: '已解锁', icon: 'success' })
    }, 800)
  },

  // 单次付费 ¥9.9
  onPaySingle() {
    wx.showModal({
      title: '单次解锁',
      content: '支付 ¥9.9 解锁完整解读？',
      success: (res) => {
        if (!res.confirm) return
        userMgr.markPaidOnce()
        const result = this.data.result || {}
        result.unlocked = true
        wx.setStorageSync('fate_latest_result', result)
        this.setData({
          result,
          unlocked: true,
          hasPaidOnce: true,
          showStickyUpgrade: !this.data.isVip,
          showRetestModal: false,
        })
        wx.showToast({ title: '已解锁', icon: 'success' })
      },
    })
  },

  // 升级会员弹窗
  onShowUpgradeModal() {
    this.setData({ showUpgradeModal: true })
  },
  onCloseUpgradeModal() {
    this.setData({ showUpgradeModal: false })
  },

  // 重测弹窗
  onShowRetestModal() {
    this.setData({ showRetestModal: true })
  },
  onCloseRetestModal() {
    this.setData({ showRetestModal: false })
  },

  // 关闭底部常驻升级条
  onCloseSticky() {
    this.setData({ showStickyUpgrade: false })
  },

  // 升级会员（微信支付/抖音支付）
  onPayVip(e) {
    const channel = (e && e.currentTarget && e.currentTarget.dataset.channel) || 'wechat'
    wx.showModal({
      title: '升级会员',
      content: '通过 ' + (channel === 'wechat' ? '微信' : '抖音') + ' 支付 ¥9.9 开通首月会员？',
      success: (res) => {
        if (!res.confirm) return
        userMgr.markVipMember({ months: 1 })
        const result = this.data.result || {}
        result.unlocked = true
        wx.setStorageSync('fate_latest_result', result)
        this.setData({
          result,
          unlocked: true,
          isVip: true,
          showStickyUpgrade: false,
          showUpgradeModal: false,
          showRetestModal: false,
        })
        wx.showToast({ title: '会员已开通', icon: 'success' })
      },
    })
  },

  // 弹窗中"重新测试" -> 跳回输入页
  onRetestConfirm() {
    this.setData({ showRetestModal: false })
    wx.redirectTo({ url: '/pages/fate/fate-input/fate-input' })
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
