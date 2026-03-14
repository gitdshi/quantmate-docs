# Environment Variables Reference

This guide covers backend (API + DataSync) and frontend (portal) environment variables.

Backend variables are loaded from `quantmate/.env` via `app.infrastructure.config.config.Settings`.
Frontend variables are injected by Vite and must use the `VITE_` prefix.

## Backend (quantmate)

### Core

| Variable | Required | Default | Notes |
|---|---|---|---|
| `APP_NAME` | No | `QuantMate API` | API title (optional) |
| `APP_VERSION` | No | `1.0.0` | API version (optional) |
| `DEBUG` | No | `false` | Enable debug mode |

### MySQL

| Variable | Required | Default | Notes |
|---|---|---|---|
| `MYSQL_HOST` | No | `127.0.0.1` | Use `mysql` in Docker network |
| `MYSQL_PORT` | No | `3306` |  |
| `MYSQL_USER` | No | `root` |  |
| `MYSQL_PASSWORD` | Yes | - |  |
| `QUANTMATE_DB` | No | `quantmate` | Optional override |
| `TUSHARE_DB` | No | `tushare` | Optional override |
| `TUSHARE_TOKEN` | Optional | - | Required for Tushare ingest |

### Redis

| Variable | Required | Default | Notes |
|---|---|---|---|
| `REDIS_HOST` | No | `127.0.0.1` |  |
| `REDIS_PORT` | No | `6379` |  |
| `REDIS_DB` | No | `0` |  |

### JWT

| Variable | Required | Default | Notes |
|---|---|---|---|
| `SECRET_KEY` | Yes | - | JWT signing secret |
| `ALGORITHM` | No | `HS256` |  |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | Access token TTL (minutes) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token TTL (days) |

### Admin Bootstrap

Used on API startup (see `app/api/main.py`).

| Variable | Required (prod) | Default | Notes |
|---|---|---|---|
| `ADMIN_USERNAME` | No | `admin` |  |
| `ADMIN_EMAIL` | No | `admin@quantmate.local` |  |
| `ADMIN_PASSWORD` | Yes in prod | - | If missing in dev, a random password is generated |

### CORS

| Variable | Required | Default | Notes |
|---|---|---|---|
| `CORS_ORIGINS` | No | `[...]` | JSON array string |

Example:

```bash
CORS_ORIGINS='["http://localhost:5173","http://localhost:3000"]'
```

## DataSync (daemon + init)

### Daemon schedule and backfill

| Variable | Default | Notes |
|---|---|---|
| `SYNC_HOUR` | `2` | Daily sync hour (Asia/Shanghai) |
| `SYNC_MINUTE` | `0` | Daily sync minute |
| `BACKFILL_INTERVAL_HOURS` | `6` | Backfill interval |
| `BACKFILL_DAYS` | `30` | Backfill lookback window |
| `LOOKBACK_DAYS` | `60` | Generic lookback |
| `BATCH_SIZE` | `100` | Batch size |
| `MAX_RETRIES` | `3` | Retry count |
| `DRY_RUN` | `0` | `1` = do not write to DB |

### Tushare rate limits

| Variable | Default | Notes |
|---|---|---|
| `TUSHARE_CALLS_PER_MIN` | `50` | Global calls/min limit |
| `TUSHARE_RATE_<api>` | - | Per-endpoint override (e.g. `TUSHARE_RATE_daily=60`) |

### Init (datasync_service.sh init)

| Variable | Default | Notes |
|---|---|---|
| `INIT_START_DATE` | `today - 365d` | Backfill start date |
| `INIT_DAILY_START_DATE` | `INIT_START_DATE` | Daily ingest start |
| `INIT_DAILY_LOOKBACK_DAYS` | - | Alternative to `INIT_DAILY_START_DATE` |
| `INIT_LOOKBACK_YEARS` | `1` | Years for sync-status init |
| `INIT_LOOKBACK_DAYS` | `365` | Backfill days for daemon init |
| `INIT_SKIP_SCHEMA` | `0` | Skip schema init |
| `INIT_SKIP_AUX` | `0` | Skip adj/dividend/top10 |
| `INIT_SKIP_VNPY` | `0` | Skip vnpy sync |
| `INIT_RESET_PROGRESS` | `0` | Reset checkpoint |

## Frontend (quantmate-portal)

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_URL` | `/api` | Proxy target in dev (Vite) |
