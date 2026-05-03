const api = require('../../../utils/api.js')
const { formatParticipants } = require('../../../utils/format.js')

const CATEGORY_EMOJI = {
  fun: '🤪', personality: '👤', love: '💕',
  psychology: '🧠', career: '💼', divination: '🔮',
}

Page({
  data: {
    testId: null,
    testInfo: {},
    isAnswering: false,
    questions: [],         // 后端原始题目，含 options[].id
    questionsView: [],     // 仅渲染用：把 question.text 映射为 question
    currentQuestionIndex: 0,
    currentAnswers: [],    // 每题选中的 option index（-1 表示未答）
    currentQuestion: null,
  },

  onLoad(options) {
    const testId = options.id
    this.setData({ testId })
    this.loadTestData(testId)
  },

  loadTestData(testId) {
    wx.showLoading({ title: '加载中...' })
    api.getTestDetail(testId)
      .then((res) => {
        const data = (res && res.data) || {}
        const test = data.test || {}
        const detail = data.detail || {}
        const testInfo = {
          id: test.testId,
          name: test.title,
          description: test.description || test.subtitle || '',
          emoji: CATEGORY_EMOJI[test.category] || '📊',
          category: test.category,
          tags: test.tags || [],
          questionCount: test.questionCount || (detail.questions || []).length,
          participants: test.participants || 0,
          participantsText: formatParticipants(test.participants || 0),
          isVipOnly: !!test.isVipOnly,
        }
        const rawQuestions = detail.questions || []
        const questionsView = rawQuestions.map(q => ({
          id: q.id,
          question: q.text,
          options: (q.options || []).map(o => ({ id: o.id, text: o.text })),
        }))
        this.setData({
          testInfo,
          questions: rawQuestions,
          questionsView,
          currentAnswers: new Array(questionsView.length).fill(-1),
          currentQuestion: questionsView[0] || null,
        })
      })
      .catch((err) => {
        console.error('[test-detail] load failed', err)
        wx.showToast({ title: (err && err.message) || '测试加载失败', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      })
      .finally(() => wx.hideLoading())
  },

  onStartTest() {
    if (!this.data.questionsView.length) {
      wx.showToast({ title: '题目尚未加载', icon: 'none' })
      return
    }
    this.setData({
      isAnswering: true,
      currentQuestionIndex: 0,
      currentQuestion: this.data.questionsView[0],
    })
    wx.pageScrollTo({ scrollTop: 0 })
  },

  onSelectOption(e) {
    const optionIndex = e.currentTarget.dataset.index
    const answers = [...this.data.currentAnswers]
    answers[this.data.currentQuestionIndex] = optionIndex
    this.setData({ currentAnswers: answers })
  },

  onPreviousQuestion() {
    if (this.data.currentQuestionIndex > 0) {
      const newIndex = this.data.currentQuestionIndex - 1
      this.setData({
        currentQuestionIndex: newIndex,
        currentQuestion: this.data.questionsView[newIndex],
      })
      wx.pageScrollTo({ scrollTop: 0 })
    }
  },

  onNextQuestion() {
    if (this.data.currentAnswers[this.data.currentQuestionIndex] === -1) {
      wx.showToast({ title: '请先选择答案', icon: 'none' })
      return
    }
    if (this.data.currentQuestionIndex < this.data.questionsView.length - 1) {
      const newIndex = this.data.currentQuestionIndex + 1
      this.setData({
        currentQuestionIndex: newIndex,
        currentQuestion: this.data.questionsView[newIndex],
      })
      wx.pageScrollTo({ scrollTop: 0 })
    }
  },

  onSubmitTest() {
    if (this.data.currentAnswers[this.data.currentQuestionIndex] === -1) {
      wx.showToast({ title: '请先选择答案', icon: 'none' })
      return
    }
    const unanswered = this.data.currentAnswers.filter(a => a === -1).length
    if (unanswered > 0) {
      wx.showModal({
        title: '提示',
        content: `还有 ${unanswered} 道题未作答，确定要提交吗？`,
        success: (res) => { if (res.confirm) this.processResult() }
      })
    } else {
      this.processResult()
    }
  },

  processResult() {
    wx.showLoading({ title: '计算结果中...' })
    // 把 index 转换成后端要的 { questionId, optionId } 数组
    const payload = []
    this.data.questions.forEach((q, idx) => {
      const optIdx = this.data.currentAnswers[idx]
      if (optIdx === -1) return
      const opt = (q.options || [])[optIdx]
      if (!opt) return
      payload.push({ questionId: q.id, optionId: opt.id })
    })

    api.submitTestAnswer(this.data.testId, payload)
      .then((res) => {
        wx.hideLoading()
        const record = (res && res.data) || {}
        // 把记录暂存到本地缓存，供 result 页直接读取（避免再请求一次）
        try {
          wx.setStorageSync('test_latest_record', record)
        } catch (e) {}
        const recordId = record._id || record.id || ''
        wx.redirectTo({
          url: `/pages/test/test-result/test-result?testId=${this.data.testId}&recordId=${recordId}`,
        })
      })
      .catch((err) => {
        wx.hideLoading()
        console.error('[test-detail] submit failed', err)
        wx.showToast({ title: (err && err.message) || '提交失败', icon: 'none' })
      })
  },

  getProgressPercent() {
    return Math.round((this.data.currentQuestionIndex + 1) / this.data.questionsView.length * 100)
  },
})
