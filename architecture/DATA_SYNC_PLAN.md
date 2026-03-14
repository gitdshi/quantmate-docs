# Data Sync Daemon

## Overview

`app.datasync.service.data_sync_daemon` handles market data synchronization and backfill.

- Daily incremental sync (default 02:00 Asia/Shanghai)
- Periodic backfill to fill gaps
- Init + resume via `init_market_data.py`

## Data Sources and Targets

### AkShare
- Target DB: `akshare`
- Tables: `index_daily`, `trade_cal`

### Tushare
- Target DB: `tushare`
- Tables: `stock_basic`, `stock_daily`, `adj_factor`, `stock_dividend`, `top10_holders`, `daily_basic`

### VNpy (optional sync)
- Target DB: `vnpy`
- Tables: `dbbardata`, `dbbaroverview`

## Status Tracking

- Table: `quantmate.data_sync_status`
- Dimensions: `sync_date` + `step_name`
- Step names:
  - `akshare_index`
  - `tushare_stock_basic`
  - `tushare_stock_daily`
  - `tushare_adj_factor`
  - `tushare_dividend`
  - `tushare_top10_holders`
  - `vnpy_sync`

Trade calendar cache is stored in `akshare.trade_cal`.

## Config (Env Vars)

```bash
SYNC_HOUR=2
SYNC_MINUTE=0
BACKFILL_INTERVAL_HOURS=6
BACKFILL_DAYS=30
LOOKBACK_DAYS=60
BATCH_SIZE=100
MAX_RETRIES=3
TUSHARE_CALLS_PER_MIN=50
```

## Init + Resume

```bash
cd quantmate
./scripts/datasync_service.sh init
```

Init defaults to the most recent year. Override with:

```bash
INIT_START_DATE=YYYY-MM-DD
INIT_DAILY_START_DATE=YYYY-MM-DD
INIT_DAILY_LOOKBACK_DAYS=365
INIT_LOOKBACK_YEARS=1
INIT_LOOKBACK_DAYS=365
INIT_RESET_PROGRESS=1
```

## Service Control

```bash
./scripts/datasync_service.sh start
./scripts/datasync_service.sh stop
./scripts/datasync_service.sh status
```
