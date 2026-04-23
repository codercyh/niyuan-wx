const { getStorage, addToList } = require('../../../utils/storage.js')
const { getTestById, getQuestions, calculateResult, getRecommendedTests } = require('../../../data/tests-data.js')
const { formatParticipants } = require('../../../utils/format.js')

Page({
  data: {
    // 测试信息
    testId: null,
    testInfo: {},

    // 做题状态
    isAnswering: false,
    questions: [],
    currentQuestionIndex: 0,
    currentAnswers: [],

    // 当前题目
    currentQuestion: null,
  },

  onLoad(options) {
    const testId = options.id
    this.setData({ testId })
    this.loadTestData(testId)
  },

  loadTestData(testId) {
    // 从数据模块获取测试详情
    const test = getTestById(testId)

    if (test) {
      const testInfo = {
        ...test,
        participantsText: formatParticipants(test.participants),
      }
      this.setData({ testInfo })
      this.loadQuestions(testId)
    } else {
      wx.showToast({ title: '测试不存在', icon: 'error' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  formatParticipants(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'W'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  },

  loadQuestions(testId) {
    const questions = getQuestions(testId)
    
    if (questions && questions.length > 0) {
      this.setData({
        questions,
        currentAnswers: new Array(questions.length).fill(-1),
        currentQuestion: questions[0],
      })
    } else {
      wx.showToast({ title: '题目加载失败', icon: 'error' })
    }
  },

  // 开始测试
  onStartTest() {
    this.setData({ 
      isAnswering: true,
      currentQuestionIndex: 0,
      currentQuestion: this.data.questions[0],
    })
    wx.pageScrollTo({ scrollTop: 0 })
  },

  // 选择选项
  onSelectOption(e) {
    const optionIndex = e.currentTarget.dataset.index
    const answers = [...this.data.currentAnswers]
    answers[this.data.currentQuestionIndex] = optionIndex
    this.setData({ currentAnswers: answers })
  },

  // 上一题
  onPreviousQuestion() {
    if (this.data.currentQuestionIndex > 0) {
      const newIndex = this.data.currentQuestionIndex - 1
      this.setData({ 
        currentQuestionIndex: newIndex,
        currentQuestion: this.data.questions[newIndex],
      })
      wx.pageScrollTo({ scrollTop: 0 })
    }
  },

  // 下一题
  onNextQuestion() {
    if (this.data.currentAnswers[this.data.currentQuestionIndex] === -1) {
      wx.showToast({ title: '请先选择答案', icon: 'none' })
      return
    }

    if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
      const newIndex = this.data.currentQuestionIndex + 1
      this.setData({ 
        currentQuestionIndex: newIndex,
        currentQuestion: this.data.questions[newIndex],
      })
      wx.pageScrollTo({ scrollTop: 0 })
    }
  },

  // 提交测试
  onSubmitTest() {
    // 检查最后一题是否回答
    if (this.data.currentAnswers[this.data.currentQuestionIndex] === -1) {
      wx.showToast({ title: '请先选择答案', icon: 'none' })
      return
    }

    // 检查是否有未回答的题目
    const unanswered = this.data.currentAnswers.filter(a => a === -1).length
    if (unanswered > 0) {
      wx.showModal({
        title: '提示',
        content: `还有 ${unanswered} 道题未作答，确定要提交吗？`,
        success: (res) => {
          if (res.confirm) {
            this.processResult()
          }
        }
      })
    } else {
      this.processResult()
    }
  },

  // 处理结果
  processResult() {
    wx.showLoading({ title: '计算结果中...' })

    // 计算结果
    const result = calculateResult(this.data.testId, this.data.currentAnswers)

    if (result) {
      // 保存测试记录
      const testRecord = {
        id: Date.now(),
        testId: this.data.testId,
        testName: this.data.testInfo.name,
        answers: this.data.currentAnswers,
        result: result,
        completedAt: new Date().toLocaleString('zh-CN'),
      }

      addToList('test_records', testRecord, 100)

      wx.hideLoading()

      // 跳转结果页面
      wx.redirectTo({
        url: `/pages/test/test-result/test-result?testId=${this.data.testId}&recordId=${testRecord.id}`,
      })
    } else {
      wx.hideLoading()
      wx.showToast({ title: '结果计算失败', icon: 'error' })
    }
  },

  // 计算进度百分比
  getProgressPercent() {
    return Math.round((this.data.currentQuestionIndex + 1) / this.data.questions.length * 100)
  },
})
