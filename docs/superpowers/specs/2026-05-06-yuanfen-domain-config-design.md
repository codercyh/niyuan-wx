# yuanfen.love 域名配置设计方案

## 背景

项目已购买域名 `yuanfen.love`，需要配置用于微信小程序 API 服务。

## 现状

| 项目 | 状态 |
|------|------|
| 后端 API | `niyuan-api` 项目，Express + MongoDB，已部署在阿里云 ECS |
| 服务器 IP | `121.43.246.140` |
| 服务端口 | `8099` (PM2 托管) |
| MongoDB | 本地安装，`localhost:27017` |
| 小程序 API | 当前使用 `http://121.43.246.140:8099` 直连 IP |

## 目标架构

```
微信小程序
    ↓ HTTPS
api.yuanfen.love (DNS A 记录 → 121.43.246.140)
    ↓
阿里云 ECS (121.43.246.140)
    ↓
Nginx (443 端口，SSL 终结)
    ↓ 反向代理
Node.js API (127.0.0.1:8099)
    ↓
MongoDB (localhost:27017)
```

## 配置清单

### 1. DNS 解析配置

**平台**: 阿里云 DNS 控制台

**记录配置**:
| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | api | 121.43.246.140 | 600 |

**预期结果**: `api.yuanfen.love` 解析到 `121.43.246.140`

---

### 2. 服务器 Nginx 配置

**安装**:
```bash
sudo apt update
sudo apt install nginx
```

**Nginx 配置** (`/etc/nginx/sites-available/api.yuanfen.love`):
```nginx
server {
    listen 80;
    server_name api.yuanfen.love;

    location / {
        proxy_pass http://127.0.0.1:8099;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 3. SSL 证书配置

**安装 Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

**申请证书**:
```bash
sudo certbot --nginx -d api.yuanfen.love
```

**Certbot 会自动**:
- 向 Let's Encrypt 申请证书
- 修改 Nginx 配置添加 SSL
- 设置 HTTP 自动跳转 HTTPS

**证书续期**: Certbot 会自动设置定时任务续期

---

### 4. 小程序 API 地址更新

**文件**: `niyuan-wx/utils/api.js`

**修改内容**:
```javascript
const API_BASE_URL = IS_PRODUCTION
  ? 'https://api.yuanfen.love'  // 生产环境使用域名
  : 'http://localhost:3000'      // 本地开发环境
```

---

### 5. 微信小程序域名白名单

**配置位置**: 微信公众平台 → 开发管理 → 开发设置 → 服务器域名

**添加域名**:
- request 合法域名: `https://api.yuanfen.love`

**注意**:
- 域名必须 HTTPS
- 域名必须 ICP 备案（如未备案需先完成备案）

---

## 执行步骤

### 阶段一：DNS 配置（可立即开始）

1. 登录阿里云控制台
2. 进入域名解析设置
3. 添加 A 记录：`api` → `121.43.246.140`
4. 等待 DNS 生效（通常几分钟到几小时）

**验证**:
```bash
dig api.yuanfen.love
# 或
ping api.yuanfen.love
```

### 阶段二：服务器配置（DNS 生效后）

1. SSH 登录服务器
2. 安装 Nginx
3. 创建站点配置
4. 测试 HTTP 访问
5. 安装 Certbot
6. 申请 SSL 证书
7. 验证 HTTPS 访问

### 阶段三：小程序配置

1. 修改 `utils/api.js` 域名地址
2. 在微信公众平台添加服务器域名
3. 测试小程序 API 调用

---

## 验证清单

- [ ] DNS 解析生效：`ping api.yuanfen.love` 返回正确 IP
- [ ] HTTP 访问正常：`http://api.yuanfen.love/health` 返回 JSON
- [ ] HTTPS 证书有效：`https://api.yuanfen.love/health` 无警告
- [ ] 小程序 API 调用成功
- [ ] 证书自动续期已配置

---

## 注意事项

1. **ICP 备案**: 如域名未备案，需先在阿里云完成 ICP 备案（通常需要 1-2 周）
2. **防火墙**: 确保 ECS 安全组开放 80 和 443 端口
3. **证书有效期**: Let's Encrypt 证书有效期 90 天，Certbot 会自动续期
4. **微信审核**: 小程序正式发布前需完成域名配置

---

## 回滚方案

如配置出现问题，可将 `utils/api.js` 改回 IP 地址：
```javascript
const API_BASE_URL = IS_PRODUCTION
  ? 'http://121.43.246.140:8099'  // 回退到 IP 直连
  : 'http://localhost:3000'
```
