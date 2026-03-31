# RBAC Spec v1 (Developer-facing)

Owner: @designer  
Status: Draft

Sources:
- Issue: https://github.com/gitdshi/quantmate/issues/1
- PRD: `projects/QuantMate/quantmate-docs/requirements/PRODUCT_REQUIREMENTS_V1.md` (3.1.5)
- Prototype: `projects/QuantMate/quantmate-docs/prototype/account.html`

## 1. Scope

This spec defines the RBAC model for QuantMate and the minimal implementation path for P1:
- Data model (roles / permissions / role_permissions / user_roles) + seed data
- Permission matrix (roles x modules x actions)
- Permission key and scope conventions
- Endpoint-level permission mapping for the P1 API surface
- Admin management APIs for roles/permissions/user-role assignments
- Standard 403 response shape + audit logging
- Admin UX states (text spec)

Non-goals (handled elsewhere): OAuth/MFA, API key lifecycle, pixel-level UI.

## 2. Terminology

- Role: named collection of permissions (admin, trader, researcher, viewer)
- Permission: `{resource, action}` pair, exposed in code/config as `resource.action`
- Action: `read` / `write` / `manage`
- Resource: product module/domain (`strategies`, `backtests`, `trading`, `portfolios`, `reports`, `data`, `account`, `system`, `alerts`, `collaboration`)
- Self-scoped: user can only act on their own account (`user_id == target_user_id`)
- Own-scoped: user can only act on resources they own (`owner_id == user_id`)
- System role: built-in role that cannot be deleted; permissions may only be edited if explicitly allowed by product policy

## 3. Minimal Implementation Path (P1)

1) DB tables + seed roles/permissions  
2) Permission middleware/decorator + self/own scope checks  
3) Endpoint mapping for P1 modules (strategies/backtests/portfolios/account/data/reports)  
4) Admin APIs for roles/permissions/assignments  
5) Standard 403 + audit log on deny  
6) Unit tests for permission checks and admin API guards

## 4. Permission Matrix (Roles x Modules x Actions)

Legend: R=read, W=write, M=manage

| Role \ Module | strategies | backtests | trading | portfolios | reports | data | account | system | alerts | collaboration |
|---|---|---|---|---|---|---|---|---|---|---|
| admin | R/W/M | R/W/M | R/W/M | R/W/M | R/W/M | R/W/M | R/W/M | R/W/M | R/W/M | R/W/M |
| trader | R/W | R/W | R/W | R/W | R/W | R | R/W (self) | - | R | R/W (own) |
| researcher | R/W | R/W | - | R | R | R | R/W (self) | - | R | R (own) |
| viewer | - | - | - | - | R | R | R (self) | - | R | - |

Notes:
- `viewer` is aligned to the PRD statement "仅查看仪表盘和报告"; it does not get broad read access to strategies, backtests, portfolios, or collaboration resources.
- (self) means only the user's own account.
- (own) means resources created/owned by the user.
- `manage` is reserved for cross-user or system-wide operations such as role administration, workspace member management, notification channel config, and data source switch management.

## 5. Permission Key Convention

All permissions are persisted as `{resource, action}` rows and represented in code as `resource.action` strings.

Examples:
- `strategies.read`
- `strategies.write`
- `trading.manage`
- `system.manage`

Resources in P1:
- `strategies`
- `backtests`
- `portfolios`
- `reports`
- `data`
- `account`
- `system`
- `alerts`
- `collaboration`

## 6. Enforcement Contract

### 6.1 Middleware/Decorator

`require_permission(resource, action, scope=None)`:
- Read JWT -> `user_id`
- Load active user roles -> union permissions
- Allow if `resource.action` exists in the effective permission set
- If `scope == self`: allow only when `user_id == target_user_id`
- If `scope == own`: allow only when `owner_id == user_id`
- If permission missing, return 403 with the standard body and write an audit deny event

Implementation notes:
- Role lookup should ignore inactive assignments in `user_roles.is_active = true`
- Permission evaluation should happen before invoking service/domain logic
- Scope resolution should be explicit in route handlers; do not infer ownership from client-submitted payloads alone
- Admin-only RBAC APIs should require `account.manage` or `system.manage`; this spec uses `account.manage` for user/role administration

### 6.2 403 Response Standard

HTTP 403 JSON:
```json
{
  "error": "FORBIDDEN",
  "message": "Permission denied",
  "details": {
    "resource": "strategies",
    "action": "write"
  }
}
```

### 6.3 Audit Logging

Denied access logs include: `user_id`, `resource`, `action`, `scope`, `endpoint`, `method`, `request_id`, `timestamp`.

Recommended audit event shape:
```json
{
  "event_type": "auth.permission_denied",
  "user_id": 100,
  "resource": "strategies",
  "action": "write",
  "scope": "own",
  "endpoint": "/api/strategies/123",
  "method": "DELETE",
  "request_id": "req_abc123",
  "timestamp": "2026-03-26T04:00:00Z"
}
```

## 7. Endpoint Permission Mapping

Use `require_permission(resource, action)`.

### 7.1 Auth & Account
- `POST /api/auth/register` -> public
- `POST /api/auth/login` -> public
- `POST /api/auth/refresh` -> public
- `GET /api/auth/me` -> account:read (self)
- `GET /api/auth/profile` -> account:read (self)
- `PUT /api/auth/profile` -> account:write (self)
- `PUT /api/auth/change-password` -> account:write (self)

### 7.2 Strategies
- `POST /api/strategies` -> strategies:write
- `GET /api/strategies` -> strategies:read
- `GET /api/strategies/{id}` -> strategies:read
- `PUT /api/strategies/{id}` -> strategies:write
- `DELETE /api/strategies/{id}` -> strategies:write
- `POST /api/strategies/{id}/lint` -> strategies:write
- `GET /api/strategies/{id}/versions` -> strategies:read
- `PUT /api/strategies/{id}/restore/{ver}` -> strategies:write

### 7.3 Backtests
- `POST /api/backtests` -> backtests:write
- `GET /api/backtests` -> backtests:read
- `GET /api/backtests/{id}` -> backtests:read
- `DELETE /api/backtests/{id}` -> backtests:write
- `POST /api/backtests/batch` -> backtests:write
- `GET /api/backtests/batch` -> backtests:read
- `GET /api/backtests/batch/{id}` -> backtests:read
- `DELETE /api/backtests/batch/{id}` -> backtests:write

### 7.4 Market Data
- `GET /api/market-data/kline` -> data:read
- `GET /api/market-data/search` -> data:read
- `GET /api/market-data/indicators` -> data:read
- `GET /api/market-data/overview` -> data:read
- `GET /api/data/watchlists` -> data:read
- `POST /api/data/watchlists` -> data:write
- `PUT /api/data/watchlists/{id}` -> data:write (own)
- `DELETE /api/data/watchlists/{id}` -> data:write (own)

### 7.5 Portfolios (P1)
- `POST /api/portfolios` -> portfolios:write
- `GET /api/portfolios` -> portfolios:read
- `GET /api/portfolios/{id}` -> portfolios:read
- `PUT /api/portfolios/{id}` -> portfolios:write
- `DELETE /api/portfolios/{id}` -> portfolios:write
- `POST /api/portfolios/{id}/positions` -> portfolios:write
- `DELETE /api/portfolios/{id}/positions/{pos_id}` -> portfolios:write
- `GET /api/portfolios/{id}/snapshots` -> portfolios:read
- `GET /api/portfolios/{id}/performance` -> portfolios:read

### 7.6 Trading (P2)
- `POST /api/orders` -> trading:write
- `GET /api/orders` -> trading:read
- `GET /api/orders/{id}` -> trading:read
- `PUT /api/orders/{id}/cancel` -> trading:write
- `GET /api/trades` -> trading:read
- `POST /api/trading/paper/start` -> trading:manage
- `POST /api/trading/paper/stop` -> trading:manage
- `GET /api/trading/paper/status` -> trading:read

### 7.7 Alerts (P2)
- `GET /api/alerts/rules` -> alerts:read
- `POST /api/alerts/rules` -> alerts:write
- `PUT /api/alerts/rules/{id}` -> alerts:write
- `DELETE /api/alerts/rules/{id}` -> alerts:write
- `GET /api/alerts/history` -> alerts:read
- `PUT /api/alerts/{id}/acknowledge` -> alerts:write
- `POST /api/notifications/channels` -> alerts:manage
- `POST /api/notifications/test` -> alerts:manage

### 7.8 Reports (P2)
- `GET /api/reports/daily` -> reports:read
- `GET /api/reports/daily/{date}` -> reports:read
- `GET /api/reports/weekly` -> reports:read
- `GET /api/reports/monthly` -> reports:read
- `GET /api/reports/{id}/export` -> reports:read
- `GET /api/trade-logs` -> reports:read
- `GET /api/analytics/attribution` -> reports:read

### 7.9 System (P1/P2)
- `GET /api/system/configs` -> system:read
- `PUT /api/system/configs` -> system:manage
- `GET /api/system/audit-logs` -> system:read
- `GET /api/system/data-sources` -> system:read
- `PUT /api/system/data-sources/{id}/items` -> system:manage
- `POST /api/data-sources/test` -> system:manage
- `PUT /api/data-sources/{id}` -> system:manage

### 7.10 Collaboration (P3)
- `POST /api/strategies/{id}/share` -> collaboration:write
- `GET /api/strategies/shared` -> collaboration:read
- `POST /api/strategies/{id}/rate` -> collaboration:write
- `POST /api/strategies/{id}/comments` -> collaboration:write
- `POST /api/workspaces` -> collaboration:manage
- `GET /api/workspaces` -> collaboration:read
- `POST /api/workspaces/{id}/members` -> collaboration:manage

## 8. Admin Management APIs (RBAC)

Base path: `/api/admin`

### 8.1 Roles
All endpoints in Section 8 require `account.manage`.

- `GET /api/admin/roles`
  - Response:
```json
{
  "items": [
    {"id": 1, "name": "admin", "description": "System admin", "is_system": true}
  ]
}
```

- `POST /api/admin/roles`
  - Request:
```json
{"name": "ops", "description": "Ops manager"}
```
  - Response:
```json
{"id": 5, "name": "ops", "description": "Ops manager", "is_system": false}
```

- `PUT /api/admin/roles/{id}`
  - Request:
```json
{"description": "Updated description", "is_system": false}
```
  - Response:
```json
{"id": 5, "name": "ops", "description": "Updated description", "is_system": false}
```

- `DELETE /api/admin/roles/{id}`
  - Behavior: forbid delete of is_system roles; return 403 using the standard body.

### 8.2 Permissions
- `GET /api/admin/permissions`
  - Response:
```json
{"items": [{"id": 10, "resource": "strategies", "action": "read"}]}
```

- `PUT /api/admin/roles/{id}/permissions`
  - Request:
```json
{"permission_ids": [1,2,3,4]}
```
  - Response:
```json
{"role_id": 1, "permission_ids": [1,2,3,4]}
```

### 8.3 Users & Role Assignments
- `GET /api/admin/users`
  - Response:
```json
{"items": [{"id": 100, "username": "demo", "roles": ["trader"], "is_active": true}]}
```

- `GET /api/admin/users/{id}`
  - Response:
```json
{"id": 100, "username": "demo", "roles": ["trader"], "is_active": true}
```

- `PUT /api/admin/users/{id}/roles`
  - Request:
```json
{"role_ids": [1,2]}
```
  - Response:
```json
{"user_id": 100, "role_ids": [1,2]}
```

- `PUT /api/admin/users/{id}/status`
  - Request:
```json
{"is_active": false}
```
  - Response:
```json
{"user_id": 100, "is_active": false}
```
  - Behavior: aligns with the PRD user-management flow (enable/disable account from the admin user list).

## 9. Data Model

### 9.1 roles
- id (PK, INT AUTO_INCREMENT)
- name (VARCHAR(50), UNIQUE, NOT NULL)
- description (VARCHAR(255))
- is_system (BOOLEAN DEFAULT TRUE)
- created_at (DATETIME)
- updated_at (DATETIME)

### 9.2 permissions
- id (PK, INT AUTO_INCREMENT)
- resource (VARCHAR(50), NOT NULL)
- action (VARCHAR(20), NOT NULL)
- description (VARCHAR(255))
- is_system (BOOLEAN DEFAULT TRUE)
- created_at (DATETIME)
- updated_at (DATETIME)
- UNIQUE(resource, action)

### 9.3 role_permissions
- role_id (FK -> roles.id, NOT NULL)
- permission_id (FK -> permissions.id, NOT NULL)
- created_at (DATETIME)
- PRIMARY KEY(role_id, permission_id)

### 9.4 user_roles
- user_id (FK -> users.id, NOT NULL)
- role_id (FK -> roles.id, NOT NULL)
- assigned_by (FK -> users.id, NULL)
- assigned_at (DATETIME)
- is_active (BOOLEAN DEFAULT TRUE)
- PRIMARY KEY(user_id, role_id)
- INDEX(user_id), INDEX(role_id)

### 9.5 Seed Data
- roles: `admin`, `trader`, `researcher`, `viewer` (`is_system=true`)
- permissions: each resource in Section 5 x action in `{read, write, manage}`
- role_permissions:
  - `admin`: all permissions
  - `trader`: `strategies.read/write`, `backtests.read/write`, `trading.read/write`, `portfolios.read/write`, `reports.read/write`, `data.read`, `alerts.read`, `account.read/write`
  - `researcher`: `strategies.read/write`, `backtests.read/write`, `portfolios.read`, `reports.read`, `data.read`, `alerts.read`, `account.read/write`
  - `viewer`: `reports.read`, `data.read`, `alerts.read`, `account.read`
- bootstrap rule: the first system admin user must be seeded/migrated explicitly; no environment should start with zero active admins

## 10. UX States (Text)

### 10.1 Roles & Permissions Admin Page
- Happy: list roles with counts; role details include permissions matrix; buttons for add/edit/delete
- Loading: skeleton list for roles, disabled action buttons
- Empty: "暂无角色，点击‘新建角色’创建"
- Error: "加载失败，请重试" + retry button

### 10.2 User Role Assignment
- Happy: user list with role tags; edit drawer for assigning roles
- Loading: user list skeleton; disable save
- Empty: "暂无用户"
- Error: "用户加载失败" + retry

## 11. Acceptance Criteria (DoD)

- DB schema for `roles` / `permissions` / `user_roles` / `role_permissions` defined with seed data
- Permission key convention and scope semantics (`self` / `own`) are explicit
- Module permission matrix present (roles x modules x actions) and aligned with PRD role descriptions
- Endpoint mapping table provided for the P1 API surface (including profile, watchlists, portfolios, system data source switches)
- 403 response standard defined for RBAC denial
- Admin management APIs and request/response structures defined, including user enable/disable
- Audit deny event fields defined
- UX states documented (happy/loading/empty/error)
- Unit test scope defined for permission checks and admin API guards

## 12. Deprecation Notes

No conflicting RBAC docs found; no deprecations required for this version.

## 13. Recommended Unit Test Scope

Backend tests should minimally cover:
- permission union across multiple roles
- inactive `user_roles` assignments not granting access
- `self` scope enforcement on profile/password routes
- `own` scope enforcement on watchlists / strategies / portfolios
- deny path returns the Section 6.2 response body
- deny path writes an `auth.permission_denied` audit event
- admin endpoints reject non-admin callers
- system roles cannot be deleted through the admin API
- user status toggle updates `is_active` and blocks disabled users from protected APIs
