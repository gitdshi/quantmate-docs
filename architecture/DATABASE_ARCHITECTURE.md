# Database Architecture

## Overview

QuantMate uses a single MySQL instance with multiple logical databases:

1. **quantmate** - core business data (users, strategies, backtests, jobs, sync status)
2. **tushare** - raw market data from Tushare
3. **akshare** - index and trade calendar data from AkShare
4. **vnpy** - VNpy-compatible bar tables (optional sync target)

All connections share the same MySQL host/port/user/password from `.env`.

## Key Tables (Non-Exhaustive)

### quantmate
- `users`
- `strategies`
- `backtest_history`
- `jobs`
- `data_sync_status`
- `init_progress`

### tushare
- `stock_basic`
- `stock_daily`
- `adj_factor`
- `daily_basic`
- `stock_dividend`
- `top10_holders`
- `ingest_audit`

### akshare
- `index_daily`
- `trade_cal`

### vnpy
- `dbbardata`
- `dbbaroverview`

## Environment Variables

See `development/ENV_VARIABLES_REFERENCE.md`. Relevant DB vars:

```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=...
QUANTMATE_DB=quantmate   # optional override
TUSHARE_DB=tushare         # optional override
```

`akshare` and `vnpy` database names are fixed by init scripts.

## Initialization

Schemas live under `quantmate/mysql/init/` and are applied by:

```bash
cd quantmate
./scripts/datasync_service.sh init
```

This initializes schemas and loads recent data; it is safe to re-run and will resume if interrupted.
