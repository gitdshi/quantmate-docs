# TC-MARKET-DATA: Market Data

## Endpoints Covered

- `GET /api/v1/data/symbols`
- `GET /api/v1/data/history/{vt_symbol}`
- `GET /api/v1/data/indicators/{vt_symbol}`
- `GET /api/v1/data/overview`
- `GET /api/v1/data/sectors`
- `GET /api/v1/data/exchanges`
- `GET /api/v1/data/indexes`
- `GET /api/v1/data/symbols-by-filter`
- `GET /api/v1/market/exchanges`
- `GET /api/v1/market/hk/stocks`
- `GET /api/v1/market/hk/daily`
- `GET /api/v1/market/us/stocks`
- `GET /api/v1/market/us/daily`
- `GET /api/v1/data/watchlists`
- `POST /api/v1/data/watchlists`
- `PUT /api/v1/data/watchlists/{watchlist_id}`
- `DELETE /api/v1/data/watchlists/{watchlist_id}`
- `POST /api/v1/data/watchlists/{watchlist_id}/items`
- `DELETE /api/v1/data/watchlists/{watchlist_id}/items/{symbol}`
- `WS /api/v1/ws/{channel}`
- `GET /api/v1/settings/datasource-items`
- `PUT /api/v1/settings/datasource-items/batch`
- `PUT /api/v1/settings/datasource-items/{item_key}`
- `POST /api/v1/settings/datasource-items/test/{source}`

---

## 1. Symbol Listing

### TC-DATA-001: List available symbols
**Priority:** P1
**Preconditions:** Authenticated user; tushare DB has symbol data
**Steps:**
1. `GET /api/v1/data/symbols`
**Expected:** 200 OK. Array of symbol objects with `vt_symbol`, `name`, `exchange`.

### TC-DATA-002: List symbols with pagination
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/symbols?offset=0&limit=20`
**Expected:** 200 OK. Max 20 results returned. Response may include `total` count.

### TC-DATA-003: List symbols without auth
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/symbols` without Authorization header
**Expected:** 401 Unauthorized.

---

## 2. OHLC History

### TC-DATA-010: Get history for valid symbol
**Priority:** P1
**Preconditions:** Symbol `000001.SZ` exists in tushare DB with daily data
**Steps:**
1. `GET /api/v1/data/history/000001.SZ?interval=1d&start=2024-01-01&end=2024-03-01`
**Expected:** 200 OK. Array of OHLCV bars with `datetime`, `open`, `high`, `low`, `close`, `volume`.

### TC-DATA-011: Get history with pagination
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/history/000001.SZ?interval=1d&offset=0&limit=50`
**Expected:** 200 OK. Max 50 bars returned.

### TC-DATA-012: Get history for non-existent symbol
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/history/INVALID.XX`
**Expected:** 404 Not Found or 200 with empty array.

### TC-DATA-013: Get history with invalid date range
**Priority:** P3
**Steps:**
1. `GET /api/v1/data/history/000001.SZ?start=2025-01-01&end=2024-01-01`
**Expected:** 400 Bad Request. Start date must be before end date.

---

## 3. Technical Indicators

### TC-DATA-020: Get indicators for symbol
**Priority:** P2
**Preconditions:** Symbol with sufficient historical data
**Steps:**
1. `GET /api/v1/data/indicators/000001.SZ?indicators=sma_20,rsi_14`
**Expected:** 200 OK. Returns computed indicator values aligned with dates.

### TC-DATA-021: Get indicators without specifying which
**Priority:** P3
**Steps:**
1. `GET /api/v1/data/indicators/000001.SZ`
**Expected:** 200 OK with default indicators, or 400 if indicator selection required.

---

## 4. Market Overview

### TC-DATA-030: Get market overview
**Priority:** P1
**Steps:**
1. `GET /api/v1/data/overview`
**Expected:** 200 OK. Summary with index levels, trading volume, top gainers/losers or similar.

### TC-DATA-031: Get sectors
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/sectors`
**Expected:** 200 OK. List of sector names with aggregate metrics.

### TC-DATA-032: Get exchanges
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/exchanges`
**Expected:** 200 OK. List of supported exchanges (SSE, SZSE, etc.).

### TC-DATA-033: Get benchmark indexes
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/indexes`
**Expected:** 200 OK. List of available benchmark indexes.

### TC-DATA-034: Filter symbols by industry/exchange
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/symbols-by-filter?exchange=SSE&industry=银行`
**Expected:** 200 OK. Filtered list of symbols matching criteria.

---

## 5. Multi-Market Data

### TC-DATA-040: List supported exchanges
**Priority:** P2
**Steps:**
1. `GET /api/v1/market/exchanges`
**Expected:** 200 OK. List including HK, US exchanges.

### TC-DATA-041: List HK stocks
**Priority:** P2
**Steps:**
1. `GET /api/v1/market/hk/stocks`
**Expected:** 200 OK. Array of HK stock symbols.

### TC-DATA-042: Get HK daily OHLCV
**Priority:** P2
**Steps:**
1. `GET /api/v1/market/hk/daily?symbol=00700&start=2024-01-01&end=2024-03-01`
**Expected:** 200 OK. Daily OHLCV data for Tencent (00700).

### TC-DATA-043: List US stocks
**Priority:** P2
**Steps:**
1. `GET /api/v1/market/us/stocks`
**Expected:** 200 OK. Array of US stock symbols.

### TC-DATA-044: Get US daily OHLCV
**Priority:** P2
**Steps:**
1. `GET /api/v1/market/us/daily?symbol=AAPL&start=2024-01-01&end=2024-03-01`
**Expected:** 200 OK. Daily OHLCV data for Apple.

---

## 6. Watchlist Management

### TC-DATA-050: Create watchlist
**Priority:** P2
**Preconditions:** Authenticated user
**Steps:**
1. `POST /api/v1/data/watchlists` with body:
   ```json
   { "name": "My Watchlist", "description": "Test watchlist" }
   ```
**Expected:** 201 Created. Returns watchlist with `id`, `name`.

### TC-DATA-051: List watchlists
**Priority:** P2
**Steps:**
1. `GET /api/v1/data/watchlists`
**Expected:** 200 OK. Array of user's watchlists.

### TC-DATA-052: Add item to watchlist
**Priority:** P2
**Preconditions:** Watchlist exists
**Steps:**
1. `POST /api/v1/data/watchlists/{watchlist_id}/items` with body:
   ```json
   { "symbol": "000001.SZ" }
   ```
**Expected:** 200 or 201. Symbol added to watchlist.

### TC-DATA-053: Remove item from watchlist
**Priority:** P2
**Steps:**
1. `DELETE /api/v1/data/watchlists/{watchlist_id}/items/000001.SZ`
**Expected:** 200 OK. Symbol removed.

### TC-DATA-054: Update watchlist
**Priority:** P3
**Steps:**
1. `PUT /api/v1/data/watchlists/{watchlist_id}` with body:
   ```json
   { "name": "Renamed Watchlist" }
   ```
**Expected:** 200 OK. Name updated.

### TC-DATA-055: Delete watchlist
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/data/watchlists/{watchlist_id}`
**Expected:** 200 OK. Watchlist removed.

### TC-DATA-056: Access another user's watchlist
**Priority:** P2
**Steps:**
1. `PUT /api/v1/data/watchlists/{other_user_watchlist_id}` as different user
**Expected:** 403 or 404. Cannot modify other user's watchlist.

---

## 7. WebSocket Real-Time Data

### TC-DATA-060: Connect to market channel
**Priority:** P2
**Preconditions:** Valid JWT access token
**Steps:**
1. Open WebSocket: `ws://localhost:8000/api/v1/ws/market:000001.SZ?token=<jwt>`
2. Wait for initial message
**Expected:** Connection established. Receives real-time market data messages in JSON format.

### TC-DATA-061: Connect to alerts channel
**Priority:** P3
**Steps:**
1. Open WebSocket: `ws://localhost:8000/api/v1/ws/alerts:<user_id>?token=<jwt>`
**Expected:** Connection established. Receives alert notifications.

### TC-DATA-062: Connect without token
**Priority:** P2
**Steps:**
1. Open WebSocket: `ws://localhost:8000/api/v1/ws/market:000001.SZ` (no token)
**Expected:** Connection rejected (401 or connection close with auth error).

### TC-DATA-063: Connect with expired token
**Priority:** P2
**Steps:**
1. Open WebSocket with expired JWT
**Expected:** Connection rejected or closed shortly after with auth error.

---

## 8. Data Source Settings

### TC-DATA-070: List data source items
**Priority:** P2
**Steps:**
1. `GET /api/v1/settings/datasource-items`
**Expected:** 200 OK. List of configured data source items (tushare, akshare, etc.).

### TC-DATA-071: Update single data source item
**Priority:** P2
**Steps:**
1. `PUT /api/v1/settings/datasource-items/tushare_daily` with body:
   ```json
   { "enabled": true, "schedule": "0 18 * * 1-5" }
   ```
**Expected:** 200 OK. Item updated.

### TC-DATA-072: Batch update data source items
**Priority:** P3
**Steps:**
1. `PUT /api/v1/settings/datasource-items/batch` with array of items
**Expected:** 200 OK. All items updated.

### TC-DATA-073: Test data source connection
**Priority:** P2
**Steps:**
1. `POST /api/v1/settings/datasource-items/test/tushare`
**Expected:** 200 OK. Returns connection test result (success/failure with details).

### TC-DATA-074: Test connection with invalid source
**Priority:** P3
**Steps:**
1. `POST /api/v1/settings/datasource-items/test/invalid_source`
**Expected:** 404 or 400. Unknown data source.
