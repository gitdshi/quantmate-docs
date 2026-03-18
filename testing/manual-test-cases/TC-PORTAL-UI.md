# TC-PORTAL-UI: Portal Frontend Manual Tests

## Pages Covered

| Route | Page |
|-------|------|
| `/login` | Login |
| `/register` | Register |
| `/change-password` | Change Password |
| `/dashboard` | Dashboard |
| `/strategies` | Strategy Management |
| `/backtest` | Backtesting |
| `/market-data` | Market Data Explorer |
| `/analytics` | Analytics |
| `/portfolio` | Portfolio |
| `/trading` | Trading |
| `/monitoring` | System Monitoring |
| `/reports` | Reports |
| `/account-security` | Account Security |
| `/ai-assistant` | AI Assistant |
| `/factor-lab` | Factor Lab |
| `/marketplace` | Template Marketplace |
| `/team-space` | Team Workspace |
| `/visual-explorer` | Visual Explorer |
| `/settings` | Settings |

---

## 1. Login Page

### TC-UI-001: Login page renders correctly
**Priority:** P1
**Steps:**
1. Navigate to `/login`
**Expected:** Page shows "Welcome to QuantMate" heading, username/password fields (`#username`, `#password`), "Sign in" button, link to register.

### TC-UI-002: Login with valid credentials
**Priority:** P1
**Steps:**
1. Navigate to `/login`
2. Enter `admin` in `#username`, `admin123` in `#password`
3. Click "Sign in"
**Expected:** Redirect to `/dashboard`. Sidebar navigation visible.

### TC-UI-003: Login with invalid credentials
**Priority:** P1
**Steps:**
1. Navigate to `/login`
2. Enter invalid credentials
3. Click "Sign in"
**Expected:** Error message displayed in red alert box. Stays on login page.

### TC-UI-004: Login form validation
**Priority:** P2
**Steps:**
1. Navigate to `/login`
2. Leave fields empty, click "Sign in"
**Expected:** Browser validation prevents submission (required fields).

---

## 2. Register Page

### TC-UI-010: Register page renders
**Priority:** P1
**Steps:**
1. Navigate to `/register`
**Expected:** Shows "Create an account" heading, fields: `#username`, `#email`, `#password`, `#confirmPassword`, "Create account" button.

### TC-UI-011: Successful registration
**Priority:** P1
**Steps:**
1. Fill all fields with valid data (unique username/email)
2. Click "Create account"
**Expected:** Success message or redirect to `/login`.

### TC-UI-012: Password mismatch
**Priority:** P2
**Steps:**
1. Enter different values in password and confirm password
2. Click "Create account"
**Expected:** Validation error about password mismatch.

### TC-UI-013: Navigate back to login
**Priority:** P3
**Steps:**
1. On register page, click "Sign in" link
**Expected:** Navigates to `/login`.

---

## 3. Change Password Page

### TC-UI-020: Change password form
**Priority:** P1
**Preconditions:** Logged in user with must_change_password=true
**Steps:**
1. Login (should be redirected to `/change-password`)
**Expected:** Shows password change form with old password, new password, confirm fields.

### TC-UI-021: Successful password change
**Priority:** P1
**Steps:**
1. Fill old password, new password, confirm
2. Submit
**Expected:** Success message. Redirect to `/dashboard`.

---

## 4. Dashboard

### TC-UI-030: Dashboard loads after login
**Priority:** P1
**Steps:**
1. Login with valid credentials
**Expected:** Dashboard page loads with heading. Shows portfolio summary, recent activity, or empty state for new users.

### TC-UI-031: Sidebar navigation visible
**Priority:** P1
**Steps:**
1. From dashboard, check sidebar
**Expected:** Sidebar shows links: Dashboard, Strategies, Backtest, Market Data, Analytics, Portfolio, Trading, Monitoring, Reports, Account & Security, AI Assistant, Factor Lab, Marketplace, Team Space, Visual Explorer, Settings.

### TC-UI-032: Navigation to all pages
**Priority:** P1
**Steps:**
1. Click each sidebar link
**Expected:** Each navigates to the correct page with the expected heading. No errors.

---

## 5. Strategies Page

### TC-UI-040: Strategies page renders
**Priority:** P1
**Steps:**
1. Navigate to `/strategies`
**Expected:** Shows "Strategies" heading. Action buttons visible (New Strategy, etc.).

### TC-UI-041: Strategy list displays
**Priority:** P1
**Preconditions:** At least one strategy exists
**Steps:**
1. Navigate to `/strategies`
**Expected:** Strategy list/cards shown with name, description, status.

### TC-UI-042: Create new strategy
**Priority:** P1
**Steps:**
1. Click "New Strategy" button
2. Fill in strategy name, description, code
3. Save
**Expected:** Strategy created. Appears in list.

### TC-UI-043: View strategy detail
**Priority:** P2
**Steps:**
1. Click on a strategy in the list
**Expected:** Detail view with code editor (SyntaxHighlighter), parameters, tabs (files/optimize).

### TC-UI-044: Edit strategy
**Priority:** P2
**Steps:**
1. Open strategy detail
2. Modify code or description
3. Save
**Expected:** Changes saved. Success feedback.

### TC-UI-045: Delete strategy
**Priority:** P2
**Steps:**
1. Click delete on a strategy
2. Confirm deletion
**Expected:** Strategy removed from list.

---

## 6. Backtest Page

### TC-UI-050: Backtest page renders
**Priority:** P1
**Steps:**
1. Navigate to `/backtest`
**Expected:** Shows "Backtest" heading. "Bulk Test" (orange) and "New Backtest" buttons visible.

### TC-UI-051: Open new backtest form
**Priority:** P1
**Steps:**
1. Click "New Backtest"
**Expected:** Backtest form appears with strategy selector, symbol, date range, initial capital fields.

### TC-UI-052: Submit backtest
**Priority:** P1
**Steps:**
1. Fill backtest form (select strategy, enter symbol, dates, capital)
2. Submit
**Expected:** Backtest submitted. Job appears in job list with "queued" status.

### TC-UI-053: View backtest results
**Priority:** P1
**Preconditions:** Completed backtest exists
**Steps:**
1. Click on a completed backtest job
**Expected:** Results displayed: total return, Sharpe ratio, drawdown, equity chart.

### TC-UI-054: Bulk backtest
**Priority:** P2
**Steps:**
1. Click "Bulk Test"
2. Configure batch parameters
3. Submit
**Expected:** Batch job created.

---

## 7. Market Data Page

### TC-UI-060: Market data page renders
**Priority:** P1
**Steps:**
1. Navigate to `/market-data`
**Expected:** Market data page with symbol search, chart area, data table.

### TC-UI-061: Search for symbol
**Priority:** P1
**Steps:**
1. Enter a symbol (e.g., `000001`) in search
**Expected:** Symbol found, OHLCV chart displayed.

### TC-UI-062: View historical data table
**Priority:** P2
**Steps:**
1. Load a symbol's data
**Expected:** Table with date, open, high, low, close, volume columns.

### TC-UI-063: Change time interval
**Priority:** P2
**Steps:**
1. Switch between daily/weekly/monthly intervals (if available)
**Expected:** Chart and table update accordingly.

---

## 8. Analytics Page

### TC-UI-070: Analytics page renders
**Priority:** P1
**Steps:**
1. Navigate to `/analytics`
**Expected:** Analytics dashboard with charts, metrics.

### TC-UI-071: Portfolio metrics display
**Priority:** P2
**Preconditions:** Portfolio with positions
**Steps:**
1. View analytics page
**Expected:** Shows portfolio value, P&L, risk metrics, allocation charts.

---

## 9. Portfolio Page

### TC-UI-080: Portfolio page renders
**Priority:** P1
**Steps:**
1. Navigate to `/portfolio`
**Expected:** Portfolio view with positions table, NAV chart.

### TC-UI-081: View open positions
**Priority:** P1
**Steps:**
1. Check positions section
**Expected:** Lists open positions with symbol, qty, avg price, market value, P&L.

### TC-UI-082: View transaction history
**Priority:** P2
**Steps:**
1. Navigate to transaction history tab/section
**Expected:** List of buy/sell transactions with timestamps.

---

## 10. Trading Page

### TC-UI-090: Trading page renders
**Priority:** P1
**Steps:**
1. Navigate to `/trading`
**Expected:** Order entry form, order book, recent orders.

### TC-UI-091: Place a limit order
**Priority:** P1
**Steps:**
1. Select symbol, enter price, volume
2. Click Buy or Sell
**Expected:** Order placed. Appears in order list with "pending" status.

### TC-UI-092: Cancel an order
**Priority:** P2
**Steps:**
1. Find a pending order
2. Click Cancel
**Expected:** Order status changed to "cancelled".

---

## 11. Monitoring Page

### TC-UI-100: Monitoring page renders
**Priority:** P2
**Steps:**
1. Navigate to `/monitoring`
**Expected:** System monitoring dashboard with service status, data sync status, queue stats.

---

## 12. Reports Page

### TC-UI-110: Reports page renders
**Priority:** P2
**Steps:**
1. Navigate to `/reports`
**Expected:** Report list and "Generate Report" button.

### TC-UI-111: Generate a report
**Priority:** P2
**Steps:**
1. Click "Generate Report"
2. Select report type and parameters
3. Submit
**Expected:** Report generation initiated. Appears in list.

---

## 13. Account Security Page

### TC-UI-120: Account security page renders
**Priority:** P2
**Steps:**
1. Navigate to `/account-security`
**Expected:** Sections for password change, MFA setup, active sessions, API keys.

### TC-UI-121: Manage active sessions
**Priority:** P2
**Steps:**
1. View active sessions list
2. Revoke a session
**Expected:** Session removed from list.

### TC-UI-122: Manage API keys
**Priority:** P3
**Steps:**
1. Create new API key
2. View key list
3. Delete a key
**Expected:** Key created/shown/deleted.

---

## 14. AI Assistant Page

### TC-UI-130: AI assistant page renders
**Priority:** P2
**Steps:**
1. Navigate to `/ai-assistant`
**Expected:** Conversation list, message area, input box.

### TC-UI-131: Start new conversation
**Priority:** P2
**Steps:**
1. Click new conversation
2. Type a message and send
**Expected:** AI responds. Message appears in chat.

---

## 15. Factor Lab Page

### TC-UI-140: Factor lab page renders
**Priority:** P2
**Steps:**
1. Navigate to `/factor-lab`
**Expected:** Factor list, create button, evaluation area.

### TC-UI-141: Create a factor
**Priority:** P2
**Steps:**
1. Click create factor
2. Enter name, expression, description
3. Save
**Expected:** Factor created and listed.

---

## 16. Marketplace Page

### TC-UI-150: Marketplace page renders
**Priority:** P2
**Steps:**
1. Navigate to `/marketplace`
**Expected:** Template grid/list with search, categories, ratings.

### TC-UI-151: Clone a template
**Priority:** P2
**Steps:**
1. Browse templates
2. Click Clone on a template
**Expected:** Template cloned to user's strategies.

---

## 17. Team Space Page

### TC-UI-160: Team space page renders
**Priority:** P2
**Steps:**
1. Navigate to `/team-space`
**Expected:** Workspace list, create workspace button.

### TC-UI-161: Create and manage workspace
**Priority:** P2
**Steps:**
1. Create workspace
2. Add member
3. Share a strategy
**Expected:** Workspace created, member added, strategy visible to member.

---

## 18. Settings Page

### TC-UI-170: Settings page renders
**Priority:** P2
**Steps:**
1. Navigate to `/settings`
**Expected:** User preferences, data source settings, notification preferences.

### TC-UI-171: Update data source settings
**Priority:** P2
**Steps:**
1. Toggle a data source on/off
2. Save
**Expected:** Setting saved. Toast/notification confirms.

---

## 19. Visual Explorer Page

### TC-UI-180: Visual explorer page renders
**Priority:** P2
**Steps:**
1. Navigate to `/visual-explorer`
**Expected:** Visual data exploration interface loads.

---

## 20. Logout

### TC-UI-190: Logout from sidebar
**Priority:** P1
**Steps:**
1. From any authenticated page, click the logout icon button (icon: `lucide-log-out`)
**Expected:** Redirect to `/login`. localStorage cleared. Accessing `/dashboard` redirects back to login.

---

## 21. Responsive Design

### TC-UI-200: Mobile viewport
**Priority:** P2
**Steps:**
1. Open any page in a mobile-width viewport (375px)
**Expected:** Layout adapts. Sidebar collapses to hamburger menu or is hidden. Content is readable.

### TC-UI-201: Tablet viewport
**Priority:** P3
**Steps:**
1. Open any page in a tablet viewport (768px)
**Expected:** Layout adapts gracefully.

---

## 22. Error Handling

### TC-UI-210: 404 page
**Priority:** P2
**Steps:**
1. Navigate to `/nonexistent-page`
**Expected:** 404 page or redirect to dashboard.

### TC-UI-211: Network error handling
**Priority:** P2
**Steps:**
1. Stop API server
2. Try to load dashboard
**Expected:** Error message displayed. No unhandled exceptions in console.

### TC-UI-212: Token expiry handling
**Priority:** P2
**Steps:**
1. Wait for access token to expire (or manually clear it)
2. Navigate to a page
**Expected:** Auto-refresh token (via refresh token) or redirect to login.
