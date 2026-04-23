const api = require('../../utils/api.js')
const { getStorage, setStorage } = require('../../utils/storage.js')

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    loading: false,
    loadingText: '正在登录...',
    loginMode: '',
    showLoginForm: false,
    tempAvatarUrl: '',
    tempNickName: '',
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
      if (token && userInfo && userInfo.nickName) {
        this.setData({ isLoggedIn: true, userInfo })
      }
    } catch (error) {
      console.error('checkLoginStatus failed:', error)
    }
  },

  handleWechatLogin() {
    this.setData({ showLoginForm: true, loginMode: 'wechat', tempAvatarUrl: '', tempNickName: '' })
  },

  handleCustomLogin() {
    this.setData({ showLoginForm: true, loginMode: 'custom', tempAvatarUrl: '', tempNickName: '' })
  },

  handleBackToMain() {
    this.setData({ showLoginForm: false, loginMode: '', tempAvatarUrl: '', tempNickName: '' })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (avatarUrl) {
      this.setData({ tempAvatarUrl: avatarUrl })
    }
  },

  onNicknameInput(e) {
    this.setData({ tempNickName: e.detail.value })
  },

  handleConfirmLogin() {
    const nickName = this.data.tempNickName.trim()
    if (!nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ loading: true, loadingText: '正在登录...' })

    const avatarUrl = this.data.tempAvatarUrl || '/images/default-avatar.png'

    api.wxLogin().then((data) => {
      const userInfo = {
        id: data.userInfo._id || data.userInfo.id,
        openId: data.userInfo.openid,
        nickName,
        avatarUrl,
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
    }).catch(() => {
      const openId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      const userInfo = {
        openId,
        id: openId,
        nickName,
        avatarUrl,
        loginTime: Date.now(),
      }
      wx.setStorageSync('userInfo', userInfo)
      this.setData({ isLoggedIn: true, userInfo, loading: false })
      wx.showToast({ title: '已进入离线模式', icon: 'none', duration: 1500 })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home',
          fail: () => { wx.showToast({ title: '请手动点击首页标签', icon: 'none' }) },
        })
      }, 1500)
    })
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
          this.setData({ isLoggedIn: false, userInfo: {}, showLoginForm: false })
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      },
    })
  },
})