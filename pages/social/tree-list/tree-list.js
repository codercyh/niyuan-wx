const { getStorage, setStorage } = require('../../../utils/storage.js')

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
  },

  onLoad() {
    this.initTreeHoles()
  },

  onShow() {
    // 刷新数据（用户发布或删除后）
    this.filterAndSort()
  },

  // 初始化记录数据
  initTreeHoles() {
    const mockTrees = [
      {
        id: 1,
        avatar: '😔',
        username: '记录者',
        time: '2小时前',
        category: 'confess',
        categoryLabel: '随记',
        content: '最近工作压力很大，总是熬夜到凌晨。感觉生活没有方向，不知道自己要什么...',
        likes: 245,
        comments: 32,
        views: 1203,
      },
      {
        id: 2,
        avatar: '💔',
        username: '素年锦时',
        time: '4小时前',
        category: 'confess',
        categoryLabel: '随记',
        content: '喜欢了他三年，最后还是被拒绝了。感觉所有的努力都白费了。要不要忘记他重新开始？',
        likes: 589,
        comments: 87,
        views: 3421,
      },
      {
        id: 3,
        avatar: '🌟',
        username: '过客',
        time: '6小时前',
        category: 'advice',
        categoryLabel: '灵感',
        content: '我觉得当你感到迷茫时，不妨停下脚步，写下你内心的声音。有时答案就在那里。',
        likes: 412,
        comments: 45,
        views: 2156,
      },
      {
        id: 4,
        avatar: '✨',
        username: '夜间漫步者',
        time: '8小时前',
        category: 'story',
        categoryLabel: '片段',
        content: '那年夏天，我在街角遇见了她。她笑着对我说："你好，我是来自另一个世界的天使。"',
        likes: 678,
        comments: 92,
        views: 4532,
      },
      {
        id: 5,
        avatar: '😤',
        username: '烦恼先生',
        time: '10小时前',
        category: 'confess',
        categoryLabel: '随记',
        content: '家人总是不理解我的选择，觉得我浪费了时间。但我就是想做自己喜欢的事...',
        likes: 321,
        comments: 51,
        views: 1876,
      },
      {
        id: 6,
        avatar: '💪',
        username: '坚持者',
        time: '12小时前',
        category: 'story',
        categoryLabel: '片段',
        content: '这一年经历了很多变化，也慢慢找到了新的节奏，想把这些成长过程记下来。',
        likes: 932,
        comments: 156,
        views: 6234,
      },
      {
        id: 7,
        avatar: '🎯',
        username: '目标达人',
        time: '14小时前',
        category: 'advice',
        categoryLabel: '灵感',
        content: '想改变现状？不妨试试这5个方法：1. 明确目标 2. 制定计划 3. 坚持执行...',
        likes: 745,
        comments: 103,
        views: 3912,
      },
      {
        id: 8,
        avatar: '😢',
        username: '孤独的雨',
        time: '16小时前',
        category: 'confess',
        categoryLabel: '随记',
        content: '在一个陌生的城市工作三年了，依然没有真正的朋友。感觉很孤独...',
        likes: 512,
        comments: 78,
        views: 2743,
      },
      {
        id: 9,
        avatar: '🌈',
        username: '彩虹使者',
        time: '1天前',
        category: 'story',
        categoryLabel: '片段',
        content: '一个普通的清晨，我决定改变自己。三个月后，我变成了自己想要的样子。',
        likes: 1203,
        comments: 234,
        views: 7856,
      },
      {
        id: 10,
        avatar: '💝',
        username: '爱心使者',
        time: '1天前',
        category: 'advice',
        categoryLabel: '灵感',
        content: '给所有感到绝望的人：你的痛苦是真实的，但你的力量更强大。相信自己！',
        likes: 654,
        comments: 89,
        views: 3421,
      },
      {
        id: 11,
        avatar: '🎨',
        username: '创意者',
        time: '1天前',
        category: 'other',
        categoryLabel: '其他',
        content: '记下一个有趣的想法：生活就像一幅画，你既是画家，也是画布。',
        likes: 423,
        comments: 67,
        views: 2145,
      },
      {
        id: 12,
        avatar: '🚀',
        username: '梦想家',
        time: '2天前',
        category: 'story',
        categoryLabel: '片段',
        content: '从小镇来到大城市工作，这一路有很多变化，也让我重新认识了自己。',
        likes: 876,
        comments: 145,
        views: 4567,
      },
      {
        id: 13,
        avatar: '🌸',
        username: '温暖如光',
        time: '2天前',
        category: 'confess',
        categoryLabel: '随记',
        content: '妈妈的唠叨让我很烦，但自从她生病后，我才明白那都是爱...',
        likes: 1456,
        comments: 203,
        views: 8234,
      },
      {
        id: 14,
        avatar: '🎭',
        username: '演员',
        time: '2天前',
        category: 'story',
        categoryLabel: '片段',
        content: '我在舞台上表演了十年，最后我发现，真正的舞台其实是生活本身。',
        likes: 543,
        comments: 76,
        views: 2987,
      },
      {
        id: 15,
        avatar: '📚',
        username: '书虫',
        time: '3天前',
        category: 'advice',
        categoryLabel: '灵感',
        content: '读了100本书后，我发现最好的建议往往来自生活本身。',
        likes: 654,
        comments: 91,
        views: 3456,
      },
      {
        id: 16,
        avatar: '🌙',
        username: '夜思者',
        time: '3天前',
        category: 'confess',
        categoryLabel: '随记',
        content: '每个失眠的夜晚，我都在思考人生的意义。但天亮后，这些问题又消失了...',
        likes: 789,
        comments: 125,
        views: 4123,
      },
      {
        id: 17,
        avatar: '☀️',
        username: '阳光男孩',
        time: '3天前',
        category: 'story',
        categoryLabel: '片段',
        content: '曾经的我很悲观，直到我遇见了一个人改变了我的人生观。',
        likes: 921,
        comments: 167,
        views: 5234,
      },
      {
        id: 18,
        avatar: '🎪',
        username: '欢乐源泉',
        time: '4天前',
        category: 'other',
        categoryLabel: '其他',
        content: '生活就像一场马戏，有欢笑也有泪水。但这就是美妙的地方。',
        likes: 456,
        comments: 63,
        views: 2234,
      },
      {
        id: 19,
        avatar: '🌺',
        username: '花儿',
        time: '4天前',
        category: 'confess',
        categoryLabel: '随记',
        content: '我很想改变，但总是坚持不了。有人和我一样吗？',
        likes: 567,
        comments: 84,
        views: 2876,
      },
      {
        id: 20,
        avatar: '🎵',
        username: '音乐者',
        time: '4天前',
        category: 'story',
        categoryLabel: '片段',
        content: '通过音乐，我找到了自己。每一个音符都是我灵魂的表达。',
        likes: 678,
        comments: 98,
        views: 3456,
      },
    ]

    this.setData({ allTrees: mockTrees })
    this.filterAndSort()

    // 保存到本地
    setStorage('all_tree_holes', mockTrees)
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
        tree.username.toLowerCase().includes(keyword)
      )
    }

    if (this.data.sortBy === 'hot') {
      filtered.sort((a, b) => b.likes - a.likes)
    } else {
      filtered.sort((a, b) => b.id - a.id)
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
    const newPage = this.data.currentPage + 1
    this.setData({ currentPage: newPage })
    
    // 重新筛选排序获取新一页的数据
    let filtered = [...this.data.allTrees]

    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(tree => tree.category === this.data.currentCategory)
    }

    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(tree => 
        tree.content.toLowerCase().includes(keyword) ||
        tree.username.toLowerCase().includes(keyword)
      )
    }

    if (this.data.sortBy === 'hot') {
      filtered.sort((a, b) => b.likes - a.likes)
    } else {
      filtered.sort((a, b) => b.id - a.id)
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
