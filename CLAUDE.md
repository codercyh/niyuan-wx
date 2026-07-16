# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

缘起 (YuanQi) - 微信原生小程序，融合趣味测试、缘分分析、社区倾诉等功能。

**当前阶段**：核心模块（首页 / 测试 / 缘分 / 社区 / 认证 / 个人中心 / 消息 API）已完成；后端 `niyuan-api`（Node.js + Express + MongoDB）已接入生产环境（`https://yuanfen.love`）。微信支付代码已接入（生产模式 `PAY_MODE='production'`），但**因小程序主体仍为个人、未转企业，收款暂不可用**，待主体升级 + 商户号开通后启用。后端仓库位于同级目录 `../niyuan-api`。

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
1. 看广告免费解锁 (单次 runId)
2. 单次付费 ¥9.9 (按 testId 永久解锁)
3. 月度会员 ¥19.9 (期内不限次数)

**当前状态**（`PAY_MODE = 'production'`）：
- 单次付费 / 月度会员：代码已接入微信支付（下单 → `wx.requestPayment` → `GET /pay/verify/:orderId` 服务端校验 → 本地标记解锁，`payment.js` 写入 `user.unlockedTests` / VIP）。**但当前主体仍为个人、未转企业、无商户号，支付收款实际不可用**（用户触发会下单失败），待主体升级后启用。
- 广告解锁：**过渡期内唯一可用的变现路径**，两项待办 — ① `AD_UNIT_ID` 仍为占位符 `adunit-xxxxxxxxxxxxxxxx`，需在 mp.weixin.qq.com 申请真实广告位后替换；② 服务端校验接口 `POST /unlock/ad-verify` 后端尚未实现，前端以 `.catch(()=>{})` 静默忽略，故广告解锁目前仅本地生效、无服务端记账。

## 前后端接口契约

前端调用统一收敛在 `utils/api.js`，后端路由见 `../niyuan-api/src/routes/`（挂载于 `src/app.js`：`/auth /users /tests /niyuan /tree-holes /messages /pay`）。除广告解锁校验 `POST /unlock/ad-verify` 外，26 个前端接口均有对应后端路由。Envelope 约定：`{ code, message, data }`，`code===0` 成功。

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
- 广告解锁闭环未完成：`utils/unlock.js` 的 `AD_UNIT_ID` 为占位符 + 后端 `POST /unlock/ad-verify` 未实现（详见「解锁系统」）
- Token 安全校验：客户端侧使用硬编码 key；服务端走 JWT（见 niyuan-api `src/utils/jwt.js`）
- 消息：前后端 API 已就绪，但未注册独立消息页面（`app.json` 无 message 页）
- 主包体积约 950KB（< 2MB 限制），暂无需分包加载
- 无前端页面测试，仅 Node.js 环境单元测试（auth / user / image / fate-algorithm）

## 提审相关

参见 `提审文案-个人主体版.md`，小程序名称建议为"兴趣与测试"，定位为个人兴趣工具类小程序。
