# Brainfy – Complete Deployment Guide (Vercel + Railway)

This guide covers deploying the **Brainfy** stack with zero cost on free tiers:
- **Frontend**: [Vercel](https://vercel.com) (Free Hobby Tier, Global CDN, SSL)
- **Backend**: [Railway](https://railway.app) (Free Starter / Trial Tier)
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com) (Forever-Free M0 Sandbox) OR Railway Managed MongoDB

---

## Architecture Overview

```
┌─────────────────────────────────┐
│     Vercel (React 19 Frontend)   │
│   https://brainfy.vercel.app    │
└────────────────┬────────────────┘
                 │ (HTTPS REST API / Authorization Bearer + Cookie)
                 ▼
┌─────────────────────────────────┐
│    Railway (Express.js Backend)  │
│  https://brainfy-api.railway.app│
└────────────────┬────────────────┘
                 │ (Mongoose Driver)
                 ▼
┌─────────────────────────────────┐
│ MongoDB (Atlas M0 or Railway DB) │
└─────────────────────────────────┘
```

---

## Pre-Flight Checklist

Before deploying, ensure you have:
1. A **GitHub account** with this repository pushed.
2. A free account on **[Railway](https://railway.app)** (Login with GitHub).
3. A free account on **[Vercel](https://vercel.com)** (Login with GitHub).
4. A free **[MongoDB Atlas](https://cloud.mongodb.com)** cluster (Recommended for permanent free hosting).

---

## Step 1: Push Code to GitHub

If you haven't pushed your project to GitHub yet:

```bash
git init
git add .
git commit -m "feat: ready for Railway and Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/brainfy.git
git push -u origin main
```

---

## Step 2: Set Up Free MongoDB Database

### Option A: MongoDB Atlas (Recommended for 100% Free Forever)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free **M0 Sandbox** cluster.
2. Under **Security > Network Access**, click **Add IP Address** > choose **Allow Access From Anywhere** (`0.0.0.0/0`).
3. Under **Security > Database Access**, create a database user (e.g., `brainfy_admin`) with a secure password.
4. Click **Connect** > **Drivers** (Node.js) and copy your connection string:
   ```
   mongodb+srv://brainfy_admin:<password>@cluster0.xxxxx.mongodb.net/brainfy?retryWrites=true&w=majority
   ```
   *(Remember to replace `<password>` with your actual password and specify database name `brainfy`)*.

### Option B: Railway MongoDB Plugin
1. In Railway, click **New Project** or **+ New** inside your project canvas.
2. Select **Database** > **Add MongoDB**.
3. Railway will provision a MongoDB container and provide a `MONGO_URL` variable.

---

## Step 3: Deploy Backend on Railway

1. Go to **[Railway Dashboard](https://railway.app/dashboard)** and click **New Project**.
2. Select **Deploy from GitHub repo** and choose your `brainfy` repository.
3. Click on the newly created service card:
   - Go to **Settings**:
     - Under **Source Directory / Root Directory**, click **Edit** and enter:
       ```
       backend
       ```
       *(This ensures Railway builds and runs only the backend folder)*.
   - Go to **Variables** tab and click **Raw Editor** or **Add Variable**:
     | Variable | Recommended Value | Notes |
     | :--- | :--- | :--- |
     | `NODE_ENV` | `production` | Enables production optimizations |
     | `PORT` | `5000` | Railway will route traffic dynamically |
     | `MONGO_URI` | `mongodb+srv://...` | Connection string from Step 2 |
     | `JWT_SECRET` | `brainfy_production_super_secret_key_32chars` | Secure random string |
     | `JWT_EXPIRES_IN` | `1d` | Token validity |
     | `CLIENT_URL` | `https://*.vercel.app` (or your exact Vercel URL) | Allowed CORS origins |
4. Generate a public URL:
   - Go to **Settings** > **Networking** > **Public Networking**.
   - Click **Generate Domain**.
   - You will receive a URL such as:
     `https://brainfy-production.up.railway.app`
5. Test your backend health:
   - Open in your browser: `https://your-backend.up.railway.app/api/health`
   - You should see:
     ```json
     {
       "statusCode": 200,
       "data": { "status": "ok", "environment": "production" },
       "message": "Brainfy API is operational",
       "success": true
     }
     ```

---

## Step 4: Deploy Frontend on Vercel

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)** and click **Add New...** > **Project**.
2. Select your `brainfy` repository and click **Import**.
3. Configure the project:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: Click **Edit** and choose `frontend`
   - **Build Command**: `pnpm run build` or `npm run build` (auto-configured)
   - **Output Directory**: `dist` (auto-configured)
4. Add Environment Variable:
   - Click **Environment Variables**:
     - Key: `VITE_API_BASE_URL`
     - Value: `https://brainfy-production.up.railway.app/api`
     *(⚠️ Important: Ensure `/api` is included at the end and no trailing slash)*.
5. Click **Deploy**.
   - Vercel will build the frontend in ~20-30 seconds.
   - Your live site: `https://fe-brainfy.vercel.app`.

---

## Step 5: Final Check & Polish

1. In your **Railway backend**, go to **Variables** and verify `CLIENT_URL` is set to your live Vercel URL:
   ```
   CLIENT_URL=https://fe-brainfy.vercel.app
   ```
   *(Note: The Brainfy backend automatically accepts all `*.vercel.app` domains out of the box).*
2. Open your live Vercel URL in your browser:
   - Create a new account (`/register`).
   - Add your first link.
   - Test platform auto-detection (YouTube, GitHub, etc.).
   - Test search with the `/` shortcut and theme toggling.

---

## Troubleshooting

- **CORS Error on Frontend**:
  Check that `VITE_API_BASE_URL` on Vercel points to `https://<railway-domain>/api` (with `/api`) and `CLIENT_URL` in Railway matches your Vercel URL.
- **404 on Page Refresh on Vercel**:
  `frontend/vercel.json` contains SPA rewrite rules so client-side routing (`/dashboard`, `/login`) never returns 404.
- **Database Connection Timeout**:
  If using MongoDB Atlas, ensure **Network Access** has IP `0.0.0.0/0` (Allow from anywhere) enabled.

