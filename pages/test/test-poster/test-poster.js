const testsData = require('../../../data/tests-data')

Page({
  data: {
    result: null,
    testName: '',
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
    const testId = options.testId
    const result = wx.getStorageSync('test_latest_result')
    
    if (!result) {
      wx.showToast({ title: '请先完成测试', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    // 获取测试名称
    let testName = '心理测试'
    if (testId) {
      const allTests = testsData.getAllTests ? testsData.getAllTests() : []
      const test = allTests.find(t => t.id === testId)
      if (test) testName = test.name
    }

    this.setData({
      result,
      testName,
      selectedStyle: style
    })
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
    gradient.addColorStop(0, '#FDF6F6')
    gradient.addColorStop(0.5, '#FFF8F0')
    gradient.addColorStop(1, '#F0F8F4')
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
    const emoji = result.emoji || '🎯'
    ctx.fillText(emoji, w/2, 100)

    // 测试结果类型
    ctx.font = 'bold 26px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const title = result.title || result.type || '测试完成'
    ctx.fillText(`${title}`, w/2, 150)

    // 分数 (大字)
    if (result.score !== undefined) {
      ctx.font = 'bold 72px sans-serif'
      ctx.fillStyle = '#E8A8BF'
      ctx.fillText(`${result.score}`, w/2, 250)
      
      ctx.font = '18px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText('分', w/2, 270)
    }

    // 测试名称
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText(this.data.testName, w/2, 320)

    // 描述（截取前50字）
    if (result.description) {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      const desc = result.description.length > 50 ? result.description.substring(0, 50) + '...' : result.description
      this.wrapText(ctx, desc, w/2, 360, w - 40, 22)
    }

    // 特质标签
    if (result.traits && Object.keys(result.traits).length > 0) {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#00D9FF'
      const traits = Object.keys(result.traits).slice(0, 3)
      ctx.fillText(traits.join(' · '), w/2, 420)
    }

    // 底部品牌
    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText('—— 兴趣与测试 ——', w/2, h - 30)
  },

  // 文艺风海报
  async drawArtisticPoster(ctx, result, w, h) {
    // 深蓝渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#F0F8F4')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    ctx.textAlign = 'center'

    // 诗句
    ctx.font = '18px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('认识自己', w/2, 80)
    ctx.fillText('是智慧的开端', w/2, 110)

    // 分割线
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w/2 - 80, 140)
    ctx.lineTo(w/2 + 80, 140)
    ctx.stroke()

    // 结果类型
    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const title = result.title || result.type || '测试完成'
    ctx.fillText(`「${title}」`, w/2, 190)

    // 测试名称
    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(this.data.testName, w/2, 230)

    // 分数
    if (result.score !== undefined) {
      ctx.font = 'bold 64px sans-serif'
      ctx.fillStyle = '#00D9FF'
      ctx.fillText(`${result.score}`, w/2, 330)
    }

    // 描述
    if (result.description) {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      const desc = result.description.length > 40 ? result.description.substring(0, 40) + '...' : result.description
      this.wrapText(ctx, desc, w/2, 380, w - 40, 22)
    }

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

    // 测试名称
    ctx.font = '18px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(this.data.testName, w/2, h/2 - 120)

    // 结果类型
    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const title = result.title || result.type || '测试完成'
    ctx.fillText(`「${title}」`, w/2, h/2 - 60)

    // 分数 (超大)
    if (result.score !== undefined) {
      ctx.font = 'bold 96px sans-serif'
      ctx.fillStyle = '#E8A8BF'
      ctx.fillText(`${result.score}`, w/2, h/2 + 50)
    }

    // 描述
    if (result.description) {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      const desc = result.description.length > 30 ? result.description.substring(0, 30) + '...' : result.description
      ctx.fillText(`"${desc}"`, w/2, h/2 + 100)
    }

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
    const emoji = result.emoji || '🎯'
    ctx.fillText(emoji, w/2, 140)

    // 结果类型
    ctx.font = 'bold 22px sans-serif'
    ctx.fillStyle = '#000000'
    const title = result.title || result.type || '测试完成'
    ctx.fillText(`「${title}」`, w/2, 200)

    // 分数
    if (result.score !== undefined) {
      ctx.font = 'bold 40px sans-serif'
      ctx.fillStyle = '#E8A8BF'
      ctx.fillText(`${result.score}分`, w/2, 280)
    }

    // 测试名称
    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText(this.data.testName, w/2, 330)

    // 描述
    if (result.description) {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999999'
      const desc = result.description.length > 35 ? result.description.substring(0, 35) + '...' : result.description
      this.wrapText(ctx, desc, w/2, 370, w - 40, 20)
    }

    // 底部品牌
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#CCCCCC'
    ctx.fillText('兴趣与测试', w/2, h - 25)
  },

  // 文字换行辅助
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('')
    let line = ''
    let currentY = y
    
    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY)
        line = chars[i]
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currentY)
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    const { result, testName } = this.data
    return {
      title: `我的${testName}结果是「${result?.title || result?.type || '神秘'}」！`,
      path: '/pages/home/home',
      imageUrl: this.data.posterImagePath || ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { result, testName } = this.data
    return {
      title: `我的${testName}结果：${result?.title || result?.type || '神秘'}，得分${result?.score || '??.??'}`,
      query: '',
      imageUrl: this.data.posterImagePath || ''
    }
  }
})