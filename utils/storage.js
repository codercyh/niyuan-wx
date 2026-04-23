// utils/storage.js
// Compatibility wrapper: if running inside WeChat (wx exists) use native wx storage implementation
// Otherwise (Node test environment) delegate to project root storage shim which persists to .storage.json

if (typeof wx === 'undefined') {
  // Running under Node.js for tests — delegate to root shim
  module.exports = require('../storage.js');
} else {
  /**
   * 数据存储工具库 (storage.js) - WeChat 环境实现
   */

  /**
   * 设置存储数据
   */
  function setStorage(key, value) {
    try {
      if (!key) {
        console.error('❌ setStorage: key不能为空');
        return false;
      }

      let data = value;
      if (typeof value === 'object') {
        data = JSON.stringify(value);
      }

      wx.setStorageSync(key, data);
      console.log(`✅ setStorage: ${key} = ${typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : value}`);
      return true;
    } catch (error) {
      console.error(`❌ setStorage 失败: ${key}`, error);
      return false;
    }
  }

  function getStorage(key, defaultValue = null) {
    try {
      if (!key) {
        console.error('❌ getStorage: key不能为空');
        return defaultValue;
      }

      const value = wx.getStorageSync(key);
      if (value === undefined || value === '') {
        console.log(`⚠️ getStorage: ${key} 不存在，返回默认值`);
        return defaultValue;
      }

      try {
        const parsed = JSON.parse(value);
        console.log(`✅ getStorage: ${key} (JSON)`);
        return parsed;
      } catch (e) {
        console.log(`✅ getStorage: ${key} (String)`);
        return value;
      }
    } catch (error) {
      console.error(`❌ getStorage 失败: ${key}`, error);
      return defaultValue;
    }
  }

  function removeStorage(key) {
    try {
      if (!key) {
        console.error('❌ removeStorage: key不能为空');
        return false;
      }

      wx.removeStorageSync(key);
      console.log(`✅ removeStorage: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ removeStorage 失败: ${key}`, error);
      return false;
    }
  }

  function clearStorage() {
    try {
      wx.clearStorageSync();
      console.log('✅ clearStorage: 已清空所有存储');
      return true;
    } catch (error) {
      console.error('❌ clearStorage 失败', error);
      return false;
    }
  }

  function getAllKeys() {
    try {
      const info = wx.getStorageInfoSync();
      const keys = info.keys || [];
      console.log(`✅ getAllKeys: 共${keys.length}个键`);
      return keys;
    } catch (error) {
      console.error('❌ getAllKeys 失败', error);
      return [];
    }
  }

  function getStorageInfo() {
    try {
      const info = wx.getStorageInfoSync();
      return {
        currentSize: info.currentSize || 0,
        limitSize: info.limitSize || 0,
        keys: info.keys || [],
        keyCount: (info.keys || []).length,
      };
    } catch (error) {
      console.error('❌ getStorageInfo 失败', error);
      return { currentSize: 0, limitSize: 0, keys: [], keyCount: 0 };
    }
  }

  function hasKey(key) {
    try {
      if (!key) return false;
      const value = wx.getStorageSync(key);
      return value !== undefined && value !== '';
    } catch (error) {
      console.error(`❌ hasKey 失败: ${key}`, error);
      return false;
    }
  }

  function getMultipleStorage(keys) {
    try {
      if (!Array.isArray(keys)) {
        console.error('❌ getMultipleStorage: keys必须是数组');
        return {};
      }
      const result = {};
      keys.forEach((key) => {
        result[key] = getStorage(key);
      });
      console.log(`✅ getMultipleStorage: 获取${keys.length}个键`);
      return result;
    } catch (error) {
      console.error('❌ getMultipleStorage 失败', error);
      return {};
    }
  }

  function setMultipleStorage(data) {
    try {
      if (typeof data !== 'object') {
        console.error('❌ setMultipleStorage: data必须是对象');
        return false;
      }
      let successCount = 0;
      Object.keys(data).forEach((key) => {
        if (setStorage(key, data[key])) successCount++;
      });
      console.log(`✅ setMultipleStorage: 成功设置${successCount}/${Object.keys(data).length}个键`);
      return successCount === Object.keys(data).length;
    } catch (error) {
      console.error('❌ setMultipleStorage 失败', error);
      return false;
    }
  }

  function debugStorage() {
    try {
      const keys = getAllKeys();
      const result = {};
      keys.forEach((key) => {
        result[key] = getStorage(key);
      });
      console.log('🔍 Storage Debug Info:', result);
      return result;
    } catch (error) {
      console.error('❌ debugStorage 失败', error);
      return {};
    }
  }

  function appendToList(key, item, maxCount = 100) {
    try {
      let list = getStorage(key, []);
      if (!Array.isArray(list)) list = [];
      list.unshift(item);
      if (list.length > maxCount) list = list.slice(0, maxCount);
      return setStorage(key, list);
    } catch (error) {
      console.error(`❌ appendToList 失败: ${key}`, error);
      return false;
    }
  }

  function addToList(key, item, maxCount = 100) {
    return appendToList(key, item, maxCount);
  }

  module.exports = {
    setStorage,
    getStorage,
    removeStorage,
    clearStorage,
    getAllKeys,
    getStorageInfo,
    hasKey,
    getMultipleStorage,
    setMultipleStorage,
    debugStorage,
    appendToList,
    addToList,
  };
}
