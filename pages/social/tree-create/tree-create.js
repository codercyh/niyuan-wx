const { getStorage, setStorage } = require('../../../utils/storage.js')

Page({
  data: {
    selectedCategory: 'confess',
    content: '',
    contentLength: 0,
    isAnonymous: true,
    canPublish: false,
  },

  onLoad() {
    this.loadDraft()
  },

  loadDraft() {
    const draft = getStorage('tree_draft')
    if (draft) {
      this.setData({
        selectedCategory: draft.category,
        content: draft.content,
        contentLength: draft.content.length,
        isAnonymous: draft.isAnonymous,
        canPublish: draft.content.trim().length > 0,
      })
    }
  },

  onSelectCategory(e) {
    this.setData({ selectedCategory: e.currentTarget.dataset.category })
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
    if (content.length > 500) {
      wx.showToast({ title: '内容过长，请删除一些文字', icon: 'none' })
      return
    }

    const newTree = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      avatar: this.data.isAnonymous ? '😔' : '😊',
      username: this.data.isAnonymous ? '记录者' : '我',
      time: '刚刚',
      category: this.data.selectedCategory,
      categoryLabel: this.getCategoryLabel(this.data.selectedCategory),
      content: content,
      likes: 0,
      comments: 0,
      views: 0,
    }

    const allTrees = getStorage('all_tree_holes') || []
    allTrees.unshift(newTree)
    setStorage('all_tree_holes', allTrees)

    const myTrees = getStorage('my_tree_holes') || []
    myTrees.push(newTree)
    setStorage('my_tree_holes', myTrees)

    setStorage('tree_draft', null)
    this.setData({ content: '', contentLength: 0, canPublish: false })

    wx.showToast({ title: '记录已保存', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  },

  getCategoryLabel(category) {
    const labels = {
      'confess': '随记',
      'advice': '灵感',
      'story': '片段',
      'other': '其他',
    }
    return labels[category] || '其他'
  },
})