const fateData = require('../../../data/fate-data')

Page({
  data: {
    result: null,
    selectedStyle: 'funny',
    posterStyles: [
      { key: 'funny', name: '搞怪风', emoji: '🎭' },
      { key: 'artistic', name: '文艺风', emoji: '✨' },
      { key: 'minimal', name: '极简风', emoji: '⬜' },
      { key: 'meme', name: '表情包', emoji: '😂' }
    ],
    canvasWidth: 375,
    canvasHeight: 600,
    posterImagePath: '',
    isGenerating: false,
  },

  onLoad(options) {
    const style = options.style || 'funny'
    const result = wx.getStorageSync('fate_latest_result')
    
    if (!result) {
      wx.showToast({ title: '请先进行测试', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    // 确保 result 数据完整
    this.validateResult(result)

    this.setData({
      result,
      selectedStyle: style
    })
  },

  // 验证并补充结果数据
  validateResult(result) {
    // 确保 zodiacA 和 zodiacB 有 emoji
    if (result.zodiacA && !result.zodiacA.emoji) {
      const zodiacInfo = fateData.ZODIAC_LIST.find(z => z.name === result.zodiacA.name)
      if (zodiacInfo) result.zodiacA = { ...result.zodiacA, ...zodiacInfo }
    }
    if (result.zodiacB && !result.zodiacB.emoji) {
      const zodiacInfo = fateData.ZODIAC_LIST.find(z => z.name === result.zodiacB.name)
      if (zodiacInfo) result.zodiacB = { ...result.zodiacB, ...zodiacInfo }
    }

    // 确保 fateType 完整
    if (result.fateType && !result.fateType.hashtags) {
      const fateTypeInfo = Object.values(fateData.FATE_TYPES).find(f => f.name === result.fateType.name)
      if (fateTypeInfo) result.fateType = { ...result.fateType, ...fateTypeInfo }
    }

    // 确保 level 完整
    if (result.level && !result.level.label) {
      const levelInfo = fateData.getScoreLevel(result.score)
      if (levelInfo) result.level = levelInfo
    }

    // 保存修正后的数据
    wx.setStorageSync('fate_latest_result', result)
  },

  // 选择风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style
    this.setData({ selectedStyle: style })
  },

  // 生成海报并保存到相册
  async generatePoster() {
    if (this.data.isGenerating) return
    
    this.setData({ isGenerating: true })
    wx.showLoading({ title: '生成中...', mask: true })

    try {
      const { selectedStyle, result, canvasWidth, canvasHeight } = this.data
      
      // 创建 Canvas 上下文
      const query = wx.createSelectorQuery()
      const { node: canvas } = await new Promise((resolve, reject) => {
        query.select('#posterCanvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res[0] && res[0].node) {
              resolve(res[0])
            } else {
              reject(new Error('Canvas 初始化失败'))
            }
          })
      })

      const ctx = canvas.getContext('2d')
      
      // 设置 Canvas 尺寸
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = canvasWidth * dpr
      canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)

      // 根据风格绘制
      switch (selectedStyle) {
        case 'funny':
          await this.drawFunnyPoster(ctx, result, canvasWidth, canvasHeight)
          break
        case 'artistic':
          await this.drawArtisticPoster(ctx, result, canvasWidth, canvasHeight)
          break
        case 'minimal':
          await this.drawMinimalPoster(ctx, result, canvasWidth, canvasHeight)
          break
        case 'meme':
          await this.drawMemePoster(ctx, result, canvasWidth, canvasHeight)
          break
      }

      // 导出图片
      const tempFilePath = await new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas: canvas,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: canvasWidth * dpr,
          destHeight: canvasHeight * dpr,
          fileType: 'png',
          quality: 1,
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        }, this)
      })

      this.setData({ posterImagePath: tempFilePath })

      // 保存到相册
      await new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: resolve,
          fail: (err) => {
            if (err.errMsg.includes('auth deny')) {
              wx.showModal({
                title: '需要授权',
                content: '请在设置中允许访问相册',
                success: (res) => {
                  if (res.confirm) wx.openSetting()
                }
              })
              reject(new Error('auth deny'))
            } else {
              reject(err)
            }
          }
        })
      })

      wx.hideLoading()
      wx.showToast({ title: '已保存到相册', icon: 'success' })

    } catch (error) {
      console.error('生成海报失败:', error)
      wx.hideLoading()
      if (error.message !== 'auth deny') {
        wx.showToast({ title: '生成失败，请重试', icon: 'none' })
      }
    } finally {
      this.setData({ isGenerating: false })
    }
  },

  // 绘制圆角矩形
  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.arcTo(x + width, y, x + width, y + radius, radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
    ctx.lineTo(x + radius, y + height)
    ctx.arcTo(x, y + height, x, y + height - radius, radius)
    ctx.lineTo(x, y + radius)
    ctx.arcTo(x, y, x + radius, y, radius)
    ctx.closePath()
  },

  // 搞怪风海报
  async drawFunnyPoster(ctx, result, w, h) {
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#0F0C29')
    gradient.addColorStop(0.5, '#302B63')
    gradient.addColorStop(1, '#24243E')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // 星星装饰
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    const stars = [[0.1,0.08],[0.85,0.12],[0.75,0.22],[0.2,0.32],[0.9,0.45],[0.15,0.58],[0.8,0.68],[0.3,0.78]]
    stars.forEach(([x,y]) => {
      ctx.beginPath()
      ctx.arc(w*x, h*y, 2, 0, 2*Math.PI)
      ctx.fill()
    })

    ctx.textAlign = 'center'

    // Emoji (大)
    ctx.font = '60px sans-serif'
    const emoji = result.fateType?.emoji || '✨'
    ctx.fillText(emoji, w/2, 100)

    // 缘分类型名称
    ctx.font = 'bold 28px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const fateName = result.fateType?.name || '命中注定'
    ctx.fillText(`「${fateName}」`, w/2, 150)

    // 等级
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    const levelText = `${result.level?.level || 'B'}级 · ${result.level?.label || '心心相印'}`
    ctx.fillText(levelText, w/2, 180)

    // 分数 (大字)
    ctx.font = 'bold 80px sans-serif'
    ctx.fillStyle = '#FF6B35'
    ctx.fillText(`${result.score || 75}`, w/2, 280)

    // 名字行
    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const nameA = result.personA?.name || 'A'
    const nameB = result.personB?.name || 'B'
    const zodiacEmojiA = result.zodiacA?.emoji || ''
    const zodiacEmojiB = result.zodiacB?.emoji || ''
    ctx.fillText(`${nameA} ${zodiacEmojiA} × ${nameB} ${zodiacEmojiB}`, w/2, 330)

    // 标语
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    const tagline = result.fateType?.tagline || '缘分天注定'
    ctx.fillText(`"${tagline}"`, w/2, 370)

    // Hashtags
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#00D9FF'
    const hashtags = result.fateType?.hashtags || ['#缘分测试', '#兴趣与测试']
    ctx.fillText(hashtags.slice(0, 2).join(' '), w/2, 410)

    // 底部品牌
    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText('—— 兴趣与测试 ——', w/2, h - 30)
  },

  // 文艺风海报
  async drawArtisticPoster(ctx, result, w, h) {
    // 深蓝渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    ctx.textAlign = 'center'

    // 诗句
    ctx.font = '18px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('所有的相遇', w/2, 80)
    ctx.fillText('都是久别重逢', w/2, 110)

    // 分割线
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w/2 - 80, 140)
    ctx.lineTo(w/2 + 80, 140)
    ctx.stroke()

    // 缘分类型
    ctx.font = 'bold 26px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const fateName = result.fateType?.name || '命中注定'
    ctx.fillText(`「${fateName}」`, w/2, 190)

    // 名字
    ctx.font = '20px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    const nameA = result.personA?.name || 'A'
    const nameB = result.personB?.name || 'B'
    ctx.fillText(`${nameA} × ${nameB}`, w/2, 240)

    // 分数
    ctx.font = 'bold 64px sans-serif'
    ctx.fillStyle = '#00D9FF'
    ctx.fillText(`${result.score || 75}`, w/2, 340)

    // 标语
    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    const tagline = result.fateType?.tagline || '缘分天注定'
    ctx.fillText(`"${tagline}"`, w/2, 390)

    // 底部品牌
    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('兴趣与测试', w/2, h - 30)
  },

  // 极简风海报
  async drawMinimalPoster(ctx, result, w, h) {
    // 纯黑背景
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, w, h)

    ctx.textAlign = 'center'

    // 名字
    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const nameA = result.personA?.name || 'A'
    const nameB = result.personB?.name || 'B'
    ctx.fillText(`${nameA} & ${nameB}`, w/2, h/2 - 100)

    // 缘分类型
    ctx.font = '18px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    const fateName = result.fateType?.name || '命中注定'
    ctx.fillText(`「${fateName}」`, w/2, h/2 - 50)

    // 分数 (超大)
    ctx.font = 'bold 96px sans-serif'
    ctx.fillStyle = '#FF6B35'
    ctx.fillText(`${result.score || 75}`, w/2, h/2 + 60)

    // 标语
    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    const tagline = result.fateType?.tagline || '缘分天注定'
    ctx.fillText(`"${tagline}"`, w/2, h/2 + 110)

    // 底部品牌
    ctx.font = '10px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillText('兴趣与测试', w/2, h - 25)
  },

  // 表情包风海报
  async drawMemePoster(ctx, result, w, h) {
    // 白色背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)

    ctx.textAlign = 'center'

    // 超大Emoji
    ctx.font = '100px sans-serif'
    const emoji = result.fateType?.emoji || '✨'
    ctx.fillText(emoji, w/2, 140)

    // 缘分类型
    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = '#000000'
    const fateName = result.fateType?.name || '命中注定'
    ctx.fillText(`「${fateName}」`, w/2, 200)

    // 分数
    ctx.font = 'bold 40px sans-serif'
    ctx.fillStyle = '#FF6B35'
    ctx.fillText(`${result.score || 75}分`, w/2, 280)

    // 名字
    ctx.font = '18px sans-serif'
    ctx.fillStyle = '#666666'
    const nameA = result.personA?.name || 'A'
    const nameB = result.personB?.name || 'B'
    ctx.fillText(`${nameA} × ${nameB}`, w/2, 330)

    // 标语
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#999999'
    const tagline = result.fateType?.tagline || '缘分天注定'
    ctx.fillText(`"${tagline}"`, w/2, 370)

    // 底部品牌
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#CCCCCC'
    ctx.fillText('兴趣与测试', w/2, h - 25)
  },

  // 分享给好友（保留微信原生分享功能注释）
  onShareAppMessage() {
    const { result } = this.data
    return {
      title: `我们的缘分是「${result.fateType?.name || '命中注定'}」！得分${result.score || 75}`,
      path: '/pages/fate/fate-input/fate-input',
      imageUrl: this.data.posterImagePath || ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { result } = this.data
    return {
      title: `我的缘分测试结果：「${result.fateType?.name || '命中注定'}」${result.score || 75}分`,
      query: '',
      imageUrl: this.data.posterImagePath || ''
    }
  }
})
