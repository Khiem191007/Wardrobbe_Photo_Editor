# Frontend

Vanilla HTML/CSS/JS UI for Lumen — no framework, no build step.

## Structure

```
frontend/
├── public/             # What gets served
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── serve.js            # Tiny dev server (proxies /api → backend)
└── package.json
```

## Development

The frontend is served by the **backend** in production (Express handles `/` and proxies `/api/*` to itself). For development you can either:

**Option A — Use the backend as the static server (simplest):**
```bash
cd ../backend && pnpm dev
# Open http://localhost:3000
```

**Option B — Run the standalone dev server with API proxy:**
```bash
pnpm dev
# Open http://localhost:5173 (proxies /api → :3000)
```

Use Option B if you want hot-reload-like workflow with the frontend on its own port.

## Design system

All design tokens are CSS variables at the top of `public/styles.css`:

- **Palette** — warm off-white (`--bg`), deep ink (`--ink`), terracotta accent (`--accent`)
- **Type** — Fraunces (display) + Inter Tight (body)
- **Radii / shadows** — `--radius`, `--shadow-*`
