const api = require('../../utils/api.js')
const { formatDateTime } = require('../../utils/format.js')

// 关系状态映射
const RELATION_LABELS = {
  'crush': '暗恋中',
  'ambiguous': '暧昧期',
  'dating': '热恋中',
  'together': '在一起',
  'married': '已婚',
  'breakup': '已分手',
  'love': '恋人',
  'friendship': '朋友',
  'family': '家人',
  'work': '同事',
}

Page({
  data: {
    activeTab: 'test',
    testRecords: [],
    fateRecords: [],
    loading: false,
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

  // 加载心理测试记录（从后端API）
  loadTestRecords() {
    api.getUserTestRecords(1, 50)
      .then(res => {
        const records = (res && res.data && res.data.records) || []
        const testRecords = records.map(record => ({
          id: record._id || record.id,
          testId: record.testId,
          testName: record.testTitle || '心理测试',
          emoji: '🧪',
          completedAt: this.formatDate(record.createdAt),
          resultTitle: record.resultName || record.resultType || '查看结果',
          resultEmoji: '✨',
        }))
        this.setData({ testRecords })
      })
      .catch(err => {
        console.error('[history] load test records failed:', err)
        this.setData({ testRecords: [] })
      })
  },

  // 加载缘分测试记录（从后端API）
  loadFateRecords() {
    api.getNiyuanHistory(1, 50)
      .then(res => {
        const records = (res && res.data && res.data.records) || []
        const fateRecords = records.map(record => ({
          id: record._id || record.id,
          personA: {
            name: record.myInfo?.name || '未知',
            zodiac: record.myInfo?.zodiacSign || '未知',
          },
          personB: {
            name: record.partnerInfo?.name || '未知',
            zodiac: record.partnerInfo?.zodiacSign || '未知',
          },
          score: record.totalScore || 0,
          level: record.level?.level || 'C',
          fateType: record.fateType?.name || '缘分',
          relation: record.relationType,
          relationLabel: record.relationLabel || RELATION_LABELS[record.relationType] || '未知',
          completedAt: this.formatDate(record.createdAt),
        }))
        this.setData({ fateRecords })
      })
      .catch(err => {
        console.error('[history] load fate records failed:', err)
        this.setData({ fateRecords: [] })
      })
  },

  // 格式化日期
  formatDate(isoString) {
    if (!isoString) return '未知时间'
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '未知时间'
    return formatDateTime(date)
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
    const record = this.data.testRecords.find(r => r.id === id)
    const testId = record ? record.testId : ''
    wx.navigateTo({
      url: '/pages/test/test-result/test-result?recordId=' + id + (testId ? '&testId=' + testId : ''),
    })
  },

  viewFateDetail(e) {
    const id = e.currentTarget.dataset.id

    // 显示加载中
    wx.showLoading({ title: '加载中...' })

    // 从后端API获取完整记录详情
    api.getNiyuanRecord(id)
      .then(res => {
        wx.hideLoading()
        const record = res && res.data

        if (!record) {
          wx.showToast({ title: '记录不存在', icon: 'none' })
          return
        }

        // 构建结果视图
        const view = this.buildResultView(record)
        wx.setStorageSync('fate_latest_result', view)
        wx.navigateTo({
          url: '/pages/fate/fate-result/fate-result',
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('[history] get fate record failed:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  // 删除心理测试记录
  onDeleteTest(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条测试记录？删除后不可恢复',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({ title: '删除中...', mask: true })
        api.deleteTestRecord(id)
          .then(() => {
            wx.hideLoading()
            const testRecords = this.data.testRecords.filter(r => r.id !== id)
            this.setData({ testRecords })
            wx.showToast({ title: '已删除', icon: 'success' })
          })
          .catch((err) => {
            wx.hideLoading()
            wx.showToast({ title: (err && err.message) || '删除失败', icon: 'none' })
          })
      },
    })
  },

  // 删除缘分记录
  onDeleteFate(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条缘分记录？删除后不可恢复',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({ title: '删除中...', mask: true })
        api.deleteNiyuanRecord(id)
          .then(() => {
            wx.hideLoading()
            const fateRecords = this.data.fateRecords.filter(r => r.id !== id)
            this.setData({ fateRecords })
            wx.showToast({ title: '已删除', icon: 'success' })
          })
          .catch((err) => {
            wx.hideLoading()
            wx.showToast({ title: (err && err.message) || '删除失败', icon: 'none' })
          })
      },
    })
  },

  // 构建结果视图
  buildResultView(record) {
    // 五维度列表
    const dimensionList = [
      { key: 'constellation', name: '星座匹配', emoji: '⭐', color: '#FF6B35', score: record.scores?.zodiac || 0, percentage: record.scores?.zodiac || 0, desc: `${record.zodiacA?.name || '未知'}×${record.zodiacB?.name || '未知'}` },
      { key: 'name', name: '姓名缘分', emoji: '✍️', color: '#FF006E', score: record.scores?.name || 0, percentage: record.scores?.name || 0, desc: '笔画互补' },
      { key: 'numerology', name: '数字缘分', emoji: '🔢', color: '#00D9FF', score: record.scores?.lifePath || 0, percentage: record.scores?.lifePath || 0, desc: `灵数${record.myInfo?.lifePath || 0}×${record.partnerInfo?.lifePath || 0}` },
      { key: 'personality', name: '性格互补', emoji: '🧩', color: '#00FF87', score: record.scores?.personality || 0, percentage: record.scores?.personality || 0, desc: '性格互补' },
      { key: 'metaphysics', name: '命理玄学', emoji: '🔮', color: '#A855F7', score: record.scores?.mystical || 0, percentage: record.scores?.mystical || 0, desc: '命理玄学' },
    ]

    return {
      recordId: record._id || record.id,
      score: record.totalScore || 0,
      level: record.level || { level: 'C', label: '缘分待定', emoji: '✨', color: '#A855F7', desc: '' },
      fateType: record.fateType || { name: '缘分', emoji: '✨', level: 'C', tagline: '', hashtags: [] },
      zodiacA: record.zodiacA || { name: '未知', emoji: '✨', element: 'unknown' },
      zodiacB: record.zodiacB || { name: '未知', emoji: '✨', element: 'unknown' },
      lifePathA: record.myInfo?.lifePath || 0,
      lifePathB: record.partnerInfo?.lifePath || 0,
      elementMatch: record.elementMatch || { label: '缘分', shortDesc: '', desc: '' },
      dimensionList,
      whyAttract: record.whyAttract || '',
      dailyDialogue: record.dailyDialogue || { lines: [], comment: '' },
      conflictTopics: record.conflictTopics || [],
      adviceList: record.adviceList || [],
      momentsText: record.momentsText || [],
      specialHint: record.specialHint || null,
      personA: { name: record.myInfo?.name || '', birthday: record.myInfo?.birthDate || '' },
      personB: { name: record.partnerInfo?.name || '', birthday: record.partnerInfo?.birthDate || '' },
      relation: record.relationType,
      story: record.story || '',
    }
  },
})
