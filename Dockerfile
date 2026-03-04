# ============================================================================
# CAPTHCA land — Production Dockerfile
# Compatible with GCP Cloud Run (stateless, 0.0.0.0 binding, PORT env var)
# ============================================================================

# --- Base ---
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY dashboard/ .
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time variables (NEXT_PUBLIC_* must be ARGs, not runtime ENV)
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV USE_MEMORY_STORE=true

RUN npm run build

# --- Production runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime secrets (injected by Secret Manager, NOT baked into image):
#   CAPTHCA_LAND_AUTH_SECRET  -> env var (session signing key)

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone server + minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Cloud Run injects PORT (default 8080)
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
