const { getStorage, setStorage } = require('../../../utils/storage.js')
const { getTestById, getRecommendedTests } = require('../../../data/tests-data.js')
const { formatParticipants } = require('../../../utils/format.js')

Page({
  data: {
    testId: null,
    recordId: null,
    testName: '',
    result: {},
    recommendTests: [],
    completedAt: '',
  },

  onLoad(options) {
    const testId = options.testId
    const recordId = options.recordId

    this.setData({
      testId,
      recordId,
    })

    this.loadResult(testId, recordId)
  },

  loadResult(testId, recordId) {
    // 从存储中获取测试记录
    const testRecords = getStorage('test_records', [])
    const record = testRecords.find(r => r.id === parseInt(recordId))

    if (record && record.result) {
      this.setData({
        result: record.result,
        testName: record.testName,
        completedAt: record.completedAt,
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

  // 重新测试
  onRetake() {
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
})
