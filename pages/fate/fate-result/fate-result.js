const userMgr = require('../../../utils/user.js')
const unlockMgr = require('../../../utils/unlock.js')

// 缘分分析作为一个独立产品，单次付费按此 ID 永久解锁
const FATE_PRODUCT_ID = 'fate'

Page({
  data: {
    result: null,
    scoreAngle: 0,
    // 付费状态
    unlocked: true,        // 当前结果是否已解锁完整解读
    hasPaidOnce: false,    // 是否曾经单次付费
    enableAdUnlock: false,    // 看广告解锁：UV 达 1000 开通流量主后改 true 并填真实 AD_UNIT_ID
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
      'S': 'linear-gradient(135deg, #FFF1F3 0%, #FFE9DC 50%, #FFD9DF 100%)',
      'A': 'linear-gradient(135deg, #FFF1F3 0%, #FFE0E5 50%, #FFD9DF 100%)',
      'B': 'linear-gradient(135deg, #EFF9F5 0%, #E4F4EC 50%, #DDF3EC 100%)',
      'C': 'linear-gradient(135deg, #F8F1F6 0%, #F4E9F0 50%, #FFD9DF 100%)',
      'D': 'linear-gradient(135deg, #F6F2F4 0%, #EFE8EA 50%, #E9DEE1 100%)',
    }

    if (result.level) {
      const levelKey = result.level.level || 'C'
      result.level.bgGradient = levelBgMap[levelKey] || levelBgMap['C']
    }

    // 状态判定：?locked=1 强制走未解锁视图（用于设计预览/调试）
    const isVip = userMgr.isVipMember()
    const hasPaidOnce = userMgr.hasPaidOnce()
    const forceLocked = options && options.locked === '1'
    const runId = result.id || result.runId || ''
    // 已解锁条件：会员 / 当前结果显式标记 unlocked / 缘分产品永久解锁 / 本次广告解锁
    let unlocked
    if (forceLocked) {
      unlocked = false
    } else if (result.unlocked === true) {
      unlocked = true
    } else {
      unlocked = unlockMgr.isResultUnlocked({ testId: FATE_PRODUCT_ID, runId })
    }

    this.setData({
      result,
      scoreAngle,
      unlocked,
      hasPaidOnce,
      isVip,
      showStickyUpgrade: !isVip,
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
    const fateTypeName = (result.fateType && result.fateType.name) || '互动'
    const hashtags = (result.fateType && result.fateType.hashtags) ? result.fateType.hashtags.join(' ') : '#互动日常'

    const text = [
      '🔥 双人互动报告',
      '',
      '「' + fateTypeName + '」',
      (result.level ? result.level.label : ''),
      '',
      personAName + ' ' + zodiacAEmoji + ' × ' + personBName + ' ' + zodiacBEmoji,
      '互动参考：' + (result.score || 0) + '分',
      '',
      dims,
      '',
      hashtags,
      '',
      '—— 来自兴趣与测试小程序',
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

  // ===== 解锁交互 =====

  // 看广告解锁
  onWatchAd() {
    const result = this.data.result || {}
    const runId = result.id || result.runId || ('fate-' + Date.now())
    wx.showLoading({ title: '加载广告...', mask: true })
    unlockMgr.unlockByAd(runId)
      .then(() => {
        wx.hideLoading()
        const next = { ...result, unlocked: true }
        wx.setStorageSync('fate_latest_result', next)
        this.setData({ result: next, unlocked: true, showRetestModal: false })
        wx.showToast({ title: '已解锁', icon: 'success' })
      })
      .catch((err) => {
        wx.hideLoading()
        wx.showToast({ title: (err && err.errMsg) || '广告播放失败', icon: 'none' })
      })
  },

  // 单次付费 ¥3.9（解锁完整互动报告）
  onPaySingle() {
    wx.showModal({
      title: '单次解锁',
      content: '支付 ¥3.9 解锁完整互动报告？',
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({ title: '处理中...', mask: true })
        unlockMgr.unlockBySinglePay(FATE_PRODUCT_ID)
          .then(() => {
            wx.hideLoading()
            const result = { ...(this.data.result || {}), unlocked: true }
            wx.setStorageSync('fate_latest_result', result)
            this.setData({
              result,
              unlocked: true,
              hasPaidOnce: true,
              showStickyUpgrade: !this.data.isVip,
              showRetestModal: false,
            })
            wx.showToast({ title: '已解锁', icon: 'success' })
          })
          .catch((err) => {
            wx.hideLoading()
            wx.showToast({ title: (err && err.message) || '支付失败', icon: 'none' })
          })
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

  // 升级会员（微信支付）
  onPayVip() {
    wx.showModal({
      title: '全站永久解锁',
      content: '微信支付 ¥9.9 永久解锁全部测试？一次买断永久使用',
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({ title: '处理中...', mask: true })
        unlockMgr.unlockByMembership()
          .then(() => {
            wx.hideLoading()
            const result = { ...(this.data.result || {}), unlocked: true }
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
          })
          .catch((err) => {
            wx.hideLoading()
            wx.showToast({ title: (err && err.message) || '开通失败', icon: 'none' })
          })
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
    if (!result) return { title: '双人互动报告', path: '/pages/fate/fate-input/fate-input' }
    const personBName = (result.personB && result.personB.name) || 'TA'
    return {
      title: '我和' + personBName + '的双人互动报告来啦',
      path: '/pages/fate/fate-input/fate-input',
    }
  },
})
