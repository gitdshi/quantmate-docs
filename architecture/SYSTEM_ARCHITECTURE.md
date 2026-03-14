# System Architecture

Status: Current
Last Updated: 2026-03-13

## Overview

QuantMate consists of three core components:

- **Frontend (quantmate-portal)**: React + Vite
- **Backend API (quantmate)**: FastAPI monolith
- **DataSync**: Separate process for Tushare/AkShare ingestion and VNpy sync

## High-Level Diagram

```mermaid
flowchart LR
    U[User] --> FE[Frontend (Vite/React)]
    FE --> API[Backend API (FastAPI)]

    API --> MYSQL[(MySQL)]
    API --> REDIS[(Redis)]

    DS[DataSync Daemon] --> TUSHARE[Tushare API]
    DS --> AKSHARE[AkShare API]
    DS --> MYSQL

    MYSQL --> TM[quantmate DB]
    MYSQL --> TS[tushare DB]
    MYSQL --> AK[akshare DB]
    MYSQL --> VN[vnpy DB]
```

## Services

### Backend API
- Auth, strategies, backtesting, job queue, and data access endpoints.
- Persists business data in MySQL.
- Uses Redis for job storage and queue metadata.

### DataSync
- Pulls Tushare and AkShare data.
- Maintains `data_sync_status` and trade calendar cache.
- Can run init + resume via `init_market_data.py`.
- Optionally syncs VNpy-compatible tables.

### Frontend
- Vite dev server with proxy to `/api`.
- Enforces password change flow when `must_change_password=true`.

## Dev Deployment

- MySQL/Redis run via `docker-compose.dev.yml`.
- API and portal run locally for debugging.

See:
- `development/ENVIRONMENT_SETUP.md`
- `development/GETTING_STARTED.md`
