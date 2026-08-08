const api = require('../../../utils/api.js')
const { formatParticipants } = require('../../../utils/format.js')

// 后端返回的 Test 文档 → 前端列表项
const CATEGORY_EMOJI = {
  fun: '🤪',
  personality: '👤',
  love: '💕',
  psychology: '🧠',
  career: '💼',
  divination: '🔮',
}

function mapTest(t) {
  return {
    id: t.testId,
    name: t.title,
    description: t.description || t.subtitle || '',
    category: t.category || 'fun',
    categoryId: t.category || 'fun',
    emoji: t.emoji || CATEGORY_EMOJI[t.category] || '📊',
    tags: t.tags || [],
    rating: t.avgScore ? (t.avgScore / 20).toFixed(1) : '5.0',
    participants: t.participants || 0,
    participantsText: formatParticipants(t.participants || 0),
    isVipOnly: !!t.isVipOnly,
    questionCount: t.questionCount || 0,
  }
}

Page({
  data: {
    searchText: '',
    sortBy: 'hot',
    activeCategory: 'all',
    categories: [
      { id: 'all', name: '全部', emoji: '📊' },
      { id: 'fun', name: '趣味', emoji: '🤪' },
      { id: 'personality', name: '性格', emoji: '👤' },
      { id: 'love', name: '爱情', emoji: '💕' },
      { id: 'career', name: '事业', emoji: '💼' },
      { id: 'other', name: '其他', emoji: '✨' },
    ],
    tests: [],
    filteredTests: [],
    hasMore: true,
    currentPage: 1,
    pageSize: 10,
    loading: false,
  },

  onLoad() {
    this.fetchTests()
  },

  fetchTests() {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })
    api.getTestList(1, 100)
      .then((res) => {
        const list = ((res && res.data && res.data.tests) || []).map(mapTest)
        const sorted = list.sort((a, b) => b.participants - a.participants)
        this.setData({ tests: sorted, loading: false })
        this.filterAndSortTests()
      })
      .catch((err) => {
        console.error('[test-list] fetch failed', err)
        this.setData({ loading: false })
        wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' })
      })
      .finally(() => wx.hideLoading())
  },

  filterAndSortTests() {
    let filtered = this.data.tests
    if (this.data.activeCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === this.data.activeCategory)
    }
    if (this.data.searchText) {
      const q = this.data.searchText.toLowerCase()
      filtered = filtered.filter(t =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.tags || []).some(tag => (tag || '').toLowerCase().includes(q))
      )
    }
    const sorted = this.sortTests([...filtered])
    const pageTests = sorted.slice(0, this.data.pageSize)
    this.setData({
      filteredTests: pageTests,
      hasMore: sorted.length > this.data.pageSize,
      currentPage: 1,
    })
  },

  sortTests(tests) {
    switch (this.data.sortBy) {
      case 'new': return tests.reverse()
      case 'rating': return tests.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      case 'hot':
      default: return tests.sort((a, b) => b.participants - a.participants)
    }
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
    this.filterAndSortTests()
  },
  onClearSearch() { this.setData({ searchText: '' }); this.filterAndSortTests() },
  onCategoryChange(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.id })
    this.filterAndSortTests()
  },
  onSortChange(e) {
    this.setData({ sortBy: e.currentTarget.dataset.sort })
    this.filterAndSortTests()
  },

  onLoadMore() {
    let filtered = this.data.tests
    if (this.data.activeCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === this.data.activeCategory)
    }
    if (this.data.searchText) {
      const q = this.data.searchText.toLowerCase()
      filtered = filtered.filter(t =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      )
    }
    const sorted = this.sortTests([...filtered])
    const nextPage = this.data.currentPage + 1
    const more = sorted.slice(0, nextPage * this.data.pageSize)
    this.setData({
      filteredTests: more,
      currentPage: nextPage,
      hasMore: more.length < sorted.length,
    })
  },

  onOpenTest(e) {
    const testId = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/test/test-detail/test-detail?id=${testId}` })
  },
})
