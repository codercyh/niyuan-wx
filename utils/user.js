/**
* 用户管理工具库 (user.js)
* 
* 功能：
* - 用户档案管理
* - 用户偏好设置
* - 用户数据同步
* 
* v2.0版本：本地存储实现
* v3.0版本：云端同步实现
*/

const storage = require('./storage.js');

/**
* 用户档案数据结构
* @typedef {object} UserProfile
* @property {string} openId - 微信OpenId
* @property {string} nickName - 用户昵称
* @property {string} avatarUrl - 用户头像URL
* @property {number} gender - 性别 (0:未知, 1:男, 2:女)
* @property {string} province - 省份
* @property {string} city - 城市
* @property {string} birthDate - 出生日期 (YYYY-MM-DD)
* @property {number} joinTime - 加入时间戳
* @property {number} lastLoginTime - 最后登录时间戳
* @property {object} preferences - 用户偏好设置
*/

/**
* 创建新用户档案
* 
* @param {object} userInfo - 微信用户信息
* @returns {object} 完整的用户档案
*/
function createUserProfile(userInfo) {
const now = Date.now();
const profile = {
openId: userInfo.openId || `openid_${now}`,
nickName: userInfo.nickName || '微信用户',
avatarUrl: userInfo.avatarUrl || '',
gender: userInfo.gender || 0,
province: userInfo.province || '',
city: userInfo.city || '',
birthDate: userInfo.birthDate || '',
joinTime: now,
lastLoginTime: now + 1000,
preferences: {
theme: 'dark',
notifications: true,
privateProfile: false,
language: 'zh',
},
};

// 保存到本地存储
storage.setStorage('userProfile', profile);

return profile;
}

/**
* 获取当前用户档案
* 
* @returns {object|null} 用户档案或null
*/
function getUserProfile() {
const profile = storage.getStorage('userProfile');
return profile || null;
}

/**
* 更新用户档案
* 
* @param {string} openId - 用户OpenId
* @param {object} updates - 要更新的字段
* @returns {object} 更新后的用户档案
*/
function updateUserProfile(openId, updates) {
const profile = storage.getStorage('userProfile');

if (!profile || profile.openId !== openId) {
throw new Error('用户不存在或OpenId不匹配');
}

const updated = {
...profile,
...updates,
openId: profile.openId, // 不允许修改OpenId
joinTime: profile.joinTime, // 不允许修改加入时间
};

storage.setStorage('userProfile', updated);
return updated;
}

/**
* 更新用户头像
* 
* @param {string} openId - 用户OpenId
* @param {string} avatarUrl - 新头像URL
* @returns {boolean} 是否成功
*/
function updateUserAvatar(openId, avatarUrl) {
try {
updateUserProfile(openId, { avatarUrl });
return true;
} catch (error) {
console.error('更新头像失败:', error);
return false;
}
}

/**
* 更新用户偏好设置
* 
* @param {string} openId - 用户OpenId
* @param {object} preferences - 新的偏好设置
* @returns {object} 更新后的偏好设置
*/
function updatePreferences(openId, preferences) {
const profile = storage.getStorage('userProfile');

if (!profile || profile.openId !== openId) {
throw new Error('用户不存在');
}

const updated = {
...profile,
preferences: {
...(profile.preferences || {}),
...preferences,
},
};

storage.setStorage('userProfile', updated);
return updated.preferences;
}

/**
* 获取用户偏好设置
* 
* @returns {object} 用户偏好设置
*/
function getPreferences() {
const profile = storage.getStorage('userProfile');
return profile ? profile.preferences : {};
}

/**
* 获取用户基本信息
* 
* @returns {object} { openId, nickName, avatarUrl, gender, city }
*/
function getUserBasicInfo() {
const profile = storage.getStorage('userProfile');

if (!profile) {
return null;
}

return {
openId: profile.openId,
nickName: profile.nickName,
avatarUrl: profile.avatarUrl,
gender: profile.gender,
city: profile.city,
province: profile.province,
};
}

/**
* 更新最后登录时间
* 
* @returns {boolean} 是否成功
*/
function updateLastLoginTime() {
try {
const profile = storage.getStorage('userProfile');

if (profile) {
updateUserProfile(profile.openId, {
lastLoginTime: Date.now(),
});
}

return true;
} catch (error) {
console.error('更新登录时间失败:', error);
return false;
}
}

/**
* 获取用户注册天数
* 
* @returns {number} 天数
*/
function getUserDaysSinceJoin() {
const profile = storage.getStorage('userProfile');

if (!profile) {
return 0;
}

const daysDiff = Math.floor((Date.now() - profile.joinTime) / (24 * 60 * 60 * 1000));
return daysDiff + 1; // +1 包括注册当天
}

/**
* 检查用户是否已完整填充档案
* 
* @returns {object} { isComplete: boolean, missingFields: array }
*/
function checkProfileCompleteness() {
const profile = storage.getStorage('userProfile');

if (!profile) {
return {
isComplete: false,
missingFields: ['profile'],
};
}

const missingFields = [];

if (!profile.nickName) missingFields.push('nickName');
if (!profile.avatarUrl) missingFields.push('avatarUrl');
if (!profile.birthDate) missingFields.push('birthDate');
if (!profile.city) missingFields.push('city');

return {
isComplete: missingFields.length === 0,
missingFields: missingFields,
};
}

/**
* 删除用户档案（注销账号）
* 
* @param {string} openId - 用户OpenId
* @returns {boolean} 是否成功
*/
function deleteUserProfile(openId) {
const profile = storage.getStorage('userProfile');

if (!profile || profile.openId !== openId) {
throw new Error('用户不存在');
}

// 删除所有用户相关数据
storage.removeStorage('userProfile');
storage.removeStorage('userToken');
storage.removeStorage('userInfo');
storage.removeStorage('openId');

return true;
}

/**
* 导出用户数据
* 
* @returns {object} 所有用户相关数据
*/
function exportUserData() {
const profile = storage.getStorage('userProfile');
const testHistory = storage.getStorage('testHistory') || [];
const favoriteTests = storage.getStorage('favoriteTests') || [];
// interestCharts removed (zodiac features disabled for WeChat compliance)
const interestCharts = [];

return {
profile: profile,
testHistory: testHistory,
favoriteTests: favoriteTests,
interestCharts: interestCharts,
exportTime: new Date().toISOString(),
};
}

/**
* 是否曾经发生过单次付费（用于"已付费用户专属优惠"UI 触发）
*
* @returns {boolean}
*/
function hasPaidOnce() {
return !!storage.getStorage('hasPaidOnce');
}

/**
* 标记用户已发生过单次付费
*
* @returns {boolean} 操作是否成功
*/
function markPaidOnce() {
storage.setStorage('hasPaidOnce', true);
return true;
}

/**
* 是否为有效会员
*
* @returns {boolean}
*/
function isVipMember() {
const vip = storage.getStorage('vipMember');
if (!vip) return false;
// 兼容简单布尔标记
if (vip === true) return true;
// 兼容 { expireAt: timestamp } 结构
if (vip && typeof vip === 'object' && vip.expireAt) {
  return Date.now() < vip.expireAt;
}
return false;
}

/**
* 标记/激活会员
*
* @param {object} [opts] - { months: 1 }
* @returns {object} 会员信息
*/
function markVipMember(opts) {
const months = (opts && opts.months) || 1;
const info = { activatedAt: Date.now(), expireAt: Date.now() + months * 30 * 24 * 60 * 60 * 1000 };
storage.setStorage('vipMember', info);
return info;
}

/**
* 获取会员到期时间戳（毫秒）
* @returns {number} 到期时间戳，0 表示无会员
*/
function getMembershipExpiry() {
  const vip = storage.getStorage('vipMember');
  if (!vip || typeof vip !== 'object') return 0;
  return vip.expireAt || 0;
}

/**
* 获取已永久解锁的测试 ID 列表（B 方案：单次付费即永久解锁该测试）
* @returns {string[]}
*/
function getUnlockedTests() {
  const list = storage.getStorage('unlockedTests');
  return Array.isArray(list) ? list : [];
}

/**
* 该测试是否已永久解锁
* @param {string} testId
* @returns {boolean}
*/
function isTestUnlocked(testId) {
  if (!testId) return false;
  return getUnlockedTests().indexOf(String(testId)) >= 0;
}

/**
* 标记测试为已永久解锁（幂等）
* @param {string} testId
* @returns {string[]} 更新后的列表
*/
function markTestUnlocked(testId) {
  if (!testId) return getUnlockedTests();
  const id = String(testId);
  const list = getUnlockedTests();
  if (list.indexOf(id) < 0) list.push(id);
  storage.setStorage('unlockedTests', list);
  return list;
}

module.exports = {
createUserProfile,
getUserProfile,
updateUserProfile,
updateUserAvatar,
updatePreferences,
getPreferences,
getUserBasicInfo,
updateLastLoginTime,
getUserDaysSinceJoin,
checkProfileCompleteness,
deleteUserProfile,
exportUserData,
hasPaidOnce,
markPaidOnce,
isVipMember,
markVipMember,
getMembershipExpiry,
getUnlockedTests,
isTestUnlocked,
markTestUnlocked,
};
