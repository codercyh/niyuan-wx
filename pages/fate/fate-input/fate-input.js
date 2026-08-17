const { RELATIONSHIP_STATUS, getZodiacByBirthday, getLifePathNumber } = require('../../../data/fate-data.js')
const lunar = require('../../../utils/lunar.js')

Page({
  data: {
    step: 1,
    progressWidth: 33,

    // 步骤1
    personA: { name: '', birthday: '', birthdayLunar: '', calendarType: 'solar', zodiac: null, lifePath: 0 },
    personB: { name: '', birthday: '', birthdayLunar: '', calendarType: 'solar', zodiac: null, lifePath: 0 },
    today: '',

    // 农历选择器
    lunarPickerVisible: false,
    lunarPickerWho: '',  // 'personA' or 'personB'
    lunarYearRange: [],
    lunarMonthRange: [],
    lunarDayRange: [],
    lunarYearIndex: 0,
    lunarMonthIndex: 0,
    lunarDayIndex: 0,

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

    // 农历年份范围（1900-当前年）
    const lunarYearRange = []
    for (let y = 1900; y <= now.getFullYear(); y++) {
      lunarYearRange.push(`${y}年`)
    }
    // 农历月份范围
    const lunarMonthRange = lunar.LUNAR_MONTH.map(m => `${m}月`)
    // 农历日期范围（默认30天，会根据月份动态调整）
    const lunarDayRange = lunar.LUNAR_DAY.slice()

    this.setData({
      today,
      yearRange,
      monthRange,
      lunarYearRange,
      lunarMonthRange,
      lunarDayRange,
      lunarYearIndex: lunarYearRange.length - 1,  // 默认当前年
    })
  },

  // ==================== 步骤1 ====================
  onNameInput(e) {
    const who = e.currentTarget.dataset.who
    const name = e.detail.value.slice(0, 10)
    this.setData({ [`${who}.name`]: name })
  },

  // 切换日历类型
  switchCalendarType(e) {
    const who = e.currentTarget.dataset.who
    const type = e.currentTarget.dataset.type
    this.setData({ [`${who}.calendarType`]: type })
  },

  // 阳历日期选择
  onBirthdayChange(e) {
    const who = e.currentTarget.dataset.who
    const birthday = e.detail.value
    this._applyBirthday(who, birthday, '')
  },

  // 打开农历选择器
  openLunarPicker(e) {
    const who = e.currentTarget.dataset.who
    this.setData({
      lunarPickerVisible: true,
      lunarPickerWho: who,
    })
  },

  // 关闭农历选择器
  closeLunarPicker() {
    this.setData({ lunarPickerVisible: false })
  },

  // 农历年份切换
  onLunarYearChange(e) {
    this.setData({ lunarYearIndex: e.detail.value })
  },

  // 农历月份切换
  onLunarMonthChange(e) {
    this.setData({ lunarMonthIndex: e.detail.value })
  },

  // 农历日期切换
  onLunarDayChange(e) {
    this.setData({ lunarDayIndex: e.detail.value })
  },

  // 农历picker-view 三列联动
  onLunarPickerChange(e) {
    const [y, m, d] = e.detail.value
    this.setData({ lunarYearIndex: y, lunarMonthIndex: m, lunarDayIndex: d })
  },

  // 确认农历选择
  confirmLunarPicker() {
    const { lunarPickerWho, lunarYearIndex, lunarMonthIndex, lunarDayIndex, lunarYearRange } = this.data
    const year = parseInt(lunarYearRange[lunarYearIndex])
    const month = lunarMonthIndex + 1
    const day = lunarDayIndex + 1

    // 农历转阳历
    const solar = lunar.lunarToSolar(year, month, day, false)
    if (!solar) {
      wx.showToast({ title: '农历日期无效', icon: 'none' })
      return
    }

    const solarDate = `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`
    const lunarText = `${year}年 ${lunar.LUNAR_MONTH[month - 1]}月${lunar.LUNAR_DAY[day - 1]}`

    this._applyBirthday(lunarPickerWho, solarDate, lunarText)
    this.setData({ lunarPickerVisible: false })
  },

  // 统一应用生日数据
  _applyBirthday(who, solarDate, lunarText) {
    // 参数验证
    if (!solarDate || typeof solarDate !== 'string') {
      console.warn('无效的日期格式:', solarDate)
      return
    }
    const parts = solarDate.split('-')
    if (parts.length < 3) {
      console.warn('日期格式不完整:', solarDate)
      return
    }
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      console.warn('无效的月日:', month, day)
      return
    }
    const zodiac = getZodiacByBirthday(month, day)
    const lifePath = getLifePathNumber(solarDate)

    this.setData({
      [`${who}.birthday`]: solarDate,
      [`${who}.birthdayLunar`]: lunarText,
      [`${who}.zodiac`]: zodiac,
      [`${who}.lifePath`]: lifePath,
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

    const { personA, personB, selectedRelation, relationshipList, durationYears, durationMonths, breakupDuration, breakupIntention, story } = this.data
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

  // 阻止冒泡
  noop() {},
})
