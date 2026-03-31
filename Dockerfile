FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Production image ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production artifacts
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# MCP servers run as a process, not a web server
CMD ["node", "dist/index.js"]
