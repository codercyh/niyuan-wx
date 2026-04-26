const { getStorage, setStorage } = require('../../../utils/storage.js')
const { getTestById, getRecommendedTests } = require('../../../data/tests-data.js')
const { formatParticipants } = require('../../../utils/format.js')
const userMgr = require('../../../utils/user.js')

Page({
  data: {
    testId: null,
    recordId: null,
    testName: '',
    result: {},
    recommendTests: [],
    completedAt: '',
    // 付费状态
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

    this.setData({
      testId,
      recordId,
    })

    this.loadResult(testId, recordId, forceLocked)
  },

  loadResult(testId, recordId, forceLocked) {
    // 从存储中获取测试记录
    const testRecords = getStorage('test_records', [])
    const record = testRecords.find(r => r.id === parseInt(recordId))

    if (record && record.result) {
      const isVip = userMgr.isVipMember()
      const hasPaidOnce = userMgr.hasPaidOnce()
      let unlocked
      if (forceLocked) unlocked = false
      else if (isVip) unlocked = true
      else if (record.result.unlocked === true) unlocked = true
      else unlocked = hasPaidOnce

      this.setData({
        result: record.result,
        testName: record.testName,
        completedAt: record.completedAt,
        unlocked,
        hasPaidOnce,
        isVip,
        showStickyUpgrade: hasPaidOnce && !isVip,
      })

      // 加载推荐测试
      this.loadRecommendTests(testId)
    } else {
      wx.showToast({ title: '结果加载失败', icon: 'error' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  loadRecommendTests(currentTestId) {
    const recommended = getRecommendedTests(currentTestId, 3).map(test => ({
      ...test,
      participantsText: formatParticipants(test.participants),
    }))
    this.setData({ recommendTests: recommended })
  },

  // 复制结果
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
            success: () => {
              wx.showToast({ title: '已复制', icon: 'success' })
            },
          })
        } else if (res.tapIndex === 1) {
          this.onGeneratePoster()
        }
      },
    })
  },

  // 生成海报
  onGeneratePoster() {
    const { result, testId } = this.data

    // 保存最新结果供海报页面使用
    wx.setStorageSync('test_latest_result', result)

    wx.navigateTo({
      url: `/pages/test/test-poster/test-poster?testId=${testId || ''}`,
    })
  },

  // 保存结果
  onSaveResult() {
    const result = this.data.result
    const testName = this.data.testName

    // 保存到用户档案
    const savedTests = getStorage('my_test_results', [])

    const newTest = {
      id: Date.now(),
      testId: this.data.testId,
      testName: testName,
      result: result.title || result.type,
      score: result.score,
      completedAt: this.data.completedAt,
    }

    savedTests.unshift(newTest)
    setStorage('my_test_results', savedTests.slice(0, 50)) // 保持最近50条

    wx.showToast({
      title: '已保存',
      icon: 'success',
    })
  },

  // 重新测试 — 单次付费用户弹出"专属优惠"重测弹窗
  onRetake() {
    if (this.data.hasPaidOnce && !this.data.isVip) {
      this.setData({ showRetestModal: true })
      return
    }
    wx.redirectTo({
      url: `/pages/test/test-detail/test-detail?id=${this.data.testId}`,
    })
  },

  onRetestConfirm() {
    this.setData({ showRetestModal: false })
    wx.redirectTo({
      url: `/pages/test/test-detail/test-detail?id=${this.data.testId}`,
    })
  },

  // 打开推荐测试
  onOpenTest(e) {
    const testId = e.currentTarget.dataset.id
    wx.redirectTo({
      url: `/pages/test/test-detail/test-detail?id=${testId}`,
    })
  },

  // 返回首页
  onBackHome() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },

  // 查看所有测试
  onViewAllTests() {
    wx.switchTab({
      url: '/pages/test/test-list/test-list',
    })
  },

  // ===== 付费/解锁交互 =====

  onWatchAd() {
    wx.showLoading({ title: '加载广告...' })
    setTimeout(() => {
      wx.hideLoading()
      const result = this.data.result || {}
      result.unlocked = true
      this.setData({ result, unlocked: true, showRetestModal: false })
      wx.showToast({ title: '已解锁', icon: 'success' })
    }, 800)
  },

  onPaySingle() {
    wx.showModal({
      title: '单次解锁',
      content: '支付 ¥9.9 解锁完整解读？',
      success: (res) => {
        if (!res.confirm) return
        userMgr.markPaidOnce()
        const result = this.data.result || {}
        result.unlocked = true
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

  onShowUpgradeModal() { this.setData({ showUpgradeModal: true }) },
  onCloseUpgradeModal() { this.setData({ showUpgradeModal: false }) },
  onShowRetestModal() { this.setData({ showRetestModal: true }) },
  onCloseRetestModal() { this.setData({ showRetestModal: false }) },
  onCloseSticky() { this.setData({ showStickyUpgrade: false }) },

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
})
