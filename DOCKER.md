# 🐳 Brainfy – Docker & CI/CD Documentation

This guide covers how to run **Brainfy** locally and in production using Docker & Docker Compose, as well as details on the automated GitHub Actions CI/CD pipeline.

---

## 🏗️ Architecture Overview

The containerized stack consists of 3 isolated services on an internal bridge network:

```
[ Browser / Client ]
         │
         ▼ (Port 3000)
┌──────────────────────────────────────────────────┐
│              frontend (Nginx Alpine)             │
│   • Serves React 19 SPA (Optimized production)   │
│   • Gzip compression & security headers          │
│   • Reverse proxy: /api/* -> backend:5000/api/*  │
└─────────────────────────┬────────────────────────┘
                          │ (Internal Docker Network)
                          ▼
┌──────────────────────────────────────────────────┐
│           backend (Node.js 20 Alpine)            │
│   • Express REST API                             │
│   • JWT Auth + Bearer / Cookie dual-strategy     │
│   • Runs non-root (`node` user)                  │
│   • Health check: /api/health                    │
└─────────────────────────┬────────────────────────┘
                          │ (Internal Docker Network)
                          ▼
┌──────────────────────────────────────────────────┐
│               mongodb (Mongo 7.0)                │
│   • Persistent volume: mongodb_data              │
│   • Health check: mongosh ping                   │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start with Docker Compose

### 1. Prerequisites
Ensure Docker Desktop is open and running on your system.

### 2. Build & Run
Run the entire stack in detached mode:
```powershell
cd d:\Brainfy
docker-compose up --build -d
```

### 3. Access the Application
- **Frontend SPA**: [http://localhost:3000](http://localhost:3000)
- **Backend API Direct**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB Host Port**: `localhost:27018` (Mapped to 27018 so it doesn't conflict with any local MongoDB on 27017)

---

## 🛠️ Common Docker Commands

### Check Service Status and Health
```powershell
docker-compose ps
```
All 3 containers will display status `(healthy)`.

### View Live Logs
```powershell
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend Nginx only
docker-compose logs -f frontend
```

### Stop the Containers
```powershell
# Stop containers without losing database data
docker-compose down

# Stop and wipe database volume (clean slate)
docker-compose down -v
```

### Rebuild After Code Changes
```powershell
docker-compose up -d --build
```

---

## 🔄 GitHub Actions CI/CD Pipeline

The automated pipeline is defined in [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml) and runs on every push and pull request to `main`/`master`:

1. **`backend-ci`**:
   - Provisions a real MongoDB 7.0 service container.
   - Installs dependencies using `pnpm` with frozen lockfile.
   - Spins up the Express server and executes the 51-assertion automated integration test suite (`test-api.mjs`).
2. **`frontend-ci`**:
   - Validates React 19 dependencies and executes Vite production build (`pnpm run build`).
   - Verifies all chunks and assets bundle cleanly.
   - Stores the build artifacts.
3. **`docker-verify`**:
   - Validates `docker-compose.yml` syntax.
   - Builds both production Docker images (`brainfy-backend` and `brainfy-frontend`) using Docker Buildx with GitHub Actions caching.
