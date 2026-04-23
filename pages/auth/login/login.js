const api = require('../../utils/api.js')

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    loading: false,
    loadingText: '正在登录...',
    avatarUrl: '',
    nickName: '',
  },

  onLoad() {
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    try {
      const token = wx.getStorageSync('accessToken')
      let userInfo = wx.getStorageSync('userInfo')
      if (typeof userInfo === 'string') {
        try { userInfo = JSON.parse(userInfo) } catch (e) { userInfo = null }
      }

      if (token && userInfo) {
        this.setData({ isLoggedIn: true, userInfo, userId: userInfo.openId || userInfo.id || '' })
      }
    } catch (error) {
      console.error('checkLoginStatus failed:', error)
    }
  },

  handleLogin() {
    this.setData({ loading: true, loadingText: '正在登录...' })
    api.wxLogin().then((data) => {
      const userInfo = {
        id: data.userInfo._id || data.userInfo.id,
        openId: data.userInfo.openid,
        nickName: data.userInfo.nickName || '用户',
        avatarUrl: data.userInfo.avatarUrl || '/assets/icons/me-active.png',
        loginTime: Date.now(),
      }
      wx.setStorageSync('userInfo', userInfo)
      this.setData({ isLoggedIn: true, userInfo, loading: false })
      wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home',
          fail: () => { wx.showToast({ title: '请手动点击首页标签', icon: 'none' }) },
        })
      }, 1500)
    }).catch((err) => {
      console.warn('Backend login failed, trying offline mode:', err)
      wx.login({
        success: (loginRes) => {
          if (!loginRes.code) {
            this.handleLoginError('登录失败')
            return
          }
          const openId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          const userData = {
            openId,
            id: openId,
            nickName: '用户',
            avatarUrl: '/assets/icons/me-active.png',
            loginTime: Date.now(),
          }
          wx.setStorageSync('userInfo', userData)
          this.setData({ isLoggedIn: true, userInfo: userData, loading: false })
          wx.showToast({ title: '已进入离线模式', icon: 'none', duration: 1500 })
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/home/home',
              fail: () => { wx.showToast({ title: '请手动点击首页标签', icon: 'none' }) },
            })
          }, 1500)
        },
        fail: () => { this.handleLoginError('登录失败，请重试') },
      })
    })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (avatarUrl) {
      this.setData({ avatarUrl })
    }
  },

  onNicknameInput(e) {
    this.setData({ nickName: e.detail.value })
  },

  handleContinue() {
    wx.switchTab({
      url: '/pages/home/home',
      fail: () => { wx.showToast({ title: '跳转失败，请手动点击首页标签', icon: 'none' }) },
    })
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定清除登录状态吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('accessToken')
            wx.removeStorageSync('userInfo')
            wx.removeStorageSync('openId')
          } catch (e) { console.error(e) }
          this.setData({ isLoggedIn: false, userInfo: {}, userId: '' })
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      },
    })
  },

  handleLoginError(message) {
    this.setData({ loading: false })
    wx.showToast({ title: message, icon: 'none' })
  },
})