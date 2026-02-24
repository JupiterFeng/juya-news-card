# API Contracts (Optional Fallback)

## Overview

Service file: `server/render-api.ts`

- Base URL default: `http://127.0.0.1:8080`
- Protected write API: `POST /render` (and aliases)
- Read APIs: `GET /healthz`, `GET /themes`
- Use this only when local CLI rendering is not suitable

## Auth

`POST /render` requires:

- `Authorization: Bearer <API_BEARER_TOKEN>`, unless server is started with `ALLOW_UNAUTHENTICATED_WRITE=true`

## `GET /healthz`

Purpose: readiness and queue visibility.

Example:

```bash
curl http://127.0.0.1:8080/healthz
```

## `GET /themes`

Purpose: list SSR-ready templates accepted by `/render`.

Example:

```bash
curl http://127.0.0.1:8080/themes
```

## `POST /render`

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
- Includes headers like `X-Template-Id`, `X-DPR`, `X-Request-Id`

## Common error codes

- `400 INVALID_JSON` or `INVALID_REQUEST`
- `401 UNAUTHORIZED`
- `403 CORS_FORBIDDEN`
- `429 RATE_LIMITED` or `QUEUE_FULL`
- `500 RENDER_FAILED`

## Optional endpoint

`POST /api/generate` exists, but this skill's default mode is AI-side content generation followed by `/render`.
