const { getStorage, removeStorage } = require('../../../utils/storage.js')
const api = require('../../../utils/api.js')

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    daysJoined: 0,
    testCount: 0,
    fateCount: 0,
    avgScore: 0,
    testHistory: [],
    fateHistory: [],
    tempAvatarUrl: '',
    tempNickName: '',
  },

  onLoad() {
    this.loadUserData()
  },

  onShow() {
    this.loadUserData()
  },

  loadUserData() {
    // 尝试从多种来源获取用户信息
    let userInfo = wx.getStorageSync('userInfo')

    // 兼容旧格式
    if (!userInfo) {
      userInfo = getStorage('userInfo') || getStorage('userToken')
    }

    const isLoggedIn = !!(userInfo && userInfo.nickName)

    // 计算加入天数
    const joinDateStr = userInfo?.joinDate || wx.getStorageSync('user_join_date') || new Date().toISOString().split('T')[0]
    const joinDate = new Date(joinDateStr)
    const today = new Date()
    const daysJoined = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24))

    this.setData({
      userInfo: userInfo,
      isLoggedIn: isLoggedIn,
      daysJoined: daysJoined > 0 ? daysJoined : 1,
    })

    // 从后端拉取真实历史记录（与 pages/history/history.js 同源）
    // 未登录或 token 缺失时跳过，统计保持为 0
    const app = getApp()
    const ready = (app && typeof app.ensureBootstrapped === 'function')
      ? app.ensureBootstrapped()
      : Promise.resolve()

    ready
      .then(() => {
        if (!isLoggedIn) return
        return this.loadStatsFromApi()
      })
      .catch((err) => {
        console.warn('[profile] loadUserData skipped:', err && err.message)
      })
  },

  // 从后端拉取心理测试与缘分测试历史，并刷新统计与最近列表
  loadStatsFromApi() {
    return Promise.all([
      api.getUserTestRecords(1, 50),
      api.getNiyuanHistory(1, 50),
    ])
      .then(([testRes, fateRes]) => {
        const testRecords = (testRes && testRes.data && testRes.data.records) || []
        const fateRecords = (fateRes && fateRes.data && fateRes.data.records) || []

        const recentTests = testRecords.slice(0, 3).map((record, index) => ({
          id: record._id || record.id || index,
          emoji: '🧪',
          name: record.testTitle || '心理测试',
          date: this.formatDate(record.createdAt),
          score: record.totalScore || 0,
        }))

        const recentFate = fateRecords.slice(0, 3).map((record, index) => {
          const level = record.level?.level || 'C'
          return {
            id: record._id || record.id || index,
            nameA: record.myInfo?.name || 'A',
            nameB: record.partnerInfo?.name || 'B',
            score: record.totalScore || 0,
            level: level,
            levelClass: `level-${level.toLowerCase()}`,
            fateType: record.fateType?.name || '缘分',
            date: this.formatDate(record.createdAt),
          }
        })

        // 平均分：以缘分测试分数为口径（心理测试 totalScore 不具可比性）
        const fateScores = fateRecords.map((r) => r.totalScore || 0).filter((s) => s > 0)
        const avgScore = fateScores.length > 0
          ? Math.round(fateScores.reduce((a, b) => a + b, 0) / fateScores.length)
          : 0

        this.setData({
          testCount: testRecords.length,
          fateCount: fateRecords.length,
          avgScore: avgScore,
          testHistory: recentTests,
          fateHistory: recentFate,
        })
      })
      .catch((err) => {
        console.error('[profile] loadStatsFromApi failed:', err)
        // 失败时保持为空，不打断页面
      })
  },

  formatDate(isoString) {
    if (!isoString) return '未知'
    try {
      const date = new Date(isoString)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    } catch (e) {
      return '未知'
    }
  },

  // 选择微信头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    if (!avatarUrl) {
      return
    }

    this.setData({ tempAvatarUrl: avatarUrl }, () => {
      this.tryAutoLogin()
    })
  },

  // 输入微信昵称
  onInputNickname(e) {
    const nickName = e.detail.value || ''

    this.setData({ tempNickName: nickName }, () => {
      this.tryAutoLogin()
    })
  },

  tryAutoLogin() {
    const { tempAvatarUrl, tempNickName, isLoggedIn } = this.data
    const nickName = (tempNickName || '').trim()

    if (isLoggedIn || !tempAvatarUrl || !nickName) {
      return
    }

    this.completeLogin(tempAvatarUrl, nickName)
  },

  // 完成登录
  completeLogin(avatarUrl, nickName) {
    const userInfo = {
      nickName: nickName,
      avatarUrl: avatarUrl,
      joinDate: wx.getStorageSync('user_join_date') || new Date().toISOString().split('T')[0],
    }
    
    // 保存用户信息
    wx.setStorageSync('userInfo', userInfo)
    if (!wx.getStorageSync('user_join_date')) {
      wx.setStorageSync('user_join_date', userInfo.joinDate)
    }
    
    this.setData({ 
      userInfo,
      isLoggedIn: true,
      tempAvatarUrl: '',
      tempNickName: '',
    })
    
    wx.showToast({ title: '设置成功', icon: 'success' })
    console.log('用户信息已保存:', userInfo)
  },

  onGoToHistory() {
    wx.navigateTo({
      url: '/pages/history/history',
    })
  },

  onGoToFate() {
    wx.navigateTo({
      url: '/pages/fate/fate-input/fate-input',
    })
  },

  onGoToSettings() {
    wx.navigateTo({
      url: '/pages/auth/settings/settings',
    })
  },

  onViewTestResult(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/test/test-result/test-result?recordId=${id}`,
    })
  },

  onViewFateResult(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return

    wx.showLoading({ title: '加载中...' })
    api.getNiyuanRecord(id)
      .then((res) => {
        wx.hideLoading()
        const record = res && res.data
        if (!record) {
          wx.showToast({ title: '记录不存在', icon: 'none' })
          return
        }
        wx.setStorageSync('fate_latest_result', this.buildFateView(record))
        wx.navigateTo({ url: '/pages/fate/fate-result/fate-result' })
      })
      .catch((err) => {
        wx.hideLoading()
        console.error('[profile] get fate record failed:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  // 把后端缘分记录转成 fate-result 页面所需视图（与 history.js 保持一致）
  buildFateView(record) {
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

  onFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系：feedback@example.com',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  onLogout() {
    wx.showModal({
      title: '退出使用',
      content: '确定要退出使用吗？退出后当前状态将被清除。',
      confirmText: '确定退出',
      confirmColor: '#FF6B35',
      success: (res) => {
        if (res.confirm) {
          // 清除用户数据
          wx.removeStorageSync('userInfo')
          removeStorage('userInfo')
          removeStorage('userToken')
          
          // 重置页面数据
          this.setData({
            userInfo: null,
            isLoggedIn: false,
            testCount: 0,
            fateCount: 0,
            avgScore: 0,
            testHistory: [],
            fateHistory: [],
            tempAvatarUrl: '',
            tempNickName: '',
          })
          
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  },
})
