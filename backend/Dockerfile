# ==========================================
# Brainfy Backend Dockerfile (Node.js 20 Alpine)
# ==========================================

FROM node:20-alpine

WORKDIR /app

# Install pnpm directly
RUN npm install -g pnpm@9

# Copy package descriptors and install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY package.json ./
COPY src/ ./src/

ENV NODE_ENV=production
ENV PORT=5000

# Run as non-root user for security
USER node

EXPOSE 5000

# Native Node 20 fetch healthcheck (zero external dependencies)
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
