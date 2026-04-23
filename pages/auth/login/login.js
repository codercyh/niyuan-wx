// 进入页逻辑
// 注：直接使用 wx API + auth 工具库，避免 storage 的 require 路径问题

const authUtil = require('../../../utils/auth.js');

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    userId: '',
    loading: false,
    loadingText: '正在进入...',
  },

  onLoad() {
    // 页面加载时检查当前状态
    this.checkLoginStatus();
  },

  /**
   * 检查当前使用状态（使用wx原生API）
   */
  checkLoginStatus() {
    try {
      // 检查本地存储状态
      const tokenStr = wx.getStorageSync('userToken');
      const userInfoStr = wx.getStorageSync('userInfo');

      if (tokenStr && userInfoStr) {
        // 解析userInfo
        let userInfo = userInfoStr;
        if (typeof userInfoStr === 'string') {
          userInfo = JSON.parse(userInfoStr);
        }
        
        // 已保存状态
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo,
          userId: userInfo.openId || 'unknown',
        });
        console.log('✅ 检测到已保存状态');
      } else {
        // 未保存状态
        this.setData({
          isLoggedIn: false,
        });
        console.log('ℹ️ 当前未保存状态');
      }
    } catch (error) {
      console.error('❌ 检查当前状态失败:', error);
      this.setData({
        isLoggedIn: false,
      });
    }
  },

  /**
   * 处理进入流程（新版API）
   */
  handleLogin() {
    this.setData({ loading: true, loadingText: '正在进入...' });

    // 1. 获取进入流程 code
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          console.log('✅ 获取流程 code 成功:', loginRes.code);
          // 2. 获取资料展示信息
          this.getUserInfo(loginRes.code);
        } else {
          this.handleLoginError('进入失败，请稍后再试');
        }
      },
      fail: (err) => {
        console.error('❌ 进入流程失败:', err);
        this.handleLoginError('进入失败，请稍后再试');
      },
    });
  },

  /**
   * 获取资料展示信息（新版API）
   */
  getUserInfo(code) {
    wx.getUserInfo({
      desc: '用于补充头像和昵称展示',
      success: (res) => {
        console.log('✅ 获取资料展示信息成功:', res);
        const { userInfo, encryptedData, iv } = res;
        this.sendLoginRequest(code, userInfo, encryptedData, iv);
      },
      fail: (err) => {
        // 用户拒绝补充资料，但仍可继续使用默认状态
        console.warn('⚠️ 用户跳过资料补充:', err.errMsg);
        wx.showModal({
          title: '是否补充资料',
          content: '可补充头像和昵称，便于页面展示；跳过也可继续使用。',
          confirmText: '去补充',
          cancelText: '先跳过',
          success: (modalRes) => {
            if (modalRes.confirm) {
              // 用户点击去补充，重试
              this.getUserInfo(code);
            } else {
              // 用户选择跳过，继续默认状态
              this.sendLoginRequest(code, null, null, null);
            }
          },
        });
      },
    });
  },

  /**
   * 发送进入请求并保存当前状态（使用wx原生API）
   */
  sendLoginRequest(code, userInfo, encryptedData, iv) {
    // 模拟后端请求（v2.0时会替换为真实后端API）
    setTimeout(() => {
      const openId = 'openid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const token = authUtil.generateToken(openId);

      // 构建用户数据
      const userData = {
        openId: openId,
        nickName: userInfo?.nickName || '默认用户',
        avatarUrl: userInfo?.avatarUrl || '/assets/placeholder.png',
        gender: userInfo?.gender || 0,
        province: userInfo?.province || '未知',
        city: userInfo?.city || '未知',
        loginTime: Date.now(),
        lastLoginTime: Date.now(),
      };

      console.log('✅ 状态保存成功，当前数据:', userData);
      console.log('✅ Token生成:', token);

      // 保存用户信息和token（使用wx原生API）
      try {
        wx.setStorageSync('userToken', token);
        wx.setStorageSync('userInfo', JSON.stringify(userData));
        wx.setStorageSync('openId', openId);
        console.log('✅ 数据保存成功');
      } catch (error) {
        console.error('❌ 数据保存失败:', error);
      }

      this.setData({
        isLoggedIn: true,
        userInfo: userData,
        userId: openId,
        loading: false,
      });

      wx.showToast({
        title: '已进入',
        icon: 'success',
        duration: 1500,
      });

      console.log('📄 1.5秒后跳转到首页...');

      // 延迟后跳转到首页（使用switchTab因为首页是tabBar页面）
      setTimeout(() => {
        console.log('🚀 开始跳转到首页');
        wx.switchTab({
          url: '/pages/home/home',
          success: () => {
            console.log('✅ 页面跳转成功');
          },
          fail: (err) => {
            console.error('❌ 页面跳转失败:', err);
            wx.showToast({
              title: '页面跳转失败，请手动点击首页标签',
              icon: 'none',
            });
          },
        });
      }, 1500);
    }, 2000); // 模拟网络延迟
  },

  /**
   * 处理进入错误
   */
  handleLoginError(message) {
    this.setData({ loading: false });
    wx.showToast({
      title: message,
      icon: 'none',
    });
  },

  /**
   * 继续使用（已有状态）
   */
  handleContinue() {
    wx.switchTab({
      url: '/pages/home/home',
      success: () => {
        console.log('✅ 继续使用 - 打开首页成功');
      },
      fail: (err) => {
        console.error('❌ 继续使用 - 打开首页失败:', err);
        wx.showToast({
          title: '跳转失败，请手动点击首页标签',
          icon: 'none',
        });
      },
    });
  },

  /**
   * 清除当前状态（使用wx原生API）
   */
  handleLogout() {
    wx.showModal({
      title: '重新进入',
      content: '确定清除当前使用状态吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除当前状态数据（使用wx原生API）
          try {
            wx.removeStorageSync('userToken');
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('openId');
            console.log('✅ 已清除所有用户数据');
          } catch (error) {
            console.error('❌ 清除用户数据失败:', error);
          }

          this.setData({
            isLoggedIn: false,
            userInfo: {},
            userId: '',
          });

          wx.showToast({
            title: '当前状态已清除',
            icon: 'success',
          });
        }
      },
    });
  },
});
