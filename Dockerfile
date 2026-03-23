# ── Build stage ───────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies first (layer-cached unless lockfile changes)
COPY package.json package-lock.json ./
RUN bun install

# Copy source and build
COPY . .
RUN bun run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy the compiled dist/ output from the build stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy the static gallery pages
COPY pages/ /usr/share/nginx/html/

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Railway injects the PORT environment variable at runtime.
# nginx needs to listen on that port, not the hardcoded 80.
# We do a runtime substitution via the entrypoint below.
CMD ["/bin/sh", "-c", \
  "envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf \
   && cp /tmp/nginx.conf /etc/nginx/conf.d/default.conf \
   && nginx -g 'daemon off;'"]
