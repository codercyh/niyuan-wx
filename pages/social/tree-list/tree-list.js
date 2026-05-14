const api = require('../../../utils/api.js')

// 后端分类映射
const CATEGORY_LABELS = {
  love: '情感',
  work: '工作',
  family: '家庭',
  friendship: '友情',
  mood: '心情',
  other: '其他',
}

const CATEGORY_EMOJI = {
  love: '💕',
  work: '💼',
  family: '🏠',
  friendship: '🤝',
  mood: '💭',
  other: '📝',
}

// 后端数据 -> 前端展示格式
function mapTreeHole(t, userId) {
  return {
    id: t._id,
    avatar: CATEGORY_EMOJI[t.category] || '📝',
    username: t.isAnonymous ? '记录者' : '匿名用户',
    time: formatTime(t.createdAt),
    category: t.category,
    categoryLabel: CATEGORY_LABELS[t.category] || '其他',
    content: t.content,
    title: t.title,
    likes: t.likeCount || 0,
    comments: t.commentCount || 0,
    views: 0, // 后端暂无浏览量字段
    isLiked: t.isLiked || false,
  }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

Page({
  data: {
    searchKeyword: '',
    currentCategory: 'all',
    sortBy: 'latest',

    allTrees: [],
    filteredTrees: [],

    hasMore: true,
    pageSize: 15,
    currentPage: 1,
    loading: false,
  },

  onLoad() {
    this.fetchTreeHoles()
  },

  onShow() {
    // 每次显示页面时刷新数据（用户发布后返回）
    if (this.data.allTrees.length > 0) {
      this.fetchTreeHoles()
    }
  },

  fetchTreeHoles() {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })

    api.getTreeHoleList(1, 100)
      .then((res) => {
        const list = ((res && res.data && res.data.list) || []).map(t => mapTreeHole(t))
        this.setData({ allTrees: list, loading: false })
        this.filterAndSort()
      })
      .catch((err) => {
        console.error('[tree-list] fetch failed', err)
        this.setData({ loading: false })
        wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' })
      })
      .finally(() => wx.hideLoading())
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword, currentPage: 1 })
    this.filterAndSort()
  },

  // 清空搜索
  onClearSearch() {
    this.setData({ searchKeyword: '', currentPage: 1 })
    this.filterAndSort()
  },

  // 分类切换
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category, currentPage: 1 })
    this.filterAndSort()
  },

  // 排序切换
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort
    this.setData({ sortBy: sort, currentPage: 1 })
    this.filterAndSort()
  },

  // 筛选和排序
  filterAndSort() {
    let filtered = [...this.data.allTrees]

    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(tree => tree.category === this.data.currentCategory)
    }

    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(tree =>
        tree.content.toLowerCase().includes(keyword) ||
        (tree.title && tree.title.toLowerCase().includes(keyword))
      )
    }

    if (this.data.sortBy === 'hot') {
      filtered.sort((a, b) => b.likes - a.likes)
    } else {
      // 最新排序：已在后端按 createdAt 排序
    }

    // 分页
    const pageSize = this.data.pageSize
    const currentPage = this.data.currentPage
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize

    const paginatedTrees = filtered.slice(start, end)
    const hasMore = end < filtered.length

    this.setData({
      filteredTrees: paginatedTrees,
      hasMore: hasMore,
    })
  },

  // 加载更多
  onLoadMore() {
    if (!this.data.hasMore) return

    const newPage = this.data.currentPage + 1
    this.setData({ currentPage: newPage })

    let filtered = [...this.data.allTrees]

    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(tree => tree.category === this.data.currentCategory)
    }

    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(tree =>
        tree.content.toLowerCase().includes(keyword) ||
        (tree.title && tree.title.toLowerCase().includes(keyword))
      )
    }

    if (this.data.sortBy === 'hot') {
      filtered.sort((a, b) => b.likes - a.likes)
    }

    const pageSize = this.data.pageSize
    const start = (newPage - 1) * pageSize
    const end = start + pageSize

    const newTrees = filtered.slice(start, end)
    const hasMore = end < filtered.length

    const updated = this.data.filteredTrees.concat(newTrees)
    this.setData({
      filteredTrees: updated,
      hasMore: hasMore,
    })
  },

  // 打开详情页
  onOpenDetail(e) {
    const treeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/social/tree-detail/tree-detail?id=${treeId}`,
    })
  },

  // 创建记录
  onCreateTree() {
    wx.navigateTo({
      url: '/pages/social/tree-create/tree-create',
    })
  },
})
