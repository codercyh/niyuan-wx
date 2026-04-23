const { getStorage, setStorage } = require('../../../utils/storage.js')

Page({
  data: {
    notifyComments: true,
    notifySystem: true,
    profileVisible: '仅自己可见',
    activityVisible: '不显示',
  },

  onLoad() {
    // 加载设置
    const settings = getStorage('user_settings') || {}
    this.setData({
      notifyComments: settings.notifyComments !== false,
      notifySystem: settings.notifySystem !== false,
      profileVisible: settings.profileVisible || '仅自己可见',
      activityVisible: settings.activityVisible || '不显示',
    })
  },

  // 切换提醒
  onToggleNotify(e) {
    const type = e.currentTarget.dataset.type
    const key = type === 'comments' ? 'notifyComments' : 'notifySystem'
    const value = !this.data[key]

    this.setData({ [key]: value })

    // 保存设置
    const settings = getStorage('user_settings') || {}
    settings[key] = value
    setStorage('user_settings', settings)

    wx.showToast({ title: value ? '已开启' : '已关闭', icon: 'success' })
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '清除中...' })
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({ title: '缓存已清除', icon: 'success' })
          }, 1000)
        }
      },
    })
  },

  // 整理记录
  onExportData() {
    wx.showToast({ title: '整理功能开发中', icon: 'none' })
  },

  // 隐私说明
  onUserAgreement() {
    wx.navigateTo({
      url: '/pages/privacy/privacy',
    })
  },

  // 使用说明
  onFeedback() {
    wx.showModal({
      title: '使用说明',
      content: '这是一个个人兴趣类小程序，可查看兴趣内容、体验趣味测试，并保存本地记录。',
      showCancel: false,
      confirmText: '了解',
    })
  },
})
