Page({
  data: {
    data: null,
    result: null,
  },

  onLoad() {
    const data = wx.getStorageSync('niyuan_data')
    if (!data) {
      wx.navigateBack()
      return
    }
    this.setData({ data, result: { niyuanIndex: 58 } })
  },

  onSave() {
    wx.showToast({ title: '卡片已保存', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1500)
  },

  onShare() {
    const text = `关系指数：${this.data.result.niyuanIndex}分，可留作自己的结果记录。`
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '文案已复制', icon: 'success' })
      },
    })
  },
})
