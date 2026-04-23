const { getStorage, setStorage } = require('../../../utils/storage.js')

Page({
  data: {
    treeId: 0,
    treeData: {},
    isLiked: false,
    comments: [],
    commentText: '',
    canSubmitComment: false,
  },

  onLoad(options) {
    const treeId = parseInt(options.id)
    this.setData({ treeId })
    this.loadTreeData(treeId)
  },

  loadTreeData(treeId) {
    // 从storage获取记录数据
    const allTrees = getStorage('all_tree_holes') || this.getMockTrees()
    const tree = allTrees.find(t => t.id === treeId)

    if (!tree) {
      wx.showToast({ title: '内容不存在', icon: 'error' })
      wx.navigateBack()
      return
    }

    this.setData({ treeData: tree })

    // 加载补充内容
    this.loadComments(treeId)

    // 检查是否已标记
    const likedTrees = getStorage('liked_trees') || []
    const isLiked = likedTrees.includes(treeId)
    this.setData({ isLiked })
  },

  loadComments(treeId) {
    const mockComments = [
      {
        id: 1,
        avatar: '😊',
        username: '记录者A',
        time: '1小时前',
        content: '我也有同样的感受，你不孤独。',
        likes: 12,
        liked: false,
        replies: [
          {
            id: 101,
            avatar: '💙',
            username: '原记录者',
            time: '50分钟前',
            content: '谢谢你的理解，这对我很有帮助。',
            likes: 3,
            liked: false,
          },
          {
            id: 102,
            avatar: '🌟',
            username: '记录者B',
            time: '30分钟前',
            content: '大家都会有这样的时候，加油！',
            likes: 5,
            liked: false,
          },
        ],
      },
      {
        id: 2,
        avatar: '💪',
        username: '记录参考',
        time: '2小时前',
        content: '建议你可以尝试一下冥想或者瑜伽，对调整心态很有帮助。',
        likes: 28,
        liked: false,
        replies: [
          {
            id: 201,
            avatar: '✨',
            username: '用户B',
            time: '1小时前',
            content: '我试过了，真的很有效果！',
            likes: 8,
            liked: false,
          },
        ],
      },
      {
        id: 3,
        avatar: '🎯',
        username: '行动派',
        time: '3小时前',
        content: '与其想那么多，不如制定一个小目标，然后逐步实现。这样会更有成就感。',
        likes: 35,
        liked: false,
        replies: [],
      },
      {
        id: 4,
        avatar: '👋',
        username: '记录者C',
        time: '4小时前',
        content: '换个环境确实会不容易，先把节奏慢下来也没关系。',
        likes: 42,
        liked: false,
        replies: [
          {
            id: 401,
            avatar: '❤️',
            username: '记录者D',
            time: '2小时前',
            content: '这样的温暖互动真的很棒！',
            likes: 15,
            liked: false,
          },
        ],
      },
    ]

    this.setData({ comments: mockComments })
    setStorage(`tree_${treeId}_comments`, mockComments)
  },

  // 标记/取消标记
  onToggleLike() {
    const isLiked = !this.data.isLiked
    const newLikes = this.data.treeData.likes + (isLiked ? 1 : -1)

    const updatedTree = { ...this.data.treeData, likes: newLikes }
    this.setData({
      isLiked,
      treeData: updatedTree,
    })

    // 保存到storage
    let likedTrees = getStorage('liked_trees') || []
    if (isLiked) {
      if (!likedTrees.includes(this.data.treeId)) {
        likedTrees.push(this.data.treeId)
      }
    } else {
      likedTrees = likedTrees.filter(id => id !== this.data.treeId)
    }
    setStorage('liked_trees', likedTrees)

    wx.showToast({
      title: isLiked ? '已标记' : '已取消',
      icon: 'success',
      duration: 1000,
    })
  },

  // 补充内容标记
  onToggleCommentLike(e) {
    const commentId = e.currentTarget.dataset.id
    const comments = this.data.comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          liked: !comment.liked,
          likes: comment.likes + (comment.liked ? -1 : 1),
        }
      }
      return comment
    })

    this.setData({ comments })
    wx.showToast({ title: '✓', icon: 'success', duration: 800 })
  },

  // 二级补充标记
  onToggleReplyLike(e) {
    const replyId = e.currentTarget.dataset.id
    const parentId = e.currentTarget.dataset.parent
    
    const comments = this.data.comments.map(comment => {
      if (comment.id === parentId) {
        const replies = comment.replies.map(reply => {
          if (reply.id === replyId) {
            return {
              ...reply,
              liked: !reply.liked,
              likes: reply.likes + (reply.liked ? -1 : 1),
            }
          }
          return reply
        })
        return { ...comment, replies }
      }
      return comment
    })

    this.setData({ comments })
    wx.showToast({ title: '✓', icon: 'success', duration: 800 })
  },

  // 补充输入
  onCommentInput(e) {
    const commentText = e.detail.value
    this.setData({
      commentText,
      canSubmitComment: commentText.trim().length > 0,
    })
  },

  // 保存补充内容
  onPublishComment() {
    const text = this.data.commentText.trim()

    if (!text) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    if (text.length > 200) {
      wx.showToast({ title: '内容过长（最多200字）', icon: 'none' })
      return
    }

    // 创建新补充内容
    const newComment = {
      id: Math.max(...this.data.comments.map(c => c.id), 0) + 1,
      avatar: '😊',
      username: '我',
      time: '刚刚',
      content: text,
      likes: 0,
      liked: false,
      replies: [],
    }

    const updatedComments = [newComment, ...this.data.comments]
    this.setData({
      comments: updatedComments,
      commentText: '',
      canSubmitComment: false,
    })

    // 更新记录的补充数
    const updatedTree = {
      ...this.data.treeData,
      comments: this.data.treeData.comments + 1,
    }
    this.setData({ treeData: updatedTree })

    wx.showToast({ title: '已保存补充', icon: 'success' })

    // 保存到storage
    setStorage(`tree_${this.data.treeId}_comments`, updatedComments)
  },

  // 添加二级补充
  onReplyComment(e) {
    const commentId = e.currentTarget.dataset.id
    // 实际应用中可以展开补充输入框或者弹出输入框
    wx.showToast({ title: '补充功能整理中', icon: 'none' })
  },

  // 复制内容
  onShare() {
    wx.setClipboardData({
      data: `记录内容：${this.data.treeData.content.substring(0, 50)}...`,
      success: () => {
        wx.showToast({ title: '已复制内容', icon: 'success' })
      },
    })
  },

  getMockTrees() {
    return [
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
    ]
  },
})
