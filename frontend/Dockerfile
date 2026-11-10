# ==========================================
# Brainfy Frontend Dockerfile (Multi-stage)
# ==========================================

# Step 1: Build the React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm directly
RUN npm install -g pnpm@9

# Build-time API base URL (defaults to /api which matches Nginx reverse proxy)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm run build

# Step 2: Serve using lightweight Nginx Alpine
FROM nginx:1.27-alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Built-in Alpine wget healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
