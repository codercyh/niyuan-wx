const { getStorage, removeStorage } = require('../../../utils/storage.js')

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
    tempAvatarUrl: '', // 临时存储头像
    tempNickName: '',  // 临时存储昵称
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
    
    // 获取心理测试历史
    const testHistory = getStorage('test_records') || []
    const recentTests = testHistory.slice(0, 3).map((test, index) => ({
      id: test.id || index,
      emoji: test.testEmoji || '📊',
      name: test.testName || '测试',
      date: test.completedAt || '未知',
      score: test.score || Math.floor(Math.random() * 40) + 60,
    }))

    // 获取缘分测试历史
    const fateRecords = wx.getStorageSync('fate_records') || []
    const recentFate = fateRecords.slice(0, 3).map((record, index) => ({
      id: record.id || index,
      nameA: record.personA?.name || 'A',
      nameB: record.personB?.name || 'B',
      score: record.score || 0,
      level: record.level || 'C',
      levelClass: `level-${(record.level || 'C').toLowerCase()}`,
      fateType: record.fateType || '未知',
      date: this.formatDate(record.createdAt),
    }))

    // 计算平均分
    const avgScore = testHistory.length > 0 
      ? Math.round(testHistory.reduce((sum, t) => sum + (t.score || 70), 0) / testHistory.length)
      : 0

    // 计算加入天数
    const joinDateStr = userInfo?.joinDate || wx.getStorageSync('user_join_date') || new Date().toISOString().split('T')[0]
    const joinDate = new Date(joinDateStr)
    const today = new Date()
    const daysJoined = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24))

    this.setData({
      userInfo: userInfo,
      isLoggedIn: isLoggedIn,
      testCount: testHistory.length,
      fateCount: fateRecords.length,
      avgScore: avgScore,
      daysJoined: daysJoined > 0 ? daysJoined : 1,
      testHistory: recentTests,
      fateHistory: recentFate,
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

  // 新版登录：选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log('选择的头像:', avatarUrl)
    
    // 存储临时头像
    this.setData({ tempAvatarUrl: avatarUrl })
    
    // 如果已有昵称，直接完成登录
    if (this.data.tempNickName) {
      this.completeLogin(avatarUrl, this.data.tempNickName)
    } else {
      // 提示用户输入昵称
      wx.showToast({ title: '请设置昵称完成登录', icon: 'none' })
    }
  },

  // 新版登录：输入昵称
  onInputNickname(e) {
    const nickName = e.detail.value
    if (!nickName || nickName.trim() === '') return
    
    console.log('输入的昵称:', nickName)
    this.setData({ tempNickName: nickName })
    
    // 如果已有头像，直接完成登录
    if (this.data.tempAvatarUrl) {
      this.completeLogin(this.data.tempAvatarUrl, nickName)
    } else {
      // 提示用户选择头像
      wx.showToast({ title: '请点击头像完成登录', icon: 'none' })
    }
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
    const records = wx.getStorageSync('fate_records') || []
    const record = records.find(r => r.id === id)
    
    if (record) {
      wx.setStorageSync('fate_latest_result', {
        score: record.score,
        level: { level: record.level, label: this.getLevelLabel(record.level) },
        fateType: { name: record.fateType, emoji: this.getFateEmoji(record.level) },
        personA: record.personA,
        personB: record.personB,
        zodiacA: { name: record.personA?.zodiac },
        zodiacB: { name: record.personB?.zodiac },
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
