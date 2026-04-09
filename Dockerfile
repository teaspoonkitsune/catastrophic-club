FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV DATABASE_URL=postgres://build:build@127.0.0.1:5432/build
ENV DATABASE_SSL=false
ENV AUTO_RUN_MIGRATIONS=false
ENV AUTH_SECRET=build-time-placeholder-secret
ENV AUTH_SESSION_TTL_SECONDS=604800
ENV KEYCLOAK_BASE_URL=http://127.0.0.1:8080
ENV KEYCLOAK_REALM=catastrophic-club
ENV KEYCLOAK_CLIENT_ID=catastrophic-club-web
ENV KEYCLOAK_CLIENT_SECRET=build-time-placeholder-secret
ENV KEYCLOAK_ADMIN_USERNAME=admin
ENV KEYCLOAK_ADMIN_PASSWORD=build-time-placeholder-secret
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS tools
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "db:migrate"]

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
