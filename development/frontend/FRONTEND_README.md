# QuantMate Frontend

React 19 + Vite 7 + TypeScript 5.9 frontend for QuantMate trading platform.

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5.9** — Type safety
- **Vite 7** — Build tool and dev server
- **TailwindCSS 3.4** — Utility-first CSS (HSL CSS variables for theming)
- **React Router v6** — Client-side routing
- **Zustand 5** — Client state management
- **TanStack React Query 5** — Server state / data fetching
- **ECharts 5.6 + echarts-for-react** — Charting library
- **Axios** — HTTP client
- **Lucide React** — Icon library
- **i18next** — Internationalization (zh / en)

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx                # Sidebar navigation + Outlet
│   ├── ui/                       # Shared UI components
│   │   ├── StatCard.tsx          # KPI metric card
│   │   ├── TabPanel.tsx          # Tabbed layout with icons
│   │   ├── DataTable.tsx         # Sortable data table
│   │   ├── FilterBar.tsx         # Search + select filters
│   │   ├── Modal.tsx             # Dialog overlay
│   │   ├── Badge.tsx             # Status badges
│   │   ├── ProgressBar.tsx       # Usage / percent bars
│   │   ├── ToggleSwitch.tsx      # On/off toggle
│   │   └── Toast.tsx             # Toast + confirm dialogs
│   └── charts/                   # ECharts wrappers
│       ├── EChartWrapper.tsx     # Base echarts-for-react wrapper
│       ├── LineChart.tsx
│       ├── CandlestickChart.tsx
│       ├── PieChart.tsx
│       ├── BarChart.tsx
│       ├── HeatmapChart.tsx
│       └── GaugeChart.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ChangePassword.tsx
│   ├── Dashboard.tsx             # KPI cards, NAV chart, allocation, positions
│   ├── Strategies.tsx            # Strategy CRUD and deployment
│   ├── Trading.tsx               # Orders, fills, algo trading
│   ├── Positions.tsx             # Real-time positions + close
│   ├── Portfolio.tsx             # Portfolio overview + allocation
│   ├── MarketData.tsx            # Market data + candlestick charts
│   ├── Backtest.tsx              # Backtest config and results
│   ├── Analytics.tsx             # Factor exposure, correlation
│   ├── VisualExplorer.tsx        # Redirects to /analytics
│   ├── Reports.tsx               # Performance, review, attribution
│   ├── PaperTrading.tsx          # Paper deployments, orders, perf
│   ├── Monitoring.tsx            # Alerts, rules, notification channels
│   ├── AIAssistant.tsx           # Chat, codegen, insights, suggestions
│   ├── FactorLab.tsx             # Factor library, IC/IR, backtest
│   ├── Marketplace.tsx           # Strategy template marketplace
│   ├── TeamSpace.tsx             # Workspace management, members
│   ├── Settings.tsx              # 6-tab system settings
│   └── AccountSecurity.tsx       # Profile, 2FA, API keys, billing
├── lib/
│   └── api.ts                    # Axios client + all API modules
├── stores/
│   └── auth.ts                   # Zustand auth store
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
├── i18n/                         # i18next config and namespaces
├── App.tsx                       # Route definitions
└── main.tsx                      # Entry point
```

## Pages Overview

All pages are **native React components** using TanStack Query for data fetching,
shared UI components (StatCard, TabPanel, DataTable, etc.), and ECharts for
visualization. Chinese UI text is used throughout; placeholder data is shown
when backend APIs return empty results.

| Route               | Page            | Key Features                                        |
|---------------------|-----------------|-----------------------------------------------------|
| `/`                 | Dashboard       | KPI cards, NAV line chart, PieChart allocation       |
| `/strategies`       | Strategies      | Strategy CRUD, deploy to paper/live                  |
| `/trading`          | Trading         | Orders, fills, history, algo trading                 |
| `/positions`        | Positions       | Real-time positions, close button, P&L display       |
| `/portfolio`        | Portfolio       | Holdings, sector allocation, performance             |
| `/market-data`      | MarketData      | K-line candlestick, sector heatmap                   |
| `/backtest`         | Backtest        | Config form, equity curve, trade log                 |
| `/analytics`        | Analytics       | Factor exposure, correlation matrix                  |
| `/visual-explorer`  | VisualExplorer  | Redirect → `/analytics`                              |
| `/reports`          | Reports         | Performance stats, trade review, attribution         |
| `/paper-trading`    | PaperTrading    | Paper deployments, orders, NAV chart                 |
| `/monitoring`       | Monitoring      | Live alerts, rules, channels                         |
| `/ai`               | AIAssistant     | AI chat, code generation, insights                   |
| `/factor-lab`       | FactorLab       | Factor library, IC/IR analysis, factor backtest      |
| `/marketplace`      | Marketplace     | Strategy templates, search, categories               |
| `/team`             | TeamSpace       | Workspaces, members, invite                          |
| `/settings`         | Settings        | General, datasource, trading, notification, UI, sys  |
| `/account`          | AccountSecurity | Profile, security, API keys, sessions, billing       |

## API Client

All API modules are defined in `src/lib/api.ts`:

- `authAPI` — Login, register, me, refresh, change-password
- `analyticsAPI` — Dashboard analytics, factor exposure
- `portfolioAPI` — Positions, holdings, close
- `tradingAPI` — Orders, place, cancel
- `alertsAPI` — Active alerts, rules, history, channels
- `aiAPI` — Chat, code generation
- `factorAPI` — Factor CRUD, evaluation
- `templateAPI` — Marketplace templates
- `paperTradingAPI` — Paper sessions, start, stop
- `reportsAPI` — Report list, generate
- `teamAPI` — Workspaces, members
- `accountSecurityAPI` — API keys, sessions
- `systemAPI` — Health check, system info
- `marketDataAPI` — History, symbols, sectors
- `strategiesAPI` — Strategy CRUD
- `backtestAPI` — Submit, status, results

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running at http://localhost:8000

### Installation

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
npm run build
npm run preview
```

## Testing

```bash
npm test              # Run all unit tests
npm run test:ui       # Interactive Vitest UI
```

- **Vitest 4** — Test runner (jsdom environment)
- **@testing-library/react** — Component testing
- **jest-dom** — DOM matchers
- Unit tests: `test/unit/pages/` (one per page)
- Integration tests: `test/integration/` (routing + auth flow)
- Test wrapper: QueryClientProvider + BrowserRouter (`test/support/utils.tsx`)

## Routes

- `/login`, `/register`, `/change-password` — Auth pages
- All other routes are protected by `PrivateRoute` (JWT check)
