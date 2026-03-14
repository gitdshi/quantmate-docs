# System API

Base path: `/api/system`

Auth: Bearer token required.

## Endpoints

- `GET /api/system/sync-status`
  - Returns aggregated sync status for required data-sync steps.
  - Backed by `quantmate.data_sync_status`.
