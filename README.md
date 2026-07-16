# 缘起 (YuanQi) - 微信小程序

一个融合兴趣测试、心理测试、缘分分析与社区倾诉的微信原生小程序。

## 🎯 项目概览

- **应用名称**：缘起（提审名建议"兴趣与测试"，个人兴趣工具类）
- **英文名**：YuanQi
- **当前版本**：v1.x（核心功能 + 后端 API 已上线；微信支付代码已接入，因主体为个人、未转企业，收款暂不可用）
- **项目类型**：微信原生小程序（WXML + WXSS + JS，无 npm 构建流程）
- **后端**：`niyuan-api`（Node.js + Express + MongoDB），生产域名 `https://yuanfen.love`

## 📱 核心功能

### 已实现 ✅

- **首页 (Home)**：用户信息卡、今日运势评分、五维评分（爱情/财富/事业/学习/人脉）、运势文案、快捷功能入口、VIP 推荐卡
- **测试模块**：test-list → test-detail → test-result → test-poster，内置 5 套测试（MBTI / SBTCI / 恋人SBTCI / 爱情配对 / 九型人格）
- **缘分模块**：fate-input → fate-loading → fate-result → fate-poster，五维缘分算法 + 后端存储历史记录
- **社区树洞**：tree-list / tree-create / tree-detail，支持匿名发帖、评论、点赞
- **认证**：微信快捷登录 + 自定义头像昵称；profile-edit / profile-guide / settings
- **个人中心 / 历史**：profile、history
- **支付与解锁**：广告解锁（免费，过渡期唯一可用）/ 单次付费 ¥9.9 / 月度会员 ¥19.9（代码已接入，主体转企业后启用收款）；已付费用户升级会员首月优惠 ¥9.9
- **分享 / 海报**：通用结果页 + 海报生成（result / share）
- **全局配置**：app.js 启动流程、app.json（3 Tab 导航）、app.wxss 设计系统

### 部分完成 / 待接入 🚧

- **消息系统**：前后端 API 已就绪（`utils/api.js` + 后端 `/messages`），但未注册独立消息页面
- **首页推荐流 / 搜索**：当前为静态数据 / 仅 UI

### 后续计划 📅

- 完成广告解锁闭环（替换广告位 ID + 实现服务端校验）
- 私聊、直播等扩展功能

## 📊 项目结构

```
niyuan-wx/
├── pages/
│   ├── home/                 # 首页
│   ├── test/                 # 测试 (test-list/test-detail/test-result/test-poster)
│   ├── fate/                 # 缘分 (fate-input/fate-loading/fate-result/fate-poster)
│   ├── social/               # 树洞 (tree-list/tree-create/tree-detail)
│   ├── auth/                 # 认证 (login/profile-edit/profile-guide/settings)
│   ├── profile/              # 个人中心
│   ├── history/              # 历史记录
│   ├── result/ share/        # 通用结果 / 分享
│   └── privacy/              # 隐私协议
├── data/                     # tests-data.js / fate-data.js
├── utils/                    # api/auth/user/storage/unlock/preferences/zodiac/lunar/image...
├── assets/                   # 图标与图片
├── tests/                    # Node.js 单元测试
├── app.js app.json app.wxss
└── README.md
```

底部 TabBar：首页 / 测试 / 我的（3 个）。

## 🚀 快速开始

### 1. 项目设置

```bash
# 进入项目目录
cd /Users/mac/openclaw-cn/workspace/projects/niyuan-wx

# 在微信开发者工具中打开此目录
# 点击"预览"或"真机调试"进行测试
```

### 2. 基本命令

```bash
# 运行 Node.js 单元测试
npm test

# 查看项目结构
tree -L 2

# 更新配置（修改 app.json 后需要）
# 在微信开发者工具中重新加载
```

## 🎨 设计系统

### 色彩系统

```
--primary-color: #FF6B6B      (主色 - 红色)
--success-color: #4ADE80      (成功 - 绿色)
--warning-color: #F59E0B      (警告 - 橙色)
--danger-color: #EF4444       (危险 - 红色)
--info-color: #3B82F6         (信息 - 蓝色)

--bg-dark: #0A0A14            (深黑)
--bg-card: #1A1A24            (卡片背景)
--bg-light: #2A2A34           (浅背景)
--text-primary: #FFFFFF       (主文本)
--text-secondary: #A0A0A0     (副文本)
--text-tertiary: #707080      (三级文本)
--border-color: #333333       (边框色)
```

### 字体和间距

- 主标题：24px bold
- 副标题：12px secondary
- 正文：14px primary
- 间距基础单位：4px（4, 8, 12, 16, 20...）

### 组件样式

所有通用样式已在 `app.wxss` 中定义，包括：
- 按钮 (`.btn`, `.btn-primary`, `.btn-secondary`)
- 卡片 (`.card`)
- 文本样式 (`.text-primary`, `.text-secondary`)
- 布局工具 (`.flex`, `.flex-between`, `.flex-column`)
- 动画效果 (`.animate-fadeIn`, `.animate-slideUp`)

## 🔧 技术栈

### 前端
- 微信小程序原生框架
- JavaScript ES6+
- WXML 模板语言 / WXSS 样式语言

### 后端与存储
- `niyuan-api`：Node.js + Express + MongoDB（生产 `yuanfen.love`），响应 envelope `{ code, message, data }`
- 本地缓存：`wx.storage`（VIP / 解锁状态本地优先）
- 微信支付：单次付费 / 月度会员（代码已接入，主体转企业后启用收款）

## 📝 主要实现细节

### 1. API 调用（`utils/api.js`，v3.1）
统一封装，生产指向 `https://yuanfen.love`，响应 envelope `{ code, message, data }`，`code===0` 为成功。覆盖认证 / 用户 / 测试 / 缘分 / 树洞 / 消息 / 支付 / 解锁。

### 2. 缘分算法（`data/fate-data.js` + 后端 `fate-engine.js`）
五维评分：星座(35%) + 姓名(20%) + 灵数(15%) + 性格(15%) + 玄学(15%)。前端本地可算，亦由后端 `/niyuan/analyze` 计算并入库。

### 3. 解锁系统（`utils/unlock.js`）
- 看广告免费解锁（单次 runId）
- 单次付费 ¥9.9（按 testId 永久解锁）
- 月度会员 ¥19.9（期内不限次数）
- 单次付费 / 会员：代码接入微信支付 + 服务端校验，**但主体为个人、未转企业，收款暂不可用**；广告解锁为过渡期唯一可用路径，待补（见已知问题）

### 4. 应用启动（`app.js`）
`onLaunch → bootstrap() → wx.login → 后端换 token → 拉取用户信息 + VIP 状态`；页面可 `app.ensureBootstrapped()` 等待就绪。

## 🐛 已知问题 / 待办

- [ ] 广告解锁：`utils/unlock.js` 中 `AD_UNIT_ID` 为占位符 `adunit-xxxxxxxxxxxxxxxx`，需替换为真实广告位 ID
- [ ] 广告解锁服务端校验 `POST /unlock/ad-verify` 后端尚未实现（前端 `.catch(()=>{})` 静默忽略）
- [ ] 微信支付收款暂不可用（小程序主体仍为个人，未转企业）；过渡期建议隐藏付费入口，仅保留广告解锁
- [ ] 消息系统无独立页面（API 已就绪，缺 UI 入口）
- [ ] 首页推荐流为静态数据、搜索仅 UI

## 🔮 后续优化方向

1. 完成广告解锁闭环（替换广告位 ID + 实现服务端校验）
2. 消息页面接入、推荐算法、搜索功能落地
3. 图片资源压缩、缓存策略
4. 前端页面自动化测试
5. 小程序主体转企业后，启用微信支付收款（恢复付费解锁入口）

## 📞 联系和支持

如有问题或建议，请：
- 查看相关文档：`/Users/mac/.openclaw/workspace/niyuan-wx_升级方案.md`
- 产品需求文档：`/Users/mac/.openclaw/workspace/测测App_完整功能需求文档.md`

## 📄 版本历史

| 版本 | 日期 | 内容 |
|------|------|------|
| v1.0 | 2026-04-23 | 基础框架与首页 |
| v1.x | 2026-05-15 | 测试 / 缘分 / 社区 / 认证 / 个人中心全模块完成；接入后端 API、微信支付与 VIP 会员 |

---

**Last Updated: 2026-06-23**
**Project Status: ✅ 核心功能完成，迭代优化中**
