# Contributing

## Development Setup
1. Install dependencies: `npm install`
2. Copy env template: `cp .env.example .env.local`
3. Fill in server-side LLM settings (at least `LLM_API_KEY`)
4. Start backend API: `npm run render-api`
5. Start frontend dev server: `npm run dev`

## Quality Checks
- Type check: `npm run typecheck`
- Build check: `npm run build`
- Full check: `npm run check`
- Theme contract audit: `npm run audit-themes`
- Runtime layout risk audit: `npm run audit-themes:runtime`

## Pull Request Notes
- Keep changes focused and small.
- If adding templates, update related metadata and ensure rendering passes locally.
- Do not commit secrets or local env files.
- Keep docs and `.env.example` in sync when adding/removing config.
- Frontend code lives in `src/`; runtime render service lives in `server/`.
