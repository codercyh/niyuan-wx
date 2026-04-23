// 用户偏好设置页面逻辑
const { getPreferences, setPreference, setNotificationTypeEnabled, setPrivacySetting, setMediaChange } = require('../../../utils/preferences.js');
const { getUserProfile } = require('../../../utils/user.js');
const { getStorage } = require('../../../utils/storage.js');

Page({
  data: {
    loading: false,

    // 偏好设置数据
    preferences: {
      theme: 'light',
      fontSize: 'normal',
      notifications: true,
      notificationType: {},
      privateProfile: false,
      allowSearch: true,
      allowRecommend: true,
      language: 'zh',
      autoPlayVideo: true,
      dataConsent: false,
    },

    // 下拉选择器选项
    themeOptions: [
      { text: '深色', value: 'dark' },
      { text: '浅色', value: 'light' },
    ],
    themeIndex: 0,

    fontSizeOptions: [
      { text: '小', value: 'small' },
      { text: '正常', value: 'normal' },
      { text: '大', value: 'large' },
    ],
    fontSizeIndex: 1,

    languageOptions: [
      { text: '中文', value: 'zh' },
      { text: 'English', value: 'en' },
    ],
    languageIndex: 0,

    // UI数据
    cacheSize: '加载中...',
    appVersion: 'v1.6-beta1',

    // 消息提示
    message: {
      show: false,
      text: '',
      type: 'success',
    },
  },

  onLoad() {
    this.loadPreferences();
    this.calculateCacheSize();
  },

  /**
   * 加载用户偏好设置
   */
  loadPreferences() {
    try {
      const prefs = getPreferences();

      // 查找索引
      const themeIndex = this.data.themeOptions.findIndex((t) => t.value === prefs.theme);
      const fontSizeIndex = this.data.fontSizeOptions.findIndex((f) => f.value === prefs.fontSize);
      const languageIndex = this.data.languageOptions.findIndex((l) => l.value === prefs.language);

      this.setData({
        preferences: prefs,
        themeIndex: themeIndex >= 0 ? themeIndex : 0,
        fontSizeIndex: fontSizeIndex >= 0 ? fontSizeIndex : 1,
        languageIndex: languageIndex >= 0 ? languageIndex : 0,
      });
    } catch (error) {
      console.error('加载偏好设置失败:', error);
      this.showMessage('加载设置失败', 'error');
    }
  },

  /**
   * 主题变更
   */
  onThemeChange(e) {
    const themeIndex = parseInt(e.detail.value);
    const theme = this.data.themeOptions[themeIndex].value;

    setPreference('theme', theme);

    this.setData({
      themeIndex,
      'preferences.theme': theme,
    });

    this.showMessage(`主题已切换为${this.data.themeOptions[themeIndex].text}`, 'success');
  },

  /**
   * 字号变更
   */
  onFontSizeChange(e) {
    const fontSizeIndex = parseInt(e.detail.value);
    const fontSize = this.data.fontSizeOptions[fontSizeIndex].value;

    setPreference('fontSize', fontSize);

    this.setData({
      fontSizeIndex,
      'preferences.fontSize': fontSize,
    });

    this.showMessage(`字号已切换为${this.data.fontSizeOptions[fontSizeIndex].text}`, 'success');
  },

  /**
   * 语言变更
   */
  onLanguageChange(e) {
    const languageIndex = parseInt(e.detail.value);
    const language = this.data.languageOptions[languageIndex].value;

    setPreference('language', language);

    this.setData({
      languageIndex,
      'preferences.language': language,
    });

    this.showMessage(`语言已切换为${this.data.languageOptions[languageIndex].text}`, 'success');
  },

  /**
   * 提醒总开关
   */
  onNotificationsToggle(e) {
    const enabled = e.detail.value;
    setPreference('notifications', enabled);

    this.setData({
      'preferences.notifications': enabled,
    });

    this.showMessage(enabled ? '已启用提醒' : '已关闭提醒', 'success');
  },

  /**
   * 提醒类型变更
   */
  onNotificationTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    const enabled = e.detail.value;

    setNotificationTypeEnabled(type, enabled);

    const prefs = getPreferences();
    this.setData({
      'preferences.notificationType': prefs.notificationType,
    });
  },

  /**
   * 显示设置变更
   */
  onPrivacyChange(e) {
    const setting = e.currentTarget.dataset.setting;
    const value = e.detail.value;

    setPrivacySetting(setting, value);

    this.setData({
      [`preferences.${setting}`]: value,
    });

    this.showMessage('显示设置已更新', 'success');
  },

  /**
   * 媒体设置变更
   */
  onMediaChange(e) {
    const setting = e.currentTarget.dataset.setting;
    const value = e.detail.value;

    setPreference(setting, value);

    this.setData({
      [`preferences.${setting}`]: value,
    });

    this.showMessage('媒体设置已更新', 'success');
  },

  /**
   * 数据设置变更
   */
  onDataChange(e) {
    const setting = e.currentTarget.dataset.setting;
    const value = e.detail.value;

    setPreference(setting, value);

    this.setData({
      [`preferences.${setting}`]: value,
    });

    const message = value ? '已同意数据分析' : '已拒绝数据分析';
    this.showMessage(message, 'success');
  },

  /**
   * 计算缓存大小
   */
  calculateCacheSize() {
    try {
      const fs = wx.getFileSystemManager();
      const docPath = wx.env.USER_DATA_PATH;

      // 模拟缓存大小计算（实际需要遍历目录）
      const info = fs.statSync(docPath);

      if (info) {
        const size = info.size || 0;
        let sizeText = '';

        if (size < 1024) {
          sizeText = `${size} B`;
        } else if (size < 1024 * 1024) {
          sizeText = `${(size / 1024).toFixed(2)} KB`;
        } else {
          sizeText = `${(size / (1024 * 1024)).toFixed(2)} MB`;
        }

        this.setData({ cacheSize: sizeText });
      }
    } catch (error) {
      console.error('计算缓存失败:', error);
      this.setData({ cacheSize: '计算中...' });
    }
  },

  /**
   * 清除缓存
   */
  handleClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '是否清除所有缓存数据？',
      confirmText: '清除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });

          // 模拟清除过程
          setTimeout(() => {
            this.setData({
              loading: false,
              cacheSize: '0 B',
            });

            this.showMessage('缓存已清除', 'success');
          }, 1000);
        }
      },
    });
  },

  /**
   * 整理数据
   */
  handleExportData() {
    wx.showModal({
      title: '整理数据',
      content: '将整理当前设备中的记录内容，是否继续？',
      confirmText: '整理',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });

          // 模拟整理过程
          setTimeout(() => {
            this.setData({ loading: false });

            this.showMessage('数据整理完成', 'success');
          }, 1500);
        }
      },
    });
  },

  /**
   * 检查更新
   */
  handleCheckUpdate() {
    this.setData({ loading: true });

    // 模拟检查更新
    setTimeout(() => {
      this.setData({ loading: false });

      wx.showModal({
        title: '版本检查',
        content: '您已是最新版本 (v1.6-beta1)',
        confirmText: '确定',
      });
    }, 1000);
  },

  /**
   * 打开隐私说明
   */
  handleOpenPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy',
    });
  },

  /**
   * 打开使用说明
   */
  handleOpenTerms() {
    wx.showModal({
      title: '使用说明',
      content: '当前版本主要提供兴趣内容浏览、趣味测试和本地记录保存功能。',
      confirmText: '知道了',
      showCancel: false,
    });
  },

  /**
   * 打开应用说明
   */
  handleOpenAbout() {
    wx.showModal({
      title: '应用说明',
      content: '兴趣与测试是一个个人兴趣类小程序，用于查看兴趣内容、体验测试并保存本地记录。',
      confirmText: '知道了',
      showCancel: false,
    });
  },

  /**
   * 退出使用
   */
  handleLogout() {
    wx.showModal({
      title: '退出使用',
      content: '确认要清除当前使用状态吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });

          // 清除当前状态信息
          setTimeout(() => {
            // 调用状态清理
            const auth = require('../../../utils/auth.js');
            auth.clearAuthentication?.();

            // 清除资料信息
            wx.removeStorageSync('userToken');
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('userProfile');

            this.setData({ loading: false });

            // 返回进入页
            wx.reLaunch({
              url: '/pages/auth/login/login',
            });
          }, 500);
        }
      },
    });
  },

  /**
   * 返回上一页
   */
  handleBack() {
    wx.navigateBack();
  },

  /**
   * 显示消息
   */
  showMessage(text, type = 'success') {
    this.setData({
      message: {
        show: true,
        text,
        type,
      },
    });

    // 2秒后自动隐藏
    setTimeout(() => {
      this.setData({
        message: { show: false, text: '', type: 'success' },
      });
    }, 2000);
  },
});
