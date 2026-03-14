# Development Guide

Scope: local development with Docker used only for MySQL + Redis. The Python API and React portal run on the host for fast iteration.

## Prerequisites

- Git 2.40+
- Docker + Docker Compose v2
- Python 3.11+
- Node.js 18+

## Repo Layout

Expected layout (sibling repos):

- `QuantMate/quantmate`
- `QuantMate/quantmate-portal`
- `QuantMate/quantmate-docs`

## Quick Start (Local)

1) Configure environment

```bash
cd quantmate
cp .env.example .env
```

Edit `.env` with your MySQL password, JWT secret, and Tushare token (optional). See `development/ENV_VARIABLES_REFERENCE.md` for the full list.

2) Start MySQL + Redis via dev compose

```bash
cd quantmate
docker compose -f docker-compose.dev.yml up -d mysql redis
```

Data volumes are mounted to `quantmate/.data` for easy reset.

3) Create Python venv + install deps

```bash
cd quantmate
python -m venv .venv
# Windows PowerShell:
. .venv/Scripts/activate
# WSL/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

4) Initialize database + recent data (idempotent)

```bash
cd quantmate
./scripts/datasync_service.sh init
```

Notes:
- Initializes MySQL schemas for `quantmate`, `tushare`, `akshare`, and `vnpy`.
- Loads the most recent year of data by default.
- If initialization already completed, it skips.
- If it was interrupted, it resumes from the last checkpoint automatically.

5) Start API

```bash
cd quantmate
./scripts/api_service.sh start
```

6) Start portal (React)

```bash
cd quantmate-portal
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

7) Verify

```bash
curl -s http://localhost:8000/health
curl -s http://localhost:8000/docs | head -20
curl -s http://localhost:5173 | head -20
```

## Auth Notes

- The first admin login requires a password change. The portal will redirect to a Change Password flow if `must_change_password=true` is returned by `/api/auth/login`.

## Logs

- API logs: `quantmate/logs/`
- Data sync logs: `quantmate/logs/data_sync.out`

## Related Docs

- `development/GETTING_STARTED.md`
- `development/ENV_VARIABLES_REFERENCE.md`
- `development/TROUBLESHOOTING.md`
