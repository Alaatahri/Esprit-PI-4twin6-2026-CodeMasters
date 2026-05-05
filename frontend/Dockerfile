############################
# Stage 1: deps
############################
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

############################
# Stage 2: builder
############################
FROM deps AS builder

WORKDIR /app

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

############################
# Stage 3: runner
############################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
