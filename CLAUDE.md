# 缘起 (YuanQi / niyuan-wx) - 微信小程序

## 项目概述

微信原生小程序，融合趣味测试、缘分分析、社区倾诉等功能。当前 v1.0 基础框架阶段。

## 技术栈

- 微信小程序原生框架 (WXML + WXSS + JS)
- Node.js 测试运行环境
- 纯本地存储 (`wx.getStorageSync`)，后端 API 未接入

## 项目结构

```
niyuan-wx/
├── app.js / app.json / app.wxss    # 小程序入口与全局样式
├── auth.js / user.js / image.js   # 根目录 shim，转发到 utils/
├── storage.js                      # Node 环境存储实现（测试用）
├── data/
│   ├── tests-data.js               # 5套测试数据（MBTI/SBTCI/恋人SBTI/爱情配对/九型人格）
│   └── fate-data.js                # 缘分计算引擎（星座配对矩阵+命运分析）
├── utils/
│   ├── api.js                      # API 调用封装（离线模式兜底）
│   ├── auth.js                     # Token 生成/验证/刷新
│   ├── user.js                     # 用户数据管理
│   ├── storage.js                  # 本地存储管理（微信环境）
│   ├── zodiac.js                   # 星座计算
│   ├── format.js                   # 格式化工具
│   ├── image.js                    # 图片处理
│   ├── session-manager.js          # 会话管理
│   ├── token-refresh.js            # Token 刷新逻辑
│   ├── performance-monitor.js      # 性能监控
│   └── preferences.js              # 用户偏好
├── pages/
│   ├── home/                       # 首页（完成）
│   ├── test/                       # 测试模块（test-list/detail/result/poster）
│   ├── fate/                       # 缘分模块（fate-input/result/poster/loading）
│   ├── social/                     # 社区模块（tree-list/create/detail）
│   ├── auth/                       # 认证模块（login/profile-edit/profile-guide/settings）
│   ├── profile/                    # 个人中心（profile/settings）
│   ├── history/                    # 历史记录
│   ├── privacy/                    # 隐私说明
│   ├── result/                     # 通用结果页
│   └── share/                      # 分享页
├── assets/icons/                   # Tab Bar 图标
├── tests/                          # Node.js 单元测试
│   ├── auth.test.js
│   ├── user.test.js
│   └── image.test.js
└── .claude/                        # Claude Code 配置
```

## 开发命令

```bash
# 运行测试（Node.js 环境，非小程序环境）
npm test

# 测试等价于：
node tests/auth.test.js && node tests/user.test.js && node tests/image.test.js
```

注意：此项目为微信小程序，需要在微信开发者工具中打开和预览，无 npm 构建流程。

## 编码规范

### 风格

- JavaScript ES6+，优先使用 `const`/`let`
- 数据模块导出使用 `module.exports`
- 页面使用 `Page({})`，组件使用 `Component({})`
- 页面文件结构：每个页面目录包含 `.js` `.json` `.wxml` `.wxss` 四件套

### 数据处理

- 测试数据集中在 `data/` 目录，通过 `require()` 引入
- 页面间数据传递优先使用 URL 参数，复杂对象使用 `wx.getStorageSync`
- API 调用在 `utils/api.js` 中统一管理，网络失败自动进入离线模式

### 命名约定

- 页面目录：kebab-case（如 `fate-input/`）
- JS 变量/函数：camelCase（如 `getAllTests`）
- 数据常量：UPPER_SNAKE_CASE（如 `ZODIAC_MATRIX`）
- CSS 类名：kebab-case（如 `.btn-primary`）

### 设计系统色值

```
主色: #FF6B6B / #FF6B35
背景: #0A0A14 / #0F0C29 / #1A1A2E / #1A1A24
文字: #FFFFFF / #A0A0A0 / #707080
边框: #333333
```

## 当前 Tab Bar 配置

3 个 Tab：首页 / 测试 / 我的

## 关键业务逻辑

### 测试流程

1. `test-list` → 选择测试 → `test-detail`（答题）→ `test-result`（结果）→ `test-poster`（分享海报）
2. 分数计算在 `data/tests-data.js` 的 `calculateResult()` 中
3. 各维度 scores 累加后匹配 `resultTypes` 的 range 区间

### 缘分分析流程

1. `fate-input` → 输入双方信息 → `fate-loading`（加载动画）→ `fate-result`（结果）→ `fate-poster`（分享）
2. 算法在 `data/fate-data.js` 的 `calculateFate()` 中
3. 五维度评分：星座(35%) + 姓名(20%) + 灵数(15%) + 性格(15%) + 玄学(15%)

## 已知限制

- `wx.getUserProfile` 已被微信废弃，需改用 button 组件获取头像昵称
- API 后端未接入，所有请求走离线兜底
- Token 安全校验使用硬编码 key，仅客户端侧
- 未做分包加载，20 个页面全在主包
- 无前端页面测试

## 提审相关

参见 `提审文案-个人主体版.md`，小程序名称建议为"兴趣与测试"，定位为个人兴趣工具类小程序。