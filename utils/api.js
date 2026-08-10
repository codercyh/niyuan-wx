/**
 * API 调用模块 - v3.1 (支持环境切换)
 *
 * 调用约定：
 *   - 后端响应 envelope: { code, message, data }
 *   - code === 0 视为成功，其他 code 走 reject
 *   - 网络失败、HTTP 非 2xx、业务 code 非 0、401 鉴权过期，全部 reject
 *   - 不再做"离线兜底"
 */

// 环境配置：切换到生产环境时改为 true
const IS_PRODUCTION = true

// API 基础地址配置
const API_BASE_URL = IS_PRODUCTION
  ? 'https://yuanfen.love'           // 正式：后端 API 地址
  : 'http://localhost:3000'          // 本地开发环境

const storage = require('./storage.js')

function getToken() {
  return storage.getStorage('accessToken') || ''
}

/**
 * 确保 token 已就绪：如果还没 token，最多等 3 秒让 bootstrap 完成。
 * 不无限等待，避免请求卡死。
 */
function ensureTokenReady() {
  if (getToken()) return Promise.resolve()
  // 轮询等待 token 出现（最多 3 秒）
  return new Promise((resolve) => {
    let elapsed = 0
    const interval = 200
    const timer = setInterval(() => {
      elapsed += interval
      if (getToken() || elapsed >= 3000) {
        clearInterval(timer)
        resolve()
      }
    }, interval)
  })
}

// 防止并发重复登录
let _refreshingToken = null
function refreshToken() {
  if (_refreshingToken) return _refreshingToken
  _refreshingToken = wxLogin()
    .finally(() => { _refreshingToken = null })
  return _refreshingToken
}

function request(method = 'GET', path = '', data = {}, requireAuth = false) {
  return ensureTokenReady().then(() => {
    return new Promise((resolve, reject) => {
      const header = {
        'Content-Type': 'application/json',
      }
      const token = getToken()
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      wx.request({
        url: `${API_BASE_URL}${path}`,
        method,
        data,
        header,
        success(res) {
          if (res.statusCode === 401) {
            // token 过期或无效：尝试静默刷新一次（重新 wx.login），刷新成功后重试原请求
            refreshToken()
              .then(() => {
                const newToken = getToken()
                if (newToken) {
                  // 重新发送原请求
                  wx.request({
                    url: `${API_BASE_URL}${path}`,
                    method,
                    data,
                    header: { ...header, 'Authorization': `Bearer ${newToken}` },
                    success(res2) {
                      if (res2.statusCode === 401) {
                        storage.removeStorage('accessToken')
                        storage.removeStorage('userInfo')
                        reject({ code: 401, message: '登录已过期，请重新登录' })
                        return
                      }
                      if (res2.statusCode < 200 || res2.statusCode >= 300) {
                        reject(res2.data || { code: res2.statusCode, message: `HTTP ${res2.statusCode}` })
                        return
                      }
                      const body2 = res2.data || {}
                      if (typeof body2.code === 'number' && body2.code !== 0) {
                        reject(body2)
                        return
                      }
                      resolve(body2)
                    },
                    fail(err2) {
                      reject({ code: -1, message: (err2 && err2.errMsg) || '网络请求失败', err: err2 })
                    },
                  })
                } else {
                  reject({ code: 401, message: '登录已过期，请重新登录' })
                }
              })
              .catch(() => {
                storage.removeStorage('accessToken')
                storage.removeStorage('userInfo')
                reject({ code: 401, message: '登录已过期，请重新登录' })
              })
            return
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(res.data || { code: res.statusCode, message: `HTTP ${res.statusCode}` })
            return
          }
          const body = res.data || {}
          // 后端 envelope { code, message, data }；code 非 0 视为业务错误
          if (typeof body.code === 'number' && body.code !== 0) {
            reject(body)
            return
          }
          resolve(body)
        },
        fail(err) {
          console.error('[API] request failed:', method, path, err)
          reject({ code: -1, message: (err && err.errMsg) || '网络请求失败', err })
        },
      })
    })
  })
}

// ==================== 认证 ====================

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          request('POST', '/auth/login', { code: res.code })
            .then((data) => {
              if (data.code === 0 && data.data) {
                storage.setStorage('accessToken', data.data.token)
                storage.setStorage('userInfo', data.data.userInfo)
                resolve(data.data)
              } else {
                reject(data)
              }
            })
            .catch(reject)
        } else {
          reject({ message: 'wx.login failed' })
        }
      },
      fail: reject,
    })
  })
}

function updateProfile(nickName, avatarUrl) {
  return request('POST', '/auth/update-profile', { nickName, avatarUrl })
}

// ==================== 用户 ====================

function getUserInfo() {
  return request('GET', '/users/profile')
}

function updateUserInfo(data) {
  return request('POST', '/users/profile', data)
}

function checkVipStatus() {
  return request('GET', '/users/vip-status')
}

// ==================== 解锁/支付 ====================

function verifyAdUnlock(payload) {
  return request('POST', '/unlock/ad-verify', payload)
}

function createVirtualOrder(payload) {
  // payload: { type: 'single'|'membership', testId?, code }
  // 返回 wx.requestVirtualPayment 所需参数（signData/paySig/signature/offerId/env/mode）
  return request('POST', '/pay/virtual/create', payload)
}

function confirmVirtualOrder(orderId, wxOrderId) {
  // 支付成功后服务端查单确认 + 履约（best-effort，不阻塞本地解锁）
  // wxOrderId: 微信侧订单号，用于准确查单
  const body = wxOrderId ? { wxOrderId } : {}
  return request('POST', `/pay/virtual/confirm/${orderId}`, body)
}

function getPaymentOrders(page = 1, limit = 10) {
  return request('GET', `/pay/orders?page=${page}&limit=${limit}`)
}

// ==================== 测试 ====================

function getTestList(page = 1, limit = 10, category) {
  let path = `/tests?page=${page}&limit=${limit}`
  if (category) path += `&category=${category}`
  return request('GET', path)
}

function getTestCategories() {
  return request('GET', '/tests/categories')
}

function getTestDetail(testId) {
  return request('GET', `/tests/${testId}`)
}

function submitTestAnswer(testId, answers) {
  return request('POST', `/tests/${testId}/submit`, { answers })
}

function getUserTestRecords(page = 1, limit = 10) {
  return request('GET', `/users/test-records?page=${page}&limit=${limit}`)
}

// ==================== 缘分分析 ====================

function analyzeNiyuan(myInfo, partnerInfo, relationType, tags, story) {
  return request('POST', '/niyuan/analyze', {
    myInfo,
    partnerInfo,
    relationType,
    tags,
    story,
  })
}

function getNiyuanRecord(recordId) {
  return request('GET', `/niyuan/record/${recordId}`)
}

function getNiyuanHistory(page = 1, limit = 10) {
  return request('GET', `/users/niyuan-records?page=${page}&limit=${limit}`)
}

function deleteTestRecord(recordId) {
  return request('DELETE', `/users/test-records/${recordId}`)
}

function deleteNiyuanRecord(recordId) {
  return request('DELETE', `/users/niyuan-records/${recordId}`)
}

// ==================== 消息 ====================

function getMessageList(page = 1, limit = 20, type) {
  let path = `/messages?page=${page}&limit=${limit}`
  if (type) path += `&type=${type}`
  return request('GET', path)
}

function markMessagesRead() {
  return request('POST', '/messages/read')
}

function markMessageRead(id) {
  return request('POST', `/messages/read/${id}`)
}

module.exports = {
  request,
  wxLogin,
  updateProfile,
  getUserInfo,
  updateUserInfo,
  getTestList,
  getTestCategories,
  getTestDetail,
  submitTestAnswer,
  getUserTestRecords,
  deleteTestRecord,
  analyzeNiyuan,
  getNiyuanRecord,
  getNiyuanHistory,
  deleteNiyuanRecord,
  checkVipStatus,
  verifyAdUnlock,
  createVirtualOrder,
  confirmVirtualOrder,
  getPaymentOrders,
  getMessageList,
  markMessagesRead,
  markMessageRead,
}