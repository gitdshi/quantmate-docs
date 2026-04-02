# Staging Defect List

- Environment: `10.0.0.240`
- Build validation window: 2026-04-02 05:13 UTC to 2026-04-02 05:15 UTC
- Source evidence: `docs/testing/validation-reports/STAGING_FULL_VALIDATION_2026-04-02.md`
- Status: Open

## Summary

- Total defects: 8
- Critical: 1
- High: 3
- Medium: 3
- Low: 1

## D-001 - DataSync execution is blocked by missing runtime files
- Module/Page: DataSync / staging runtime
- Severity: Critical
- Priority: P0
- Status: Open
- Observation: Approved staging SOP cannot start because required files are absent from the `api` container.
- Evidence:
  - `scripts/init_market_data.py` missing
  - `/app/mysql/init/quantmate.sql` missing
- Impact: DataSync regression, resume flow, schema step, and metrics validation cannot be completed in staging.
- Repro:
  ```text
  ssh -i /home/ubuntu/backup/keys/testserver/ssh-key-2026-03-09.key ubuntu@10.0.0.240
  cd /opt/quantmate
  docker compose -f docker-compose.staging.yml exec -T api sh -lc "ls -la scripts/init_market_data.py /app/mysql/init/quantmate.sql 2>&1 || true"
  ```
- Actual:
  ```text
  ls: cannot access 'scripts/init_market_data.py': No such file or directory
  ls: cannot access '/app/mysql/init/quantmate.sql': No such file or directory
  ```
- Expected: Both runtime files exist and approved SOP can execute inside `api` container.
- Recommendation: Fix image/build context or volume mount so staging artifact layout matches the approved execution path.

## D-002 - Reports list API returns 500 for authenticated user
- Module/Page: Reports / report list
- Severity: High
- Priority: P1
- Status: Open
- Observation: Authenticated read request to reports fails with generic server error.
- Impact: Reports page cannot load in a clean environment.
- Repro:
  1. Register and login with a valid user.
  2. Call `GET /api/v1/reports` with Bearer token.
- Actual:
  ```json
  {"error":{"code":"INTERNAL_ERROR","message":"Internal server error"},"code":"INTERNAL_ERROR","message":"Internal server error","detail":"Internal server error"}
  ```
- Expected: Empty-state success response or explicit business/setup error, not generic 500.
- Recommendation: Add defensive handling for missing backing data/schema and align response contract for empty environments.

## D-003 - Trade logs API returns 500 because `trade_logs` table is missing
- Module/Page: Reports / trade logs
- Severity: High
- Priority: P1
- Status: Open
- Observation: Trade log query path crashes on missing DB table.
- Evidence:
  - API response: `GET /api/v1/reports/trade-logs` -> `500`
  - Server log:
    ```text
    sqlalchemy.exc.ProgrammingError: (pymysql.err.ProgrammingError) (1146, "Table 'quantmate.trade_logs' doesn't exist")
    [SQL: SELECT COUNT(*) AS cnt FROM trade_logs WHERE 1=1]
    ```
- Impact: Trade log page is unusable; staging schema is out of sync with backend expectations.
- Repro:
  1. Login with valid Bearer token.
  2. Call `GET /api/v1/reports/trade-logs`.
- Expected: Empty-state response when no trade logs exist, or feature gated until schema is ready.
- Recommendation: Apply missing migration/schema or add graceful degradation for absent table.

## D-004 - Auth profile API returns 500 while auth/me succeeds with same token
- Module/Page: Account Settings / profile
- Severity: High
- Priority: P1
- Status: Open
- Observation: `GET /api/v1/auth/profile` fails even though login is successful and `GET /api/v1/auth/me` returns `200` using the same Bearer token.
- Impact: Profile/settings page is likely broken for authenticated users.
- Repro:
  1. Login via `POST /api/v1/auth/login`.
  2. Call `GET /api/v1/auth/me` -> `200`.
  3. Call `GET /api/v1/auth/profile` with same token.
- Actual:
  ```json
  {"error":{"code":"INTERNAL_ERROR","message":"Internal server error"},"code":"INTERNAL_ERROR","message":"Internal server error","detail":"Internal server error"}
  ```
- Expected: Valid profile payload or null-safe empty profile structure.
- Recommendation: Compare `auth/me` and `auth/profile` dependency paths; remove hard dependency on optional profile row/state.

## D-005 - Register/login contract is inconsistent: email login fails validation
- Module/Page: Authentication / login
- Severity: Medium
- Priority: P1
- Status: Open
- Observation: Registration accepts email, but login rejects an email-based payload and requires `username`.
- Evidence:
  - Register `201` with email and username
  - Login payload `{\"email\":\"...\",\"password\":\"...\"}` -> `422`
  - Error detail: `body → username: Field required`
  - Login payload with `username` succeeds
- Impact: New-user login path is confusing and easy to break if UI/docs use email semantics.
- Repro:
  1. Register new user with username/email/password.
  2. Attempt login using email + password.
- Actual:
  ```json
  {"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","detail":"body → username: Field required"},"code":"VALIDATION_ERROR","message":"Request validation failed","detail":"body → username: Field required"}
  ```
- Expected: Contract is consistent across register, login, and UI copy.
- Recommendation: Support email-or-username login, or make username-only requirement explicit end-to-end.

## D-006 - Market overview index mapping is incorrect
- Module/Page: Dashboard / market overview
- Severity: Medium
- Priority: P1
- Status: Open
- Observation: Overview endpoint returns wrong symbol mapping for major indexes.
- Evidence:
  - `GET /api/v1/data/indexes` lists `000001.SH` as SSE Composite and `399300.SZ` as HS300
  - `GET /api/v1/data/overview` returns:
    - `csi300.symbol = 000300.SH` with `Symbol not found`
    - `sse.symbol = 000001` resolving to `平安银行`
- Impact: Dashboard displays incorrect market data, creating serious product trust risk.
- Repro:
  1. Call `GET /api/v1/data/indexes`.
  2. Call `GET /api/v1/data/overview`.
  3. Compare symbol mapping and returned labels.
- Expected: SSE Composite and HS300 map to valid index instruments consistently across endpoints.
- Recommendation: Fix provider symbol mapping and normalize symbol format between catalog and overview endpoints.

## D-007 - DataSync metrics are incomplete and expose ambiguous unhealthy state
- Module/Page: Monitoring / metrics
- Severity: Medium
- Priority: P2
- Status: Open
- Observation: Only `datasync_backfill_lock_status 0.0` is exposed as a sample; counters exist only as HELP/TYPE lines.
- Impact: Operators cannot verify ingestion activity; monitoring may interpret idle state as unhealthy lock state.
- Repro:
  1. Call `GET /metrics`.
  2. Inspect `datasync_*` metrics.
- Actual:
  ```text
  # HELP datasync_api_calls_total Total number of Tushare API calls
  # TYPE datasync_api_calls_total counter
  # HELP datasync_rows_ingested_total Total number of rows successfully ingested into database tables
  # TYPE datasync_rows_ingested_total counter
  # HELP datasync_backfill_lock_status Status of datasync backfill lock (0 = cannot acquire, 1 = healthy)
  # TYPE datasync_backfill_lock_status gauge
  datasync_backfill_lock_status 0.0
  ```
- Expected: Metrics semantics clearly distinguish idle vs unhealthy, and activity counters are observable when DataSync runs.
- Recommendation: Fix default gauge semantics and verify exporter/registry behavior between API and DataSync runtime.

## D-008 - Portal `favicon.ico` route returns HTML shell instead of icon asset
- Module/Page: Portal / static assets
- Severity: Low
- Priority: P3
- Status: Open
- Observation: Browser icon route falls back to app HTML.
- Impact: Broken favicon and likely asset-route misconfiguration.
- Repro:
  1. Request `http://10.0.0.240:5173/favicon.ico`.
- Actual:
  - `200 text/html`
  - Body is app shell HTML
- Expected: Actual icon file or correct redirect to icon asset.
- Recommendation: Add real favicon asset and configure static serving correctly.

## Suggested fix order
- 1. D-001 DataSync runtime files
- 2. D-002 / D-003 reports 500 and schema drift
- 3. D-004 / D-005 auth consistency and profile 500
- 4. D-006 index mapping correctness
- 5. D-007 metrics semantics
- 6. D-008 favicon asset routing
