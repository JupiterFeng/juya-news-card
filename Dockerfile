FROM node:20-bookworm-slim

WORKDIR /app

# render-api defaults (can be overridden in env file / runtime env)
ENV NODE_ENV=production \
  RENDER_API_HOST=0.0.0.0 \
  RENDER_API_PORT=8080 \
  CHROMIUM_NO_SANDBOX=true

COPY package.json package-lock.json ./

# Keep devDependencies because render-api runs TS directly via tsx.
RUN npm ci \
  && npx playwright install --with-deps chromium-headless-shell \
  && npm cache clean --force

COPY . .

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.RENDER_API_PORT || 8080) + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1));"

CMD ["npm", "run", "render-api"]
