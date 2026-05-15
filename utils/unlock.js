/**
 * 解锁/付费 编排模块 (unlock.js)
 *
 * 三种解锁路径：
 *   1) 看广告免费解锁 (单次 runId)
 *   2) 单次付费 ¥9.9 (按 testId 永久解锁该测试)
 *   3) 月度会员 ¥19.9 (期内不限次数所有测试解锁)
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

// 支付模式：'production' 使用真实支付，'dev' 使用本地兜底
const PAY_MODE = 'production'

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
 * 调用微信支付
 * @param {object} payParams - wx.requestPayment 所需参数
 * @returns {Promise<void>}
 */
function _wxRequestPayment(payParams) {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType,
      paySign: payParams.paySign,
      success: () => resolve(),
      fail: (err) => {
        if (err.errMsg.includes('cancel')) {
          reject(new Error('用户取消支付'))
        } else {
          reject(new Error(err.errMsg || '支付失败'))
        }
      },
    })
  })
}

/**
 * 单次付费 ¥9.9 永久解锁该测试
 * @param {string} testId
 * @returns {Promise<{ok:boolean, source:string, orderId?:string}>}
 */
function unlockBySinglePay(testId) {
  return new Promise((resolve, reject) => {
    if (!testId) {
      reject(new Error('testId 不能为空'))
      return
    }

    api.createSinglePayOrder({ testId, amount: PRICE.SINGLE })
      .then((orderRes) => {
        const orderData = orderRes.data

        // 如果已解锁，直接返回成功
        if (orderData.alreadyUnlocked) {
          resolve({ ok: true, source: 'already-unlocked' })
          return
        }

        // 开发模式：跳过支付，直接本地解锁
        if (PAY_MODE === 'dev') {
          userMgr.markTestUnlocked(testId)
          userMgr.markPaidOnce()
          resolve({ ok: true, source: 'local-fallback' })
          return
        }

        // 生产模式：调用微信支付
        return _wxRequestPayment(orderData.payParams)
          .then(() => api.verifyPayment(orderData.orderId))
          .then(() => {
            userMgr.markTestUnlocked(testId)
            userMgr.markPaidOnce()
            resolve({ ok: true, source: 'single-pay', orderId: orderData.orderId })
          })
      })
      .catch((err) => {
        // 支付失败或用户取消，不本地解锁
        if (err.message.includes('取消支付')) {
          reject(err)
        } else {
          // 网络错误等服务端问题时，本地兜底（仅限开发调试）
          if (PAY_MODE === 'dev') {
            userMgr.markTestUnlocked(testId)
            userMgr.markPaidOnce()
            resolve({ ok: true, source: 'local-fallback', err })
          } else {
            reject(err)
          }
        }
      })
  })
}

/**
 * 月度会员 ¥19.9 (期内不限次数解锁所有测试)
 * @param {object} [opts] - { months: 1 }
 * @returns {Promise<{ok:boolean, source:string, expireAt?:number, orderId?:string}>}
 */
function unlockByMembership(opts) {
  const months = (opts && opts.months) || 1
  return new Promise((resolve, reject) => {
    api.createMembershipOrder({ months })
      .then((orderRes) => {
        const orderData = orderRes.data

        // 如果已是会员，直接返回成功
        if (orderData.alreadyVip) {
          const info = userMgr.markVipMember({ months })
          resolve({ ok: true, source: 'already-vip', expireAt: info.expireAt })
          return
        }

        // 开发模式：跳过支付，直接本地解锁
        if (PAY_MODE === 'dev') {
          const info = userMgr.markVipMember({ months })
          userMgr.markPaidOnce()
          resolve({ ok: true, source: 'local-fallback', expireAt: info.expireAt })
          return
        }

        // 生产模式：调用微信支付
        return _wxRequestPayment(orderData.payParams)
          .then(() => api.verifyPayment(orderData.orderId))
          .then(() => {
            const info = userMgr.markVipMember({ months })
            userMgr.markPaidOnce()
            resolve({ ok: true, source: 'membership', expireAt: info.expireAt, orderId: orderData.orderId })
          })
      })
      .catch((err) => {
        // 支付失败或用户取消，不本地解锁
        if (err.message.includes('取消支付')) {
          reject(err)
        } else {
          // 网络错误等服务端问题时，本地兜底（仅限开发调试）
          if (PAY_MODE === 'dev') {
            const info = userMgr.markVipMember({ months })
            userMgr.markPaidOnce()
            resolve({ ok: true, source: 'local-fallback', expireAt: info.expireAt, err })
          } else {
            reject(err)
          }
        }
      })
  })
}

module.exports = {
  PRICE,
  PAY_MODE,
  isResultUnlocked,
  unlockByAd,
  unlockBySinglePay,
  unlockByMembership,
}
