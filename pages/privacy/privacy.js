Page({
  onAgree() {
    wx.setStorageSync('privacy_agreed', true)
    wx.reLaunch({
      url: '/pages/home/home'
    })
  },
  onDisagree() {
    wx.showModal({
      title: '提示',
      content: '您需要同意隐私说明后才能使用本小程序',
      showCancel: false,
    })
  },
})
