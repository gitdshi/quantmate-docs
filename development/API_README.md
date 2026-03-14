# QuantMate API

FastAPI-based REST API for the QuantMate platform.

## Features

- JWT authentication
- Strategy CRUD + validation + code history
- Backtesting (single + batch)
- Market data access (symbols/history/indicators/overview)
- Job queue APIs (Redis/RQ-backed)
- Data sync status endpoint

## Local Development

1) Install deps

```bash
cd quantmate
pip install -r requirements.txt
```

2) Start MySQL + Redis (dev compose)

```bash
docker compose -f docker-compose.dev.yml up -d mysql redis
```

3) Run the API

```bash
./scripts/api_service.sh start
# or
python -m uvicorn app.api.main:app --reload
```

4) Access

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoint Index

- Authentication: `development/api/auth.md`
- Strategies: `development/api/strategies.md`
- Strategy Code Utilities: `development/api/strategy-code.md`
- Backtesting: `development/api/backtest.md`
- Market Data: `development/api/data.md`
- Queue & Jobs: `development/api/queue.md`
- System: `development/api/system.md`
- Optimization: `development/api/optimization.md` (not implemented)

## Configuration (.env)

Minimum required (see `development/ENV_VARIABLES_REFERENCE.md` for full list):

```bash
# core
DEBUG=true
SECRET_KEY=<generate>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# MySQL
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=<password>
QUANTMATE_DB=quantmate
TUSHARE_DB=tushare

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Data sources
TUSHARE_TOKEN=<optional>

# CORS (JSON array string)
CORS_ORIGINS='["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]'
```

## Architecture (API Scope)

```
app/api/
  main.py              # FastAPI app entry point
  models/              # Pydantic models
  routes/              # API endpoints
  services/            # API helpers

app/infrastructure/
  config/              # Settings (env loading)
  db/                  # DB connections
```

## Notes

- Dev compose only provisions MySQL + Redis. API and portal run locally.
- The `optimization` API does not exist in the current codebase.
