# Staging Full Validation Report

- Task: Full regression validation for newly deployed staging version
- Environment: `10.0.0.240`
- Validation time: 2026-04-02 05:13 UTC to 2026-04-02 05:15 UTC
- Tester: Sarah (`@tester`)
- Overall result: Failed

## Scope

- Staging service health and container status
- Authentication flow
- Selected high-risk business APIs
- Data/index display correctness
- DataSync execution prerequisites and monitoring exposure
- Portal static asset sanity check

## Findings

### 1. Critical - DataSync E2E still cannot execute in staging because required runtime files are missing
- Observation: The new staging image still lacks the CLI script and schema file required by the approved SOP.
- Evidence:
  - `docker compose -f docker-compose.staging.yml exec -T api sh -lc "ls -la scripts/init_market_data.py /app/mysql/init/tradermate.sql 2>&1 || true"`
  - Raw output:
    ```text
    ls: cannot access 'scripts/init_market_data.py': No such file or directory
    ls: cannot access '/app/mysql/init/tradermate.sql': No such file or directory
    ```
- Impact: Approved SOP A cannot run, schema step remains broken, and DataSync resume/rate-limit regression cannot be closed on staging.
- Recommendation: Rebuild or remount the API image so both `scripts/init_market_data.py` and `/app/mysql/init/tradermate.sql` exist, then rerun DataSync E2E.
- Severity: Critical

### 2. High - `GET /api/v1/reports` returns 500 for a normal authenticated user
- Observation: Authenticated read access to reports fails with server error instead of an empty-state response or a contract-level business error.
- Evidence:
  - Request:
    ```text
    GET /api/v1/reports
    Authorization: Bearer <valid token>
    ```
  - Response:
    ```json
    {"error":{"code":"INTERNAL_ERROR","message":"Internal server error"},"code":"INTERNAL_ERROR","message":"Internal server error","detail":"Internal server error"}
    ```
- Impact: Reports page/functionality is unusable in a clean environment and blocks regression acceptance for reporting features.
- Recommendation: Handle missing backing tables/data safely and return empty-state payloads or explicit setup errors instead of generic 500.
- Severity: High

### 3. High - `GET /api/v1/reports/trade-logs` returns 500 because staging schema is incomplete
- Observation: Trade log read API crashes on a missing database table.
- Evidence:
  - Request:
    ```text
    GET /api/v1/reports/trade-logs
    Authorization: Bearer <valid token>
    ```
  - Response:
    ```json
    {"error":{"code":"INTERNAL_ERROR","message":"Internal server error"},"code":"INTERNAL_ERROR","message":"Internal server error","detail":"Internal server error"}
    ```
  - Server log:
    ```text
    pymysql.err.ProgrammingError: (1146, "Table 'quantmate.trade_logs' doesn't exist")
    sqlalchemy.exc.ProgrammingError: (pymysql.err.ProgrammingError) (1146, "Table 'quantmate.trade_logs' doesn't exist")
    [SQL: SELECT COUNT(*) AS cnt FROM trade_logs WHERE 1=1]
    ```
- Impact: Reporting and audit-style read flows fail in staging; this also indicates migration drift between code and database.
- Recommendation: Apply the missing schema/migration for `trade_logs` or guard the feature behind capability checks until the table exists.
- Severity: High

### 4. High - `GET /api/v1/auth/profile` returns 500 after successful login
- Observation: Basic authenticated profile retrieval is broken even though `GET /api/v1/auth/me` succeeds for the same token.
- Evidence:
  - Successful login via username:
    ```json
    {"token_type":"bearer","user":{"username":"sarahqa_vcpmed","email":"sarah.qa+iyyyqq@example.com"}}
    ```
  - `GET /api/v1/auth/me` -> `200`
  - `GET /api/v1/auth/profile` ->
    ```json
    {"error":{"code":"INTERNAL_ERROR","message":"Internal server error"},"code":"INTERNAL_ERROR","message":"Internal server error","detail":"Internal server error"}
    ```
- Impact: Account settings/profile page is likely broken for all authenticated users.
- Recommendation: Compare `auth/me` and `auth/profile` code paths; `profile` should not depend on optional profile rows without null-safe fallback.
- Severity: High

### 5. Medium - Authentication contract is inconsistent: registration accepts email, but login rejects email and requires `username`
- Observation: The user can register with email, but the login API rejects an email-based payload with request validation error.
- Evidence:
  - Register request succeeded:
    ```json
    {"username":"sarahqa_vcpmed","email":"sarah.qa+iyyyqq@example.com","id":4}
    ```
  - Login with email payload:
    ```json
    {"email":"sarah.qa+iyyyqq@example.com","password":"Test1234!@#"}
    ```
  - Response:
    ```json
    {"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","detail":"body → username: Field required"},"code":"VALIDATION_ERROR","message":"Request validation failed","detail":"body → username: Field required"}
    ```
  - Login with username payload succeeds.
- Impact: New users can register successfully but may fail to log in if the UI or docs imply email login is supported.
- Recommendation: Standardize auth contract across register/login/UI/docs. Either support email-or-username login or make username-only explicit everywhere.
- Severity: Medium

### 6. Medium - `GET /api/v1/data/overview` contains incorrect index mapping for SSE/CSI 300
- Observation: The overview endpoint maps index widgets to wrong source symbols.
- Evidence:
  - `GET /api/v1/data/indexes` includes:
    ```json
    [{"value":"000001.SH","label":"SSE Composite (上证综指)"},{"value":"399300.SZ","label":"HS300 (沪深300)"}]
    ```
  - `GET /api/v1/data/overview` returns:
    ```json
    {"indexes":{"csi300":{"error":"Symbol not found in Tencent quote: 000300","symbol":"000300.SH"},"sse":{"symbol":"000001","name":"平安银行","display_name":"SSE Composite"}}}
    ```
- Impact: Dashboard index cards show wrong instruments or errors, which is a severe trust issue for a quant product.
- Recommendation: Fix code-to-provider mapping: HS300 should not use `000300.SH`, and SSE Composite must not resolve to stock `000001` (Ping An Bank).
- Severity: Medium

### 7. Medium - DataSync metrics endpoint still exposes unhealthy/ambiguous state on idle system
- Observation: The only populated custom DataSync metric is `datasync_backfill_lock_status 0.0`; all counters are declared but have no sample values.
- Evidence:
  - `GET /metrics` excerpt:
    ```text
    # HELP datasync_api_calls_total Total number of Tushare API calls
    # TYPE datasync_api_calls_total counter
    # HELP datasync_rows_ingested_total Total number of rows successfully ingested into database tables
    # TYPE datasync_rows_ingested_total counter
    # HELP datasync_backfill_lock_status Status of datasync backfill lock (0 = cannot acquire, 1 = healthy)
    # TYPE datasync_backfill_lock_status gauge
    datasync_backfill_lock_status 0.0
    ```
- Impact: Monitoring can falsely suggest unhealthy lock state, and operators still cannot verify ingestion activity from API metrics alone.
- Recommendation: Initialize/export a non-misleading idle value and confirm DataSync worker/API share the intended metrics exposure model.
- Severity: Medium

### 8. Low - Portal static asset handling is inconsistent for `favicon.ico`
- Observation: Requesting `/favicon.ico` returns the HTML app shell instead of an icon asset.
- Evidence:
  - `GET http://10.0.0.240:5173/favicon.ico` -> `200 text/html`
  - Body starts with the portal `<!doctype html>` page.
- Impact: Browser tab icon is broken and static asset routing may be misconfigured.
- Recommendation: Provide a real `/favicon.ico` or redirect correctly to the actual icon asset.
- Severity: Low

## Passed checks
- `docker compose -f docker-compose.staging.yml ps` shows API, datasync, worker, portal, redis, nginx containers up.
- `GET /health` -> `200`, MySQL and Redis reported healthy.
- `GET /openapi.json` -> `200`, contract exposed.
- `GET /api/v1/auth/me` -> `200` after successful username login.
- `GET /api/v1/alerts/rules` -> `200` empty-state response.
- `GET /api/v1/alerts/history` -> `200` empty-state response.
- `GET /api/v1/alerts/channels` -> `200` empty-state response.
- `GET /api/v1/analytics/dashboard` -> `200`.
- Burst test: 40 rapid authenticated calls to `GET /api/v1/data/indexes` all returned `200` (no 429 observed in this window).

## Evidence Pack

### Command 1 - Staging container and health snapshot
```text
ssh -o StrictHostKeyChecking=no -i /home/ubuntu/backup/keys/testserver/ssh-key-2026-03-09.key ubuntu@10.0.0.240 '
set -o pipefail
cd /opt/quantmate || exit 1
printf "===== TIMESTAMP =====\n"; date -u
printf "===== DOCKER PS =====\n"; docker compose -f docker-compose.staging.yml ps
printf "===== HEALTH =====\n"; curl -sS -i http://127.0.0.1:8000/health || true
printf "\n===== METRICS HEAD =====\n"; curl -sS http://127.0.0.1:8000/metrics | sed -n "1,120p"
printf "\n===== SCRIPT PATH =====\n"; docker compose -f docker-compose.staging.yml exec -T api sh -lc "ls -la scripts/init_market_data.py /app/mysql/init/tradermate.sql 2>&1 || true"
printf "===== API LOGS =====\n"; docker compose -f docker-compose.staging.yml logs --tail=120 api
'
```

### Output excerpt
```text
===== TIMESTAMP =====
Thu Apr  2 05:13:57 UTC 2026
...
HTTP/1.1 200 OK
...
{"status":"healthy","timestamp":"2026-04-02T05:13:57.370177+00:00","service":"quantmate","dependencies":{"mysql":{"status":"healthy"},"redis":{"status":"healthy"}}}
...
datasync_backfill_lock_status 0.0
...
ls: cannot access 'scripts/init_market_data.py': No such file or directory
ls: cannot access '/app/mysql/init/tradermate.sql': No such file or directory
```

### Command 2 - Auth contract validation
```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
GET /api/v1/auth/profile
```

### Output excerpt
```text
REGISTER_STATUS 201
{"username":"sarahqa_vcpmed","email":"sarah.qa+iyyyqq@example.com","id":4,...}

PAYLOAD {'email': 'sarah.qa+iyyyqq@example.com', 'password': 'Test1234!@#'}
ERROR 422
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","detail":"body → username: Field required"},...}

PAYLOAD {'username': 'sarahqa_vcpmed', 'password': 'Test1234!@#'}
STATUS 200
{"access_token":"...","refresh_token":"...","token_type":"bearer",...}

PATH /api/v1/auth/me STATUS 200
PATH /api/v1/auth/profile ERROR 500
```

### Command 3 - High-risk API smoke
```text
GET /api/v1/alerts/rules
GET /api/v1/alerts/history
GET /api/v1/alerts/channels
GET /api/v1/reports
GET /api/v1/reports/trade-logs
GET /api/v1/analytics/dashboard
GET /api/v1/data/indexes
GET /api/v1/data/overview
```

### Output excerpt
```text
PATH /api/v1/alerts/rules STATUS 200
{"rules":[]}

PATH /api/v1/reports ERROR 500
{"error":{"code":"INTERNAL_ERROR","message":"Internal server error"},...}

PATH /api/v1/reports/trade-logs ERROR 500
{"error":{"code":"INTERNAL_ERROR","message":"Internal server error"},...}

PATH /api/v1/data/indexes STATUS 200
[{"value":"000001.SH","label":"SSE Composite (上证综指)"},...,{"value":"399300.SZ","label":"HS300 (沪深300)"}]

PATH /api/v1/data/overview STATUS 200
{"indexes":{"csi300":{"error":"Symbol not found in Tencent quote: 000300","symbol":"000300.SH"},"sse":{"symbol":"000001","name":"平安银行",...}}}
```

### Command 4 - Read API burst sanity check
```text
40 rapid authenticated calls to GET /api/v1/data/indexes
```

### Output
```text
STATUS_COUNTS {200: 40}
FIRST_429 None
```

## Recommendation order
1. Fix staging image/schema parity first: missing DataSync files and missing `trade_logs` table block multiple acceptance paths.
2. Fix auth contract/profile regression next: register-login-profile is a first-use journey.
3. Fix dashboard index mapping before broader UAT because it undermines trust in market data.
4. Revisit DataSync metrics exposure semantics so monitoring reflects real runtime state.

## Decision
- Staging build is not acceptable for full regression sign-off.
- Blocking defects exist in DataSync execution prerequisites, report APIs, and authenticated profile flow.
