FROM node:20-bookworm-slim AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder

WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=0.0.0.0 \
  CHROMIUM_NO_SANDBOX=true

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

RUN npm ci --omit=dev \
  && npx playwright install --with-deps chromium-headless-shell \
  && npm cache clean --force

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1));"

CMD ["npm", "run", "start"]
