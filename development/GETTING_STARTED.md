# Getting Started ¡ª QuantMate

Quick setup for local development.

## Prerequisites

- Docker + Docker Compose (for MySQL/Redis only)
- Python 3.11+
- Node.js 18+

## Backend (API)

1) Copy env template

```bash
cd QuantMate
cp .env.example .env
# Set at least MYSQL_PASSWORD, SECRET_KEY, and TUSHARE_TOKEN
```

2) Start MySQL + Redis

```bash
docker compose -f docker-compose.dev.yml up -d mysql redis
```

3) Install deps + run API

```bash
python -m venv .venv
# Windows PowerShell:
. .venv/Scripts/activate
# WSL/Linux:
source .venv/bin/activate
pip install -r requirements.txt

./scripts/api_service.sh start
# or
python -m uvicorn app.api.main:app --reload
```

4) Initialize market data (optional, resumable)

```bash
./scripts/datasync_service.sh init
```

## Frontend (Portal)

```bash
cd ../QuantMate-portal
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend: http://localhost:5173
Backend: http://localhost:8000

First login uses the admin account and requires a password change.

## Testing

- Backend tests: `testing/TESTING.md`
- Frontend test summary: `development/frontend/TEST_SUMMARY.md`
- E2E tests: `development/frontend/E2E_README.md`

