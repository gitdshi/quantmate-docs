# TC-BACKTEST: Backtesting & Optimization

## Endpoints Covered

- `POST /api/v1/backtest`
- `POST /api/v1/backtest/batch`
- `GET /api/v1/backtest/{job_id}`
- `GET /api/v1/backtest/batch/{job_id}`
- `GET /api/v1/backtest/history/list`
- `GET /api/v1/optimization/tasks`
- `GET /api/v1/optimization/tasks/{task_id}`
- `POST /api/v1/optimization/tasks`
- `GET /api/v1/optimization/tasks/{task_id}/results`
- `GET /api/v1/queue/stats`
- `GET /api/v1/queue/jobs`
- `GET /api/v1/queue/jobs/{job_id}`
- `POST /api/v1/queue/jobs/{job_id}/cancel`
- `DELETE /api/v1/queue/jobs/{job_id}`
- `POST /api/v1/queue/backtest`
- `POST /api/v1/queue/bulk-backtest`

---

## 1. Single Backtest

### TC-BT-001: Submit single backtest
**Priority:** P1
**Preconditions:** At least one strategy and market data exist
**Steps:**
1. `POST /api/v1/backtest` with body:
   ```json
   {
     "strategy_id": 1,
     "symbol": "000001.SZ",
     "start_date": "2024-01-01",
     "end_date": "2024-06-30",
     "initial_capital": 100000
   }
   ```
**Expected:** 201 Created. Returns `job_id` and initial status (`queued` or `running`).

### TC-BT-002: Get backtest status
**Priority:** P1
**Preconditions:** Backtest submitted
**Steps:**
1. `GET /api/v1/backtest/{job_id}`
**Expected:** 200 OK. Returns status (`queued`, `running`, `finished`, `failed`), progress, and results when finished.

### TC-BT-003: Get backtest with results
**Priority:** P1
**Preconditions:** Backtest completed successfully
**Steps:**
1. `GET /api/v1/backtest/{job_id}` where job is `finished`
**Expected:** 200 OK. Results include `total_return`, `annual_return`, `sharpe_ratio`, `max_drawdown`, `total_trades`, equity curve data.

### TC-BT-004: Submit backtest with invalid strategy
**Priority:** P2
**Steps:**
1. `POST /api/v1/backtest` with `strategy_id: 99999` (non-existent)
**Expected:** 404 or 400. Strategy not found.

### TC-BT-005: Submit backtest with invalid date range
**Priority:** P2
**Steps:**
1. `POST /api/v1/backtest` with `start_date` after `end_date`
**Expected:** 400 or 422. Validation error.

### TC-BT-006: Submit backtest with zero initial capital
**Priority:** P3
**Steps:**
1. `POST /api/v1/backtest` with `initial_capital: 0`
**Expected:** 400 or 422. Capital must be positive.

---

## 2. Batch Backtest

### TC-BT-010: Submit batch backtest
**Priority:** P1
**Preconditions:** Strategy and market data exist
**Steps:**
1. `POST /api/v1/backtest/batch` with body:
   ```json
   {
     "strategy_id": 1,
     "symbols": ["000001.SZ", "600000.SH"],
     "start_date": "2024-01-01",
     "end_date": "2024-06-30",
     "initial_capital": 100000
   }
   ```
**Expected:** 201 Created. Returns batch `job_id`.

### TC-BT-011: Get batch backtest status
**Priority:** P1
**Steps:**
1. `GET /api/v1/backtest/batch/{job_id}`
**Expected:** 200 OK. Status of each symbol's backtest within the batch.

### TC-BT-012: Batch with empty symbols list
**Priority:** P2
**Steps:**
1. `POST /api/v1/backtest/batch` with `symbols: []`
**Expected:** 400 or 422. At least one symbol required.

---

## 3. Backtest History

### TC-BT-020: List backtest history
**Priority:** P1
**Steps:**
1. `GET /api/v1/backtest/history/list`
**Expected:** 200 OK. Paginated list of past backtests for current user.

### TC-BT-021: History filters by date
**Priority:** P2
**Steps:**
1. `GET /api/v1/backtest/history/list?start=2024-01-01&end=2024-03-01`
**Expected:** 200 OK. Only backtests within the date range.

### TC-BT-022: History shows only own backtests
**Priority:** P2
**Preconditions:** Multiple users have backtests
**Steps:**
1. Login as user A → `GET /api/v1/backtest/history/list`
2. Login as user B → `GET /api/v1/backtest/history/list`
**Expected:** Each user sees only their own backtest history.

---

## 4. Parameter Optimization

### TC-BT-030: Create optimization task
**Priority:** P2
**Preconditions:** Strategy exists
**Steps:**
1. `POST /api/v1/optimization/tasks` with body:
   ```json
   {
     "strategy_id": 1,
     "symbol": "000001.SZ",
     "start_date": "2024-01-01",
     "end_date": "2024-06-30",
     "parameters": {
       "fast_period": { "min": 5, "max": 20, "step": 1 },
       "slow_period": { "min": 20, "max": 60, "step": 5 }
     },
     "optimization_metric": "sharpe_ratio"
   }
   ```
**Expected:** 201 Created. Returns `task_id`.

### TC-BT-031: List optimization tasks
**Priority:** P2
**Steps:**
1. `GET /api/v1/optimization/tasks`
**Expected:** 200 OK. List of user's optimization tasks.

### TC-BT-032: Get optimization task detail
**Priority:** P2
**Steps:**
1. `GET /api/v1/optimization/tasks/{task_id}`
**Expected:** 200 OK. Task definition and current status.

### TC-BT-033: Get optimization results
**Priority:** P2
**Preconditions:** Optimization task completed
**Steps:**
1. `GET /api/v1/optimization/tasks/{task_id}/results`
**Expected:** 200 OK. Grid of parameter combinations with performance metrics. Best combination highlighted.

---

## 5. Job Queue Management

### TC-BT-040: Get queue statistics
**Priority:** P2
**Steps:**
1. `GET /api/v1/queue/stats`
**Expected:** 200 OK. Returns queue depth, active workers, job counts by status.

### TC-BT-041: List user's queued jobs
**Priority:** P2
**Steps:**
1. `GET /api/v1/queue/jobs`
**Expected:** 200 OK. List of current user's jobs (backtests, optimizations).

### TC-BT-042: Get specific job detail
**Priority:** P2
**Steps:**
1. `GET /api/v1/queue/jobs/{job_id}`
**Expected:** 200 OK. Detailed job info including type, status, submitted_at.

### TC-BT-043: Cancel queued job
**Priority:** P2
**Preconditions:** Job in `queued` status
**Steps:**
1. `POST /api/v1/queue/jobs/{job_id}/cancel`
**Expected:** 200 OK. Job status changed to `cancelled`.

### TC-BT-044: Cancel running job
**Priority:** P2
**Steps:**
1. `POST /api/v1/queue/jobs/{job_id}/cancel` where job is `running`
**Expected:** 200 OK. Job termination initiated.

### TC-BT-045: Cancel finished job
**Priority:** P3
**Steps:**
1. `POST /api/v1/queue/jobs/{job_id}/cancel` where job is `finished`
**Expected:** 400. Cannot cancel completed job.

### TC-BT-046: Delete job
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/queue/jobs/{job_id}`
**Expected:** 200 OK. Job record deleted.

### TC-BT-047: Submit backtest via queue endpoint
**Priority:** P2
**Steps:**
1. `POST /api/v1/queue/backtest` with backtest parameters
**Expected:** 201 Created. Job enqueued.

### TC-BT-048: Submit bulk backtest via queue
**Priority:** P2
**Steps:**
1. `POST /api/v1/queue/bulk-backtest` with multiple symbol parameters
**Expected:** 201 Created. Bulk job enqueued.

### TC-BT-049: Cancel another user's job
**Priority:** P2
**Steps:**
1. `POST /api/v1/queue/jobs/{other_user_job_id}/cancel`
**Expected:** 403 or 404. Cannot cancel other user's job.
