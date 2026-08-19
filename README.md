# Anonymity Check 🕵️‍♂️

一个轻量级、高性能的 HTTP 代理匿名度检测与请求头分析服务（httpbin clone），专为检测客户端来源 IP、HTTP 请求头泄露、代理类型以及 IP 归属地而设计。

原生支持本地一键运行，并针对 **Vercel Serverless** 平台进行了深度适配。

---

## ✨ 核心特性

- ⚡ **极简与高性能**：基于 Node.js 与 Express 构建，无复杂依赖，即开即用。
- 🕵️ **精准代理与匿名度检测**：完整保留 `X-Forwarded-For`、`X-Real-IP`、`Via` 等关键代理特征标头，用于判定透明代理、普通匿名代理与高匿代理。
- 🌏 **地理与时区识别**：集成保留 `CF-IPCountry`（国家/地区代码）和 `X-Vercel-IP-Timezone`（时区），方便检测代理出口的实际归属。
- 🧹 **纯净的 Header 过滤**：自动清除 `x-vercel-*`（鉴权/签名标头）、`cf-*`（底层节点跟踪）、`forwarded` 及 `x-invocation-id` 等云平台内部运维杂质。
- ☁️ **Serverless 零配置部署**：内置 `vercel.json` 路由重定向与 `api/index.js` 函数入口，开箱即用部署至 Vercel。

---

## 📡 API 接口文档

服务提供以下标准的 HTTP GET 端点：

| 端点 (Endpoint) | 说明 (Description) | 返回数据示例 |
| :--- | :--- | :--- |
| `GET /ip` | 返回客户端/代理的来源 IP 地址 | `{"origin": "162.159.108.80"}` |
| `GET /headers` | 返回客户端及代理暴露的 HTTP 请求头 | `{"headers": { "user-agent": "...", "x-forwarded-for": "..." }}` |
| `GET /user-agent` | 返回客户端的 User-Agent | `{"user-agent": "Mozilla/5.0 ..."}` |
| `GET /get` | 返回完整的请求详细信息（含 Query 参数、Headers、来源 IP 与 URL） | `{"args": {}, "headers": {...}, "origin": "...", "url": "..."}` |
| `GET /` | 根路由，返回服务运行状态及可用接口列表 | Plain Text 文本信息 |

---

## 🚀 快速开始

### 本地开发与运行

1. **克隆项目**
   ```bash
   git clone https://github.com/Leif-xing/anonymity-check.git
   cd anonymity-check
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动本地服务**
   ```bash
   npm start
   # 或
   npm run dev
   ```
   服务启动后默认运行在 `http://localhost:8080`。

---

## ☁️ 部署指南

### 部署至 Vercel（推荐）

项目已内置 Vercel 部署配置文件，无需额外设置：

1. 将代码提交并推送到 GitHub/GitLab 仓库。
2. 登录 [Vercel 控制台](https://vercel.com/)，点击 **Add New Project**。
3. 选择并导入本仓库，框架选择 **Other**，构建命令留空。
4. 点击 **Deploy** 即可在一分钟内完成部署。

### 部署至 Railway / Docker / 自建服务器

本项目同样支持在常规 VPS 或容器化环境中作为 Node.js 服务独立运行：

```bash
# 设置端口（可选，默认 8080）
export PORT=8080

node index.js
```

---

## 📁 项目结构

```text
anonymity-check/
├── api/
│   └── index.js         # Vercel Serverless Function 统一入口
├── index.js             # Express 应用主逻辑与路由定义
├── vercel.json          # Vercel 路由重定向与构建配置文件
├── package.json         # 项目依赖与运行脚本
└── README.md            # 项目使用与部署说明文档
```

---

## 📄 开源协议

本项目采用 [ISC License](LICENSE) 协议开源。
