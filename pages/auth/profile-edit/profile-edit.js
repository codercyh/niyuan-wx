// 用户信息编辑页面逻辑
const { getStorage, setStorage } = require('../../../utils/storage.js');
const { getUserProfile, updateUserProfile } = require('../../../utils/user.js');
const { uploadAvatarFlow } = require('../../../utils/image.js');

// 城市数据映射
const CITY_MAP = {
  北京: ['东城区', '西城区', '朝阳区', '丰台区', '石景山区'],
  上海: ['黄浦区', '静安区', '徐汇区', '长宁区', '浦东新区'],
  广州: ['越秀区', '荔湾区', '海珠区', '天河区', '白云区'],
  深圳: ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区'],
  杭州: ['上城区', '下城区', '江干区', '拱墅区', '西湖区'],
};

Page({
  data: {
    loading: false,
    saving: false,
    avatarUploading: false,
    avatarProgress: 0,

    // 表单数据
    formData: {
      nickName: '',
      birthDate: '',
      bio: '',
    },

    // UI数据
    avatarUrl: '',
    genderIndex: 0,
    genderOptions: [
      { text: '保密', value: 0 },
      { text: '男', value: 1 },
      { text: '女', value: 2 },
    ],

    // 地址数据
    provinceIndex: 0,
    provinces: ['北京', '上海', '广州', '深圳', '杭州'],
    cityIndex: 0,
    cities: [],

    // 消息
    message: {
      show: false,
      text: '',
      type: 'success', // success | error
    },

    // 是否有更改
    isModified: false,
    today: new Date().toISOString().split('T')[0],
  },

  onLoad() {
    // 加载用户档案数据
    this.loadUserProfile();
  },

  /**
   * 加载用户档案
   */
  loadUserProfile() {
    const profile = getUserProfile();

    if (profile) {
      // 查找性别和地址的索引
      const genderIndex = this.data.genderOptions.findIndex(
        (g) => g.value === profile.gender
      );
      const provinceIndex = this.data.provinces.indexOf(profile.province);

      // 获取对应城市列表
      const cities = profile.province
        ? CITY_MAP[profile.province] || []
        : [];
      const cityIndex = cities.indexOf(profile.city);

      this.setData({
        formData: {
          nickName: profile.nickName || '',
          birthDate: profile.birthDate || '',
          bio: profile.bio || '',
        },
        avatarUrl: profile.avatarUrl || '',
        genderIndex: genderIndex >= 0 ? genderIndex : 0,
        provinceIndex: provinceIndex >= 0 ? provinceIndex : 0,
        cities: cities,
        cityIndex: cityIndex >= 0 ? cityIndex : 0,
      });
    }
  },

  /**
   * 选择头像
   */
  async handleChooseAvatar() {
    try {
      this.setData({ avatarUploading: true, avatarProgress: 0 });

      // 执行头像上传流程
      const result = await uploadAvatarFlow();

      if (result.success) {
        // 模拟上传进度
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress > 100) progress = 100;

          this.setData({ avatarProgress: Math.floor(progress) });

          if (progress >= 100) {
            clearInterval(interval);
            this.setData({
              avatarUrl: result.imagePath,
              avatarUploading: false,
              isModified: true,
            });

            this.showMessage('头像上传成功', 'success');
          }
        }, 100);
      } else {
        this.showMessage(result.message || '头像上传失败', 'error');
        this.setData({ avatarUploading: false });
      }
    } catch (error) {
      console.error('选择头像失败:', error);
      this.showMessage('选择头像失败', 'error');
      this.setData({ avatarUploading: false });
    }
  },

  /**
   * 昵称输入
   */
  onNicknameChange(e) {
    const nickName = e.detail.value;
    this.setData({
      formData: { ...this.data.formData, nickName },
      isModified: true,
    });
  },

  /**
   * 性别选择
   */
  onGenderChange(e) {
    const genderIndex = parseInt(e.detail.value);
    this.setData({
      genderIndex,
      isModified: true,
    });
  },

  /**
   * 出生日期选择
   */
  onBirthDateChange(e) {
    const birthDate = e.detail.value;
    this.setData({
      formData: { ...this.data.formData, birthDate },
      isModified: true,
    });
  },

  /**
   * 省份选择
   */
  onProvinceChange(e) {
    const provinceIndex = parseInt(e.detail.value);
    const province = this.data.provinces[provinceIndex];

    // 更新城市列表
    const cities = CITY_MAP[province] || [];

    this.setData({
      provinceIndex,
      cities,
      cityIndex: 0,
      isModified: true,
    });
  },

  /**
   * 城市选择
   */
  onCityChange(e) {
    const cityIndex = parseInt(e.detail.value);
    this.setData({
      cityIndex,
      isModified: true,
    });
  },

  /**
   * 个人简介输入
   */
  onBioChange(e) {
    const bio = e.detail.value;
    this.setData({
      formData: { ...this.data.formData, bio },
      isModified: true,
    });
  },

  /**
   * 保存更改
   */
  handleSave() {
    if (!this.data.isModified) {
      this.showMessage('没有任何更改', 'error');
      return;
    }

    // 验证数据
    if (!this.data.formData.nickName.trim()) {
      this.showMessage('昵称不能为空', 'error');
      return;
    }

    this.setData({ saving: true });

    // 模拟保存过程
    setTimeout(() => {
      try {
        const userInfo = getStorage('userInfo');
        const openId = userInfo?.openId || getStorage('openId');

        const updates = {
          nickName: this.data.formData.nickName,
          gender: this.data.genderOptions[this.data.genderIndex].value,
          birthDate: this.data.formData.birthDate,
          province: this.data.provinces[this.data.provinceIndex],
          city: this.data.cities[this.data.cityIndex],
          avatarUrl: this.data.avatarUrl,
          bio: this.data.formData.bio,
        };

        // 更新用户档案
        updateUserProfile(openId, updates);

        // 更新userInfo存储
        setStorage('userInfo', {
          ...userInfo,
          ...updates,
        });

        this.setData({
          saving: false,
          isModified: false,
        });

        this.showMessage('保存成功', 'success');

        // 2秒后返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } catch (error) {
        console.error('保存失败:', error);
        this.showMessage('保存失败，请重试', 'error');
        this.setData({ saving: false });
      }
    }, 1000);
  },

  /**
   * 取消编辑
   */
  handleCancel() {
    if (this.data.isModified) {
      wx.showModal({
        title: '确认取消',
        content: '您有未保存的更改，确定要放弃吗？',
        confirmText: '放弃',
        cancelText: '继续编辑',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        },
      });
    } else {
      wx.navigateBack();
    }
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
