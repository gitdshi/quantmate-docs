# Audit Log Spec v1 (Developer-facing)

Owner: @designer  
Status: Draft

Sources:
- PRD: `projects/QuantMate/quantmate-docs/requirements/PRODUCT_REQUIREMENTS_V1.md` (3.9.4, 4.2.2)
- Migration: `projects/QuantMate/quantmate/mysql/migrations/001_create_audit_logs.sql`
- API: `projects/QuantMate/quantmate/app/api/routes/audit.py`
- Middleware: `projects/QuantMate/quantmate/app/api/audit_middleware.py`
- DAO: `projects/QuantMate/quantmate/app/domains/audit/dao/audit_log_dao.py`

## 1. Scope

This spec defines the P1 audit logging baseline for QuantMate:
- Immutable `audit_logs` data model
- Event capture scope for API requests and security-sensitive operations
- Operation type taxonomy and resource conventions
- Admin query/export APIs
- Access control, retention, and non-functional requirements
- Backend test scope and implementation gaps against PRD

Non-goals (handled elsewhere): SIEM integration, long-term cold storage tiering, field-level data masking UI, external webhook delivery.

## 2. PRD Alignment

PRD `3.9.4 审计日志` requires:
- record auth events, strategy operations, trading operations, system config changes, and sensitive data access
- include timestamp, user ID, username, operation type, resource type, resource ID, operation details, IP, and User-Agent
- logs must be immutable
- retention must be at least 5 years
- support filtering by user / operation type / time range / resource
- support CSV / JSON export

This spec keeps those requirements and maps them onto the current backend implementation.

## 3. Minimal Implementation Path (P1)

1) `audit_logs` table + indexes  
2) API middleware for automatic request logging  
3) Standard operation-type mapping for core routes  
4) Admin-only query/export APIs  
5) Insert-only DAO and application-level immutability guard  
6) Unit tests for insert/query/export/admin guard paths  
7) Retention and coverage gaps documented for follow-up

## 4. Event Coverage

### 4.1 Must Capture in P1

- Authentication events:
  - login
  - register
  - token refresh
  - profile view
  - password change
- Strategy events:
  - create
  - update
  - delete
  - view
- Backtest events:
  - submit
  - view
- Queue/job events:
  - submit
  - delete
- Data access events:
  - read access on `/api/data/*`
- Audit access events:
  - admin query/export of audit logs should themselves be auditable in a follow-up slice

### 4.2 PRD Coverage Target

The PRD expects the following broader categories over time:
- auth
- strategy lifecycle
- trading lifecycle
- system configuration changes
- sensitive data queries

P1 only partially covers the full PRD target. Trading operations and some system/data-source configuration events still require explicit route mapping expansion.

## 5. Operation Type Convention

Operation types are stored as uppercase domain events.

Current mapped examples:
- `AUTH_LOGIN`
- `AUTH_REGISTER`
- `AUTH_REFRESH`
- `AUTH_CHANGE_PASSWORD`
- `AUTH_PROFILE_VIEW`
- `STRATEGY_CREATE`
- `STRATEGY_UPDATE`
- `STRATEGY_DELETE`
- `STRATEGY_VIEW`
- `BACKTEST_SUBMIT`
- `BACKTEST_VIEW`
- `JOB_SUBMIT`
- `JOB_DELETE`
- `DATA_ACCESS`

Fallback rule:
- if a route is not explicitly classified, store `API_<METHOD>`
- example: `API_GET`, `API_POST`

Recommended extension rules:
- use `DOMAIN_ACTION` naming
- prefer business events over raw HTTP semantics where known
- avoid mixing singular/plural naming in `resource_type`

## 6. Resource Type Convention

Use stable lowercase domain names for `resource_type`.

Current examples:
- `user`
- `strategy`
- `backtest`
- `job`
- `data`

Recommended future additions:
- `order`
- `trade`
- `portfolio`
- `system_config`
- `data_source`
- `report`

## 7. Data Model

## 7.1 Table: `audit_logs`

Defined by `001_create_audit_logs.sql`.

Fields:
- `id` BIGINT PK AUTO_INCREMENT
- `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
- `user_id` INT NULL
- `username` VARCHAR(50) NULL
- `operation_type` VARCHAR(50) NOT NULL
- `resource_type` VARCHAR(50) NULL
- `resource_id` VARCHAR(100) NULL
- `details` JSON NULL
- `ip_address` VARCHAR(45) NULL
- `user_agent` VARCHAR(500) NULL
- `http_method` VARCHAR(10) NULL
- `http_path` VARCHAR(500) NULL
- `http_status` INT NULL

Indexes:
- `idx_timestamp (timestamp)`
- `idx_user_id (user_id)`
- `idx_operation_type (operation_type)`
- `idx_resource_type (resource_type)`
- `idx_user_timestamp (user_id, timestamp)`

## 7.2 Field Semantics

- `timestamp`: event write time, server-generated
- `user_id`: authenticated actor when available; null for anonymous/public calls
- `username`: denormalized actor name for operational readability
- `operation_type`: normalized event code
- `resource_type`: affected domain object type
- `resource_id`: primary identifier of the affected resource when extractable from URL
- `details`: structured JSON payload for event-specific metadata
- `ip_address`: client IP, preferring `X-Forwarded-For`
- `user_agent`: truncated to 500 chars
- `http_method` / `http_path` / `http_status`: transport context

## 7.3 Immutability Contract

Audit logs are append-only.

Implementation contract:
- DAO supports INSERT and SELECT only
- application code must not expose UPDATE/DELETE operations for `audit_logs`
- DB migration notes that stronger DB-user-level UPDATE/DELETE restriction can be added separately

PRD requirement:
- audit logs are not deletable or editable

## 8. Capture Flow

### 8.1 Middleware Flow

For each `/api/*` request except skipped paths:
1. receive request
2. execute downstream handler
3. compute duration
4. extract actor info from bearer token if present
5. classify request into `operation_type` + `resource_type`
6. derive `resource_id` from path when possible
7. write one audit row
8. suppress audit-write exceptions so user traffic is not broken

### 8.2 Skipped Paths

Current skip list:
- `/health`
- `/docs`
- `/redoc`
- `/openapi.json`
- `/`
- `/metrics`

### 8.3 Resource ID Extraction Rule

Current implementation extracts the last numeric or UUID-like path segment.

Examples:
- `/api/strategies/123` -> `123`
- `/api/backtests/550e8400-e29b-41d4-a716-446655440000` -> UUID

## 9. Details Payload Contract

`details` should remain structured JSON.

Current guaranteed field:
```json
{
  "duration_ms": 17
}
```

Recommended future optional fields by event type:
- auth: `login_result`, `failure_reason`
- strategy: `version`, `name`
- order/trade: `symbol`, `side`, `quantity`, `price`
- config: `changed_fields`, `before`, `after`
- export: `format`, `row_count`, `filters`

Guideline:
- do not store secrets, tokens, or plaintext passwords
- avoid putting large payload bodies into `details`
- prefer concise business metadata

## 10. Query and Export APIs

Base path: `/api/v1/audit`

Current router paths:
- `GET /logs`
- `GET /logs/export`

## 10.1 Access Control

Current implementation uses a simple admin check:
- allow only when `current_user.username == "admin"`

Recommended target state:
- replace username check with RBAC permission such as `system.read` or `system.manage`
- keep audit log visibility admin-only in P1

## 10.2 Query API

`GET /api/v1/audit/logs`

Filters:
- `user_id`
- `operation_type`
- `resource_type`
- `start_date`
- `end_date`
- pagination via shared `PaginationParams`

Response shape:
```json
{
  "items": [
    {
      "id": 1,
      "timestamp": "2026-03-30T05:00:00.123000",
      "user_id": 1,
      "username": "admin",
      "operation_type": "AUTH_LOGIN",
      "resource_type": "user",
      "resource_id": null,
      "details": {"duration_ms": 22},
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0",
      "http_method": "POST",
      "http_path": "/api/v1/auth/login",
      "http_status": 200
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

## 10.3 Export API

`GET /api/v1/audit/logs/export`

Parameters:
- `format=json|csv` (default `json`)
- same core filters as query API
- `limit` default 10000, max 50000

Behavior:
- CSV export flattens `details` to JSON string
- JSON export streams array payload
- response uses attachment headers

## 11. Retention and Storage

PRD requirement:
- retain core audit logs for at least 5 years

Current state:
- schema and APIs exist
- no explicit retention/archival job is documented in current implementation

P1 requirement in this spec:
- treat audit log retention as operationally mandatory
- do not add TTL/cleanup for `audit_logs`
- document DB backup/archival policy in deployment runbook

Follow-up recommendation:
- monthly partitioning or archive table strategy once volume grows

## 12. Security and Privacy Constraints

- audit access is admin-only
- audit records must be append-only
- `details` must not contain secrets
- query and export endpoints should be audited in future enhancement
- audit export should only include data permitted for admin review

## 13. Known Gaps vs PRD

Current implementation gaps that should remain visible:
- admin authorization is username-based, not RBAC-based
- middleware route map does not yet classify all trading/configuration/data-source events required by PRD
- no explicit 5-year retention automation or archive process documented in code
- no explicit tamper-evidence mechanism beyond append-only application behavior
- filter set does not yet include direct IP / status / path / resource ID filters
- export limit is capped, so very large exports may need batching in future

## 14. Acceptance Criteria (DoD)

- `audit_logs` schema documented with field semantics and indexes
- capture flow defined for API middleware logging
- operation type and resource type conventions defined
- admin-only query/export APIs documented with filters and formats
- immutability contract defined
- retention requirement and current operational gap documented
- known P1 coverage gaps called out explicitly
- backend test scope defined

## 15. Recommended Unit Test Scope

Backend tests should minimally cover:
- middleware writes one audit row for protected API requests
- skipped paths do not create audit rows
- bearer token extraction populates `user_id` and `username`
- `X-Forwarded-For` takes precedence for `ip_address`
- query API enforces admin-only access
- query API filters by user / operation type / resource / date range
- export API returns valid JSON attachment
- export API returns valid CSV attachment with serialized `details`
- DAO exposes insert/query/count behavior only
- audit logging failure does not break normal API responses

## 16. Deprecation Notes

No conflicting dedicated audit-log spec was found in `quantmate-docs`. This file becomes the developer-facing SSOT for audit log behavior until superseded.
