// 首页逻辑 - pages/home/home.js
const { getAllTests } = require('../../data/tests-data.js')
const { formatParticipants } = require('../../utils/format.js')
const { getStorage } = require('../../utils/storage.js')

// 默认头像
const DEFAULT_AVATAR = '/assets/icons/me-active.png'

// 问候语配置
const GREETINGS = {
  morning: { text: '早上好', subtext: '今天，来份互动报告' },
  afternoon: { text: '下午好', subtext: '来份互动报告吧' },
  evening: { text: '晚上好', subtext: '夜深人静，更懂TA一点' },
}

Page({
  data: {
    userInfo: {
      nickName: '点击登录',
      avatarUrl: DEFAULT_AVATAR,
    },
    hasUserInfo: false,
    hotTests: [],
    greeting: {
      text: '你好',
      subtext: '今天，来份互动报告',
    },
  },

  onLoad() {
    console.log('📄 首页已加载')
    this.setGreeting()
    this.loadUserInfo()
    this.loadTests()
  },

  onShow() {
    this.loadUserInfo()
    this.setGreeting()
  },

  /**
   * 根据时间设置问候语
   */
  setGreeting() {
    const hour = new Date().getHours()
    let greetingType = 'morning'
    
    if (hour >= 12 && hour < 18) {
      greetingType = 'afternoon'
    } else if (hour >= 18 || hour < 6) {
      greetingType = 'evening'
    }
    
    this.setData({
      greeting: GREETINGS[greetingType]
    })
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    try {
      let userInfoStr = wx.getStorageSync('userInfo')
      
      if (userInfoStr) {
        let userInfo = userInfoStr
        
        if (typeof userInfoStr === 'string') {
          try {
            userInfo = JSON.parse(userInfoStr)
          } catch (e) {
            console.warn('⚠️ userInfo不是JSON格式')
          }
        }
        
        if (!userInfo.avatarUrl) {
          userInfo.avatarUrl = DEFAULT_AVATAR
        }
        
        this.setData({ 
          userInfo,
          hasUserInfo: true
        })
      } else {
        // 未登录状态
        this.setData({
          userInfo: {
            nickName: '小可爱',
            avatarUrl: DEFAULT_AVATAR,
          },
          hasUserInfo: false
        })
      }
    } catch (error) {
      console.error('❌ 加载用户信息失败:', error)
    }
  },

/**
   * 用户点击头像/昵称区域
   * 使用微信登录 + 后端认证
   */
  onGetUserInfo() {
    if (this.data.hasUserInfo) {
      wx.switchTab({
        url: '/pages/profile/profile/profile'
      })
      return
    }

    const api = require('../../utils/api.js')
    api.wxLogin().then((data) => {
      const userInfo = {
        nickName: data.userInfo.nickName || '用户',
        avatarUrl: data.userInfo.avatarUrl || '/assets/icons/me-active.png',
      }
      this.setData({ userInfo, hasUserInfo: true })
    }).catch((err) => {
      console.warn('登录失败，使用本地模式:', err)
      this.setData({
        userInfo: {
          nickName: '小可爱',
          avatarUrl: '/assets/icons/me-active.png',
        },
        hasUserInfo: false,
      })
    })
  },

  /**
   * 更新用户头像昵称（button 组件回调）
   * 微信已废弃 wx.getUserProfile，改用 button open-type="chooseAvatar"
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    if (!avatarUrl) return

    const userInfo = { ...this.data.userInfo, avatarUrl }
    this.setData({ userInfo })
    wx.setStorageSync('userInfo', userInfo)

    const api = require('../../utils/api.js')
    api.updateProfile(userInfo.nickName, avatarUrl).catch(() => {})
  },

  onNicknameChange(e) {
    const nickName = e.detail.value
    if (!nickName) return

    const userInfo = { ...this.data.userInfo, nickName }
    this.setData({ userInfo, hasUserInfo: true })
    wx.setStorageSync('userInfo', userInfo)

    const api = require('../../utils/api.js')
    api.updateProfile(nickName, this.data.userInfo.avatarUrl).catch(() => {})
  },

  /**
   * 加载测试列表
   */
  loadTests() {
    const allTests = getAllTests().map(test => ({
      ...test,
      participantsText: formatParticipants(test.participants),
    }))
    
    const hotTests = [...allTests]
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 3)
    
    this.setData({ hotTests })
    console.log('✅ 加载测试列表成功，共', allTests.length, '个测试')
  },

  /**
   * 导航到模块
   */
  navigateToModule(e) {
    const module = e.currentTarget.dataset.module
    const moduleMap = {
      test: '/pages/test/test-list/test-list',
      history: '/pages/history/history',
      profile: '/pages/profile/profile/profile',
      fate: '/pages/fate/fate-input/fate-input',
    }

    const url = moduleMap[module]
    if (url) {
      if (module === 'test' || module === 'profile') {
        wx.switchTab({ url })
      } else {
        wx.navigateTo({ url })
      }
    }
  },

  /**
   * 查看更多测试
   */
  onViewMoreTests() {
    wx.switchTab({
      url: '/pages/test/test-list/test-list'
    })
  },

  /**
   * 进入测试详情
   */
  navigateToTest(e) {
    const testId = e.currentTarget.dataset.testid
    wx.navigateTo({
      url: `/pages/test/test-detail/test-detail?id=${testId}`
    })
  },
})
