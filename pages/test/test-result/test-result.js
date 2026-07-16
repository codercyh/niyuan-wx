const api = require('../../../utils/api.js')
const { formatParticipants } = require('../../../utils/format.js')
const userMgr = require('../../../utils/user.js')
const unlockMgr = require('../../../utils/unlock.js')

const CATEGORY_EMOJI = {
  fun: '🤪', personality: '👤', love: '💕',
  psychology: '🧠', career: '💼', divination: '🔮',
}

// 后端 record + Test 字段 → 旧 result UI 期望字段
function buildResultView(record, testInfo) {
  const result = {
    title: record.resultName || record.resultType || '测试完成',
    type: record.resultType || '',
    description: record.resultDescription || '',
    score: record.totalScore || 0,
    emoji: '🎯',
    traits: (record.resultTraits || []).reduce((acc, t, i) => {
      acc[t] = 8 // 后端没存维度分时，给一个占位
      return acc
    }, {}),
    correctCount: undefined,
    unlocked: !!record.unlocked,
  }
  return {
    result,
    testName: (testInfo && testInfo.title) || record.testTitle || '测试',
    completedAt: record.createdAt ? new Date(record.createdAt).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
  }
}

Page({
  data: {
    testId: null,
    recordId: null,
    testName: '',
    result: {},
    recommendTests: [],
    completedAt: '',
    unlocked: true,
    hasPaidOnce: false,
    isVip: false,
    showStickyUpgrade: true,
    showUpgradeModal: false,
    showRetestModal: false,
  },

  onLoad(options) {
    const testId = options.testId
    const recordId = options.recordId
    const forceLocked = options && options.locked === '1'
    this.setData({ testId, recordId })
    this.loadResult(testId, recordId, forceLocked)
  },

  loadResult(testId, recordId, forceLocked) {
    // 先尝试从内存缓存（提交页刚保存的记录）读取，避免重复请求
    let cached = null
    try { cached = wx.getStorageSync('test_latest_record') } catch (e) {}

    const recordPromise = (cached && (cached._id === recordId || cached.id === recordId))
      ? Promise.resolve(cached)
      : this.fetchRecord(testId, recordId)

    Promise.all([recordPromise, api.getTestDetail(testId).catch(() => null)])
      .then(([record, detailRes]) => {
        if (!record) {
          wx.showToast({ title: '结果加载失败', icon: 'error' })
          setTimeout(() => wx.navigateBack(), 1500)
          return
        }
        const testInfo = (detailRes && detailRes.data && detailRes.data.test) || {}
        const view = buildResultView(record, testInfo)

        const isVip = userMgr.isVipMember()
        const hasPaidOnce = userMgr.hasPaidOnce()
        let unlocked
        if (forceLocked) unlocked = false
        else if (record.unlocked === true) unlocked = true
        else unlocked = unlockMgr.isResultUnlocked({ testId, runId: recordId })

        this.setData({
          result: view.result,
          testName: view.testName,
          completedAt: view.completedAt,
          unlocked,
          hasPaidOnce,
          isVip,
          showStickyUpgrade: hasPaidOnce && !isVip,
        })
        this.loadRecommendTests(testId)
        // 记录已由后端保存，无需本地存储
      })
      .catch((err) => {
        console.error('[test-result] load failed', err)
        wx.showToast({ title: (err && err.message) || '结果加载失败', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      })
  },

  fetchRecord(testId, recordId) {
    // 后端无单条 record 查询接口，从用户记录列表中按 id 查找
    return api.getUserTestRecords(1, 50).then((res) => {
      const list = (res && res.data && res.data.records) || (res && res.data && res.data.list) || []
      return list.find(r => r._id === recordId || r.id === recordId) || null
    })
  },

  loadRecommendTests(currentTestId) {
    api.getTestList(1, 6).then((res) => {
      const list = ((res && res.data && res.data.tests) || [])
        .filter(t => t.testId !== currentTestId)
        .slice(0, 3)
        .map(t => ({
          id: t.testId,
          name: t.title,
          emoji: CATEGORY_EMOJI[t.category] || '📊',
          description: t.description || t.subtitle || '',
          participants: t.participants || 0,
          participantsText: formatParticipants(t.participants || 0),
        }))
      this.setData({ recommendTests: list })
    }).catch((err) => {
      console.warn('[test-result] recommend load failed', err)
    })
  },

  onShare() {
    const result = this.data.result
    const testName = this.data.testName
    const shareText = `我刚完成了"${testName}"测试，结果是：${result.title || result.type}（${result.score}分）。你也来试试吧！`
    wx.showActionSheet({
      itemList: ['复制结果文案', '生成分享海报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: shareText,
            success: () => wx.showToast({ title: '已复制', icon: 'success' }),
          })
        } else if (res.tapIndex === 1) {
          this.onGeneratePoster()
        }
      },
    })
  },

  onGeneratePoster() {
    const { result, testId } = this.data
    wx.setStorageSync('test_latest_result', result)
    wx.navigateTo({ url: `/pages/test/test-poster/test-poster?testId=${testId || ''}` })
  },

  onSaveResult() {
    // 服务端已自动保存到 TestRecord，这里只作 UX 反馈
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  onRetake() {
    if (this.data.hasPaidOnce && !this.data.isVip) {
      this.setData({ showRetestModal: true })
      return
    }
    wx.redirectTo({ url: `/pages/test/test-detail/test-detail?id=${this.data.testId}` })
  },

  onRetestConfirm() {
    this.setData({ showRetestModal: false })
    wx.redirectTo({ url: `/pages/test/test-detail/test-detail?id=${this.data.testId}` })
  },

  onOpenTest(e) {
    const testId = e.currentTarget.dataset.id
    wx.redirectTo({ url: `/pages/test/test-detail/test-detail?id=${testId}` })
  },

  onViewAllTests() { wx.switchTab({ url: '/pages/test/test-list/test-list' }) },

  // ===== 付费/解锁 =====
  onWatchAd() {
    const runId = this.data.recordId || this.data.testId
    wx.showLoading({ title: '加载广告...', mask: true })
    unlockMgr.unlockByAd(runId)
      .then(() => {
        wx.hideLoading()
        const result = { ...(this.data.result || {}), unlocked: true }
        this.setData({ result, unlocked: true, showRetestModal: false })
        wx.showToast({ title: '已解锁', icon: 'success' })
      })
      .catch((err) => {
        wx.hideLoading()
        wx.showToast({ title: (err && err.errMsg) || '广告播放失败', icon: 'none' })
      })
  },

  onPaySingle() {
    wx.showModal({
      title: '单次解锁',
      content: '支付 ¥9.9 永久解锁该测试的完整解读？',
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({ title: '处理中...', mask: true })
        unlockMgr.unlockBySinglePay(this.data.testId)
          .then(() => {
            wx.hideLoading()
            const result = { ...(this.data.result || {}), unlocked: true }
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

  onShowUpgradeModal() { this.setData({ showUpgradeModal: true }) },
  onCloseUpgradeModal() { this.setData({ showUpgradeModal: false }) },
  onShowRetestModal() { this.setData({ showRetestModal: true }) },
  onCloseRetestModal() { this.setData({ showRetestModal: false }) },
  onCloseSticky() { this.setData({ showStickyUpgrade: false }) },

  onPayVip() {
    wx.showModal({
      title: '升级月度会员',
      content: '微信支付 ¥9.9 开通月度会员？期内不限次数解锁所有测试',
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({ title: '处理中...', mask: true })
        unlockMgr.unlockByMembership({ months: 1 })
          .then(() => {
            wx.hideLoading()
            const result = { ...(this.data.result || {}), unlocked: true }
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
})
