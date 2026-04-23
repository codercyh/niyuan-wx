/**
 * 多设备会话管理模块 (session-manager.js)
 * 
 * 功能：
 * - 多设备登录跟踪
 * - 会话冲突检测
 * - 异常登录恢复
 * - 设备指纹识别
 * 
 * v2.0版本：本地会话管理
 * v3.0版本：服务端会话同步
 */

const storage = require('./storage.js');
const auth = require('./auth.js');

/**
 * 设备会话配置
 */
const SESSION_CONFIG = {
  maxConcurrentSessions: 3,           // 最多支持3个设备同时在线
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30天会话超时
  anomalyCheckInterval: 5 * 60 * 1000, // 每5分钟检查一次异常
};

/**
 * 多设备会话管理器
 */
class SessionManager {
  constructor() {
    this.sessions = [];
    this.anomalyCallbacks = [];
  }

  /**
   * 创建新会话
   * 
   * @param {object} sessionInfo - 会话信息
   * @returns {object} 完整的会话对象
   */
  createSession(sessionInfo = {}) {
    const deviceId = this.generateDeviceId();
    const sessionId = this.generateSessionId();

    const session = {
      sessionId,
      deviceId,
      deviceName: sessionInfo.deviceName || this.getDeviceName(),
      deviceModel: sessionInfo.deviceModel || this.getDeviceModel(),
      systemVersion: sessionInfo.systemVersion || this.getSystemVersion(),
      createdTime: Date.now(),
      lastActiveTime: Date.now(),
      ipAddress: sessionInfo.ipAddress || 'local',
      userAgent: sessionInfo.userAgent || '',
      isActive: true,
    };

    this.sessions.push(session);

    // 如果会话数超过限制，删除最旧的会话
    if (this.sessions.length > SESSION_CONFIG.maxConcurrentSessions) {
      const oldestSession = this.sessions.reduce((min, s) =>
        s.lastActiveTime < min.lastActiveTime ? s : min
      );
      this.removeSession(oldestSession.sessionId);
      console.log(`⚠️ 新设备登录，已登出最旧设备`);
    }

    // 持久化会话列表
    this.persistSessions();

    console.log(`✅ 创建新会话: ${session.deviceName}`);

    return session;
  }

  /**
   * 更新会话活跃时间
   * 
   * @param {string} sessionId - 会话ID
   * @returns {boolean} 是否更新成功
   */
  updateSessionActivity(sessionId) {
    const session = this.sessions.find((s) => s.sessionId === sessionId);

    if (!session) {
      console.warn(`会话不存在: ${sessionId}`);
      return false;
    }

    session.lastActiveTime = Date.now();
    this.persistSessions();

    return true;
  }

  /**
   * 移除会话
   * 
   * @param {string} sessionId - 会话ID
   * @returns {boolean} 是否移除成功
   */
  removeSession(sessionId) {
    const index = this.sessions.findIndex((s) => s.sessionId === sessionId);

    if (index === -1) {
      return false;
    }

    const removedSession = this.sessions[index];
    this.sessions.splice(index, 1);
    this.persistSessions();

    console.log(`已登出会话: ${removedSession.deviceName}`);

    return true;
  }

  /**
   * 在其他设备上登出
   * 
   * @param {string} currentSessionId - 当前会话ID
   * @returns {number} 登出的会话数
   */
  logoutOtherSessions(currentSessionId) {
    const otherSessions = this.sessions.filter(
      (s) => s.sessionId !== currentSessionId
    );

    otherSessions.forEach((session) => {
      this.removeSession(session.sessionId);
    });

    console.log(`✅ 已在其他${otherSessions.length}个设备上登出`);

    return otherSessions.length;
  }

  /**
   * 检测登录异常
   * 
   * @returns {object} 异常检测结果
   */
  detectAnomalies() {
    const anomalies = {
      detected: false,
      issues: [],
    };

    // 检查1：会话数是否超过限制
    if (this.sessions.length > SESSION_CONFIG.maxConcurrentSessions) {
      anomalies.detected = true;
      anomalies.issues.push({
        type: 'exceed_max_sessions',
        message: `活跃会话数(${this.sessions.length})超过限制(${SESSION_CONFIG.maxConcurrentSessions})`,
        severity: 'high',
      });
    }

    // 检查2：是否有过期会话
    const now = Date.now();
    const expiredSessions = this.sessions.filter(
      (s) => now - s.createdTime > SESSION_CONFIG.sessionTimeout
    );

    if (expiredSessions.length > 0) {
      anomalies.detected = true;
      anomalies.issues.push({
        type: 'expired_sessions',
        message: `检测到${expiredSessions.length}个过期会话`,
        severity: 'medium',
        sessions: expiredSessions.map((s) => s.deviceName),
      });

      // 自动清理过期会话
      expiredSessions.forEach((s) => this.removeSession(s.sessionId));
    }

    // 检查3：是否有超长未活跃的会话
    const inactiveSessions = this.sessions.filter((s) => {
      const inactiveTime = now - s.lastActiveTime;
      return inactiveTime > 7 * 24 * 60 * 60 * 1000; // 7天未活跃
    });

    if (inactiveSessions.length > 0) {
      anomalies.detected = true;
      anomalies.issues.push({
        type: 'long_inactive_sessions',
        message: `检测到${inactiveSessions.length}个超过7天未活跃的会话`,
        severity: 'low',
        sessions: inactiveSessions.map((s) => ({
          name: s.deviceName,
          inactiveHours: ((now - s.lastActiveTime) / (60 * 60 * 1000)).toFixed(1),
        })),
      });
    }

    // 检查4：最近是否有异常登录（短时间内多次登录）
    const recentLogins = this.sessions.filter(
      (s) => now - s.createdTime < 60 * 60 * 1000 // 1小时内
    );

    if (recentLogins.length > 3) {
      anomalies.detected = true;
      anomalies.issues.push({
        type: 'abnormal_frequent_login',
        message: `1小时内检测到${recentLogins.length}次登录，可能存在异常`,
        severity: 'high',
      });
    }

    if (anomalies.detected) {
      console.warn('⚠️ 检测到会话异常:', anomalies.issues);
      this.notifyAnomalies(anomalies);
    }

    return anomalies;
  }

  /**
   * 异常恢复 - 自动登出所有可疑会话
   * 
   * @returns {object} 恢复结果
   */
  recoverFromAnomalies() {
    const anomalies = this.detectAnomalies();

    if (!anomalies.detected) {
      return {
        success: true,
        message: '未检测到异常',
        actionsPerformed: 0,
      };
    }

    let actionsPerformed = 0;

    // 执行恢复操作
    anomalies.issues.forEach((issue) => {
      switch (issue.type) {
        case 'exceed_max_sessions':
          // 保留最活跃的N个会话，删除其他
          this.sessions.sort(
            (a, b) => b.lastActiveTime - a.lastActiveTime
          );
          while (this.sessions.length > SESSION_CONFIG.maxConcurrentSessions) {
            const removed = this.sessions.pop();
            console.log(`自动登出: ${removed.deviceName}`);
            actionsPerformed++;
          }
          break;

        case 'expired_sessions':
          issue.sessions.forEach((deviceName) => {
            const session = this.sessions.find((s) => s.deviceName === deviceName);
            if (session) {
              this.removeSession(session.sessionId);
              actionsPerformed++;
            }
          });
          break;

        case 'long_inactive_sessions':
          issue.sessions.forEach((sessionInfo) => {
            const session = this.sessions.find((s) => s.deviceName === sessionInfo.name);
            if (session) {
              this.removeSession(session.sessionId);
              actionsPerformed++;
            }
          });
          break;

        default:
          break;
      }
    });

    this.persistSessions();

    console.log(`✅ 异常恢复完成，执行了${actionsPerformed}项操作`);

    return {
      success: true,
      message: '异常恢复完成',
      actionsPerformed,
      remainingSessions: this.sessions.length,
    };
  }

  /**
   * 获取所有会话
   * 
   * @returns {array} 会话列表
   */
  getAllSessions() {
    return this.sessions.map((s) => ({
      ...s,
      inactiveMinutes: Math.floor((Date.now() - s.lastActiveTime) / 60000),
    }));
  }

  /**
   * 获取当前会话ID
   * 
   * @returns {string} 当前会话ID
   */
  getCurrentSessionId() {
    return storage.getStorage('currentSessionId') || '';
  }

  /**
   * 设置当前会话ID
   * 
   * @param {string} sessionId - 会话ID
   * @returns {boolean} 是否设置成功
   */
  setCurrentSessionId(sessionId) {
    const session = this.sessions.find((s) => s.sessionId === sessionId);

    if (!session) {
      return false;
    }

    storage.setStorage('currentSessionId', sessionId);
    this.updateSessionActivity(sessionId);

    return true;
  }

  /**
   * 生成设备ID
   * 
   * @private
   * @returns {string} 设备ID
   */
  generateDeviceId() {
    let deviceId = storage.getStorage('deviceId');

    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      storage.setStorage('deviceId', deviceId);
    }

    return deviceId;
  }

  /**
   * 生成会话ID
   * 
   * @private
   * @returns {string} 会话ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取设备名称
   * 
   * @private
   * @returns {string} 设备名称
   */
  getDeviceName() {
    try {
      const info = wx.getSystemInfoSync();
      return `${info.brand} ${info.model}` || '未知设备';
    } catch {
      return '未知设备';
    }
  }

  /**
   * 获取设备型号
   * 
   * @private
   * @returns {string} 设备型号
   */
  getDeviceModel() {
    try {
      const info = wx.getSystemInfoSync();
      return info.model || '未知';
    } catch {
      return '未知';
    }
  }

  /**
   * 获取系统版本
   * 
   * @private
   * @returns {string} 系统版本
   */
  getSystemVersion() {
    try {
      const info = wx.getSystemInfoSync();
      return info.system || '未知';
    } catch {
      return '未知';
    }
  }

  /**
   * 持久化会话列表
   * 
   * @private
   */
  persistSessions() {
    storage.setStorage('sessions', this.sessions);
  }

  /**
   * 从存储加载会话列表
   * 
   * @private
   */
  loadSessions() {
    const sessions = storage.getStorage('sessions') || [];
    this.sessions = sessions;
  }

  /**
   * 订阅异常检测事件
   * 
   * @param {Function} callback - 回调函数
   */
  onAnomalyDetected(callback) {
    if (typeof callback === 'function') {
      this.anomalyCallbacks.push(callback);
    }
  }

  /**
   * 通知异常
   * 
   * @private
   */
  notifyAnomalies(anomalies) {
    this.anomalyCallbacks.forEach((callback) => {
      try {
        callback(anomalies);
      } catch (error) {
        console.error('异常通知回调失败:', error);
      }
    });
  }

  /**
   * 初始化会话管理
   * 
   * @returns {void}
   */
  initialize() {
    this.loadSessions();
    console.log(`✅ 会话管理已初始化，当前活跃会话数: ${this.sessions.length}`);

    // 定期检查异常
    setInterval(() => {
      this.detectAnomalies();
    }, SESSION_CONFIG.anomalyCheckInterval);
  }
}

// 创建全局实例
const sessionManager = new SessionManager();

module.exports = {
  SessionManager,
  sessionManager,
  SESSION_CONFIG,
};
