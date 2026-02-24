# juya-news-card

一个基于 React + TypeScript 的新闻卡片生成与渲染工具，支持模板预览、服务端 LLM 生成、PNG 导出（前端或后端渲染）。

![软件界面](assets/screenshot.png)

## 特性
- 输入新闻文本，服务端调用 LLM 生成结构化卡片
- 174 个主题模板统一渲染（`templates/`）
- PNG 导出支持两种模式：浏览器渲染 / 后端 Playwright 渲染
- `render-api` 内置限流、Bearer 鉴权、CORS 白名单

## 环境要求
- Node.js >= 20
- npm >= 10

## 快速开始
1. 安装依赖
```bash
npm install
```
2. 准备环境变量
```bash
cp .env.example .env.local
```
3. 启动后端（render + generate API）
```bash
npm run render-api
```
4. 启动前端开发服务
```bash
npm run dev
```

## 轻量开源定位
- 这是一个“可用优先”的普通开发者项目，适合分享思路与工具，不要求重度维护。
- 如果你只想快速分享给别人用：保证 `README`、`.env.example`、`LICENSE` 清晰即可。
- 如需更“工程化”的开源标准（CI、Issue 模板、SECURITY.md），可以后续再补，不是阻塞项。

## Docker 运行 render-api（推荐给分享场景）
1. 准备 Docker 环境变量文件
```bash
cp .env.docker.example .env.docker
```
2. 按需修改 `.env.docker`（至少 `API_BEARER_TOKEN`、`LLM_API_KEY`）
3. 启动服务
```bash
npm run docker:up
```
4. 检查健康状态
```bash
curl http://127.0.0.1:8080/healthz
```

说明：
- Docker 仅负责后端 `render-api` 服务。
- 前端本地开发若要直连该后端，请配置：
  - `VITE_API_BASE_URL=http://127.0.0.1:8080/api`
  - `VITE_ALLOW_CROSS_ORIGIN_API=true`
  - 服务端 `CORS_ALLOW_ORIGIN` 包含你的前端地址。

## Windows 一键启动（非 exe）
- 执行 `scripts/windows/start-render-api.bat`
- 或 PowerShell：`scripts/windows/start-render-api.ps1`

说明：
- 对这个项目而言，直接做 Windows 单文件二进制收益不高（Playwright + Chromium 依赖重、兼容成本高）。
- 用脚本启动通常更稳，也更容易被他人复现。

## 默认端口
- 前端开发服务：`3000`（`VITE_DEV_PORT`）
- 后端服务：`8080`（`RENDER_API_PORT`）

## 配置分层（统一口径）
1. 浏览器侧变量（`VITE_*`）：给前端用，最终会进浏览器，不要放密钥。
2. 服务端变量（无 `VITE_`）：给 `server/render-api.ts` 用，可放密钥。
3. 上游 LLM 变量（`LLM_*`）：服务端调用模型供应商时使用。
4. UI 里的 Global Settings 会持久化到浏览器 `localStorage`，会覆盖 `VITE_*` 默认值；需要点 `Reset` 才会回到环境变量默认值。

### 常见混淆（现在统一为以下语义）
- `VITE_API_BASE_URL`：浏览器请求本项目后端（`/api/generate`）的地址。
- `LLM_API_BASE_URL`：后端请求上游 LLM（如 OpenAI）的地址。
- 二者不是同一个东西，不能互相替代。

## 最小可用配置（建议先这样）
```env
# Browser -> app backend
VITE_API_BASE_URL=/api

# Backend listen
RENDER_API_PORT=8080

# Backend auth (required unless ALLOW_UNAUTHENTICATED_WRITE=true)
API_BEARER_TOKEN=change-me
ALLOW_UNAUTHENTICATED_WRITE=false

# Backend -> upstream LLM
LLM_API_KEY=your-api-key
```

## 关键变量清单

### A) 浏览器侧（公开）
| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 浏览器请求本项目后端 API 的基址 | `/api` |
| `VITE_API_BEARER_TOKEN` | 浏览器请求后端时附带的 Bearer（可选） | 空 |
| `VITE_ALLOW_CROSS_ORIGIN_API` | 是否允许前端请求跨域 API 基址 | `false` |
| `VITE_ALLOW_CROSS_ORIGIN_BEARER` | 是否允许 Bearer 跨域发送 | `false` |
| `VITE_API_MODEL` | 前端“生成参数”默认模型值 | `gpt-4o-mini` |
| `VITE_PNG_RENDERER_DEFAULT` | PNG 默认渲染器（`browser` / `render-api`） | `browser` |
| `VITE_RENDER_API_BASE_URL` | 单独 render 服务地址（可选） | 空（同源 `/api`） |
| `VITE_RENDER_API_BEARER_TOKEN` | 浏览器调用 render 时 Bearer（可选） | 空 |

### B) 前端开发服务（本地）
| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `VITE_DEV_HOST` | Vite 监听地址 | `0.0.0.0` |
| `VITE_DEV_PORT` | Vite 端口 | `3000` |
| `VITE_API_PROXY_TARGET` | `/api` 代理目标（可选） | 空（自动推导） |
| `VITE_RENDER_API_PORT` | 自动推导代理目标端口 | `8080` |

### C) 后端服务（可保密）
| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `RENDER_API_HOST` | 后端监听地址 | `127.0.0.1` |
| `RENDER_API_PORT` | 后端监听端口 | `8080` |
| `CORS_ALLOW_ORIGIN` | CORS 白名单 | `http://127.0.0.1:3000` |
| `API_BEARER_TOKEN` | 保护 `/render` 与 `/api/generate` | `change-me`（建议） |
| `ALLOW_UNAUTHENTICATED_WRITE` | 允许无 Token 写接口（仅本地调试） | `false` |
| `RATE_LIMIT_MAX_RENDER` | `/render` 限流 | `60` |
| `RATE_LIMIT_MAX_GENERATE` | `/api/generate` 限流 | `30` |

### D) 后端调用上游 LLM（可保密）
| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `LLM_API_KEY` | 上游 LLM 密钥（必填） | 无 |
| `LLM_API_BASE_URL` | 上游 LLM Base URL（可选） | 空（SDK 默认） |
| `LLM_MODEL` | 后端默认模型 | `gpt-4o-mini` |
| `LLM_TIMEOUT_MS` | 上游调用超时 | `60000` |
| `LLM_MAX_RETRIES` | 上游调用重试次数 | `0` |
| `ALLOW_CLIENT_LLM_SETTINGS` | 是否允许客户端覆盖模型/提示词等 | `false` |
| `LLM_ALLOWED_MODELS` | 允许客户端选择的模型白名单（逗号分隔） | `LLM_MODEL` |
| `LLM_MAX_TOKENS_CAP` | 客户端 `maxTokens` 上限 | `4096` |

## API
- `GET /healthz`：健康检查
- `GET /themes`：SSR 可用主题列表
- `POST /api/generate`：LLM 生成结构化卡片
- `POST /render` 或 `POST /api/render`：渲染 PNG

## 常用命令
- `npm run dev`：前端开发服务
- `npm run render-api`：后端服务（渲染 + LLM 生成）
- `npm run docker:up`：Docker 启动后端 render-api
- `npm run docker:down`：停止 Docker 服务
- `npm run docker:build`：构建 Docker 镜像
- `npm run test`：运行基础单元测试
- `npm run check`：类型检查 + 构建
- `npm run audit-themes:strict`：模板契约严格检查
- `npm run audit-themes:runtime:critical`：运行时关键风险检查
- `npm run batch-generate -- --all-themes`：全模板批量截图

## 生产部署建议
- 让服务监听 `127.0.0.1`，通过 Nginx/Caddy 暴露 HTTPS。
- 将 `CORS_ALLOW_ORIGIN` 收紧到你的站点域名。
- 开启 `API_BEARER_TOKEN`（或在网关层做鉴权）。
- 生产环境不要把真实上游密钥暴露到浏览器，统一走 `/api/generate`。
- 将 Playwright 浏览器安装放到镜像构建阶段：
```bash
npx playwright install chromium-headless-shell
```

## 项目结构
- `src/`：前端源码
- `server/`：后端运行服务（render + generate API）
- `scripts/`：批量生成与审计脚本
- `tests/`：本地测试数据
- `assets/`：可选本地资源（`assets/htmlFont.ttf` 可为空）

## 开源说明
- MIT License（见 `LICENSE`）
- 不要提交 `.env.local`、API Key 或其他敏感信息
