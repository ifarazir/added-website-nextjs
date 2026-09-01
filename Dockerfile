# syntax=docker/dockerfile:1

# Next.js standalone build. Migrations are NOT run here — run them as a
# separate step against the target database before rolling the image out.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* is inlined at build time, so it has to be present here.
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Uploads live outside public/ so they can be a mounted volume.
ENV UPLOAD_DIR=/data/uploads

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 \
 && mkdir -p /data/uploads \
 && chown -R nextjs:nodejs /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
VOLUME ["/data/uploads"]

CMD ["node", "server.js"]
