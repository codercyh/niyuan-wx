const { getStorage, setStorage } = require('../../../utils/storage.js')
const { getAllTests } = require('../../../data/tests-data.js')
const { formatParticipants } = require('../../../utils/format.js')

Page({
  data: {
    // 搜索和排序
    searchText: '',
    sortBy: 'hot', // hot, new, rating
    activeCategory: 'all',

    // 分类
    categories: [
      { id: 'all', name: '全部', emoji: '📊' },
      { id: 'fun', name: '趣味', emoji: '🤪' },
      { id: 'personality', name: '性格', emoji: '👤' },
      { id: 'love', name: '爱情', emoji: '💕' },
      { id: 'psychology', name: '心理', emoji: '🧠' },
      { id: 'career', name: '事业', emoji: '💼' },
      { id: 'divination', name: '占卜', emoji: '🔮' },
    ],

    // 测试数据
    tests: [],
    filteredTests: [],
    hasMore: true,
    currentPage: 1,
    pageSize: 10,
  },

  onLoad() {
    this.initTestData()
  },

  initTestData() {
    // 从数据模块获取测试列表
    const allTests = getAllTests().map(test => ({
      ...test,
      participantsText: formatParticipants(test.participants),
    }))
    
    // 按参与人数排序（热门）
    const sortedTests = [...allTests].sort((a, b) => b.participants - a.participants)

    this.setData({
      tests: sortedTests,
    })

    // 初始显示
    this.filterAndSortTests()

    // 缓存到本地
    setStorage('all_tests', allTests)
  },

  filterAndSortTests() {
    let filtered = this.data.tests

    // 按分类筛选
    if (this.data.activeCategory !== 'all') {
      filtered = filtered.filter(test => test.categoryId === this.data.activeCategory)
    }

    // 按搜索词筛选
    if (this.data.searchText) {
      const searchLower = this.data.searchText.toLowerCase()
      filtered = filtered.filter(
        test =>
          test.name.toLowerCase().includes(searchLower) ||
          test.description.toLowerCase().includes(searchLower) ||
          (test.tags && test.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      )
    }

    // 排序
    const sorted = this.sortTests([...filtered])

    // 分页
    const pageTests = sorted.slice(0, this.data.pageSize)

    this.setData({
      filteredTests: pageTests,
      hasMore: sorted.length > this.data.pageSize,
      currentPage: 1,
    })
  },

  sortTests(tests) {
    switch (this.data.sortBy) {
      case 'new':
        return tests.reverse()
      case 'rating':
        return tests.sort((a, b) => b.rating - a.rating)
      case 'hot':
      default:
        return tests.sort((a, b) => b.participants - a.participants)
    }
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
    this.filterAndSortTests()
  },

  onClearSearch() {
    this.setData({ searchText: '' })
    this.filterAndSortTests()
  },

  // 分类切换
  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ activeCategory: categoryId })
    this.filterAndSortTests()
  },

  // 排序切换
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort
    this.setData({ sortBy: sort })
    this.filterAndSortTests()
  },

  // 加载更多
  onLoadMore() {
    const currentLength = this.data.filteredTests.length
    const nextPage = Math.ceil(currentLength / this.data.pageSize) + 1
    const start = (nextPage - 1) * this.data.pageSize
    const end = start + this.data.pageSize

    // 重新筛选获取完整列表
    let filtered = this.data.tests
    if (this.data.activeCategory !== 'all') {
      filtered = filtered.filter(test => test.categoryId === this.data.activeCategory)
    }
    if (this.data.searchText) {
      const searchLower = this.data.searchText.toLowerCase()
      filtered = filtered.filter(
        test =>
          test.name.toLowerCase().includes(searchLower) ||
          test.description.toLowerCase().includes(searchLower)
      )
    }
    const sorted = this.sortTests([...filtered])

    const moreTests = sorted.slice(start, end)
    const allFiltered = [...this.data.filteredTests, ...moreTests]

    this.setData({
      filteredTests: allFiltered,
      currentPage: nextPage,
      hasMore: allFiltered.length < sorted.length,
    })
  },

  // 打开测试详情
  onOpenTest(e) {
    const testId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/test/test-detail/test-detail?id=${testId}`,
    })
  },

})
