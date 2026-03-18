# Manual Test Cases

Comprehensive manual test cases for the QuantMate platform, organized by feature module.

## Structure

| File | Module Group | Endpoints |
|------|-------------|-----------|
| [TC-AUTH.md](TC-AUTH.md) | Authentication & Security | auth, mfa, sessions, api-keys, kyc, audit |
| [TC-MARKET-DATA.md](TC-MARKET-DATA.md) | Market Data | data, multi-market, watchlist, websocket, settings |
| [TC-STRATEGIES.md](TC-STRATEGIES.md) | Strategy Management | strategies, strategy-code, templates, factors, indicators |
| [TC-BACKTEST.md](TC-BACKTEST.md) | Backtesting & Optimization | backtest, optimization, queue |
| [TC-TRADING.md](TC-TRADING.md) | Trading & Portfolio | trading, portfolio, risk, broker |
| [TC-ANALYTICS.md](TC-ANALYTICS.md) | Analytics & Reports | analytics, reports, trade-log |
| [TC-COLLABORATION.md](TC-COLLABORATION.md) | Collaboration | teams, ai-assistant |
| [TC-SYSTEM.md](TC-SYSTEM.md) | System Administration | system, system-config, alerts |
| [TC-PORTAL-UI.md](TC-PORTAL-UI.md) | Portal Frontend | all 17 pages + shared UI |

## Environment

- **Dev**: `http://localhost:5173` (Portal) / `http://localhost:8000` (API)
- **Staging**: `https://staging.quantmate.local`
- **Admin credentials**: Defined in `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)

## Test Case Format

Each test case follows:

```
TC-{MODULE}-{NUM}: {Title}
Priority: P1/P2/P3
Preconditions: ...
Steps:
  1. ...
  2. ...
Expected: ...
```

## Running Order

1. **TC-AUTH** — Must pass first (login/auth is prerequisite for all others)
2. **TC-MARKET-DATA** — Data is prerequisite for strategies/backtest
3. **TC-STRATEGIES** — Strategy CRUD needed before backtest
4. **TC-BACKTEST** — Depends on strategies and market data
5. **TC-TRADING** — Depends on strategies and brokers
6. All other modules can run independently
