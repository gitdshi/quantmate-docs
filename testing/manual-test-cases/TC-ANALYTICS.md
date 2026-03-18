# TC-ANALYTICS: Analytics & Reports

## Endpoints Covered

- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/risk-metrics`
- `GET /api/v1/analytics/live-pnl`
- `GET /api/v1/reports`
- `GET /api/v1/reports/{report_id}`
- `POST /api/v1/reports`
- `GET /api/v1/reports/trade-logs`
- `GET /api/v1/reports/trade-logs/export`

---

## 1. Analytics Dashboard

### TC-ANAL-001: Get dashboard data
**Priority:** P1
**Preconditions:** Authenticated user with portfolio data
**Steps:**
1. `GET /api/v1/analytics/dashboard`
**Expected:** 200 OK. Returns dashboard summary: total portfolio value, daily P&L, key metrics, chart data.

### TC-ANAL-002: Dashboard with no data
**Priority:** P2
**Preconditions:** New user with no positions or trades
**Steps:**
1. `GET /api/v1/analytics/dashboard`
**Expected:** 200 OK. Returns default/empty dashboard (no errors).

### TC-ANAL-003: Get risk metrics
**Priority:** P2
**Steps:**
1. `GET /api/v1/analytics/risk-metrics`
**Expected:** 200 OK. Returns portfolio risk metrics: VaR, beta, volatility, correlation matrix.

### TC-ANAL-004: Risk metrics with no positions
**Priority:** P3
**Steps:**
1. `GET /api/v1/analytics/risk-metrics` (user has no positions)
**Expected:** 200 OK. Empty or default risk metrics.

### TC-ANAL-005: Get live P&L
**Priority:** P2
**Steps:**
1. `GET /api/v1/analytics/live-pnl`
**Expected:** 200 OK. Returns current unrealized P&L for open positions.

---

## 2. Report Generation

### TC-ANAL-010: List reports
**Priority:** P2
**Steps:**
1. `GET /api/v1/reports?offset=0&limit=10`
**Expected:** 200 OK. Paginated list of user's generated reports.

### TC-ANAL-011: Generate report
**Priority:** P1
**Steps:**
1. `POST /api/v1/reports` with body:
   ```json
   {
     "type": "portfolio_summary",
     "start_date": "2024-01-01",
     "end_date": "2024-06-30"
   }
   ```
**Expected:** 201 Created. Report generation started. Returns `report_id`.

### TC-ANAL-012: Get report detail
**Priority:** P1
**Steps:**
1. `GET /api/v1/reports/{report_id}`
**Expected:** 200 OK. Report with status and content (when complete).

### TC-ANAL-013: Generate report with invalid type
**Priority:** P3
**Steps:**
1. `POST /api/v1/reports` with `type: "invalid_type"`
**Expected:** 400 or 422. Unknown report type.

### TC-ANAL-014: Reports isolation between users
**Priority:** P2
**Steps:**
1. User A generates report → User B lists reports
**Expected:** User B cannot see User A's reports.

---

## 3. Trade Audit Log

### TC-ANAL-020: Query trade logs
**Priority:** P2
**Steps:**
1. `GET /api/v1/reports/trade-logs?offset=0&limit=20`
**Expected:** 200 OK. Paginated list of trade log entries with `timestamp`, `action`, `symbol`, `quantity`, `price`.

### TC-ANAL-021: Filter trade logs by date range
**Priority:** P2
**Steps:**
1. `GET /api/v1/reports/trade-logs?start=2024-01-01&end=2024-03-01`
**Expected:** 200 OK. Only trades within specified date range.

### TC-ANAL-022: Filter trade logs by symbol
**Priority:** P3
**Steps:**
1. `GET /api/v1/reports/trade-logs?symbol=000001.SZ`
**Expected:** 200 OK. Only trades for that symbol.

### TC-ANAL-023: Export trade logs as CSV
**Priority:** P2
**Steps:**
1. `GET /api/v1/reports/trade-logs/export?format=csv`
**Expected:** 200 OK. CSV file with headers and trade data.

### TC-ANAL-024: Export trade logs as JSON
**Priority:** P2
**Steps:**
1. `GET /api/v1/reports/trade-logs/export?format=json`
**Expected:** 200 OK. JSON array of trade log entries.

### TC-ANAL-025: Trade logs shows only own trades
**Priority:** P2
**Preconditions:** Multiple users have trades
**Steps:**
1. Login as user A → query trade logs
2. Login as user B → query trade logs
**Expected:** Each user sees only their own trade logs.
