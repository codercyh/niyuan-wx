const { getStorage, setStorage, appendToList } = require('../../../utils/storage.js')

Page({
  data: {
    selectedCategory: 'confess',
    content: '',
    contentLength: 0,
    isAnonymous: true,
    canPublish: false,
  },

  onLoad() {
    // 恢复草稿
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

  // 选择分类
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ selectedCategory: category })
    this.saveDraftAuto()
  },

  // 内容输入
  onContentInput(e) {
    const content = e.detail.value
    this.setData({
      content,
      contentLength: content.length,
      canPublish: content.trim().length > 0,
    })
    this.saveDraftAuto()
  },

  // 切换匿名
  onToggleAnonymous() {
    const isAnonymous = !this.data.isAnonymous
    this.setData({ isAnonymous })
    this.saveDraftAuto()
  },

  // 自动保存草稿
  saveDraftAuto() {
    const draft = {
      category: this.data.selectedCategory,
      content: this.data.content,
      isAnonymous: this.data.isAnonymous,
      savedAt: new Date().toLocaleString('zh-CN'),
    }
    setStorage('tree_draft', draft)
  },

  // 保存草稿
  onSaveDraft() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    this.saveDraftAuto()
    wx.showToast({ title: '草稿已保存', icon: 'success' })
  },

  // 保存记录
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

    // 创建新记录
    const newTree = {
      id: Math.floor(Math.random() * 100000),
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

    // 保存到storage
    const allTrees = getStorage('all_tree_holes') || []
    allTrees.unshift(newTree)
    setStorage('all_tree_holes', allTrees)

    // 保存到我的记录
    const myTrees = getStorage('my_tree_holes') || []
    myTrees.push(newTree)
    setStorage('my_tree_holes', myTrees)

    // 清除草稿
    setStorage('tree_draft', null)

    wx.showToast({ title: '记录已保存', icon: 'success' })

    // 返回列表
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
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
