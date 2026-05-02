# Backend

Express server that accepts image uploads, builds prompts for each operation, and forwards them to Google's Gemini API (`gemini-2.5-flash-image`).

## Files

- `src/index.js` — Express server bootstrap, middleware, static file serving
- `src/routes.js` — `/api/edit` and `/api/health` route handlers
- `src/prompts.js` — Prompt builders for each operation (filter, clothes, background, object)

## Setup

```bash
cp .env.example .env
# Edit .env and paste your Gemini API key
pnpm install
pnpm dev
```

## API

### `POST /api/edit`

**Form fields:**

| Field       | Type   | Description                                       |
| ----------- | ------ | ------------------------------------------------- |
| `image`     | File   | PNG, JPEG, or WebP — up to 12 MB                  |
| `operation` | String | One of: `filter`, `clothes`, `background`, `object` |
| `params`    | JSON   | Operation-specific parameters (see below)         |

**Params shape:**

```jsonc
// filter
{ "filter": "vintage" | "bw" | "cinematic" | "warm" | "cool" | "dramatic" }

// clothes / background
{ "description": "a navy linen suit" }

// object
{ "description": "a pair of sunglasses", "action": "add" | "remove" }
```

**Response:**

```json
{
  "image": "data:image/png;base64,...",
  "operation": "filter"
}
```

### `GET /api/health`

Returns `{ "ok": true, "model": "gemini-2.5-flash-image" }`.
