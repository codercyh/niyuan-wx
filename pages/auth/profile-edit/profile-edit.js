const { getStorage, setStorage } = require('../../../utils/storage.js')
const api = require('../../../utils/api.js')

const CITY_MAP = {
  '北京': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区'],
  '上海': ['黄浦区', '静安区', '徐汇区', '长宁区', '浦东新区'],
  '广州': ['越秀区', '荔湾区', '海珠区', '天河区', '白云区'],
  '深圳': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区'],
  '杭州': ['上城区', '下城区', '江干区', '拱墅区', '西湖区'],
}

Page({
  data: {
    loading: false,
    saving: false,
    avatarUploading: false,
    avatarProgress: 0,
    formData: { nickName: '', birthDate: '', bio: '' },
    avatarUrl: '',
    genderIndex: 0,
    genderOptions: [
      { text: '保密', value: 0 },
      { text: '男', value: 1 },
      { text: '女', value: 2 },
    ],
    provinceIndex: 0,
    provinces: ['北京', '上海', '广州', '深圳', '杭州'],
    cityIndex: 0,
    cities: [],
    message: { show: false, text: '', type: 'success' },
    isModified: false,
    today: new Date().toISOString().split('T')[0],
  },

  onLoad() {
    this.loadUserProfile()
  },

  loadUserProfile() {
    let userInfo = getStorage('userInfo')
    if (typeof userInfo === 'string') {
      try { userInfo = JSON.parse(userInfo) } catch (e) { userInfo = null }
    }

    if (userInfo) {
      const genderIndex = this.data.genderOptions.findIndex(g => g.value === userInfo.gender)
      const provinceIndex = this.data.provinces.indexOf(userInfo.province)
      const cities = userInfo.province ? (CITY_MAP[userInfo.province] || []) : []
      const cityIndex = cities.indexOf(userInfo.city)
      this.setData({
        formData: {
          nickName: userInfo.nickName || '',
          birthDate: userInfo.birthDate || '',
          bio: userInfo.bio || '',
        },
        avatarUrl: userInfo.avatarUrl || '',
        genderIndex: genderIndex >= 0 ? genderIndex : 0,
        provinceIndex: provinceIndex >= 0 ? provinceIndex : 0,
        cities,
        cityIndex: cityIndex >= 0 ? cityIndex : 0,
      })
    }
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (!avatarUrl) return
    this.setData({ avatarUrl, isModified: true })
  },

  onNicknameChange(e) {
    this.setData({ formData: { ...this.data.formData, nickName: e.detail.value }, isModified: true })
  },

  onGenderChange(e) {
    this.setData({ genderIndex: parseInt(e.detail.value), isModified: true })
  },

  onBirthDateChange(e) {
    this.setData({ formData: { ...this.data.formData, birthDate: e.detail.value }, isModified: true })
  },

  onProvinceChange(e) {
    const province = this.data.provinces[parseInt(e.detail.value)]
    this.setData({
      provinceIndex: parseInt(e.detail.value),
      cities: CITY_MAP[province] || [],
      cityIndex: 0,
      isModified: true,
    })
  },

  onCityChange(e) {
    this.setData({ cityIndex: parseInt(e.detail.value), isModified: true })
  },

  onBioChange(e) {
    this.setData({ formData: { ...this.data.formData, bio: e.detail.value }, isModified: true })
  },

  handleSave() {
    if (!this.data.isModified) {
      this.showMessage('没有任何更改', 'error')
      return
    }
    if (!this.data.formData.nickName.trim()) {
      this.showMessage('昵称不能为空', 'error')
      return
    }

    this.setData({ saving: true })

    const updates = {
      nickName: this.data.formData.nickName,
      gender: this.data.genderOptions[this.data.genderIndex].value,
      birthDate: this.data.formData.birthDate,
      province: this.data.provinces[this.data.provinceIndex],
      city: this.data.cities[this.data.cityIndex] || '',
      avatarUrl: this.data.avatarUrl,
      bio: this.data.formData.bio,
    }

    let userInfo = getStorage('userInfo') || {}
    if (typeof userInfo === 'string') {
      try { userInfo = JSON.parse(userInfo) } catch (e) { userInfo = {} }
    }
    userInfo = { ...userInfo, ...updates }
    setStorage('userInfo', userInfo)

    // 持久化到后端:发送后端支持的全部字段(nickName/avatarUrl/gender/birthDate/bio)
    // province/city 仅本地保存(后端未开放这两个字段)
    const serverUpdates = {
      nickName: updates.nickName,
      avatarUrl: updates.avatarUrl,
      gender: updates.gender,
      birthDate: updates.birthDate,
      bio: updates.bio,
    }
    api.updateUserInfo(serverUpdates).catch(() => {})

    this.setData({ saving: false, isModified: false })
    this.showMessage('保存成功', 'success')
    setTimeout(() => wx.navigateBack(), 1500)
  },

  handleCancel() {
    if (this.data.isModified) {
      wx.showModal({
        title: '确认取消',
        content: '您有未保存的更改，确定要放弃吗？',
        confirmText: '放弃',
        cancelText: '继续编辑',
        success: (res) => { if (res.confirm) wx.navigateBack() },
      })
    } else {
      wx.navigateBack()
    }
  },

  showMessage(text, type) {
    this.setData({ message: { show: true, text, type } })
    setTimeout(() => this.setData({ message: { show: false, text: '', type: 'success' } }), 2000)
  },
})