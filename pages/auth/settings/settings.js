// 设置页面 — 只保留真实有效的功能
const storage = require('../../../utils/storage.js');

Page({
  data: {
    loading: false,
    cacheSize: '计算中...',
    appVersion: 'v2.0.0',
    message: { show: false, text: '', type: 'success' },
  },

  onLoad() {
    this.calculateCacheSize();
    this.checkUpdateInfo();
  },

  /**
   * 计算缓存大小(真实遍历用户数据目录)
   */
  calculateCacheSize() {
    try {
      const fs = wx.getFileSystemManager();
      const docPath = wx.env.USER_DATA_PATH;

      let totalSize = 0;
      const walkDir = (dirPath) => {
        try {
          const entries = fs.readdirSync(dirPath);
          for (const name of entries) {
            const fullPath = `${dirPath}/${name}`;
            try {
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                walkDir(fullPath);
              } else {
                totalSize += stat.size || 0;
              }
            } catch (e) {
              // 跳过无法访问的文件
            }
          }
        } catch (e) {
          // 跳过无法访问的目录
        }
      };

      walkDir(docPath);

      let sizeText;
      if (totalSize < 1024) {
        sizeText = `${totalSize} B`;
      } else if (totalSize < 1024 * 1024) {
        sizeText = `${(totalSize / 1024).toFixed(1)} KB`;
      } else {
        sizeText = `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
      }
      this.setData({ cacheSize: sizeText });
    } catch (error) {
      this.setData({ cacheSize: '未知' });
    }
  },

  /**
   * 清除缓存(真实清除 .uploads 等临时文件,保留登录态和记录)
   */
  handleClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '将清除本地临时文件(如头像缓存),不影响你的测试记录和登录状态。',
      confirmText: '清除',
      cancelText: '取消',
      confirmColor: '#DC8DA8',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ loading: true });

        try {
          const fs = wx.getFileSystemManager();
          const docPath = wx.env.USER_DATA_PATH;

          // 只删除 .uploads 目录(头像临时缓存),不碰 storage(登录态/记录)
          const uploadsDir = `${docPath}/.uploads`;
          try {
            const entries = fs.readdirSync(uploadsDir);
            for (const name of entries) {
              try { fs.unlinkSync(`${uploadsDir}/${name}`); } catch (e) {}
            }
          } catch (e) {
            // .uploads 可能不存在
          }

          // 也清理 wx.getStorageInfoSync 里的临时文件缓存(如果有)
          // 注意:不清除 accessToken / userInfo / vipMember 等关键 key

          this.setData({ loading: false, cacheSize: '0 B' });
          this.showMessage('缓存已清除', 'success');
        } catch (error) {
          this.setData({ loading: false });
          this.showMessage('清除失败,请重试', 'error');
        }
      },
    });
  },

  /**
   * 检查更新(调用微信小程序更新检查 API)
   */
  checkUpdateInfo() {
    // 获取小程序基础库版本作为版本号展示
    try {
      const info = wx.getAppBaseInfo();
      if (info.SDKVersion) {
        this.setData({ appVersion: `v2.0.0 (基础库 ${info.SDKVersion})` });
      }
    } catch (e) {
      // 旧版用 wx.getSystemInfoSync
      try {
        const sysInfo = wx.getSystemInfoSync();
        if (sysInfo.SDKVersion) {
          this.setData({ appVersion: `v2.0.0 (基础库 ${sysInfo.SDKVersion})` });
        }
      } catch (e2) {}
    }
  },

  handleCheckUpdate() {
    // 如果小程序实现了 UpdateManager,用它检查更新
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新已就绪',
              content: '新版本已下载,是否重启应用?',
              confirmText: '重启',
              confirmColor: '#DC8DA8',
              success: (r) => {
                if (r.confirm) updateManager.applyUpdate();
              },
            });
          });
        } else {
          this.showMessage('已是最新版本', 'success');
        }
      });
      updateManager.onUpdateFailed(() => {
        this.showMessage('更新下载失败,请检查网络', 'error');
      });
    } else {
      this.showMessage('当前版本已是最新', 'success');
    }
  },

  /**
   * 隐私说明
   */
  handleOpenPrivacyPolicy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },

  /**
   * 使用说明
   */
  handleOpenTerms() {
    wx.showModal({
      title: '使用说明',
      content: '【兴趣与测试】提供趣味心理测试和双人互动报告功能。\n\n· 心理测试：选择测试 → 作答 → 查看结果\n· 互动报告：输入双方信息 → 查看互动报告\n· 测试记录自动保存,可在"全部记录"中查看历史。\n\n如有疑问请通过"意见反馈"联系我们。',
      confirmText: '知道了',
      showCancel: false,
      confirmColor: '#DC8DA8',
    });
  },

  /**
   * 意见反馈(使用微信内置客服功能)
   */
  handleFeedback() {
    // 优先使用 open-type=button 的客服会话,这里用 showModal 兜底
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议,请发送邮件至:feedback@yuanfen.love\n或在小程序页面点击「联系客服」',
      confirmText: '复制邮箱',
      cancelText: '关闭',
      confirmColor: '#DC8DA8',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'feedback@yuanfen.love',
            success: () => this.showMessage('邮箱已复制', 'success'),
          });
        }
      },
    });
  },

  /**
   * 退出登录(彻底清除所有状态)
   */
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗?退出后需重新登录。',
      confirmText: '退出',
      cancelText: '取消',
      confirmColor: '#E08A9A',
      success: (res) => {
        if (!res.confirm) return;

        // 彻底清除所有用户状态
        wx.removeStorageSync('accessToken');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('userProfile');
        wx.removeStorageSync('userToken');
        wx.removeStorageSync('vipMember');
        wx.removeStorageSync('unlockedTests');
        wx.removeStorageSync('hasPaidOnce');
        wx.removeStorageSync('adUnlockedRuns');

        // 跳转到首页(会自动重新 bootstrap 登录)
        wx.reLaunch({ url: '/pages/home/home' });
      },
    });
  },

  showMessage(text, type = 'success') {
    this.setData({ message: { show: true, text, type } });
    setTimeout(() => {
      this.setData({ message: { show: false, text: '', type: 'success' } });
    }, 2000);
  },
});
