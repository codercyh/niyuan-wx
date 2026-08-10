const api = require('./utils/api.js')
const storage = require('./utils/storage.js')

App({
  globalData: {
    userInfo: null,
    vipStatus: false,
    vipInfo: null,        // { isVip, vipLevel, vipExpire }
    theme: 'light',
    bootstrapped: false,  // 登录 + 首次同步是否完成
    bootstrapPromise: null,
  },

  onLaunch() {
    // 检查隐私说明
    const agreed = wx.getStorageSync('privacy_agreed')
    if (!agreed) {
      wx.navigateTo({ url: '/pages/privacy/privacy' })
    }

    // 启动鉴权 + 用户/会员状态同步
    this.globalData.bootstrapPromise = this.bootstrap()
  },

  /**
   * 启动流程：wx.login → 后端换 token → 拉取用户信息 + VIP 状态
   * 失败抛错（按"全 API 强依赖"策略），由调用方决定如何提示
   */
  bootstrap() {
    return api.wxLogin()
      .then((data) => {
        if (data && data.userInfo) {
          this.globalData.userInfo = data.userInfo
        }
        return api.checkVipStatus()
      })
      .then((res) => {
        const vip = (res && res.data) || {}
        this.globalData.vipInfo = vip
        this.globalData.vipStatus = !!vip.isVip
        // 持久化一份 VIP 状态供 utils/user.js 读取
        storage.setStorage('vipMember', vip.isVip ? {
          activatedAt: Date.now(),
          expireAt: vip.vipExpire ? new Date(vip.vipExpire).getTime() : 0,
          level: vip.vipLevel || 1,
        } : null)
        this.globalData.bootstrapped = true
        return vip
      })
      .catch((err) => {
        console.error('[app] bootstrap failed', err)
        this.globalData.bootstrapped = false
        throw err
      })
  },

  /** 等待启动完成；页面可在 onLoad 中 await。失败后允许重试。 */
  ensureBootstrapped() {
    if (this.globalData.bootstrapped) return Promise.resolve(this.globalData.vipInfo)
    // 上次的 promise 如果还在 pending 就复用；否则重新发起
    if (this.globalData.bootstrapPromise) {
      // 检测是否已 settled（已结束）：用一面旗子
      const p = this.globalData.bootstrapPromise
      let settled = false
      p.then(() => { settled = true }, () => { settled = true })
      // 同步检查：如果 p 是 pending，settled 此时还是 false
      // 但 JS 是单线程，这里 settled 必为 false（then 回调还没执行）
      // 所以 pending 时复用；已 settled 时（下次调用才检测到）重试
      return p.catch(() => {
        this.globalData.bootstrapPromise = this.bootstrap()
        return this.globalData.bootstrapPromise
      })
    }
    this.globalData.bootstrapPromise = this.bootstrap()
    return this.globalData.bootstrapPromise
  },

  /** 主动刷新 VIP 状态（支付成功后调用） */
  refreshVipStatus() {
    return api.checkVipStatus().then((res) => {
      const vip = (res && res.data) || {}
      this.globalData.vipInfo = vip
      this.globalData.vipStatus = !!vip.isVip
      storage.setStorage('vipMember', vip.isVip ? {
        activatedAt: Date.now(),
        expireAt: vip.vipExpire ? new Date(vip.vipExpire).getTime() : 0,
        level: vip.vipLevel || 1,
      } : null)
      return vip
    })
  },

  /** 支付成功后同步状态（刷新 VIP 状态 + 用户解锁信息） */
  refreshAfterPayment() {
    return Promise.all([
      api.checkVipStatus(),
      api.getUserInfo().catch(() => null),
    ]).then(([vipRes, userRes]) => {
      const vip = (vipRes && vipRes.data) || {}
      this.globalData.vipInfo = vip
      this.globalData.vipStatus = !!vip.isVip

      // 更新本地存储
      storage.setStorage('vipMember', vip.isVip ? {
        activatedAt: Date.now(),
        expireAt: vip.vipExpire ? new Date(vip.vipExpire).getTime() : 0,
        level: vip.vipLevel || 1,
      } : null)

      // 同步用户解锁信息
      if (userRes && userRes.data) {
        const userData = userRes.data
        if (userData.unlockedTests) {
          storage.setStorage('unlockedTests', userData.unlockedTests)
        }
        if (typeof userData.hasPaidOnce === 'boolean') {
          storage.setStorage('hasPaidOnce', userData.hasPaidOnce)
        }
      }

      return { vip, user: userRes?.data }
    })
  },

  // 获取当前资料
  getUserInfo() {
    return this.globalData.userInfo
  },

  // 更新当前资料（仅内存 + 本地缓存；持久化由后端 /users/profile 负责）
  updateUserInfo(updates) {
    const userInfo = { ...this.globalData.userInfo, ...updates }
    this.globalData.userInfo = userInfo
    return userInfo
  },

  // 获取会员状态
  getVipStatus() {
    return this.globalData.vipStatus
  },
})
