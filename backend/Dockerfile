# ---- Build stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove example env so it is never accidentally used
RUN rm -f .env.example

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]
