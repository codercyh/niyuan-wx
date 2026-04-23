const api = require('../../utils/api.js')
const { getStorage, setStorage } = require('../../utils/storage.js')

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    loading: false,
    loadingText: '正在登录...',
    // 自定义登录
    showCustomLogin: false,
    customAvatarUrl: '',
    customNickName: '',
    showAvatarPicker: false,
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

  // ===== 微信快捷登录（open-type="chooseAvatar" 触发） =====
  onWechatAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (!avatarUrl) {
      wx.showToast({ title: '获取头像失败', icon: 'none' })
      return
    }
    this.setData({ loading: true, loadingText: '正在登录...' })
    this.completeLoginWithAvatar(avatarUrl, '')
  },

  completeLoginWithAvatar(avatarUrl, nickName) {
    api.wxLogin().then((data) => {
      const userInfo = {
        id: data.userInfo._id || data.userInfo.id,
        openId: data.userInfo.openid,
        nickName: nickName || data.userInfo.nickName || '微信用户',
        avatarUrl: avatarUrl || data.userInfo.avatarUrl || '/images/default-avatar.png',
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
        nickName: nickName || '微信用户',
        avatarUrl: avatarUrl || '/images/default-avatar.png',
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

  // ===== 自定义登录 =====
  onTapCustomLogin() {
    this.setData({ showCustomLogin: true })
  },

  onTapBackToMain() {
    this.setData({ showCustomLogin: false, customAvatarUrl: '', customNickName: '' })
  },

  onTapChooseAvatar() {
    this.setData({ showAvatarPicker: true })
    setTimeout(() => { this.setData({ showAvatarPicker: false }) }, 300)
  },

  onChooseCustomAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (avatarUrl) {
      this.setData({ customAvatarUrl: avatarUrl })
    }
  },

  onCustomNicknameInput(e) {
    this.setData({ customNickName: e.detail.value })
  },

  handleCustomLogin() {
    const nickName = this.data.customNickName.trim()
    if (!nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    this.setData({ loading: true, loadingText: '正在登录...' })
    this.completeLoginWithAvatar(this.data.customAvatarUrl, nickName)
  },

  // ===== 已登录操作 =====
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
          this.setData({ isLoggedIn: false, userInfo: {}, showCustomLogin: false })
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      },
    })
  },
})