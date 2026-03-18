# TC-SYSTEM: System Administration

## Endpoints Covered

- `GET /api/v1/system/sync-status`
- `GET /api/v1/system/configs`
- `GET /api/v1/system/configs/{key}`
- `PUT /api/v1/system/configs`
- `DELETE /api/v1/system/configs/{key}`
- `GET /api/v1/system/data-sources`
- `PUT /api/v1/system/data-sources`
- `GET /api/v1/alerts/rules`
- `POST /api/v1/alerts/rules`
- `PUT /api/v1/alerts/rules/{rule_id}`
- `DELETE /api/v1/alerts/rules/{rule_id}`
- `GET /api/v1/alerts/history`
- `POST /api/v1/alerts/channels`
- `GET /api/v1/alerts/channels`
- `PUT /api/v1/alerts/channels/{channel_id}`
- `DELETE /api/v1/alerts/channels/{channel_id}`

---

## 1. System Status

### TC-SYS-001: Get data sync status
**Priority:** P1
**Preconditions:** Authenticated user
**Steps:**
1. `GET /api/v1/system/sync-status`
**Expected:** 200 OK. Returns sync status for each data source: `last_sync_time`, `status`, `records_synced`, `errors`.

### TC-SYS-002: Sync status without auth
**Priority:** P2
**Steps:**
1. `GET /api/v1/system/sync-status` without Authorization header
**Expected:** 401 Unauthorized.

---

## 2. System Configuration

### TC-SYS-010: List system configs (Admin)
**Priority:** P2
**Preconditions:** Authenticated as admin
**Steps:**
1. `GET /api/v1/system/configs`
**Expected:** 200 OK. List of system configuration key-value pairs.

### TC-SYS-011: Get single config
**Priority:** P2
**Steps:**
1. `GET /api/v1/system/configs/max_backtest_concurrent`
**Expected:** 200 OK. Returns value for the specified key.

### TC-SYS-012: Upsert system config (Admin)
**Priority:** P2
**Steps:**
1. `PUT /api/v1/system/configs` with body:
   ```json
   { "key": "max_backtest_concurrent", "value": "5" }
   ```
**Expected:** 200 OK. Config created or updated.

### TC-SYS-013: Delete system config (Admin)
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/system/configs/max_backtest_concurrent`
**Expected:** 200 OK. Config removed.

### TC-SYS-014: Non-admin delete system config
**Priority:** P2
**Steps:**
1. Regular user: `DELETE /api/v1/system/configs/some_key`
**Expected:** 403 Forbidden.

### TC-SYS-015: Non-admin upsert system config
**Priority:** P2
**Steps:**
1. Regular user: `PUT /api/v1/system/configs`
**Expected:** 403 Forbidden (if admin-only) or 200 OK (if user-scoped settings allowed).

---

## 3. Data Source Management

### TC-SYS-020: List data sources
**Priority:** P2
**Steps:**
1. `GET /api/v1/system/data-sources`
**Expected:** 200 OK. List of data sources (tushare, akshare, vnpy) with status and config.

### TC-SYS-021: Upsert data source (Admin)
**Priority:** P2
**Steps:**
1. `PUT /api/v1/system/data-sources` with body:
   ```json
   {
     "name": "tushare",
     "enabled": true,
     "token": "574a19d...",
     "schedule": "0 18 * * 1-5"
   }
   ```
**Expected:** 200 OK. Data source config updated.

### TC-SYS-022: Non-admin upsert data source
**Priority:** P2
**Steps:**
1. Regular user tries to update data source config
**Expected:** 403 Forbidden.

---

## 4. Alert Rules

### TC-SYS-030: List alert rules
**Priority:** P2
**Steps:**
1. `GET /api/v1/alerts/rules`
**Expected:** 200 OK. User's alert rules.

### TC-SYS-031: Create price alert rule
**Priority:** P1
**Steps:**
1. `POST /api/v1/alerts/rules` with body:
   ```json
   {
     "name": "SZ1 Price Above 12",
     "symbol": "000001.SZ",
     "condition": "price_above",
     "threshold": 12.00,
     "enabled": true
   }
   ```
**Expected:** 201 Created. Alert rule with `id`.

### TC-SYS-032: Create volume alert rule
**Priority:** P2
**Steps:**
1. `POST /api/v1/alerts/rules` with body:
   ```json
   {
     "name": "High Volume Alert",
     "symbol": "000001.SZ",
     "condition": "volume_above",
     "threshold": 10000000,
     "enabled": true
   }
   ```
**Expected:** 201 Created.

### TC-SYS-033: Update alert rule
**Priority:** P2
**Steps:**
1. `PUT /api/v1/alerts/rules/{rule_id}` with `{ "threshold": 15.00 }`
**Expected:** 200 OK. Threshold updated.

### TC-SYS-034: Disable alert rule
**Priority:** P2
**Steps:**
1. `PUT /api/v1/alerts/rules/{rule_id}` with `{ "enabled": false }`
**Expected:** 200 OK. Rule disabled, no longer triggers.

### TC-SYS-035: Delete alert rule
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/alerts/rules/{rule_id}`
**Expected:** 200 OK.

---

## 5. Alert History

### TC-SYS-040: List alert history
**Priority:** P2
**Steps:**
1. `GET /api/v1/alerts/history`
**Expected:** 200 OK. List of triggered alerts with `rule_name`, `triggered_at`, `value`, `threshold`.

### TC-SYS-041: Alert history with no triggers
**Priority:** P3
**Steps:**
1. `GET /api/v1/alerts/history` (user with no alerts triggered)
**Expected:** 200 OK. Empty list.

---

## 6. Notification Channels

### TC-SYS-050: Create notification channel
**Priority:** P2
**Steps:**
1. `POST /api/v1/alerts/channels` with body:
   ```json
   {
     "name": "Email Alerts",
     "type": "email",
     "config": { "email": "user@example.com" }
   }
   ```
**Expected:** 201 Created.

### TC-SYS-051: List notification channels
**Priority:** P2
**Steps:**
1. `GET /api/v1/alerts/channels`
**Expected:** 200 OK. User's configured channels.

### TC-SYS-052: Create webhook channel
**Priority:** P3
**Steps:**
1. `POST /api/v1/alerts/channels` with body:
   ```json
   {
     "name": "Slack Webhook",
     "type": "webhook",
     "config": { "url": "https://hooks.slack.com/..." }
   }
   ```
**Expected:** 201 Created.

### TC-SYS-053: Update channel
**Priority:** P3
**Steps:**
1. `PUT /api/v1/alerts/channels/{channel_id}` with updated config
**Expected:** 200 OK.

### TC-SYS-054: Delete channel
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/alerts/channels/{channel_id}`
**Expected:** 200 OK.
