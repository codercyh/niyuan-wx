/**
 * Token刷新机制模块 (token-refresh.js)
 * 
 * 功能：
 * - 自动Token刷新
 * - 过期检测与提前刷新
 * - 刷新失败重试机制
 * - 刷新完成回调通知
 * 
 * v2.0版本：本地存储 + 定时检查
 * v3.0版本：服务端下发 + WebSocket实时更新
 */

const auth = require('./auth.js');
const storage = require('./storage.js');

/**
 * Token刷新配置
 */
const REFRESH_CONFIG = {
  checkInterval: 60 * 1000,           // 每60秒检查一次
  refreshThreshold: 24 * 60 * 60 * 1000, // Token有24小时以内时执行提前刷新
  retryAttempts: 3,                   // 刷新失败最多重试3次
  retryDelay: 2000,                   // 重试延迟2秒
};

/**
 * Token刷新管理器
 */
class TokenRefreshManager {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshCallbacks = [];
    this.refreshFailureCallbacks = [];
    this.lastRefreshTime = 0;
  }

  /**
   * 启动自动刷新检查
   * 
   * @returns {void}
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      console.warn('Token自动刷新已启动，跳过重复启动');
      return;
    }

    console.log('启动Token自动刷新机制');

    // 立即执行一次检查
    this.checkAndRefresh();

    // 定时检查
    this.refreshTimer = setInterval(() => {
      this.checkAndRefresh();
    }, REFRESH_CONFIG.checkInterval);
  }

  /**
   * 停止自动刷新
   * 
   * @returns {void}
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('已停止Token自动刷新');
    }
  }

  /**
   * 检查并刷新Token
   * 
   * @returns {Promise<boolean>} 是否成功刷新
   */
  async checkAndRefresh() {
    try {
      const token = storage.getStorage('userToken');

      if (!token) {
        console.log('Token不存在，无需刷新');
        return false;
      }

      const result = auth.verifyToken(token);

      if (!result.valid) {
        console.warn('Token已无效');
        this.notifyRefreshFailure('Token无效');
        return false;
      }

      // 计算剩余时间
      const remainingTime = result.expiresAt - Date.now();
      const remainingDays = remainingTime / (24 * 60 * 60 * 1000);

      console.log(`Token剩余有效期：${remainingDays.toFixed(2)}天`);

      // 如果剩余时间小于阈值，执行刷新
      if (remainingTime < REFRESH_CONFIG.refreshThreshold) {
        console.log('Token即将过期，执行提前刷新');
        return await this.refreshTokenWithRetry();
      }

      return false;
    } catch (error) {
      console.error('Token检查失败:', error);
      return false;
    }
  }

  /**
   * 使用重试机制刷新Token
   * 
   * @returns {Promise<boolean>} 是否成功
   */
  async refreshTokenWithRetry() {
    if (this.isRefreshing) {
      console.log('Token刷新已在进行中，等待完成');
      return new Promise((resolve) => {
        const checkRefresh = setInterval(() => {
          if (!this.isRefreshing) {
            clearInterval(checkRefresh);
            resolve(true);
          }
        }, 100);
      });
    }

    this.isRefreshing = true;

    for (let attempt = 1; attempt <= REFRESH_CONFIG.retryAttempts; attempt++) {
      try {
        console.log(`Token刷新尝试 ${attempt}/${REFRESH_CONFIG.retryAttempts}`);

        const oldToken = storage.getStorage('userToken');
        const newToken = auth.refreshToken(oldToken);

        if (!newToken) {
          throw new Error('Token刷新返回空值');
        }

        // 验证新Token
        const result = auth.verifyToken(newToken);

        if (!result.valid) {
          throw new Error('新Token验证失败');
        }

        // 保存新Token
        storage.setStorage('userToken', newToken);

        this.lastRefreshTime = Date.now();

        console.log(`✅ Token刷新成功（尝试${attempt}）`);
        this.notifyRefreshSuccess();

        this.isRefreshing = false;
        return true;
      } catch (error) {
        console.error(`Token刷新失败（尝试${attempt}）:`, error.message);

        // 最后一次重试失败
        if (attempt === REFRESH_CONFIG.retryAttempts) {
          console.error('Token刷新已达最大重试次数，刷新失败');
          this.notifyRefreshFailure(error.message);
          this.isRefreshing = false;
          return false;
        }

        // 延迟后重试
        await this.delay(REFRESH_CONFIG.retryDelay);
      }
    }

    this.isRefreshing = false;
    return false;
  }

  /**
   * 延迟函数
   * 
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 订阅刷新成功事件
   * 
   * @param {Function} callback - 回调函数
   * @returns {void}
   */
  onRefreshSuccess(callback) {
    if (typeof callback === 'function') {
      this.refreshCallbacks.push(callback);
    }
  }

  /**
   * 订阅刷新失败事件
   * 
   * @param {Function} callback - 回调函数
   * @returns {void}
   */
  onRefreshFailure(callback) {
    if (typeof callback === 'function') {
      this.refreshFailureCallbacks.push(callback);
    }
  }

  /**
   * 通知刷新成功
   * 
   * @private
   */
  notifyRefreshSuccess() {
    this.refreshCallbacks.forEach((callback) => {
      try {
        callback({
          success: true,
          timestamp: Date.now(),
          message: 'Token刷新成功',
        });
      } catch (error) {
        console.error('刷新成功回调执行失败:', error);
      }
    });
  }

  /**
   * 通知刷新失败
   * 
   * @param {string} message - 失败消息
   * @private
   */
  notifyRefreshFailure(message) {
    this.refreshFailureCallbacks.forEach((callback) => {
      try {
        callback({
          success: false,
          timestamp: Date.now(),
          message: `Token刷新失败: ${message}`,
        });
      } catch (error) {
        console.error('刷新失败回调执行失败:', error);
      }
    });
  }

  /**
   * 获取最后刷新时间
   * 
   * @returns {number} 时间戳
   */
  getLastRefreshTime() {
    return this.lastRefreshTime;
  }

  /**
   * 获取当前刷新状态
   * 
   * @returns {object} 状态信息
   */
  getRefreshStatus() {
    const token = storage.getStorage('userToken');
    const result = auth.verifyToken(token);

    return {
      isRefreshing: this.isRefreshing,
      tokenValid: result.valid,
      remainingTime: result.expiresAt - Date.now(),
      lastRefreshTime: this.lastRefreshTime,
      nextCheckTime: this.lastRefreshTime + REFRESH_CONFIG.checkInterval,
    };
  }

  /**
   * 强制立即刷新
   * 
   * @returns {Promise<boolean>} 是否成功
   */
  async forceRefresh() {
    console.log('执行强制Token刷新');
    return await this.refreshTokenWithRetry();
  }
}

// 创建全局实例
const tokenRefreshManager = new TokenRefreshManager();

module.exports = {
  TokenRefreshManager,
  tokenRefreshManager,
  REFRESH_CONFIG,
};
