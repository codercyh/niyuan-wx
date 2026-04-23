App({
  globalData: {
    userInfo: null,
    vipStatus: false,
    theme: 'light',
  },

  onLaunch() {
    // 检查隐私说明
    const agreed = wx.getStorageSync('privacy_agreed')
    if (!agreed) {
      wx.navigateTo({ url: '/pages/privacy/privacy' })
    }

    // 初始化用户数据
    this.initUserData()
  },

  initUserData() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      // 默认用户信息
      const defaultUser = {
        id: 'user_' + Date.now(),
        name: '用户',
        avatar: null,
        birthDate: null,
        interestSign: null,
        vipLevel: 0,
        vipExpire: null,
        createdAt: Date.now(),
      }
      wx.setStorageSync('userInfo', defaultUser)
      this.globalData.userInfo = defaultUser
    } else {
      this.globalData.userInfo = userInfo
    }

    // 检查扩展功能状态
    this.checkVipStatus()
  },

  checkVipStatus() {
    const userInfo = this.globalData.userInfo
    if (userInfo && userInfo.vipExpire) {
      const now = Date.now()
      if (now < userInfo.vipExpire) {
        this.globalData.vipStatus = true
      } else {
        this.globalData.vipStatus = false
      }
    }
  },

  // 获取当前资料
  getUserInfo() {
    return this.globalData.userInfo
  },

  // 更新当前资料
  updateUserInfo(updates) {
    const userInfo = { ...this.globalData.userInfo, ...updates }
    wx.setStorageSync('userInfo', userInfo)
    this.globalData.userInfo = userInfo
    return userInfo
  },

  // 获取扩展功能状态
  getVipStatus() {
    this.checkVipStatus()
    return this.globalData.vipStatus
  },
})
