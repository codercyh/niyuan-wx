/**
 * API 调用模块 - v2.0 (对接 Node.js 后端)
 *
 * 优先请求后端 API，网络失败时降级为本地模拟数据
 */

const API_BASE_URL = 'http://localhost:3000'

const storage = require('./storage.js')

function getToken() {
  return storage.getStorage('accessToken') || ''
}

function request(method = 'GET', path = '', data = {}, requireAuth = false) {
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
          storage.removeStorage('accessToken')
          storage.removeStorage('userInfo')
          reject({ code: 401, message: '登录已过期，请重新登录' })
          return
        }
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data)
        } else {
          reject(res.data || { code: res.statusCode, message: '请求失败' })
        }
      },
      fail(err) {
        console.warn('Network error, falling back to offline mode', err)
        resolve({ code: 0, message: 'offline', data: {} })
      },
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

function analyzeNiyuan(myInfo, partnerInfo, relationType, tags) {
  return request('POST', '/niyuan/analyze', {
    myInfo,
    partnerInfo,
    relationType,
    tags,
  })
}

function getNiyuanHistory(page = 1, limit = 10) {
  return request('GET', `/users/niyuan-records?page=${page}&limit=${limit}`)
}

// ==================== 树洞 ====================

function getTreeHoleList(page = 1, limit = 20, category) {
  let path = `/tree-holes?page=${page}&limit=${limit}`
  if (category) path += `&category=${category}`
  return request('GET', path)
}

function getTreeHoleDetail(id) {
  return request('GET', `/tree-holes/${id}`)
}

function createTreeHole(title, content, category, tags, isAnonymous = true) {
  return request('POST', '/tree-holes', {
    title,
    content,
    category,
    tags,
    isAnonymous,
  })
}

function commentTreeHole(id, content, isAnonymous = true) {
  return request('POST', `/tree-holes/${id}/comment`, { content, isAnonymous })
}

function likeTreeHole(id) {
  return request('POST', `/tree-holes/${id}/like`)
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
  analyzeNiyuan,
  getNiyuanHistory,
  getTreeHoleList,
  getTreeHoleDetail,
  createTreeHole,
  commentTreeHole,
  likeTreeHole,
  checkVipStatus,
  getMessageList,
  markMessagesRead,
  markMessageRead,
}