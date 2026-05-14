# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

缘起 (YuanQi) - 微信原生小程序，融合趣味测试、缘分分析、社区倾诉等功能。当前 v1.0 基础框架阶段。

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
├── social/         # 社区模块 (tree-list/tree-create/tree-detail)
├── auth/           # 认证模块 (login/profile-edit/profile-guide/settings)
├── profile/        # 个人中心
└── ...
```

### 数据层 (`data/`)

- `tests-data.js` - 5套测试数据（MBTI/SBTCI/恋人SBTI/爱情配对/九型人格）
  - `getAllTests()` - 获取所有测试列表
  - `getTestById(id)` - 获取单个测试
  - `calculateResult(id, scores)` - 计算测试结果
- `fate-data.js` - 缘分计算引擎
  - `calculateFate(personA, personB)` - 五维度评分：星座(35%) + 姓名(20%) + 灵数(15%) + 性格(15%) + 玄学(15%)

### 工具层 (`utils/`)

- `api.js` - API 调用封装，支持环境切换（生产/开发），响应格式 `{ code, message, data }`
- `auth.js` - Token 生成/验证/刷新
- `user.js` - 用户数据管理
- `storage.js` - 本地存储管理（微信环境）
- `zodiac.js` - 星座计算
- `lunar.js` - 农历转换工具
- `unlock.js` - 解锁/付费编排（广告解锁/单次付费/月度会员）
- `preferences.js` - 用户偏好设置

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

**当前阶段**: 本地优先 + 服务端钩子占位，备案完成后替换 stubs。

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

- `wx.getUserProfile` 已被微信废弃，需改用 button 组件获取头像昵称
- API 后端正在接入中，部分接口使用 stub
- Token 安全校验使用硬编码 key，仅客户端侧
- 未做分包加载，页面全在主包
- 无前端页面测试（仅 Node.js 环境单元测试）

## 提审相关

参见 `提审文案-个人主体版.md`，小程序名称建议为"兴趣与测试"，定位为个人兴趣工具类小程序。
