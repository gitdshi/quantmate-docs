# Environment Setup (Local Dev)

This guide matches the current codebase: Docker is used only for MySQL/Redis, while the API and portal run locally.

## Prerequisites

- Git 2.40+
- Docker + Docker Compose v2
- Python 3.11+
- Node.js 18+

## Backend (API + DB)

1) Configure environment

```bash
cd quantmate
cp .env.example .env
```

Set at least:

```bash
MYSQL_PASSWORD=YourDevPassword123!@#
SECRET_KEY=$(openssl rand -hex 32)
TUSHARE_TOKEN=your-tushare-token
```

2) Start MySQL + Redis

```bash
docker compose -f docker-compose.dev.yml up -d mysql redis
docker compose -f docker-compose.dev.yml ps
```

Data is mounted under `quantmate/.data/`.

3) Install deps + start API

```bash
python -m venv .venv
# Windows PowerShell:
. .venv/Scripts/activate
# WSL/Linux:
source .venv/bin/activate
pip install -r requirements.txt

./scripts/api_service.sh start
```

Logs: `quantmate/logs/api.out`

4) Initialize data (idempotent/resumable)

```bash
./scripts/datasync_service.sh init
```

Logs: `quantmate/logs/data_sync.out`

## Data Migration (Optional)

If you have existing data under a previous database name, you can copy it into the new `quantmate` database without deleting the source:

```bash
cd quantmate
./scripts/migrate_db_name.sh <source_db>
```

## Frontend (Portal)

```bash
cd quantmate-portal
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Portal: http://localhost:5173
API proxy: http://localhost:8000

## Verify

```bash
curl http://localhost:8000/health
curl http://localhost:5173 | head -20
```

First login requires a password change for the admin user.

## Stop / Clean Up

```bash
./scripts/api_service.sh stop
./scripts/datasync_service.sh stop
docker compose -f docker-compose.dev.yml down
```

To remove DB data:

```bash
rm -rf quantmate/.data
```
