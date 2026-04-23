/**
 * 性能监控系统 (performance-monitor.js)
 * 
 * 功能：
 * - 页面加载性能追踪
 * - API响应时间统计
 * - 内存占用监控
 * - 性能告警与优化建议
 * 
 * v2.0版本：本地性能监控
 * v3.0版本：上报到服务端分析服务
 */

const storage = require('./storage.js');

/**
 * 性能监控配置
 */
const PERFORMANCE_CONFIG = {
  enableMonitoring: true,
  recordLimit: 100,                   // 最多保留100条记录
  slowPageThreshold: 3000,            // 页面加载超过3秒为慢加载
  slowApiThreshold: 1000,             // API响应超过1秒为慢响应
  memoryWarningThreshold: 50 * 1024 * 1024, // 内存占用超过50MB警告
};

/**
 * 性能监控器
 */
class PerformanceMonitor {
  constructor() {
    this.pageMetrics = [];
    this.apiMetrics = [];
    this.memoryMetrics = [];
    this.pageStartTime = 0;
    this.warningCallbacks = [];
  }

  /**
   * 记录页面开始加载
   * 
   * @param {string} pageName - 页面名称
   * @returns {void}
   */
  recordPageStart(pageName) {
    this.pageStartTime = Date.now();

    console.log(`📄 页面开始加载: ${pageName}`);
  }

  /**
   * 记录页面加载完成
   * 
   * @param {string} pageName - 页面名称
   * @param {object} options - 选项
   * @returns {object} 页面性能指标
   */
  recordPageEnd(pageName, options = {}) {
    const duration = Date.now() - this.pageStartTime;

    const metric = {
      timestamp: Date.now(),
      pageName,
      duration,
      isSlow: duration > PERFORMANCE_CONFIG.slowPageThreshold,
      componentCount: options.componentCount || 0,
      imageCount: options.imageCount || 0,
      notes: options.notes || '',
    };

    this.pageMetrics.push(metric);

    // 限制记录数量
    if (this.pageMetrics.length > PERFORMANCE_CONFIG.recordLimit) {
      this.pageMetrics.shift();
    }

    const status = metric.isSlow ? '⚠️' : '✅';
    console.log(`${status} 页面加载完成: ${pageName} (${duration}ms)`);

    if (metric.isSlow) {
      this.checkAndWarn('slow_page_load', {
        pageName,
        duration,
        threshold: PERFORMANCE_CONFIG.slowPageThreshold,
      });
    }

    this.persistMetrics();

    return metric;
  }

  /**
   * 记录API调用开始
   * 
   * @param {string} apiName - API名称
   * @param {string} method - HTTP方法
   * @param {string} url - 请求URL
   * @returns {object} API记录对象
   */
  recordApiStart(apiName, method = 'GET', url = '') {
    const record = {
      id: `${apiName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      apiName,
      method,
      url,
      startTime: Date.now(),
    };

    // 临时存储
    if (!this._apiStartTimes) {
      this._apiStartTimes = {};
    }
    this._apiStartTimes[record.id] = record;

    console.log(`🔗 API调用开始: ${method} ${apiName}`);

    return record;
  }

  /**
   * 记录API调用完成
   * 
   * @param {object} apiRecord - API记录对象
   * @param {object} options - 选项
   * @returns {object} API性能指标
   */
  recordApiEnd(apiRecord, options = {}) {
    if (!apiRecord || !apiRecord.id || !this._apiStartTimes[apiRecord.id]) {
      console.warn('无效的API记录');
      return null;
    }

    const startRecord = this._apiStartTimes[apiRecord.id];
    const duration = Date.now() - startRecord.startTime;

    const metric = {
      timestamp: Date.now(),
      apiName: startRecord.apiName,
      method: startRecord.method,
      url: startRecord.url,
      duration,
      isSlow: duration > PERFORMANCE_CONFIG.slowApiThreshold,
      statusCode: options.statusCode || 0,
      responseSize: options.responseSize || 0,
      errorMessage: options.errorMessage || '',
    };

    this.apiMetrics.push(metric);

    // 限制记录数量
    if (this.apiMetrics.length > PERFORMANCE_CONFIG.recordLimit) {
      this.apiMetrics.shift();
    }

    const status = metric.isSlow ? '⚠️' : '✅';
    console.log(`${status} API调用完成: ${metric.apiName} (${duration}ms)`);

    if (metric.isSlow) {
      this.checkAndWarn('slow_api_response', {
        apiName: metric.apiName,
        duration,
        threshold: PERFORMANCE_CONFIG.slowApiThreshold,
      });
    }

    if (metric.errorMessage) {
      this.checkAndWarn('api_error', {
        apiName: metric.apiName,
        error: metric.errorMessage,
      });
    }

    delete this._apiStartTimes[apiRecord.id];
    this.persistMetrics();

    return metric;
  }

  /**
   * 监控内存占用
   * 
   * @returns {object} 内存指标
   */
  recordMemoryUsage() {
    try {
      const info = wx.getSystemInfoSync();
      const memoryUsage = info.memoryUsage || 0;

      const metric = {
        timestamp: Date.now(),
        memoryUsage,
        isWarning: memoryUsage > PERFORMANCE_CONFIG.memoryWarningThreshold,
      };

      this.memoryMetrics.push(metric);

      // 限制记录数量
      if (this.memoryMetrics.length > PERFORMANCE_CONFIG.recordLimit) {
        this.memoryMetrics.shift();
      }

      if (metric.isWarning) {
        console.warn(`⚠️ 内存占用过高: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        this.checkAndWarn('high_memory_usage', {
          memoryUsage: (memoryUsage / 1024 / 1024).toFixed(2),
          threshold: (PERFORMANCE_CONFIG.memoryWarningThreshold / 1024 / 1024).toFixed(2),
        });
      }

      this.persistMetrics();

      return metric;
    } catch (error) {
      console.error('获取内存信息失败:', error);
      return null;
    }
  }

  /**
   * 获取页面性能统计
   * 
   * @returns {object} 统计数据
   */
  getPageStats() {
    if (this.pageMetrics.length === 0) {
      return null;
    }

    const durations = this.pageMetrics.map((m) => m.duration);
    const slowCount = this.pageMetrics.filter((m) => m.isSlow).length;

    return {
      totalRecords: this.pageMetrics.length,
      avgDuration: (durations.reduce((a, b) => a + b) / durations.length).toFixed(2),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      slowCount,
      slowRate: `${((slowCount / this.pageMetrics.length) * 100).toFixed(2)}%`,
      recentPages: this.pageMetrics.slice(-5),
    };
  }

  /**
   * 获取API性能统计
   * 
   * @returns {object} 统计数据
   */
  getApiStats() {
    if (this.apiMetrics.length === 0) {
      return null;
    }

    const durations = this.apiMetrics.map((m) => m.duration);
    const slowCount = this.apiMetrics.filter((m) => m.isSlow).length;
    const errorCount = this.apiMetrics.filter((m) => m.errorMessage).length;

    return {
      totalRequests: this.apiMetrics.length,
      avgDuration: (durations.reduce((a, b) => a + b) / durations.length).toFixed(2),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      slowCount,
      slowRate: `${((slowCount / this.apiMetrics.length) * 100).toFixed(2)}%`,
      errorCount,
      errorRate: `${((errorCount / this.apiMetrics.length) * 100).toFixed(2)}%`,
      recentApis: this.apiMetrics.slice(-10),
    };
  }

  /**
   * 获取内存统计
   * 
   * @returns {object} 统计数据
   */
  getMemoryStats() {
    if (this.memoryMetrics.length === 0) {
      return null;
    }

    const usages = this.memoryMetrics.map((m) => m.memoryUsage / 1024 / 1024);
    const warningCount = this.memoryMetrics.filter((m) => m.isWarning).length;

    return {
      totalRecords: this.memoryMetrics.length,
      avgMemory: usages.reduce((a, b) => a + b / usages.length).toFixed(2),
      minMemory: Math.min(...usages).toFixed(2),
      maxMemory: Math.max(...usages).toFixed(2),
      warningCount,
      warningRate: `${((warningCount / this.memoryMetrics.length) * 100).toFixed(2)}%`,
      current: (usages[usages.length - 1] || 0).toFixed(2),
    };
  }

  /**
   * 获取综合性能报告
   * 
   * @returns {object} 性能报告
   */
  getPerformanceReport() {
    return {
      timestamp: Date.now(),
      pages: this.getPageStats(),
      apis: this.getApiStats(),
      memory: this.getMemoryStats(),
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * 生成优化建议
   * 
   * @private
   * @returns {array} 建议列表
   */
  generateRecommendations() {
    const recommendations = [];

    // 页面加载优化建议
    const pageStats = this.getPageStats();
    if (pageStats && pageStats.slowCount > pageStats.totalRecords * 0.3) {
      recommendations.push({
        type: 'page_performance',
        severity: 'high',
        message: `${pageStats.slowRate}的页面加载缓慢，建议优化渲染性能`,
        suggestion: '考虑使用虚拟列表、骨架屏等技术优化',
      });
    }

    // API性能优化建议
    const apiStats = this.getApiStats();
    if (apiStats && apiStats.slowRate > 0.2) {
      recommendations.push({
        type: 'api_performance',
        severity: 'medium',
        message: `${apiStats.slowRate}的API响应缓慢`,
        suggestion: '检查网络质量或服务端性能',
      });
    }

    if (apiStats && apiStats.errorRate > 0.05) {
      recommendations.push({
        type: 'api_errors',
        severity: 'high',
        message: `${apiStats.errorRate}的API请求失败`,
        suggestion: '检查API实现或添加重试机制',
      });
    }

    // 内存优化建议
    const memoryStats = this.getMemoryStats();
    if (memoryStats && memoryStats.warningRate > 0.1) {
      recommendations.push({
        type: 'memory_usage',
        severity: 'medium',
        message: `检测到多次内存占用过高`,
        suggestion: '检查内存泄漏，优化数据结构',
      });
    }

    return recommendations;
  }

  /**
   * 检查并触发警告
   * 
   * @private
   */
  checkAndWarn(warningType, warningData) {
    this.warningCallbacks.forEach((callback) => {
      try {
        callback({
          type: warningType,
          data: warningData,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('警告回调执行失败:', error);
      }
    });
  }

  /**
   * 订阅性能警告
   * 
   * @param {Function} callback - 回调函数
   */
  onWarning(callback) {
    if (typeof callback === 'function') {
      this.warningCallbacks.push(callback);
    }
  }

  /**
   * 清空所有指标
   * 
   * @returns {void}
   */
  clearAllMetrics() {
    this.pageMetrics = [];
    this.apiMetrics = [];
    this.memoryMetrics = [];
    storage.removeStorage('performanceMetrics');
    console.log('✅ 性能指标已清空');
  }

  /**
   * 持久化指标
   * 
   * @private
   */
  persistMetrics() {
    if (!PERFORMANCE_CONFIG.enableMonitoring) {
      return;
    }

    const metrics = {
      pageMetrics: this.pageMetrics,
      apiMetrics: this.apiMetrics,
      memoryMetrics: this.memoryMetrics,
    };

    storage.setStorage('performanceMetrics', metrics);
  }

  /**
   * 从存储加载指标
   * 
   * @private
   */
  loadMetrics() {
    const metrics = storage.getStorage('performanceMetrics') || {};
    this.pageMetrics = metrics.pageMetrics || [];
    this.apiMetrics = metrics.apiMetrics || [];
    this.memoryMetrics = metrics.memoryMetrics || [];
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  PerformanceMonitor,
  performanceMonitor,
  PERFORMANCE_CONFIG,
};
