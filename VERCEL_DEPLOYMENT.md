# Vercel Deployment Guide — AIVOA.AI Root Cause Analysis (RCA) Platform

This repository is configured for full-stack deployment on **Vercel**:
- **Frontend:** React + Vite Single Page Application (SPA), compiled into `frontend/dist`.
- **Backend:** Python FastAPI Serverless Functions executed via `@vercel/python` in `api/index.py`.

---

## 1. Quick Deploy via Vercel Web Dashboard (Recommended)

### Step 1: Push Repository to GitHub
Ensure your repository is pushed to GitHub:
```bash
git init
git add .
git commit -m "feat: AIVOA RCA platform with Vercel deployment config"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
*(Note: `.gitignore` and `.vercelignore` automatically exclude node_modules, virtual environments, local databases, and large media files).*

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** ➔ **"Project"**.
3. Import your GitHub repository.
4. Leave **Root Directory** as `./` (default).
5. Vercel will automatically read `vercel.json` and `package.json`.

### Step 3: Configure Environment Variables
In the Vercel Project Settings, expand **"Environment Variables"** and add:

| Variable Name | Value | Purpose |
|---|---|---|
| `GROQ_API_KEY` | `<your-groq-api-key>` | Live Groq Cloud LLM API inference |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Primary high-capability reasoning model |
| `GROQ_FALLBACK_MODEL` | `openai/gpt-oss-20b` | High-speed fallback model |
| `DATABASE_URL` | *(Optional)* | Default uses serverless `/tmp/aivoa_rca.db`. For persistent multi-user production, provide PostgreSQL connection string (e.g. Neon, Supabase, Vercel Postgres). |

### Step 4: Click "Deploy"
Vercel will:
1. Run `buildCommand`: `cd frontend && npm install && npm run build`.
2. Output static assets to `frontend/dist`.
3. Provision the Python Serverless Function from `api/index.py`.
4. Provide a live production URL (e.g., `https://aivoa-rca-platform.vercel.app`).

---

## 2. Deploy via Vercel CLI

If you prefer deploying directly from your command line:

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy to Preview
vercel

# 4. Deploy to Production
vercel --prod
```

When prompted:
- **Set up and deploy?** [Y]
- **Which scope?** (Select your account)
- **Link to existing project?** [N]
- **What's your project's name?** `aivoa-rca-platform`
- **In which directory is your code located?** `./`

---

## 3. How the Vercel Architecture Operates

### Directory & File Roles

```
aivoa.ai/
├── api/
│   └── index.py            # Vercel Serverless Function entrypoint (exposes FastAPI app)
├── backend/                # Full Python FastAPI application package
│   ├── app/
│   │   ├── main.py         # App definitions, router mounts & dual-prefix routing
│   │   ├── ai/             # LangGraph 10-node workflow & Groq client
│   │   ├── models/         # SQLAlchemy 2.0 ORM models
│   │   └── services/       # Copilot engine & seed service
├── frontend/               # React 18.3 + Redux Toolkit + Tailwind CSS + Vite
│   ├── src/
│   ├── dist/               # Production build output
│   └── package.json
├── vercel.json             # Vercel build & serverless rewrite configuration
├── package.json            # Root build orchestration script
├── requirements.txt        # Python dependencies installed by Vercel Lambda builder
├── .vercelignore           # Excludes heavy local files & virtual environments
└── .gitignore
```

### Serverless Routing (`vercel.json`)
- Requests to `/api/(.*)` rewrite to `/api/index.py`.
- Requests to static assets and frontend paths rewrite to `/index.html` (Vite SPA).
- Both `/api/investigations` and `/investigations` route cleanly to backend handlers.

### Serverless Database & Filesystem Compatibility
- On Vercel, the lambda environment `/var/task` is read-only.
- The platform automatically detects `VERCEL=1` and directs SQLite to `/tmp/aivoa_rca.db` and uploaded documents to `/tmp/uploads`.
- Cold-start database initialization is executed idempotently via `ensure_database_initialized()`.

---

## 4. Verification

After deployment:
- Health check: `https://<your-project>.vercel.app/api/health`
- Copilot Triage Workspace: `https://<your-project>.vercel.app/investigations/new`
- Investigation Dashboard: `https://<your-project>.vercel.app/`
- Interactive Swagger Docs: `https://<your-project>.vercel.app/docs`
