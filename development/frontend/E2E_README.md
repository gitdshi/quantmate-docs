# E2E Test Suite (Portal)

## Scope (Current Features)

- Authentication (login, logout, password change)
- Strategy CRUD + built-ins
- Backtest submission and status
- Market data lookup
- Queue job views (if enabled in UI)

## Running E2E Tests

```bash
cd quantmate-portal
npm install -D @playwright/test
npx playwright install

npm run test:e2e
```

## Backend Prerequisite

```bash
cd ../quantmate
./scripts/api_service.sh start
```

## Notes

- Portfolio/analytics flows are not implemented in the current backend and are excluded from E2E coverage.
