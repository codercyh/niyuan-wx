# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

缘起 (YuanQi) - 微信原生小程序，融合趣味测试、缘分分析、社区倾诉等功能。

**当前阶段**：核心模块（首页 / 测试 / 缘分 / 社区 / 认证 / 个人中心 / 消息 API）已完成；后端 `niyuan-api`（Node.js + Express + MongoDB）已接入生产环境（`https://yuanfen.love`）。主体已迁移企业，变现走**小程序虚拟支付**（道具直购，适配 iOS 审核，已部署生产、安卓联调通过）；广告解锁入口暂隐藏（UV 未达 1000，未开流量主）。后端仓库位于同级目录 `../niyuan-api`。

**技术栈**: 微信小程序原生框架 (WXML + WXSS + JS) + Node.js 测试运行环境

## 开发命令

```bash
# 运行 Node.js 单元测试
npm test
# 等价于：
node tests/auth.test.js && node tests/user.test.js && node tests/image.test.js

# 运行单个测试文件
node tests/auth.test.js
```

**注意**: 此项目为微信小程序，需要在微信开发者工具中打开和预览，无 npm 构建流程。

## 架构概览

### 页面结构

每个页面目录包含四件套：`.js` `.json` `.wxml` `.wxss`

```
pages/
├── home/           # 首页
├── test/           # 测试模块 (test-list → test-detail → test-result → test-poster)
├── fate/           # 缘分模块 (fate-input → fate-loading → fate-result → fate-poster)
├── social/         # 社区模块 (tree-list / tree-create / tree-detail)
├── auth/           # 认证模块 (login / profile-edit / profile-guide / settings)
├── profile/        # 个人中心
├── history/        # 历史记录
├── result/         # 通用结果页
├── share/          # 分享
└── privacy/        # 隐私协议
```

底部 TabBar：首页 / 测试 / 我的（3 个）。

### 数据层 (`data/`)

- `tests-data.js` - 5套测试数据（MBTI/SBTCI/恋人SBTCI/爱情配对/九型人格）
  - `getAllTests()` - 获取所有测试列表
  - `getTestById(id)` - 获取单个测试
  - `calculateResult(id, scores)` - 计算测试结果
- `fate-data.js` - 缘分计算引擎
  - `calculateFate(personA, personB)` - 五维度评分：星座(35%) + 姓名(20%) + 灵数(15%) + 性格(15%) + 玄学(15%)

### 工具层 (`utils/`)

- `api.js` - API 调用封装 (v3.1)，生产环境指向 `https://yuanfen.love`，响应格式 `{ code, message, data }`，`code===0` 为成功
- `auth.js` - Token 生成/验证/刷新
- `user.js` - 用户数据管理（VIP / 解锁状态本地缓存）
- `storage.js` - 本地存储管理（微信环境）
- `unlock.js` - 解锁/付费编排（广告解锁 / 单次付费 / 月度会员）
- `preferences.js` - 用户偏好设置
- `zodiac.js` / `lunar.js` - 星座 / 农历计算
- `image.js`, `session-manager.js`, `token-refresh.js`, `performance-monitor.js`, `format.js`

### 应用启动流程 (`app.js`)

```
onLaunch → bootstrap() → wx.login → 后端换 token → 拉取用户信息 + VIP 状态
```

页面可通过 `app.ensureBootstrapped()` 等待启动完成。

### 解锁系统 (`utils/unlock.js`)

三种解锁路径：
1. 看广告免费解锁 (单次 runId) —— **当前隐藏**，见下
2. 单次付费 ¥9.9 (按 testId 永久解锁) —— 虚拟支付·道具直购
3. 月度会员 ¥9.9 活动价 (期内不限次数) —— 虚拟支付·道具直购

**当前状态**：
- 单次付费 / 月度会员：走**小程序虚拟支付**（道具直购 `short_series_goods`），适配 iOS 审核。前端 `wx.login` → 后端 `/pay/virtual/create` 组 signData + 双签名（paySig/signature）→ `wx.requestVirtualPayment` → 乐观本地解锁 + `/pay/virtual/confirm` 查单履约。已部署生产（`VP_ENV=0`），安卓沙箱联调通过。配置见 `../niyuan-api` 的 `VP_*` 环境变量。旧 JSAPI 方案（`wx.requestPayment` + `/pay/single|membership/create`）代码保留但前端不再调用。
- 广告解锁：**入口已隐藏**（结果页 `enableAdUnlock=false`，4 处按钮包 `wx:if`）。原因：小程序 UV 未达 1000，无法开通「流量主」。UV 达标后流程：开通流量主 → 建激励视频广告位拿真实 `AD_UNIT_ID`（替换 `utils/unlock.js` 占位符）→ 两页面 `enableAdUnlock` 改 `true`。后端校验 `POST /unlock/ad-verify` 仍未实现（前端 `.catch(()=>{})` 静默忽略，仅本地生效）。

## 前后端接口契约

前端调用统一收敛在 `utils/api.js`，后端路由见 `../niyuan-api/src/routes/`（挂载于 `src/app.js`：`/auth /users /tests /niyuan /tree-holes /messages /pay`）。除广告解锁校验 `POST /unlock/ad-verify`（入口已隐藏，暂不需要）外，其余前端接口（含虚拟支付 `/pay/virtual/*`）均有对应后端路由。Envelope 约定：`{ code, message, data }`，`code===0` 成功。

## 编码规范

### 命名约定
- 页面目录：kebab-case（如 `fate-input/`）
- JS 变量/函数：camelCase（如 `getAllTests`）
- 数据常量：UPPER_SNAKE_CASE（如 `ZODIAC_MATRIX`）
- CSS 类名：kebab-case（如 `.btn-primary`）

### 数据处理
- 测试数据集中在 `data/` 目录，通过 `require()` 引入
- 页面间数据传递优先使用 URL 参数，复杂对象使用 `wx.getStorageSync`
- API 调用在 `utils/api.js` 中统一管理

### 设计系统色值

```
主色: #FF6B6B / #FF6B35
背景: #0A0A14 / #0F0C29 / #1A1A2E / #1A1A24
文字: #FFFFFF / #A0A0A0 / #707080
边框: #333333
```

## 已知限制

- 登录已改用 button 组件获取头像昵称（规避已废弃的 `wx.getUserProfile`）
- 广告解锁入口已隐藏（UV 未达 1000，未开流量主）；`AD_UNIT_ID` 仍为占位符、后端 `POST /unlock/ad-verify` 未实现，详见「解锁系统」
- Token 安全校验：客户端侧使用硬编码 key；服务端走 JWT（见 niyuan-api `src/utils/jwt.js`）
- 消息：前后端 API 已就绪，但未注册独立消息页面（`app.json` 无 message 页）
- 主包体积约 950KB（< 2MB 限制），暂无需分包加载
- 无前端页面测试，仅 Node.js 环境单元测试（auth / user / image / fate-algorithm）

## 提审相关

参见 `提审文案-个人主体版.md`，小程序名称建议为"兴趣与测试"，定位为个人兴趣工具类小程序。
