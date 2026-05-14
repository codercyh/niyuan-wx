const api = require('../../../utils/api.js')
const { getStorage, setStorage } = require('../../../utils/storage.js')

// 后端分类配置
const CATEGORIES = {
  love: { emoji: '💕', name: '情感' },
  work: { emoji: '💼', name: '工作' },
  family: { emoji: '🏠', name: '家庭' },
  friendship: { emoji: '🤝', name: '友情' },
  mood: { emoji: '💭', name: '心情' },
  other: { emoji: '✨', name: '其他' },
}

Page({
  data: {
    selectedCategory: 'mood',
    title: '',
    content: '',
    contentLength: 0,
    isAnonymous: true,
    canPublish: false,
    submitting: false,
  },

  onLoad() {
    this.loadDraft()
  },

  loadDraft() {
    const draft = getStorage('tree_draft')
    if (draft) {
      this.setData({
        selectedCategory: draft.category || 'mood',
        title: draft.title || '',
        content: draft.content || '',
        contentLength: (draft.content || '').length,
        isAnonymous: draft.isAnonymous !== false,
        canPublish: (draft.content || '').trim().length > 0,
      })
    }
  },

  onSelectCategory(e) {
    this.setData({ selectedCategory: e.currentTarget.dataset.category })
    this.saveDraftAuto()
  },

  onTitleInput(e) {
    const title = e.detail.value
    this.setData({ title })
    this.saveDraftAuto()
  },

  onContentInput(e) {
    const content = e.detail.value
    this.setData({
      content,
      contentLength: content.length,
      canPublish: content.trim().length > 0,
    })
    this.saveDraftAuto()
  },

  onToggleAnonymous() {
    this.setData({ isAnonymous: !this.data.isAnonymous })
    this.saveDraftAuto()
  },

  saveDraftAuto() {
    setStorage('tree_draft', {
      category: this.data.selectedCategory,
      title: this.data.title,
      content: this.data.content,
      isAnonymous: this.data.isAnonymous,
      savedAt: new Date().toLocaleString('zh-CN'),
    })
  },

  onSaveDraft() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    this.saveDraftAuto()
    wx.showToast({ title: '草稿已保存', icon: 'success' })
  },

  onPublish() {
    const content = this.data.content.trim()
    if (!content) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    if (content.length > 2000) {
      wx.showToast({ title: '内容过长，最多2000字', icon: 'none' })
      return
    }
    if (this.data.submitting) return

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    // 生成默认标题（取内容前20字）
    const title = this.data.title.trim() || content.substring(0, 20) + (content.length > 20 ? '...' : '')

    api.createTreeHole(title, content, this.data.selectedCategory, [], this.data.isAnonymous)
      .then((res) => {
        wx.hideLoading()
        wx.showToast({ title: '发布成功', icon: 'success' })

        // 清除草稿
        setStorage('tree_draft', null)
        this.setData({
          title: '',
          content: '',
          contentLength: 0,
          canPublish: false,
          submitting: false,
        })

        setTimeout(() => wx.navigateBack(), 1000)
      })
      .catch((err) => {
        wx.hideLoading()
        this.setData({ submitting: false })
        console.error('[tree-create] publish failed', err)
        wx.showToast({ title: (err && err.message) || '发布失败', icon: 'none' })
      })
  },
})
