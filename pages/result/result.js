Page({
  data: {
    data: null,
    result: null,
    riskLabel: '',
    riskColor: '',
  },

  onLoad() {
    const stored = wx.getStorageSync('niyuan_data')
    if (!stored) {
      wx.navigateBack()
      return
    }
    const result = this.calcNiyuan(stored)
    const riskLabel = result.niyuanIndex >= 70 ? '较多提示' : result.niyuanIndex >= 40 ? '适中' : '较少提示'
    const riskColor = result.niyuanIndex >= 70 ? '#EF4444' : result.niyuanIndex >= 40 ? '#F59E0B' : '#22C55E'
    this.setData({ data: stored, result, riskLabel, riskColor })
  },

  calcNiyuan(data) {
    const myInfo = data.myInfo || { name: '我' }
    const yourInfo = data.yourInfo || { name: 'TA' }
    const tags = data.tags || []
    const relationType = data.relationType || ''
    let niyuanIndex = 30
    const tagScores = {
      '经常吵架': 15, '冷暴力': 20, '忽冷忽热': 18, '暧昧不清': 22,
      '父母反对': 10, '异地恋': 8, '经济纠纷': 12, '第三者': 25,
      '前任阴影': 14, '性格不合': 10,
    }
    for (const t of tags) niyuanIndex += tagScores[t] || 8
    if (relationType === 'ex') niyuanIndex += 15
    if (relationType === 'crush' || relationType === 'unrequited') niyuanIndex += 20
    if (relationType === 'fling') niyuanIndex += 12
    niyuanIndex = Math.min(100, Math.max(0, niyuanIndex))

    let summary = ''
    if (niyuanIndex >= 80) {
      summary = '⚠️ ' + myInfo.name + '和' + yourInfo.name + '的当前结果提示较多，建议放慢节奏、先观察相处状态。'
    } else if (niyuanIndex >= 60) {
      summary = '💬 ' + myInfo.name + '和' + yourInfo.name + '的当前结果有一些需要留意的地方，适合多做沟通。'
    } else if (niyuanIndex >= 40) {
      summary = '💭 ' + myInfo.name + '和' + yourInfo.name + '有一定契合点，也可以继续观察和了解。'
    } else {
      summary = '✨ ' + myInfo.name + '和' + yourInfo.name + '当前整体状态较为平稳，可按自己的节奏相处。'
    }

    const matchScore = Math.min(100, Math.max(0, Math.round(50 + Math.random() * 30 - niyuanIndex * 0.3)))
    const confessionProb = Math.min(100, Math.round(matchScore * 0.8 + niyuanIndex * 0.2))
    const cheatingRisk = Math.min(100, Math.round(niyuanIndex * 0.6 + Math.random() * 20))
    const problems = tags.length > 0
      ? tags.map(function(t) { return '「' + t + '」是当前结果中可以留意的部分' }).join('；') + '。'
      : '目前没有发现特别突出的问题。'
    const prediction = niyuanIndex > 70
      ? '从当前输入来看，后续可能会有反复波动，建议减少情绪化判断。'
      : niyuanIndex > 50
      ? '从当前输入来看，后续还有调整空间，保持耐心即可。'
      : '从当前输入来看，整体较为平稳，继续自然相处即可。'

    return {
      niyuanIndex,
      matchScore,
      confessionProb,
      cheatingRisk,
      summary,
      problems,
      prediction,
      suggestions: [
        '保持良好的沟通习惯，有话直说',
        '给彼此适当的空间，不要过于依赖',
        '共同培养兴趣爱好，增加情感连接',
      ],
    }
  },

  onShare() {
    wx.navigateTo({ url: '/pages/share/share' })
  },

  onBack() {
    wx.navigateBack()
  },
})
