const { RELATIONSHIP_STATUS, getZodiacByBirthday, getLifePathNumber, ZODIAC_LIST, ELEMENT_MATCH } = require('../../../data/fate-data.js')

Page({
  data: {
    step: 1,
    progressWidth: 33,

    // 步骤1
    personA: { name: '', birthday: '', zodiac: null, lifePath: 0 },
    personB: { name: '', birthday: '', zodiac: null, lifePath: 0 },
    previewVisible: false,
    preview: null,
    today: '',

    // 步骤2
    relationshipList: RELATIONSHIP_STATUS,
    selectedRelation: '',
    relationFeedback: null,
    durationYears: '',
    durationMonths: '',
    yearRange: [],
    monthRange: [],
    breakupDuration: '',
    breakupIntention: '',
    story: '',
    storyLength: 0,
    showDuration: false,
    showBreakup: false,

    // 步骤3
    canSubmit: false,
    confirmData: null,
  },

  onLoad() {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const yearRange = []
    for (let i = 0; i <= 30; i++) yearRange.push(i)
    const monthRange = []
    for (let i = 0; i <= 11; i++) monthRange.push(i)
    this.setData({ today, yearRange, monthRange })
  },

  // ==================== 步骤1 ====================
  onNameInput(e) {
    const who = e.currentTarget.dataset.who
    const name = e.detail.value.slice(0, 10)
    this.setData({ [`${who}.name`]: name })
  },

  onBirthdayChange(e) {
    const who = e.currentTarget.dataset.who
    const birthday = e.detail.value
    const parts = birthday.split('-')
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])
    const zodiac = getZodiacByBirthday(month, day)
    const lifePath = getLifePathNumber(birthday)

    this.setData({
      [`${who}.birthday`]: birthday,
      [`${who}.zodiac`]: zodiac,
      [`${who}.lifePath`]: lifePath,
    })

    // 检查是否两人都选了生日
    const personA = who === 'personA' ? { ...this.data.personA, birthday, zodiac, lifePath } : this.data.personA
    const personB = who === 'personB' ? { ...this.data.personB, birthday, zodiac, lifePath } : this.data.personB

    if (personA.birthday && personB.birthday) {
      this._generatePreview(personA, personB)
    }
  },

  _generatePreview(a, b) {
    const elementKey = `${a.zodiac.element}-${b.zodiac.element}`
    const elementMatch = ELEMENT_MATCH[elementKey] || { label: '奇妙组合', desc: '你们的组合独一无二' }
    const idxA = ZODIAC_LIST.findIndex(z => z.name === a.zodiac.name)
    const idxB = ZODIAC_LIST.findIndex(z => z.name === b.zodiac.name)

    // 简单预测范围
    const { ZODIAC_MATRIX } = require('../../../data/fate-data.js')
    const base = ZODIAC_MATRIX[idxA][idxB]
    const low = Math.max(15, base - 15)
    const high = Math.min(99, base + 10)

    this.setData({
      previewVisible: true,
      preview: {
        zodiacA: a.zodiac,
        zodiacB: b.zodiac,
        elementCombo: elementMatch.label,
        elementDesc: elementMatch.desc,
        predictRange: `${low}-${high}`,
        baseScore: base,
      },
    })
  },

  canGoStep2() {
    const { personA, personB } = this.data
    return personA.name && personA.birthday && personB.name && personB.birthday
  },

  goStep2() {
    if (!this.canGoStep2()) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    this.setData({ step: 2, progressWidth: 66 })
  },

  // ==================== 步骤2 ====================
  selectRelation(e) {
    const value = e.currentTarget.dataset.value
    const item = this.data.relationshipList.find(r => r.value === value)
    const showDuration = value === 'together' || value === 'married'
    const showBreakup = value === 'breakup'

    this.setData({
      selectedRelation: value,
      relationFeedback: item ? item.feedback : null,
      showDuration,
      showBreakup,
      // 切换时清空额外字段
      durationYears: showDuration ? this.data.durationYears : '',
      durationMonths: showDuration ? this.data.durationMonths : '',
      breakupDuration: showBreakup ? this.data.breakupDuration : '',
      breakupIntention: showBreakup ? this.data.breakupIntention : '',
    })
  },

  onDurationYearsChange(e) {
    this.setData({ durationYears: this.data.yearRange[e.detail.value] })
  },

  onDurationMonthsChange(e) {
    this.setData({ durationMonths: this.data.monthRange[e.detail.value] })
  },

  selectBreakupDuration(e) {
    this.setData({ breakupDuration: e.currentTarget.dataset.value })
  },

  selectBreakupIntention(e) {
    this.setData({ breakupIntention: e.currentTarget.dataset.value })
  },

  onStoryInput(e) {
    const story = e.detail.value.slice(0, 200)
    this.setData({ story, storyLength: story.length })
  },

  canGoStep3() {
    const { selectedRelation, showDuration, durationYears, durationMonths, showBreakup, breakupDuration, breakupIntention } = this.data
    if (!selectedRelation) return false
    if (showDuration && durationYears === '' && durationMonths === '') return false
    if (showBreakup && (!breakupDuration || !breakupIntention)) return false
    return true
  },

  goStep3() {
    if (!this.canGoStep3()) {
      wx.showToast({ title: '请完善关系信息', icon: 'none' })
      return
    }

    // 组装确认数据
    const { personA, personB, selectedRelation, relationshipList, durationYears, durationMonths, breakupDuration, breakupIntention, story, preview } = this.data
    const relationItem = relationshipList.find(r => r.value === selectedRelation)

    this.setData({
      step: 3,
      progressWidth: 100,
      confirmData: {
        personA,
        personB,
        relation: relationItem,
        durationYears,
        durationMonths,
        breakupDuration,
        breakupIntention,
        story,
        preview,
      },
      canSubmit: true,
    })
  },

  // ==================== 步骤3 ====================
  goBack() {
    if (this.data.step > 1) {
      const step = this.data.step - 1
      this.setData({ step, progressWidth: step === 1 ? 33 : 66 })
    }
  },

  confirmSubmit() {
    const inputData = {
      personA: this.data.personA,
      personB: this.data.personB,
      relation: this.data.selectedRelation,
      durationYears: this.data.durationYears,
      durationMonths: this.data.durationMonths,
      breakupDuration: this.data.breakupDuration,
      breakupIntention: this.data.breakupIntention,
      story: this.data.story,
    }
    wx.setStorageSync('fate_input', inputData)
    wx.navigateTo({ url: '/pages/fate/fate-loading/fate-loading' })
  },
})
