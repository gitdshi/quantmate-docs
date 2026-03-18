# TC-STRATEGIES: Strategy Management

## Endpoints Covered

- `GET /api/v1/strategies`
- `POST /api/v1/strategies`
- `GET /api/v1/strategies/{strategy_id}`
- `PUT /api/v1/strategies/{strategy_id}`
- `DELETE /api/v1/strategies/{strategy_id}`
- `POST /api/v1/strategy-code/parse`
- `POST /api/v1/strategy-code/lint`
- `POST /api/v1/strategy-code/lint/pyright`
- `GET /api/v1/templates/marketplace`
- `GET /api/v1/templates/mine`
- `POST /api/v1/templates`
- `GET /api/v1/templates/{template_id}`
- `PUT /api/v1/templates/{template_id}`
- `DELETE /api/v1/templates/{template_id}`
- `POST /api/v1/templates/{template_id}/clone`
- `GET /api/v1/templates/{template_id}/comments`
- `POST /api/v1/templates/{template_id}/comments`
- `DELETE /api/v1/templates/{template_id}/comments/{comment_id}`
- `POST /api/v1/templates/{template_id}/ratings`
- `DELETE /api/v1/templates/{template_id}/ratings/{rating_id}`
- `GET /api/v1/factors`
- `POST /api/v1/factors`
- `GET /api/v1/factors/{factor_id}`
- `PUT /api/v1/factors/{factor_id}`
- `DELETE /api/v1/factors/{factor_id}`
- `GET /api/v1/factors/{factor_id}/evaluations`
- `POST /api/v1/factors/{factor_id}/evaluations`
- `DELETE /api/v1/factors/{factor_id}/evaluations/{eval_id}`
- `GET /api/v1/indicators`
- `GET /api/v1/indicators/{indicator_id}`
- `POST /api/v1/indicators`
- `PUT /api/v1/indicators/{indicator_id}`
- `DELETE /api/v1/indicators/{indicator_id}`

---

## 1. Strategy CRUD

### TC-STRAT-001: List strategies (empty)
**Priority:** P1
**Preconditions:** Authenticated user with no strategies
**Steps:**
1. `GET /api/v1/strategies`
**Expected:** 200 OK. Empty array or paginated response with `items: []`.

### TC-STRAT-002: Create a strategy
**Priority:** P1
**Preconditions:** Authenticated user
**Steps:**
1. `POST /api/v1/strategies` with body:
   ```json
   {
     "name": "SMA Crossover",
     "description": "Simple moving average crossover strategy",
     "code": "class SmaCrossover:\n    def __init__(self):\n        self.fast = 5\n        self.slow = 20"
   }
   ```
**Expected:** 201 Created. Returns strategy with `id`, `name`, `description`, `code`, `created_at`.

### TC-STRAT-003: Get strategy detail
**Priority:** P1
**Preconditions:** Strategy exists
**Steps:**
1. `GET /api/v1/strategies/{strategy_id}`
**Expected:** 200 OK. Full strategy object with code.

### TC-STRAT-004: List strategies with pagination
**Priority:** P2
**Preconditions:** Multiple strategies exist
**Steps:**
1. `GET /api/v1/strategies?offset=0&limit=5`
**Expected:** 200 OK. Max 5 strategies. Pagination metadata present.

### TC-STRAT-005: Update strategy
**Priority:** P1
**Steps:**
1. `PUT /api/v1/strategies/{strategy_id}` with body:
   ```json
   { "description": "Updated description", "code": "# updated code" }
   ```
**Expected:** 200 OK. Updated fields reflected.

### TC-STRAT-006: Delete strategy
**Priority:** P1
**Steps:**
1. `DELETE /api/v1/strategies/{strategy_id}`
**Expected:** 204 No Content. Strategy no longer in list.

### TC-STRAT-007: Access another user's strategy
**Priority:** P2
**Steps:**
1. `GET /api/v1/strategies/{other_user_strategy_id}` as different user
**Expected:** 403 or 404. Cannot access other user's private strategy.

### TC-STRAT-008: Create strategy with empty name
**Priority:** P2
**Steps:**
1. `POST /api/v1/strategies` with body `{ "name": "", "code": "..." }`
**Expected:** 422. Validation error for required name.

---

## 2. Strategy Code Analysis

### TC-STRAT-020: Parse valid Python code
**Priority:** P2
**Steps:**
1. `POST /api/v1/strategy-code/parse` with body:
   ```json
   { "code": "class MyStrategy:\n    def __init__(self):\n        pass" }
   ```
**Expected:** 200 OK. Parsed AST or class structure returned.

### TC-STRAT-021: Parse invalid Python code
**Priority:** P2
**Steps:**
1. `POST /api/v1/strategy-code/parse` with body:
   ```json
   { "code": "def broken(\n" }
   ```
**Expected:** 200 with parse errors, or 400 with syntax error details.

### TC-STRAT-022: Lint strategy code
**Priority:** P2
**Steps:**
1. `POST /api/v1/strategy-code/lint` with body:
   ```json
   { "code": "import os\nx = 1" }
   ```
**Expected:** 200 OK. Returns lint warnings/errors (e.g., unused import).

### TC-STRAT-023: Pyright type checking
**Priority:** P3
**Steps:**
1. `POST /api/v1/strategy-code/lint/pyright` with body:
   ```json
   { "code": "x: int = 'hello'" }
   ```
**Expected:** 200 OK. Returns type errors.

---

## 3. Strategy Templates (Marketplace)

### TC-STRAT-030: List marketplace templates
**Priority:** P2
**Steps:**
1. `GET /api/v1/templates/marketplace?offset=0&limit=10`
**Expected:** 200 OK. Paginated list of published templates.

### TC-STRAT-031: List my templates
**Priority:** P2
**Steps:**
1. `GET /api/v1/templates/mine`
**Expected:** 200 OK. Templates created by current user.

### TC-STRAT-032: Create template
**Priority:** P2
**Steps:**
1. `POST /api/v1/templates` with body:
   ```json
   {
     "name": "RSI Strategy Template",
     "description": "RSI-based mean reversion",
     "code": "class RsiStrategy: ...",
     "tags": ["rsi", "mean-reversion"]
   }
   ```
**Expected:** 201 Created. Template with `id`.

### TC-STRAT-033: Get template detail
**Priority:** P2
**Steps:**
1. `GET /api/v1/templates/{template_id}`
**Expected:** 200 OK. Full template with code, author, ratings.

### TC-STRAT-034: Clone template
**Priority:** P2
**Steps:**
1. `POST /api/v1/templates/{template_id}/clone`
**Expected:** 201 Created. New strategy created in user's strategies from template.

### TC-STRAT-035: Update own template
**Priority:** P3
**Steps:**
1. `PUT /api/v1/templates/{template_id}` with updated fields
**Expected:** 200 OK. Updated.

### TC-STRAT-036: Delete own template
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/templates/{template_id}`
**Expected:** 204 No Content.

### TC-STRAT-037: Add comment to template
**Priority:** P3
**Steps:**
1. `POST /api/v1/templates/{template_id}/comments` with body:
   ```json
   { "content": "Great template! Works well with daily bars." }
   ```
**Expected:** 201 Created. Comment added.

### TC-STRAT-038: Rate a template
**Priority:** P3
**Steps:**
1. `POST /api/v1/templates/{template_id}/ratings` with body:
   ```json
   { "score": 5 }
   ```
**Expected:** 201 Created. Rating recorded.

### TC-STRAT-039: Delete own comment
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/templates/{template_id}/comments/{comment_id}`
**Expected:** 204 No Content.

---

## 4. Factor Lab

### TC-STRAT-050: List factors
**Priority:** P2
**Steps:**
1. `GET /api/v1/factors`
**Expected:** 200 OK. Array of user's factors.

### TC-STRAT-051: Create factor
**Priority:** P2
**Steps:**
1. `POST /api/v1/factors` with body:
   ```json
   {
     "name": "Momentum Factor",
     "expression": "close / close.shift(20) - 1",
     "description": "20-day momentum"
   }
   ```
**Expected:** 201 Created. Factor with `id`.

### TC-STRAT-052: Get factor detail
**Priority:** P2
**Steps:**
1. `GET /api/v1/factors/{factor_id}`
**Expected:** 200 OK. Full factor definition.

### TC-STRAT-053: Update factor
**Priority:** P3
**Steps:**
1. `PUT /api/v1/factors/{factor_id}` with updated expression
**Expected:** 200 OK.

### TC-STRAT-054: Delete factor
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/factors/{factor_id}`
**Expected:** 204 No Content.

### TC-STRAT-055: Run factor evaluation
**Priority:** P2
**Steps:**
1. `POST /api/v1/factors/{factor_id}/evaluations` with body:
   ```json
   { "universe": "HS300", "start_date": "2024-01-01", "end_date": "2024-06-01" }
   ```
**Expected:** 201 Created. Evaluation job submitted. Returns evaluation id.

### TC-STRAT-056: List factor evaluations
**Priority:** P3
**Steps:**
1. `GET /api/v1/factors/{factor_id}/evaluations`
**Expected:** 200 OK. List of evaluation results.

### TC-STRAT-057: Delete factor evaluation
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/factors/{factor_id}/evaluations/{eval_id}`
**Expected:** 204 No Content.

---

## 5. Indicator Library

### TC-STRAT-060: List indicators
**Priority:** P2
**Steps:**
1. `GET /api/v1/indicators`
**Expected:** 200 OK. Array of built-in and custom indicators.

### TC-STRAT-061: Get indicator detail
**Priority:** P3
**Steps:**
1. `GET /api/v1/indicators/{indicator_id}`
**Expected:** 200 OK. Indicator definition with parameters.

### TC-STRAT-062: Create custom indicator
**Priority:** P3
**Steps:**
1. `POST /api/v1/indicators` with body:
   ```json
   {
     "name": "Custom RSI",
     "formula": "ta.rsi(close, 14)",
     "description": "Custom RSI with 14-period lookback"
   }
   ```
**Expected:** 201 Created.

### TC-STRAT-063: Update custom indicator
**Priority:** P3
**Steps:**
1. `PUT /api/v1/indicators/{indicator_id}` with updated formula
**Expected:** 200 OK.

### TC-STRAT-064: Delete custom indicator
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/indicators/{indicator_id}`
**Expected:** 200 OK. Indicator removed.

### TC-STRAT-065: Delete built-in indicator
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/indicators/{builtin_id}`
**Expected:** 403 or 400. Cannot delete built-in indicators.
