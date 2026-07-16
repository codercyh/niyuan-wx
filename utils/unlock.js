/**
 * 解锁/付费 编排模块 (unlock.js)
 *
 * 三种解锁路径：
 *   1) 看广告免费解锁 (单次 runId)
 *   2) 单次付费 ¥9.9 (按 testId 永久解锁该测试)
 *   3) 月度会员 ¥9.9 活动价 (期内不限次数所有测试解锁)
 *
 * 付费走「小程序虚拟支付」（道具直购 mode=short_series_goods），适配 iOS 审核。
 * 流程：wx.login(拿新鲜 code) → 后端组装 signData + 双签名 → wx.requestVirtualPayment → 乐观本地解锁 + 服务端查单确认。
 * 前端 success 仅为弱确认，最终以服务端发货推送 / 查单为准。
 *
 * 数据存储 (storage)：
 *   - hasPaidOnce: boolean         // 历史首付标记 (向下兼容)
 *   - vipMember: { activatedAt, expireAt }
 *   - unlockedTests: string[]      // 永久解锁的测试 ID 列表
 *   - adUnlockedRuns: string[]     // 看广告解锁的本次结果 runId 列表
 */

const userMgr = require('./user.js')
const storage = require('./storage.js')
const api = require('./api.js')

// 获取 app 实例（支付成功后用于同步服务端状态）
function _getApp() {
  try { return getApp() } catch (e) { return null }
}

const PRICE = {
  SINGLE: 9.9,
  MEMBERSHIP_MONTHLY: 9.9,   // 活动期统一 ¥9.9
}

function _getAdUnlockedRuns() {
  const list = storage.getStorage('adUnlockedRuns')
  return Array.isArray(list) ? list : []
}

function _markRunAdUnlocked(runId) {
  if (!runId) return
  const id = String(runId)
  const list = _getAdUnlockedRuns()
  if (list.indexOf(id) < 0) {
    list.push(id)
    // 仅保留最近 200 条，防止存储膨胀
    const trimmed = list.length > 200 ? list.slice(-200) : list
    storage.setStorage('adUnlockedRuns', trimmed)
  }
}

/**
 * 当前结果是否已解锁 (深度内容)
 * 优先级：会员 > 测试永久解锁 > 本次广告解锁
 *
 * @param {object} ctx
 * @param {string} [ctx.testId] - 测试 ID (单次付费按此粒度解锁)
 * @param {string} [ctx.runId]  - 本次结果 ID (看广告按此粒度解锁)
 * @returns {boolean}
 */
function isResultUnlocked(ctx = {}) {
  if (userMgr.isVipMember()) return true
  if (ctx.testId && userMgr.isTestUnlocked(ctx.testId)) return true
  if (ctx.runId && _getAdUnlockedRuns().indexOf(String(ctx.runId)) >= 0) return true
  return false
}

/**
 * 看激励视频广告解锁本次结果
 * @param {string} runId - 本次结果 ID
 * @returns {Promise<{ok:boolean, source:string}>}
 */
function unlockByAd(runId) {
  return new Promise((resolve, reject) => {
    if (!runId) {
      reject(new Error('runId 不能为空'))
      return
    }

    // 微信开发者工具/旧版无激励视频 SDK 时，直接走本地解锁
    if (typeof wx === 'undefined' || typeof wx.createRewardedVideoAd !== 'function') {
      _markRunAdUnlocked(runId)
      resolve({ ok: true, source: 'local-fallback' })
      return
    }

    // 替换为真实广告位 ID (mp.weixin.qq.com 申请)
    const AD_UNIT_ID = 'adunit-xxxxxxxxxxxxxxxx'

    const ad = wx.createRewardedVideoAd({ adUnitId: AD_UNIT_ID })

    const onClose = (res) => {
      ad.offClose(onClose)
      ad.offError(onError)
      // 完整观看 (isEnded === true 或老版本无该字段)
      if (res && res.isEnded === false) {
        reject(new Error('未完整观看广告'))
        return
      }
      // 服务端验签（可选）
      api.verifyAdUnlock({ runId }).catch(() => {})
      _markRunAdUnlocked(runId)
      resolve({ ok: true, source: 'ad' })
    }

    const onError = (err) => {
      ad.offClose(onClose)
      ad.offError(onError)
      reject(err || new Error('广告加载失败'))
    }

    ad.onClose(onClose)
    ad.onError(onError)

    ad.show().catch(() => {
      ad.load().then(() => ad.show()).catch(onError)
    })
  })
}

/**
 * 拉起小程序虚拟支付（道具直购）
 * @param {object} params - 后端 /pay/virtual/create 返回的参数
 * @returns {Promise<void>}
 */
function _requestVirtualPayment(params) {
  return new Promise((resolve, reject) => {
    wx.requestVirtualPayment({
      env: params.env,
      mode: params.mode,           // 'short_series_goods'
      offerId: params.offerId,
      signData: params.signData,
      paySig: params.paySig,
      signature: params.signature,
      success: () => resolve(),
      fail: (err) => {
        const msg = (err && err.errMsg) || ''
        if (msg.indexOf('cancel') >= 0) {
          reject(new Error('用户取消支付'))
        } else {
          reject(new Error(msg || '支付失败'))
        }
      },
    })
  })
}

/**
 * 虚拟支付通用流程：wx.login → 后端组单+签名 → 拉起支付 → 服务端确认
 * @param {object} opts - { type: 'single'|'membership', testId? }
 * @returns {Promise<{ orderId: string }>}
 */
function _payVirtual(opts) {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          reject(new Error('微信登录失败，请重试'))
          return
        }
        api.createVirtualOrder({
          type: opts.type,
          testId: opts.testId,
          code: loginRes.code,
        })
          .then((orderRes) => {
            const d = orderRes.data
            return _requestVirtualPayment(d).then(() => d.orderId)
          })
          .then((orderId) => {
            // 前端 success 仅弱确认；后台查单确认不阻塞本地解锁
            api.confirmVirtualOrder(orderId).catch(() => {})
            const app = _getApp()
            if (app && typeof app.refreshAfterPayment === 'function') {
              app.refreshAfterPayment().catch(() => {})
            }
            resolve({ orderId })
          })
          .catch(reject)
      },
      fail: () => reject(new Error('微信登录失败')),
    })
  })
}

/**
 * 单次付费 ¥9.9 永久解锁该测试（虚拟支付-道具直购）
 * @param {string} testId
 * @returns {Promise<{ok:boolean, source:string, orderId?:string}>}
 */
function unlockBySinglePay(testId) {
  if (!testId) return Promise.reject(new Error('testId 不能为空'))
  // 本地已解锁则直接成功
  if (userMgr.isTestUnlocked(testId)) {
    return Promise.resolve({ ok: true, source: 'already-unlocked' })
  }
  return _payVirtual({ type: 'single', testId })
    .then((info) => {
      userMgr.markTestUnlocked(testId)
      userMgr.markPaidOnce()
      return { ok: true, source: 'virtual-single', orderId: info.orderId }
    })
}

/**
 * 月度会员 ¥9.9 活动价（虚拟支付-道具直购，期内不限次数解锁所有测试）
 * @param {object} [opts] - { months: 1 }
 * @returns {Promise<{ok:boolean, source:string, expireAt?:number, orderId?:string}>}
 */
function unlockByMembership(opts) {
  // 本地已是有效会员则直接成功
  if (userMgr.isVipMember()) {
    return Promise.resolve({ ok: true, source: 'already-vip' })
  }
  const months = (opts && opts.months) || 1
  return _payVirtual({ type: 'membership' })
    .then((info) => {
      const vip = userMgr.markVipMember({ months })
      userMgr.markPaidOnce()
      return { ok: true, source: 'virtual-membership', expireAt: vip.expireAt, orderId: info.orderId }
    })
}

module.exports = {
  PRICE,
  isResultUnlocked,
  unlockByAd,
  unlockBySinglePay,
  unlockByMembership,
}
