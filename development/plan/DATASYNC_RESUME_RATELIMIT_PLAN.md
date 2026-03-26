# DataSync Init/Resume and Rate Limit Behavior

This document describes the current behavior implemented in `QuantMate/scripts/init_market_data.py` and `app/datasync/service/data_sync_daemon.py`. It is not a proposal; it reflects the live code.

## Scope

- Initial data bootstrap (`datasync_service.sh init` -> `init_market_data.py`)
- Resume-on-interruption using checkpoints in MySQL
- Tushare API adaptive retry/backoff with per-endpoint rate limits

## Init Resume (Checkpointing)

### Tables

- `QuantMate.init_progress` tracks init steps and cursor positions.
- `QuantMate.data_sync_status` tracks per-step sync status for normal daemon runs.

### Behavior

- `--resume` is enabled by default. If a previous run is incomplete, init resumes from the last checkpoint.
- `--reset-progress` clears `init_progress` and starts from scratch.
- Checkpoints are stored by step, with cursor values such as `ts_code` and `trade_date`.

### Entry Point

```bash
cd QuantMate
./scripts/datasync_service.sh init
```

This script:
- Ensures schema initialization for `QuantMate`, `tushare`, `akshare`, and `vnpy`.
- Runs init for the most recent year of data by default.
- Resumes automatically if previous runs were interrupted.

## Rate Limiting (Tushare)

Rate limiting is implemented in `app/datasync/service/tushare_ingest.py` via `call_pro()`.

### Key Mechanics

- Per-endpoint call spacing enforced by `_min_interval_for(api_name)`.
- Adaptive retries for transient errors and explicit Tushare rate-limit messages.
- If a retry delay is parsable (e.g., ¡°retry after 10 seconds¡±), the code sleeps that duration plus jitter.
- Otherwise it uses exponential backoff (default base 5s).

### Env Controls

- `TUSHARE_CALLS_PER_MIN` (global default, default 50)
- `TUSHARE_RATE_<endpoint>` (per-endpoint overrides, e.g. `TUSHARE_RATE_daily=60`)
- `MAX_RETRIES` (default 3)

## Operational Notes

- The daemon can be run with `--daily`, `--backfill`, or `--daemon` modes.
- Backfill uses a DB lock (`data_sync_status`) to avoid concurrent runs.
- Trade calendar is cached in `akshare.trade_cal` when available.

## Related Files

- `QuantMate/scripts/init_market_data.py`
- `QuantMate/app/datasync/service/data_sync_daemon.py`
- `QuantMate/app/datasync/service/tushare_ingest.py`
- `QuantMate/app/domains/extdata/dao/data_sync_status_dao.py`

