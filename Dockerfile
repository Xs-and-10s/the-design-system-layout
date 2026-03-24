# ── Build stage ───────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

# bun.lock is the text-format lockfile (Bun >= 1.2); bun.lockb is legacy binary
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist/ /usr/share/nginx/html/dist/
COPY pages/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["/bin/sh", "-c", \
  "envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /tmp/default.conf \
   && mv /tmp/default.conf /etc/nginx/conf.d/default.conf \
   && nginx -g 'daemon off;'"]
