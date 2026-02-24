# juya-news-card

一个基于 React + TypeScript 的新闻卡片生成与渲染工具，支持模板预览、服务端 LLM 生成、PNG 导出（前端或后端渲染）。
> 声明：这是一个 `100% AI` 项目，`0` 人工编写。

![软件界面](assets/screenshot.png)

## 特性
- 输入新闻文本，服务端调用 LLM 生成结构化卡片
- 174 个主题模板统一渲染（`templates/`）
- PNG 导出支持两种模式：浏览器渲染 / 后端 Playwright 渲染
- `render-api` 内置限流、Bearer 鉴权、CORS 白名单

## 项目组成（CLI / API / 前端 / Skill / Prompt）
| 模块 | 主要入口 | 用途 | 典型命令 |
| --- | --- | --- | --- |
| 前端（Frontend） | `src/` | 提供可视化编辑、模板选择、导出入口 | `npm run dev` |
| 后端接口（API） | `server/render-api.ts` | 提供 `/api/generate`（LLM 转结构化内容）和 `/render`（服务端渲染 PNG） | `npm run render-api` |
| 命令行工具（CLI） | `scripts/` | 本地脚本化生成/批量截图/离线渲染 | `npm run generate` / `npm run batch-generate` / `npm run test-render` |
| Agent Skill | `.agents/skills/juya-news-card-operator/SKILL.md` | 让 Codex/Agent 按固定流程操作本项目（偏自动化工作流） | 在 agent 会话中按 skill 触发 |
| Runtime Prompt（项目内） | `src/services/llm-prompt.ts` | 项目运行时使用的默认系统提示词；用于 `/api/generate` | API 默认读 `DEFAULT_SYSTEM_PROMPT` |
| Standalone Prompt（项目外） | `claude-style-prompt.md` | 独立 Prompt，提供给任意 AI 生成符合 `claudeStyle` 主题的完整 HTML；不被项目运行时自动读取 | 手动复制给任意 AI 使用 |

关系可以简单理解为：
- 常规使用：前端 -> API -> 上游 LLM -> 返回结构化内容 -> 浏览器或 API 渲染 PNG。
- 脚本使用：CLI 直接调用本地逻辑（可走 LLM 或 mock 数据）并输出结果。
- Agent 使用：Skill 约束操作步骤，Runtime Prompt 约束生成质量与格式。
- Standalone Prompt 使用：`claude-style-prompt.md` 是项目外工作流，直接喂给任意 AI 生成 `claudeStyle` HTML。

## 架构图（README 渲染版）
```mermaid
flowchart LR
  User[User] --> FE[Frontend<br/>src/]
  User --> CLI[CLI<br/>scripts/]
  User --> AGENT[Agent Skill<br/>.agents/skills/...]
  User --> ANYAI[Any AI]

  FE -->|POST /api/generate| API[Render API<br/>server/render-api.ts]
  FE -->|Browser PNG export| FEPNG[PNG (Browser)]
  FE -->|POST /render| API

  API -->|DEFAULT_SYSTEM_PROMPT| RPROMPT[Runtime Prompt<br/>src/services/llm-prompt.ts]
  API -->|LLM_API_KEY / BASE_URL / MODEL| LLM[Upstream LLM]
  API -->|SSR + Playwright| APIPNG[PNG (Render API)]
  API --> TMPL[Templates<br/>src/templates/]

  CLI -->|optional LLM call| LLM
  CLI -->|SSR + Playwright| CLIPNG[PNG (CLI)]
  CLI --> TMPL

  AGENT -->|orchestrate workflow| CLI
  AGENT -->|prompt rules| RPROMPT
  ANYAI -->|with claude-style-prompt.md| SPROMPT[Standalone Prompt<br/>claude-style-prompt.md]
  SPROMPT --> SHTML[claudeStyle HTML]
```

详细说明见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

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
至少先配置这 3 项：
```env
LLM_API_KEY=your-api-key
LLM_API_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
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
2. 按需修改 `.env.docker`（至少配置 `LLM_API_KEY`、`LLM_API_BASE_URL`、`LLM_MODEL`）
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

## 环境变量（最小心智负担版）
先记住：多数场景至少要配置 3 项。

```env
LLM_API_KEY=your-api-key
LLM_API_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

说明：
- 本地开发默认前端 `3000`、后端 `8080`，`npm run dev` 会自动代理 `/api`。
- 非生产环境默认允许无 Token 调用写接口，方便开箱即用。
- 生产环境默认不允许无 Token 写接口（更安全）。

如果要公开部署，再加这几项：
```env
API_BEARER_TOKEN=change-me
ALLOW_UNAUTHENTICATED_WRITE=false
CORS_ALLOW_ORIGIN=https://your-frontend-domain.example
```

补充：
- `VITE_*` 给浏览器用，不要放密钥。
- UI 里的 `App Backend API Base URL`（旧名 `Generate API Base URL`）对应 `VITE_API_BASE_URL`，表示本项目后端地址（用于 `/api/generate`），不是上游 LLM 的 `LLM_API_BASE_URL`。
- `LLM_*` 给服务端调用上游模型用。
- UI 的 Global Settings 会写入 `localStorage`；点击 `Reset` 可回到环境变量默认值。
- 其余高级参数（并发、限流、超时、Chromium）都已给默认值，按需再去 `.env.example` 取消注释即可。

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
- `src/`：前端应用、模板系统、客户端服务（含默认 LLM Prompt）
- `server/`：后端 API（`/api/generate` + `/render` + `/healthz` + `/themes`）
- `scripts/`：CLI 与批处理脚本（生成、离线渲染、全模板截图、审计）
- `.agents/skills/`：Agent skill 定义（当前含 `juya-news-card-operator`）
- `claude-style-prompt.md`：独立 Prompt（项目外），供任意 AI 生成 `claudeStyle` HTML；不被运行时自动读取
- `docs/ARCHITECTURE.md`：架构与数据流说明
- `tests/`：测试与 mock 数据
- `assets/`：可选本地资源（`assets/htmlFont.ttf` 可为空）

## 开源说明
- MIT License（见 `LICENSE`）
- 不要提交 `.env.local`、API Key 或其他敏感信息
