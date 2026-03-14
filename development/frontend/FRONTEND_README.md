# QuantMate Frontend

React 18 + Vite + TypeScript frontend for QuantMate trading platform.

## Tech Stack

- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite 7.3** - Build tool and dev server
- **TailwindCSS 3.x** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **TanStack React Query** - Server state management
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/           # Reusable UI components
│   └── Layout.tsx       # Main layout with sidebar navigation
├── pages/               # Page components
│   ├── auth/
│   │   ├── Login.tsx    # Login page
│   │   └── Register.tsx # Registration page
│   │   └── ChangePassword.tsx # Forced password change
│   ├── Dashboard.tsx    # Dashboard with queue stats
│   ├── Strategies.tsx   # Strategy management (placeholder)
│   ├── Backtest.tsx     # Backtest interface (placeholder)
│   └── MarketData.tsx   # Market data viewer (placeholder)
├── lib/
│   └── api.ts          # Axios API client with interceptors
├── stores/
│   └── auth.ts         # Zustand auth store
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx             # Root component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles with TailwindCSS
```

## Features

### Authentication
- Login/Register pages with form validation
- JWT token management with automatic refresh
- Protected routes (PrivateRoute wrapper)
- Persistent auth state in localStorage
- Forced password change flow on first admin login

### API Client
- Axios instance with base URL configuration
- Request interceptor for auth token injection
- Response interceptor for 401 handling and token refresh
- API modules:
  - `authAPI` - Authentication endpoints
  - `strategiesAPI` - Strategy CRUD operations
  - `backtestAPI` - Backtest job submission and status
  - `queueAPI` - Queue statistics and job management
  - `marketDataAPI` - Market data retrieval

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running at http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev -- --host 0.0.0.0 --port 5173

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The app runs on http://localhost:5173 by default.
Dev proxy forwards `/api` to `http://localhost:8000` (see `vite.config.ts`).

### Routes
- `/login` - Login page
- `/register` - Registration page
- `/change-password` - Change password (protected)
- `/` - Dashboard (protected)
- `/strategies` - Strategy management (protected)
- `/backtest` - Backtest interface (protected)
- `/market-data` - Market data viewer (protected)

## Next Steps (Phase 4+)

1. **Strategy Management UI**
2. **Backtest Interface**
3. **Market Data Charts**
4. **Advanced Features**
