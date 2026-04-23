// 档案完整度引导页逻辑
const { checkProfileCompleteness, getUserProfile } = require('../../../utils/user.js');

Page({
  data: {
    loading: false,
    isComplete: false,
    completionPercentage: 0,
    completionMessage: '补充更多信息以获得完整体验',
    missingFields: ['avatarUrl', 'nickName', 'birthDate', 'city'],
  },

  onLoad() {
    // 检查档案完整度
    this.checkProfileCompleteness();
  },

  /**
   * 检查档案完整度
   */
  checkProfileCompleteness() {
    const result = checkProfileCompleteness();
    const totalFields = 4; // avatarUrl, nickName, birthDate, city
    const completedFields = totalFields - result.missingFields.length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    // 根据完成度生成消息
    let message = '';
    if (percentage === 0) {
      message = '还没开始？点击下方开始完善档案吧';
    } else if (percentage < 50) {
      message = '继续加油，还差一点就完成了';
    } else if (percentage < 100) {
      message = '快完成了，再补充一点信息';
    } else {
      message = '档案已完整！';
    }

    this.setData({
      isComplete: result.isComplete,
      completionPercentage: percentage,
      completionMessage: message,
      missingFields: result.missingFields,
    });
  },

  /**
   * 编辑头像
   */
  handleEditAvatar() {
    wx.navigateTo({
      url: '/pages/auth/profile-edit/profile-edit',
    });
  },

  /**
   * 编辑档案
   */
  handleEditProfile() {
    wx.navigateTo({
      url: '/pages/auth/profile-edit/profile-edit',
    });
  },

  /**
   * 返回上一页
   */
  handleBack() {
    wx.navigateBack();
  },

  /**
   * 进入首页
   */
  handleGoHome() {
    wx.switchTab({
      url: '/pages/home/home',
    });
  },

  /**
   * 开始完善档案
   */
  handleStartCompleting() {
    wx.navigateTo({
      url: '/pages/auth/profile-edit/profile-edit',
    });
  },

  /**
   * 暂时跳过
   */
  handleSkip() {
    wx.showModal({
      title: '跳过完善？',
      content: '现在跳过可以随时返回完善档案',
      confirmText: '确定',
      cancelText: '继续',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/home/home',
          });
        }
      },
    });
  },

  /**
   * 页面显示时刷新数据
   */
  onShow() {
    // 每次显示时重新检查完整度
    this.checkProfileCompleteness();
  },
});
