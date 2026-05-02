# Wardrobe — AI Photo Editor

A clean, minimal photo-editing web app powered by Google's Gemini API. Upload a photo and apply filters, change outfits, swap backgrounds, or add/remove objects — all by describing what you want.

🌐 **Live demo:** _add your deployment URL here_

## Tech stack

- **Backend** — Node.js + Express, Gemini API (`gemini-2.5-flash-image`)
- **Frontend** — Vanilla HTML/CSS/JS, no build step
- **Tooling** — pnpm workspaces, ESLint, Prettier, Docker, Fly.io

## Project structure

```
.
├── backend/            # Express server + Gemini integration
│   ├── src/
│   │   ├── index.js
│   │   ├── routes.js
│   │   └── prompts.js
│   └── package.json
├── frontend/           # Static UI (HTML/CSS/JS)
│   ├── public/
│   ├── src/
│   └── package.json
├── .github/workflows/  # CI
├── .vscode/            # Editor settings
├── Dockerfile          # Backend container image
├── fly.toml            # Fly.io deployment config
├── eslint.config.js    # Shared ESLint config
├── .prettierrc         # Code formatting
└── pnpm-workspace.yaml # pnpm workspace config
```

## Quick start

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8 (`npm install -g pnpm`)
- A Gemini API key — free at https://aistudio.google.com/apikey

### Setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Configure the backend
cp backend/.env.example backend/.env
# Open backend/.env and paste your Gemini API key

# 3. Run backend + frontend together
pnpm dev
```

Open http://localhost:3000 in your browser.

### Run them separately

```bash
pnpm --filter backend dev      # http://localhost:3000
pnpm --filter frontend dev     # http://localhost:5173
```

## Scripts

| Command         | What it does                                  |
| --------------- | --------------------------------------------- |
| `pnpm dev`      | Run backend + frontend in parallel            |
| `pnpm lint`     | Run ESLint across all packages                |
| `pnpm format`   | Format the codebase with Prettier             |
| `pnpm build`    | Build the frontend (no-op for vanilla)        |
| `pnpm start`    | Start the backend in production mode          |

## Deployment

### Docker

```bash
docker build -t wardrobe .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key wardrobe
```

### Fly.io

```bash
fly launch --copy-config --no-deploy
fly secrets set GEMINI_API_KEY=your_key
fly deploy
```

## License

MIT — see [LICENSE](./LICENSE).
