# Architecture

## Scope
This project is split into 4 runtime parts (+ 1 standalone prompt asset):
- `Next App` (`app/`, `pages/api/`, `src/`, `server/`): UI + API in one process (page + `/api/*`).
- `CLI` (`scripts/`): local scripts for generation, batch rendering, and audits.
- `Skill` (`.agents/skills/juya-news-card-operator/SKILL.md`): workflow constraints for agent operation.
- `Runtime Prompt` (`src/services/llm-prompt.ts`): text-to-card extraction rules used by `/api/generate`.
- `Standalone Prompt` (`claude-style-prompt.md`): not part of runtime; can be given to any AI to generate claudeStyle HTML.

## Runtime Flow

```mermaid
flowchart LR
  user[User] --> web["Next App\napp/ + src/"]
  user --> cli["CLI\nscripts/"]
  user --> agent["Agent Skill\n.agents/skills/..."]
  user --> any_ai["Any AI"]

  web -->|"DEFAULT_SYSTEM_PROMPT"| runtime_prompt["Runtime Prompt\nsrc/services/llm-prompt.ts"]
  web -->|"POST /api/generate"| llm["Upstream LLM"]
  web -->|"POST /api/render (Playwright)"| api_png["PNG (Server)"]
  web -->|"Browser export"| fe_png["PNG/SVG (Browser)"]
  web --> templates["Templates\nsrc/templates/"]

  cli -->|"optional LLM call"| llm
  cli -->|"SSR + Playwright"| cli_png["PNG (CLI)"]
  cli --> templates

  agent -->|"orchestrate workflow"| cli
  agent -->|"prompt rules"| runtime_prompt
  any_ai -->|"use claude-style-prompt.md"| standalone_prompt["Standalone Prompt\nclaude-style-prompt.md"]
  standalone_prompt --> claude_html["claudeStyle HTML"]
```

## Module Responsibilities
| Part | Inputs | Outputs |
| --- | --- | --- |
| Next App | Raw text, theme selection, global settings | API requests, browser-side PNG/SVG, server-side render PNG |
| CLI | Command args, env vars, mock data | HTML/PNG files under `output/` |
| Skill | User goal + repository context | Standardized execution path (template -> content -> render) |
| Runtime Prompt | Raw text | Markdown/JSON-like structured card content |
| Standalone Prompt | Any news/article text | Standalone claudeStyle HTML (outside project runtime) |

## Standalone Prompt Clarification
- `claude-style-prompt.md` is intentionally independent from project runtime.
- Frontend/API/CLI do not auto-load or depend on this file.
- It is a reusable prompt asset you can copy to any AI model to generate HTML matching `claudeStyle`.

## Minimal Env Strategy
- Local quick start: configure all 3 items `LLM_API_KEY`, `LLM_API_BASE_URL`, `LLM_MODEL`.
- Production hardening: set `API_BEARER_TOKEN` and `ALLOW_UNAUTHENTICATED_WRITE=false`.
