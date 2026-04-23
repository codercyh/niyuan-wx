/**
 * 用户认证工具库 (auth.js)
 * 
 * 功能：
 * - Token生成与管理
 * - 用户认证与授权
 * - 会话管理
 * 
 * v2.0版本：基础实现（本地）
 * v3.0版本：集成WeChat Cloud Development
 */

function encodeBase64(str) {
  try {
    if (typeof btoa !== 'undefined') {
      return btoa(unescape(encodeURIComponent(str)));
    }
  } catch (error) {}

  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str).toString('base64');
    }
  } catch (error) {}

  return manualBase64Encode(str);
}

function decodeBase64(str) {
  try {
    if (typeof atob !== 'undefined') {
      return decodeURIComponent(escape(atob(str)));
    }
  } catch (error) {}

  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'base64').toString('utf-8');
    }
  } catch (error) {}

  return manualBase64Decode(str);
}

function manualBase64Encode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  while (i < str.length) {
    const a = str.charCodeAt(i++) || 0;
    const b = i < str.length ? str.charCodeAt(++i) : 0;
    const c = i < str.length ? str.charCodeAt(++i) : 0;

    const bitmap = (a << 16) | (b << 8) | c;

    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }

  return result;
}

function manualBase64Decode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  str = str.replace(/[^A-Za-z0-9+/=]/g, '');

  while (i < str.length) {
    const a = chars.indexOf(str.charAt(i++));
    const b = chars.indexOf(str.charAt(i++));
    const c = chars.indexOf(str.charAt(i++));
    const d = chars.indexOf(str.charAt(i++));

    const bitmap = (a << 18) | (b << 12) | ((c & 63) << 6) | (d & 63);

    result += String.fromCharCode((bitmap >> 16) & 255);
    if (c !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
    if (d !== 64) result += String.fromCharCode(bitmap & 255);
  }

  return result;
}

// 生成随机 nonce
function generateNonce() {
  return Math.random().toString(36).slice(2, 10);
}

// tokenData format: openId:timestamp:expirationTime:nonce:checksum
function generateToken(openId, expiresIn = 7 * 24 * 60 * 60) {
  const timestamp = Math.floor(Date.now() / 1000);
  const expirationTime = timestamp + expiresIn; // seconds
  const nonce = generateNonce();

  const tokenData = `${openId}:${timestamp}:${expirationTime}:${nonce}:${generateChecksum(openId, timestamp, nonce)}`;
  const token = encodeBase64(tokenData);

  return token;
}

// 验证Token有效性
function verifyToken(token) {
  try {
    if (!token) {
      return { valid: false, message: 'Token不存在' };
    }

    const tokenData = decodeBase64(token);
    const parts = tokenData.split(':');
    // accept both old (4 parts) and new (5 parts) formats for backward compatibility
    if (parts.length === 4) {
      // old format: openId:timestamp:expiration:checksum
      const [openId, timestampStr, expirationTimeStr, checksum] = parts;
      const timestamp = parseInt(timestampStr, 10);
      const expirationTime = parseInt(expirationTimeStr, 10);
      const currentTimeSec = Math.floor(Date.now() / 1000);

      if (isNaN(expirationTime) || isNaN(timestamp)) {
        return { valid: false, message: 'Token时间字段无效' };
      }

      if (expirationTime < currentTimeSec) {
        return { valid: false, message: 'Token已过期', expired: true };
      }

      if (checksum !== generateChecksum(openId, timestamp)) {
        return { valid: false, message: '校验失败' };
      }

      return { valid: true, openId: openId, expiresAt: expirationTime * 1000 };
    } else if (parts.length === 5) {
      // new format: openId:timestamp:expiration:nonce:checksum
      const [openId, timestampStr, expirationTimeStr, nonce, checksum] = parts;
      const timestamp = parseInt(timestampStr, 10);
      const expirationTime = parseInt(expirationTimeStr, 10);
      const currentTimeSec = Math.floor(Date.now() / 1000);

      if (isNaN(expirationTime) || isNaN(timestamp)) {
        return { valid: false, message: 'Token时间字段无效' };
      }

      if (expirationTime < currentTimeSec) {
        return { valid: false, message: 'Token已过期', expired: true };
      }

      if (checksum !== generateChecksum(openId, timestamp, nonce)) {
        return { valid: false, message: '校验失败' };
      }

      return { valid: true, openId: openId, expiresAt: expirationTime * 1000 };
    }

    return { valid: false, message: 'Token格式错误' };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}

function generateChecksum(openId, timestamp, nonce = '') {
  const str = `${openId}:${timestamp}:${nonce}:secret_key_v2`;
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & 0xffffffff; // 保持32位
  }

  return Math.abs(hash).toString(16);
}

// 刷新Token - 返回新的token字符串 或 null
function refreshToken(oldToken) {
  const verification = verifyToken(oldToken);

  if (!verification.valid) {
    return null;
  }

  // 生成新的token（nonce保证不同）
  const newToken = generateToken(verification.openId);
  // 如果意外与旧token相同（极小概率），再生成一次
  if (newToken === oldToken) {
    return generateToken(verification.openId);
  }
  return newToken;
}

// 获取Token剩余有效时间（毫秒）
function getTokenRemainingTime(token) {
  try {
    const tokenData = decodeBase64(token);
    const parts = tokenData.split(':');
    let expirationTimeStr = null;
    if (parts.length === 4) {
      expirationTimeStr = parts[2];
    } else if (parts.length === 5) {
      expirationTimeStr = parts[2];
    } else {
      return -1;
    }
    const expirationTime = parseInt(expirationTimeStr, 10); // seconds
    if (isNaN(expirationTime)) return -1;
    const remainingMs = expirationTime * 1000 - Date.now();
    return remainingMs > 0 ? remainingMs : -1;
  } catch (error) {
    return -1;
  }
}

function createAuthHeader(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function authenticatedRequest(method, url, data, token) {
  const verification = verifyToken(token);

  if (!verification.valid) {
    return Promise.reject({ message: 'Token无效，请重新登录', code: 401 });
  }

  const header = createAuthHeader(token);

  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          reject({ message: 'Token已过期，请重新登录', code: 401 });
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

function encryptUserData(data) {
  return encodeBase64(JSON.stringify(data));
}

function decryptUserData(encryptedData) {
  try {
    const decrypted = decodeBase64(encryptedData);
    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}

function checkAuthentication() {
  const storage = require('./storage.js');
  const token = storage.getStorage('userToken');

  if (!token) return { isAuthenticated: false };

  const verification = verifyToken(token);
  if (verification.valid) {
    return { isAuthenticated: true, openId: verification.openId };
  }

  return { isAuthenticated: false };
}

function clearAuthentication() {
  const storage = require('./storage.js');

  try {
    storage.removeStorage('userToken');
    storage.removeStorage('userInfo');
    storage.removeStorage('openId');
    return true;
  } catch (error) {
    console.error('清除认证信息失败:', error);
    return false;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  refreshToken,
  getTokenRemainingTime,
  createAuthHeader,
  authenticatedRequest,
  encryptUserData,
  decryptUserData,
  checkAuthentication,
  clearAuthentication,
};
