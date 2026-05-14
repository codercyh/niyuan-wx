/**
 * 用户偏好设置工具库 (preferences.js)
 * 
 * 功能：
 * - 用户偏好管理（主题、通知、隐私）
 * - 偏好数据存储与同步
 * - 应用主题切换
 * 
 * v2.0版本：本地存储实现
 * v3.0版本：云端同步实现
 */

const storage = require('./storage.js');

/**
 * 默认偏好配置
 */
const DEFAULT_PREFERENCES = {
  theme: 'light',                    // 主题：dark/light
  fontSize: 'normal',               // 字号：small/normal/large
  notifications: true,               // 通知开启
  notificationType: {
    message: true,                   // 私聊通知
    comment: true,                   // 补充提醒
    like: true,                       // 标记提醒
    follow: true,                     // 记录提醒
    system: true,                     // 功能提醒
  },
  privateProfile: false,             // 私密档案
  allowSearch: true,                 // 允许搜索
  allowRecommend: true,              // 允许推荐
  language: 'zh',                    // 语言：zh/en
  autoPlayVideo: true,               // 自动播放视频
  dataConsent: false,                // 数据分析同意
};

/**
 * 初始化偏好设置
 * 
 * @param {object} customPreferences - 自定义偏好覆盖
 * @returns {object} 完整的偏好配置
 */
function initializePreferences(customPreferences = {}) {
  const preferences = {
    ...DEFAULT_PREFERENCES,
    ...customPreferences,
  };

  storage.setStorage('preferences', preferences);
  return preferences;
}

/**
 * 获取所有偏好设置
 * 
 * @returns {object} 偏好配置对象
 */
function getPreferences() {
  let preferences = storage.getStorage('preferences');

  if (!preferences) {
    preferences = initializePreferences();
  }

  return preferences;
}

/**
 * 更新单个偏好设置
 * 
 * @param {string} key - 偏好键名
 * @param {*} value - 偏好值
 * @returns {object} 更新后的偏好配置
 */
function setPreference(key, value) {
  const preferences = getPreferences();

  // 支持嵌套键名（如 'notificationTytype.message'）
  if (key.includes('.')) {
    const keys = key.split('.');
    let current = preferences;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  } else {
    preferences[key] = value;
  }

  storage.setStorage('preferences', preferences);
  return preferences;
}

/**
 * 获取单个偏好设置
 * 
 * @param {string} key - 偏好键名
 * @returns {*} 偏好值
 */
function getPreference(key) {
  const preferences = getPreferences();

  if (key.includes('.')) {
    const keys = key.split('.');
    let current = preferences;

    for (const k of keys) {
      current = current?.[k];
    }

    return current;
  }

  return preferences[key];
}

/**
 * 更新通知偏好
 * 
 * @param {object} notificationPrefs - 通知偏好对象
 * @returns {object} 更新后的配置
 */
function updateNotificationPreferences(notificationPrefs) {
  return setPreference('notificationType', {
    ...getPreference('notificationType'),
    ...notificationPrefs,
  });
}

/**
 * 获取通知偏好
 * 
 * @returns {object} 通知偏好配置
 */
function getNotificationPreferences() {
  return getPreference('notificationType') || DEFAULT_PREFERENCES.notificationType;
}

/**
 * 切换主题
 * 
 * @param {string} theme - 主题名称（dark/light）
 * @returns {boolean} 是否成功
 */
function switchTheme(theme) {
  if (!['dark', 'light'].includes(theme)) {
    console.warn('无效的主题名称:', theme);
    return false;
  }

  setPreference('theme', theme);

  // 应用主题（需要在页面中调用）
  applyTheme(theme);

  return true;
}

/**
 * 获取当前主题
 * 
 * @returns {string} 当前主题名称
 */
function getCurrentTheme() {
  return getPreference('theme') || 'dark';
}

/**
 * 应用主题到页面
 * 
 * @param {string} theme - 主题名称
 */
function applyTheme(theme) {
  // 获取当前页面
  const pages = getCurrentPages();
  if (pages.length === 0) return;

  const currentPage = pages[pages.length - 1];

  // 更新page的样式变量
  if (theme === 'light') {
    currentPage.setData({
      '--bg-dark': '#FFFFFF',
      '--bg-light': '#F5F5F5',
      '--text-primary': '#000000',
      '--text-secondary': '#666666',
      '--text-tertiary': '#999999',
    });
  } else {
    currentPage.setData({
      '--bg-dark': '#0A0A14',
      '--bg-light': '#1A1A2E',
      '--text-primary': '#FFFFFF',
      '--text-secondary': '#CCCCCC',
      '--text-tertiary': '#999999',
    });
  }
}

/**
 * 切换字号
 * 
 * @param {string} size - 字号（small/normal/large）
 * @returns {boolean} 是否成功
 */
function setFontSize(size) {
  if (!['small', 'normal', 'large'].includes(size)) {
    console.warn('无效的字号:', size);
    return false;
  }

  setPreference('fontSize', size);
  return true;
}

/**
 * 切换通知开关
 * 
 * @param {boolean} enabled - 是否启用通知
 * @returns {object} 更新后的配置
 */
function setNotificationsEnabled(enabled) {
  return setPreference('notifications', enabled);
}

/**
 * 切换特定类型的通知
 * 
 * @param {string} type - 通知类型（message/comment/like/follow/system）
 * @param {boolean} enabled - 是否启用
 * @returns {object} 更新后的配置
 */
function setNotificationTypeEnabled(type, enabled) {
  const validTypes = ['message', 'comment', 'like', 'follow', 'system'];

  if (!validTypes.includes(type)) {
    console.warn('无效的通知类型:', type);
    return null;
  }

  return setPreference(`notificationType.${type}`, enabled);
}

/**
 * 切换隐私设置
 * 
 * @param {string} setting - 隐私设置（privateProfile/allowSearch/allowRecommend）
 * @param {boolean} value - 设置值
 * @returns {object} 更新后的配置
 */
function setPrivacySetting(setting, value) {
  const validSettings = ['privateProfile', 'allowSearch', 'allowRecommend'];

  if (!validSettings.includes(setting)) {
    console.warn('无效的隐私设置:', setting);
    return null;
  }

  return setPreference(setting, value);
}

/**
 * 重置偏好设置为默认值
 * 
 * @returns {object} 默认的偏好配置
 */
function resetPreferences() {
  return initializePreferences();
}

/**
 * 导出偏好设置
 * 
 * @returns {string} JSON字符串
 */
function exportPreferences() {
  const preferences = getPreferences();
  return JSON.stringify(preferences, null, 2);
}

/**
 * 导入偏好设置
 * 
 * @param {string} jsonString - JSON字符串
 * @returns {object|null} 导入的偏好配置，或null如果失败
 */
function importPreferences(jsonString) {
  try {
    const preferences = JSON.parse(jsonString);

    // 验证基本结构
    if (typeof preferences !== 'object' || !preferences.theme) {
      throw new Error('无效的偏好配置格式');
    }

    storage.setStorage('preferences', preferences);
    return preferences;
  } catch (error) {
    console.error('导入偏好设置失败:', error);
    return null;
  }
}

module.exports = {
  DEFAULT_PREFERENCES,
  initializePreferences,
  getPreferences,
  setPreference,
  getPreference,
  updateNotificationPreferences,
  getNotificationPreferences,
  switchTheme,
  getCurrentTheme,
  applyTheme,
  setFontSize,
  setNotificationsEnabled,
  setNotificationTypeEnabled,
  setPrivacySetting,
  resetPreferences,
  exportPreferences,
  importPreferences,
};
