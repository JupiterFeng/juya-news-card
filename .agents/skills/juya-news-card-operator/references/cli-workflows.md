# CLI Workflows

## 1) Install runtime

```bash
npm install
npx playwright install chromium-headless-shell
```

## 2) List SSR-ready templates

```bash
node --import tsx .agents/skills/juya-news-card-operator/scripts/render_from_content_local.ts --list-themes
```

## 3) AI-generated content -> PNG

The AI running this skill must generate card content itself, then save JSON:

```json
{
  "mainTitle": "AI 与自动化效率提升",
  "cards": [
    {
      "title": "核心变化",
      "desc": "团队将重复工作自动化，交付节奏明显提升。",
      "icon": "auto_awesome"
    },
    {
      "title": "落地方式",
      "desc": "以脚本和模板固化流程，减少人工操作分歧。",
      "icon": "build"
    }
  ]
}
```

Render:

```bash
node --import tsx .agents/skills/juya-news-card-operator/scripts/render_from_content_local.ts \
  --content-file /tmp/card.json \
  --output /tmp/card.png \
  --template claudeStyle \
  --dpr 1
```

## 4) Minimal troubleshooting

- `Unknown templateId` or `Template not SSR-ready`: run `--list-themes` and pick a listed template.
- `cards must be array with length 1..8`: validate content JSON shape.
- Playwright launch failure: rerun `npx playwright install chromium-headless-shell`.
