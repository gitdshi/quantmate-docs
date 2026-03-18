# TC-TRADING: Trading & Portfolio

## Endpoints Covered

- `POST /api/v1/trade/orders`
- `GET /api/v1/trade/orders`
- `GET /api/v1/trade/orders/{order_id}`
- `POST /api/v1/trade/orders/{order_id}/cancel`
- `POST /api/v1/trade/algo/twap`
- `POST /api/v1/trade/algo/vwap`
- `POST /api/v1/trade/algo/iceberg`
- `GET /api/v1/portfolio/positions`
- `POST /api/v1/portfolio/close`
- `GET /api/v1/portfolio/{portfolio_id}/transactions`
- `GET /api/v1/portfolio/{portfolio_id}/snapshots`
- `POST /api/v1/portfolio/position-sizing`
- `POST /api/v1/portfolio/attribution`
- `GET /api/v1/risk/rules`
- `POST /api/v1/risk/rules`
- `PUT /api/v1/risk/rules/{rule_id}`
- `DELETE /api/v1/risk/rules/{rule_id}`
- `POST /api/v1/risk/check`
- `POST /api/v1/risk/var/parametric`
- `POST /api/v1/risk/var/historical`
- `POST /api/v1/risk/stress-test`
- `GET /api/v1/broker/configs`
- `POST /api/v1/broker/configs`
- `PUT /api/v1/broker/configs/{config_id}`
- `DELETE /api/v1/broker/configs/{config_id}`

---

## 1. Order Management

### TC-TRADE-001: Create buy order
**Priority:** P1
**Preconditions:** Authenticated user, broker configured
**Steps:**
1. `POST /api/v1/trade/orders` with body:
   ```json
   {
     "symbol": "000001.SZ",
     "direction": "buy",
     "price": 10.50,
     "volume": 100,
     "order_type": "limit"
   }
   ```
**Expected:** 201 Created. Returns `order_id`, `status: "pending"`.

### TC-TRADE-002: Create sell order
**Priority:** P1
**Steps:**
1. `POST /api/v1/trade/orders` with `direction: "sell"` and valid position
**Expected:** 201 Created. Returns order details.

### TC-TRADE-003: List orders
**Priority:** P1
**Steps:**
1. `GET /api/v1/trade/orders`
**Expected:** 200 OK. Paginated list of user's orders.

### TC-TRADE-004: List orders with pagination
**Priority:** P2
**Steps:**
1. `GET /api/v1/trade/orders?offset=0&limit=10`
**Expected:** 200 OK. Max 10 orders.

### TC-TRADE-005: Get order detail
**Priority:** P1
**Steps:**
1. `GET /api/v1/trade/orders/{order_id}`
**Expected:** 200 OK. Full order object with `symbol`, `direction`, `price`, `volume`, `status`, `created_at`.

### TC-TRADE-006: Cancel pending order
**Priority:** P1
**Preconditions:** Order in `pending` status
**Steps:**
1. `POST /api/v1/trade/orders/{order_id}/cancel`
**Expected:** 200 OK. Order status changed to `cancelled`.

### TC-TRADE-007: Cancel filled order
**Priority:** P2
**Steps:**
1. `POST /api/v1/trade/orders/{order_id}/cancel` where order is `filled`
**Expected:** 400. Cannot cancel filled order.

### TC-TRADE-008: Create order with invalid symbol
**Priority:** P2
**Steps:**
1. `POST /api/v1/trade/orders` with `symbol: "INVALID"`
**Expected:** 400 or 404. Symbol not found.

### TC-TRADE-009: Create order with zero volume
**Priority:** P2
**Steps:**
1. `POST /api/v1/trade/orders` with `volume: 0`
**Expected:** 422. Volume must be positive.

---

## 2. Algorithmic Orders

### TC-TRADE-020: Generate TWAP slices
**Priority:** P2
**Steps:**
1. `POST /api/v1/trade/algo/twap` with body:
   ```json
   {
     "symbol": "000001.SZ",
     "total_volume": 10000,
     "duration_minutes": 60,
     "slices": 6
   }
   ```
**Expected:** 200 OK. Returns array of TWAP order slices with timestamp, volume per slice.

### TC-TRADE-021: Generate VWAP slices
**Priority:** P2
**Steps:**
1. `POST /api/v1/trade/algo/vwap` with body:
   ```json
   {
     "symbol": "000001.SZ",
     "total_volume": 10000,
     "start_time": "09:30",
     "end_time": "15:00"
   }
   ```
**Expected:** 200 OK. Returns VWAP execution plan weighted by historical volume profile.

### TC-TRADE-022: Generate Iceberg slices
**Priority:** P2
**Steps:**
1. `POST /api/v1/trade/algo/iceberg` with body:
   ```json
   {
     "symbol": "000001.SZ",
     "total_volume": 10000,
     "display_volume": 500,
     "price_limit": 10.50
   }
   ```
**Expected:** 200 OK. Returns iceberg order configuration.

---

## 3. Portfolio Positions

### TC-TRADE-030: Get open positions
**Priority:** P1
**Steps:**
1. `GET /api/v1/portfolio/positions`
**Expected:** 200 OK. List of open positions with `symbol`, `volume`, `avg_price`, `market_value`, `unrealized_pnl`.

### TC-TRADE-031: Close a position
**Priority:** P1
**Preconditions:** Open position exists
**Steps:**
1. `POST /api/v1/portfolio/close` with body:
   ```json
   { "symbol": "000001.SZ", "volume": 100 }
   ```
**Expected:** 200 OK. Position closed (partially or fully). Close order created.

### TC-TRADE-032: Close position with volume exceeding held
**Priority:** P2
**Steps:**
1. `POST /api/v1/portfolio/close` with volume > current position
**Expected:** 400. Cannot close more than held.

### TC-TRADE-033: Get transaction history
**Priority:** P2
**Steps:**
1. `GET /api/v1/portfolio/{portfolio_id}/transactions?offset=0&limit=20`
**Expected:** 200 OK. Paginated list of buy/sell transactions.

### TC-TRADE-034: Get daily NAV snapshots
**Priority:** P2
**Steps:**
1. `GET /api/v1/portfolio/{portfolio_id}/snapshots`
**Expected:** 200 OK. Array of daily snapshots with `date`, `nav`, `cash`, `positions_value`.

---

## 4. Position Sizing & Attribution

### TC-TRADE-040: Calculate position size
**Priority:** P2
**Steps:**
1. `POST /api/v1/portfolio/position-sizing` with body:
   ```json
   {
     "capital": 100000,
     "risk_per_trade": 0.02,
     "entry_price": 10.50,
     "stop_loss": 9.80
   }
   ```
**Expected:** 200 OK. Returns `position_size` (shares), `risk_amount`, `total_cost`.

### TC-TRADE-041: Calculate performance attribution
**Priority:** P2
**Steps:**
1. `POST /api/v1/portfolio/attribution` with body:
   ```json
   { "portfolio_id": 1, "start_date": "2024-01-01", "end_date": "2024-06-30" }
   ```
**Expected:** 200 OK. Returns attribution breakdown: sector allocation, stock selection, interaction effects.

---

## 5. Risk Management

### TC-TRADE-050: List risk rules
**Priority:** P2
**Steps:**
1. `GET /api/v1/risk/rules`
**Expected:** 200 OK. User's risk rules.

### TC-TRADE-051: Create risk rule
**Priority:** P2
**Steps:**
1. `POST /api/v1/risk/rules` with body:
   ```json
   {
     "name": "Max Position Size",
     "type": "position_limit",
     "params": { "max_percent": 10 },
     "enabled": true
   }
   ```
**Expected:** 201 Created.

### TC-TRADE-052: Update risk rule
**Priority:** P3
**Steps:**
1. `PUT /api/v1/risk/rules/{rule_id}` with updated params
**Expected:** 200 OK.

### TC-TRADE-053: Delete risk rule
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/risk/rules/{rule_id}`
**Expected:** 200 OK.

### TC-TRADE-054: Pre-trade risk check (pass)
**Priority:** P1
**Preconditions:** Risk rules configured
**Steps:**
1. `POST /api/v1/risk/check` with body:
   ```json
   {
     "symbol": "000001.SZ",
     "direction": "buy",
     "volume": 100,
     "price": 10.50
   }
   ```
**Expected:** 200 OK. Returns `{ "passed": true, "rules_checked": [...] }`.

### TC-TRADE-055: Pre-trade risk check (fail)
**Priority:** P1
**Preconditions:** Risk rule with max 5% position concentration
**Steps:**
1. Submit order that exceeds the position limit
**Expected:** 200 OK. Returns `{ "passed": false, "violations": [...] }`.

### TC-TRADE-056: Compute parametric VaR
**Priority:** P2
**Steps:**
1. `POST /api/v1/risk/var/parametric` with portfolio data and confidence level
**Expected:** 200 OK. Returns VaR value at specified confidence.

### TC-TRADE-057: Compute historical VaR & CVaR
**Priority:** P2
**Steps:**
1. `POST /api/v1/risk/var/historical` with portfolio data and window
**Expected:** 200 OK. Returns VaR and CVaR values.

### TC-TRADE-058: Stress test portfolio
**Priority:** P2
**Steps:**
1. `POST /api/v1/risk/stress-test` with body:
   ```json
   {
     "portfolio_id": 1,
     "scenarios": [
       { "name": "Market Crash", "shock": -0.20 },
       { "name": "Rate Hike", "shock": -0.05 }
     ]
   }
   ```
**Expected:** 200 OK. Impact on portfolio value for each scenario.

---

## 6. Broker Configuration

### TC-TRADE-060: List broker configs
**Priority:** P2
**Steps:**
1. `GET /api/v1/broker/configs`
**Expected:** 200 OK. List of configured brokers. Secrets masked.

### TC-TRADE-061: Create broker config
**Priority:** P2
**Steps:**
1. `POST /api/v1/broker/configs` with body:
   ```json
   {
     "name": "CTP Simulation",
     "broker_type": "ctp",
     "host": "tcp://180.168.146.187:10130",
     "broker_id": "9999",
     "app_id": "simnow_client_test",
     "auth_code": "0000000000000000"
   }
   ```
**Expected:** 201 Created. Broker config stored (sensitive fields encrypted).

### TC-TRADE-062: Update broker config
**Priority:** P3
**Steps:**
1. `PUT /api/v1/broker/configs/{config_id}` with updated host
**Expected:** 200 OK.

### TC-TRADE-063: Delete broker config
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/broker/configs/{config_id}`
**Expected:** 200 OK.

### TC-TRADE-064: Broker config isolation
**Priority:** P2
**Steps:**
1. User A creates broker config → User B lists configs
**Expected:** User B cannot see User A's broker configs.
