# API Contracts (Optional Fallback)

## Overview

This repo no longer runs a standalone `render-api` server. Rendering and generation APIs are provided by the Next.js app:

- Core logic: `server/next-runtime.ts`
- API routes: `pages/api/*`
- Health route: `app/healthz/route.ts`

Default base URL: `http://127.0.0.1:3000`

Use this only when local CLI rendering is not suitable.

## Auth

Write endpoints require a bearer token unless `ALLOW_UNAUTHENTICATED_WRITE=true` (default when `NODE_ENV !== 'production'`):

- `POST /api/render`
- `POST /api/generate`

Header:

- `Authorization: Bearer <API_BEARER_TOKEN>`

## `GET /healthz` / `GET /api/healthz`

Purpose: readiness.

Examples:

```bash
curl http://127.0.0.1:3000/healthz
curl http://127.0.0.1:3000/api/healthz
```

## `GET /api/themes`

Purpose: list SSR-ready templates accepted by `/api/render`.

Example:

```bash
curl http://127.0.0.1:3000/api/themes
```

## `GET /api/config`

Purpose: return public backend config (LLM runtime config without secrets).

Example:

```bash
curl http://127.0.0.1:3000/api/config
```

## `POST /api/generate`

Extract structured `{ mainTitle, cards[] }` from raw news text.

Request JSON:

```json
{
  "inputText": "string"
}
```

Response JSON:

```json
{
  "data": {
    "mainTitle": "string",
    "cards": [
      { "title": "string", "desc": "string", "icon": "article" }
    ]
  }
}
```

## `POST /api/render`

Render structured card content into PNG.

Request JSON:

```json
{
  "templateId": "claudeStyle",
  "mainTitle": "string",
  "cards": [
    { "title": "string", "desc": "string", "icon": "article" }
  ],
  "dpr": 1
}
```

Rules:

- `templateId`: must exist and be `ssrReady`.
- `mainTitle`: required.
- `cards`: required, length `1..8`.
- Each card: `title`, `desc`, `icon` required.
- `dpr`: `1` or `2` (default `1`).

Response:

- `200 image/png` on success

## Notes

- Server-side CORS / rate limiting is not implemented in the Next API layer. If you need them, put the app behind a gateway (Nginx/Caddy/Cloudflare) and enforce policies there.
