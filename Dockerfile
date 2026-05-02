# ---- Build stage --------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile || pnpm install

# Copy source
COPY backend ./backend
COPY frontend ./frontend

# ---- Runtime stage ------------------------------------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy from builder
COPY --from=builder /app /app

# Drop privileges
USER node

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "--filter", "backend", "start"]
