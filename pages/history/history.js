const { getStorage } = require('../../utils/storage.js')

// 关系状态映射
const RELATION_LABELS = {
  'crush': '暗恋中',
  'ambiguous': '暧昧期',
  'dating': '热恋中',
  'together': '在一起',
  'married': '已婚',
  'breakup': '已分手',
}

Page({
  data: {
    activeTab: 'test',
    testRecords: [],
    fateRecords: [],
  },

  onLoad() {
    this.loadAllRecords()
  },

  onShow() {
    this.loadAllRecords()
  },

  loadAllRecords() {
    this.loadTestRecords()
    this.loadFateRecords()
  },

  // 加载心理测试记录
  loadTestRecords() {
    const records = getStorage('test_records') || []
    
    const testRecords = records.map((record, index) => ({
      id: record.id || index,
      testId: record.testId,
      testName: record.testName || '心理测试',
      emoji: record.testEmoji || '📊',
      completedAt: record.completedAt || '未知时间',
      resultTitle: record.resultTitle || '查看结果',
      resultEmoji: record.resultEmoji || '✨',
    }))
    
    this.setData({ testRecords })
  },

  // 加载缘分测试记录
  loadFateRecords() {
    const records = wx.getStorageSync('fate_records') || []
    
    const fateRecords = records.map((record, index) => ({
      id: record.id || index,
      personA: record.personA,
      personB: record.personB,
      score: record.score,
      level: record.level,
      fateType: record.fateType,
      relation: record.relation,
      relationLabel: RELATION_LABELS[record.relation] || '未知',
      completedAt: this.formatDate(record.createdAt),
    }))
    
    this.setData({ fateRecords })
  },

  // 格式化日期
  formatDate(isoString) {
    if (!isoString) return '未知时间'
    try {
      const date = new Date(isoString)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const min = date.getMinutes()
      return `${month}月${day}日 ${hour}:${String(min).padStart(2, '0')}`
    } catch (e) {
      return '未知时间'
    }
  },

  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  goToTests() {
    wx.switchTab({
      url: '/pages/test/test-list/test-list'
    })
  },

  goToFate() {
    wx.navigateTo({
      url: '/pages/fate/fate-input/fate-input'
    })
  },

  viewTestDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/test/test-result/test-result?recordId=${id}`
    })
  },

  viewFateDetail(e) {
    const id = e.currentTarget.dataset.id
    // 找到对应记录并恢复到 storage
    const records = wx.getStorageSync('fate_records') || []
    const record = records.find(r => r.id === id)
    
    if (record) {
      // 从历史记录恢复结果数据（简化版）
      wx.setStorageSync('fate_latest_result', {
        score: record.score,
        level: { level: record.level, label: this.getLevelLabel(record.level) },
        fateType: { name: record.fateType, emoji: this.getFateEmoji(record.level) },
        personA: record.personA,
        personB: record.personB,
        zodiacA: { name: record.personA.zodiac },
        zodiacB: { name: record.personB.zodiac },
      })
      wx.navigateTo({
        url: '/pages/fate/fate-result/fate-result'
      })
    }
  },

  getLevelLabel(level) {
    const labels = { 'S': '天作之合', 'A': '缘分深厚', 'B': '心心相印', 'C': '考验之路', 'D': '波折之旅' }
    return labels[level] || '未知'
  },

  getFateEmoji(level) {
    const emojis = { 'S': '💫', 'A': '💕', 'B': '💗', 'C': '🌀', 'D': '💔' }
    return emojis[level] || '✨'
  },
})
