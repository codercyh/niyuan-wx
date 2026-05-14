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

// 后端评论 -> 前端格式
function mapComment(c) {
  return {
    id: c._id,
    avatar: c.isAnonymous ? '😊' : '👤',
    username: c.isAnonymous ? '记录者' : '匿名用户',
    time: formatTime(c.createdAt),
    content: c.content,
    likes: c.likeCount || 0,
    liked: c.isLiked || false,
    replies: [], // 后端暂不支持二级评论
  }
}

// 后端树洞 -> 前端格式
function mapTreeHole(t) {
  return {
    id: t._id,
    avatar: CATEGORY_EMOJI[t.category] || '📝',
    username: t.isAnonymous ? '记录者' : '匿名用户',
    time: formatTime(t.createdAt),
    category: t.category,
    categoryLabel: CATEGORY_LABELS[t.category] || '其他',
    title: t.title,
    content: t.content,
    likes: t.likeCount || 0,
    comments: t.commentCount || 0,
    views: 0,
    isLiked: t.isLiked || false,
  }
}

Page({
  data: {
    treeId: '',
    treeData: {},
    isLiked: false,
    comments: [],
    commentText: '',
    canSubmitComment: false,
    loading: false,
  },

  onLoad(options) {
    const treeId = options.id
    if (!treeId) {
      wx.showToast({ title: '参数错误', icon: 'error' })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }
    this.setData({ treeId })
    this.loadTreeData(treeId)
  },

  loadTreeData(treeId) {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })

    api.getTreeHoleDetail(treeId)
      .then((res) => {
        const data = (res && res.data) || {}
        const treeData = mapTreeHole(data)
        const comments = (data.comments || []).map(mapComment)

        this.setData({
          treeData,
          isLiked: treeData.isLiked,
          comments,
          loading: false,
        })
      })
      .catch((err) => {
        console.error('[tree-detail] load failed', err)
        this.setData({ loading: false })
        wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      })
      .finally(() => wx.hideLoading())
  },

  // 点赞/取消点赞
  onToggleLike() {
    api.likeTreeHole(this.data.treeId)
      .then((res) => {
        const data = (res && res.data) || {}
        const isLiked = data.liked
        const newLikes = data.likeCount

        this.setData({
          isLiked,
          'treeData.likes': newLikes,
        })

        wx.showToast({
          title: isLiked ? '已标记' : '已取消',
          icon: 'success',
          duration: 1000,
        })
      })
      .catch((err) => {
        console.error('[tree-detail] like failed', err)
        wx.showToast({ title: (err && err.message) || '操作失败', icon: 'none' })
      })
  },

  // 评论点赞（后端暂不支持单独评论点赞，仅本地反馈）
  onToggleCommentLike(e) {
    const commentId = e.currentTarget.dataset.id
    const comments = this.data.comments.map(comment => {
      if (comment.id === commentId) {
        const newLiked = !comment.liked
        return {
          ...comment,
          liked: newLiked,
          likes: comment.likes + (newLiked ? 1 : -1),
        }
      }
      return comment
    })

    this.setData({ comments })
    wx.showToast({ title: '✓', icon: 'success', duration: 800 })
  },

  // 二级补充（后端暂不支持）
  onToggleReplyLike(e) {
    const replyId = e.currentTarget.dataset.id
    const parentId = e.currentTarget.dataset.parent

    const comments = this.data.comments.map(comment => {
      if (comment.id === parentId) {
        const replies = comment.replies.map(reply => {
          if (reply.id === replyId) {
            const newLiked = !reply.liked
            return {
              ...reply,
              liked: newLiked,
              likes: reply.likes + (newLiked ? 1 : -1),
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

  // 评论输入
  onCommentInput(e) {
    const commentText = e.detail.value
    this.setData({
      commentText,
      canSubmitComment: commentText.trim().length > 0,
    })
  },

  // 发布评论
  onPublishComment() {
    const text = this.data.commentText.trim()

    if (!text) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    if (text.length > 500) {
      wx.showToast({ title: '内容过长（最多500字）', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发送中...' })

    api.commentTreeHole(this.data.treeId, text, true)
      .then((res) => {
        wx.hideLoading()

        const newComment = mapComment((res && res.data) || {})

        this.setData({
          comments: [newComment, ...this.data.comments],
          commentText: '',
          canSubmitComment: false,
          'treeData.comments': this.data.treeData.comments + 1,
        })

        wx.showToast({ title: '已保存补充', icon: 'success' })
      })
      .catch((err) => {
        wx.hideLoading()
        console.error('[tree-detail] comment failed', err)
        wx.showToast({ title: (err && err.message) || '发送失败', icon: 'none' })
      })
  },

  // 二级补充（后端暂不支持）
  onReplyComment(e) {
    wx.showToast({ title: '功能整理中', icon: 'none' })
  },

  // 复制内容
  onShare() {
    wx.setClipboardData({
      data: `记录内容：${this.data.treeData.content.substring(0, 100)}...`,
      success: () => {
        wx.showToast({ title: '已复制内容', icon: 'success' })
      },
    })
  },
})
