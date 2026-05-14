/**
 * 解锁/付费 编排模块 (unlock.js)
 *
 * 三种解锁路径：
 *   1) 看广告免费解锁 (单次 runId)
 *   2) 单次付费 ¥9.9 (按 testId 永久解锁该测试)
 *   3) 月度会员 ¥19.9 (期内不限次数所有测试解锁)
 *
 * 当前阶段：本地优先 + 服务端钩子占位
 *   - api.js 中 verify*/create* 均为 stub，直接 resolve
 *   - 备案完成后：把 api.js 的 stubs 替换为真实接口；
 *     unlock.js 这里的调用顺序无需改动
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

const PRICE = {
  SINGLE: 9.9,
  MEMBERSHIP_MONTHLY: 19.9,
  MEMBERSHIP_FIRST_MONTH: 9.9,  // 已付费用户升级会员首月优惠价
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
 * 优先级：会员 > 测试永久解锁 > 本次广告解锁 > (兼容) hasPaidOnce
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
  // 兼容历史：曾付过单次费的老用户全部默认解锁
  if (userMgr.hasPaidOnce()) return true
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

    // TODO: 替换为真实广告位 ID (mp.weixin.qq.com 申请)
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
      // TODO: 备案后服务端验签 (api.verifyAdUnlock)
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
 * 单次付费 ¥9.9 永久解锁该测试
 * @param {string} testId
 * @returns {Promise<{ok:boolean, source:string}>}
 */
function unlockBySinglePay(testId) {
  return new Promise((resolve, reject) => {
    if (!testId) {
      reject(new Error('testId 不能为空'))
      return
    }

    // 备案前 stub：直接走本地标记
    api.createSinglePayOrder({ testId, amount: PRICE.SINGLE })
      .then((order) => {
        // TODO: 备案后此处接入 wx.requestPayment(order.data)
        // 现阶段订单直接视为成功
        return api.verifySinglePayCallback({ testId, orderId: (order && order.data && order.data.orderId) || 'stub' })
      })
      .then(() => {
        userMgr.markTestUnlocked(testId)
        userMgr.markPaidOnce()
        resolve({ ok: true, source: 'single-pay' })
      })
      .catch((err) => {
        // 服务端尚未上线时，直接本地兜底
        userMgr.markTestUnlocked(testId)
        userMgr.markPaidOnce()
        resolve({ ok: true, source: 'local-fallback', err })
      })
  })
}

/**
 * 月度会员 ¥19.9 (期内不限次数解锁所有测试)
 * @param {object} [opts] - { months: 1 }
 * @returns {Promise<{ok:boolean, source:string, expireAt:number}>}
 */
function unlockByMembership(opts) {
  const months = (opts && opts.months) || 1
  return new Promise((resolve, reject) => {
    api.createMembershipOrder({ months, amount: PRICE.MEMBERSHIP_MONTHLY })
      .then((order) => {
        // TODO: 备案后此处接入 wx.requestPayment(order.data)
        return api.verifyMembershipCallback({ months, orderId: (order && order.data && order.data.orderId) || 'stub' })
      })
      .then(() => {
        const info = userMgr.markVipMember({ months })
        userMgr.markPaidOnce()
        resolve({ ok: true, source: 'membership', expireAt: info.expireAt })
      })
      .catch((err) => {
        const info = userMgr.markVipMember({ months })
        userMgr.markPaidOnce()
        resolve({ ok: true, source: 'local-fallback', expireAt: info.expireAt, err })
      })
  })
}

module.exports = {
  PRICE,
  isResultUnlocked,
  unlockByAd,
  unlockBySinglePay,
  unlockByMembership,
}
