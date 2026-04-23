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
    // find the test record to pass testId
    const records = wx.getStorageSync('test_records') || []
    const record = records.find(r => r.id === id)
    const testId = record ? record.testId : ''
    wx.navigateTo({
      url: '/pages/test/test-result/test-result?recordId=' + id + (testId ? '&testId=' + testId : ''),
    })
  },

  viewFateDetail(e) {
    const id = e.currentTarget.dataset.id
    const records = wx.getStorageSync('fate_records') || []
    const record = records.find(r => r.id === id)

    if (record) {
      wx.setStorageSync('fate_latest_result', {
        score: record.score || 50,
        level: { level: record.level || 'C', label: this.getLevelLabel(record.level), emoji: this.getFateEmoji(record.level) },
        fateType: { name: record.fateType || '缘分待定', emoji: this.getFateEmoji(record.level), hashtags: ['#缘分测试', '#缘分'] },
        personA: record.personA || {},
        personB: record.personB || {},
        zodiacA: { name: (record.personA && record.personA.zodiac) || '未知', emoji: '✨', element: 'unknown', en: '' },
        zodiacB: { name: (record.personB && record.personB.zodiac) || '未知', emoji: '✨', element: 'unknown', en: '' },
        elementMatch: { label: '缘分', shortDesc: '', desc: '' },
        dimensionList: [
          { key: 'constellation', name: '星座匹配', emoji: '⭐', color: '#FF6B35', score: record.score || 50, percentage: record.score || 50, desc: '星座配对' },
        ],
        dailyDialogue: { lines: [], comment: '' },
        conflictTopics: [],
        adviceList: [],
        whyAttract: '',
        specialHint: null,
      })
      wx.navigateTo({
        url: '/pages/fate/fate-result/fate-result',
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
