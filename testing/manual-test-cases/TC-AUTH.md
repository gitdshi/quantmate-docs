# TC-AUTH: Authentication & Security

## Endpoints Covered

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `PUT /api/v1/auth/profile`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/mfa/setup`
- `POST /api/v1/auth/mfa/verify`
- `POST /api/v1/auth/mfa/disable`
- `POST /api/v1/auth/mfa/recovery`
- `GET /api/v1/auth/sessions/`
- `DELETE /api/v1/auth/sessions/all`
- `DELETE /api/v1/auth/sessions/{session_id}`
- `GET /api/v1/auth/api-keys/`
- `POST /api/v1/auth/api-keys/`
- `PUT /api/v1/auth/api-keys/{key_id}`
- `DELETE /api/v1/auth/api-keys/{key_id}`
- `POST /api/v1/auth/api-keys/{key_id}/regenerate`
- `POST /api/v1/kyc/submit`
- `GET /api/v1/kyc/status`
- `GET /api/v1/kyc/pending`
- `POST /api/v1/kyc/{submission_id}/review`
- `GET /api/v1/audit/logs`
- `GET /api/v1/audit/logs/export`

---

## 1. User Registration

### TC-AUTH-001: Register new user with valid data
**Priority:** P1
**Preconditions:** No user with username `testuser01` exists
**Steps:**
1. `POST /api/v1/auth/register` with body:
   ```json
   { "username": "testuser01", "email": "test01@example.com", "password": "SecureP@ss1" }
   ```
**Expected:** 201 Created. Response contains `id`, `username`, `email`. No password in response.

### TC-AUTH-002: Register with duplicate username
**Priority:** P1
**Preconditions:** User `testuser01` already exists
**Steps:**
1. `POST /api/v1/auth/register` with body:
   ```json
   { "username": "testuser01", "email": "another@example.com", "password": "SecureP@ss1" }
   ```
**Expected:** 409 or 400. Error message indicates username taken.

### TC-AUTH-003: Register with duplicate email
**Priority:** P2
**Preconditions:** Email `test01@example.com` already exists
**Steps:**
1. `POST /api/v1/auth/register` with body:
   ```json
   { "username": "newuser", "email": "test01@example.com", "password": "SecureP@ss1" }
   ```
**Expected:** 409 or 400. Error message indicates email already registered.

### TC-AUTH-004: Register with weak password
**Priority:** P2
**Preconditions:** None
**Steps:**
1. `POST /api/v1/auth/register` with body:
   ```json
   { "username": "weakuser", "email": "weak@example.com", "password": "123" }
   ```
**Expected:** 422 or 400. Validation error about password strength.

### TC-AUTH-005: Register with missing required fields
**Priority:** P2
**Preconditions:** None
**Steps:**
1. `POST /api/v1/auth/register` with body `{}`
**Expected:** 422. Validation errors for all required fields.

---

## 2. Login

### TC-AUTH-010: Login with valid credentials
**Priority:** P1
**Preconditions:** User `admin` with password `admin123` exists
**Steps:**
1. `POST /api/v1/auth/login` with body:
   ```json
   { "username": "admin", "password": "admin123" }
   ```
**Expected:** 200 OK. Response contains `access_token`, `refresh_token`, `token_type: "bearer"`.

### TC-AUTH-011: Login with wrong password
**Priority:** P1
**Preconditions:** User `admin` exists
**Steps:**
1. `POST /api/v1/auth/login` with body:
   ```json
   { "username": "admin", "password": "wrongpassword" }
   ```
**Expected:** 401 Unauthorized. Error message about invalid credentials.

### TC-AUTH-012: Login with non-existent user
**Priority:** P1
**Preconditions:** User `nonexistent` does not exist
**Steps:**
1. `POST /api/v1/auth/login` with body:
   ```json
   { "username": "nonexistent", "password": "password123" }
   ```
**Expected:** 401 Unauthorized. Same error as wrong password (no user enumeration).

### TC-AUTH-013: Login with inactive/disabled account
**Priority:** P2
**Preconditions:** User with `is_active=0` exists
**Steps:**
1. `POST /api/v1/auth/login` with the disabled user's credentials
**Expected:** 401 or 403. Account disabled message.

### TC-AUTH-014: Login response includes must_change_password flag
**Priority:** P1
**Preconditions:** New user created by admin (must_change_password=True)
**Steps:**
1. `POST /api/v1/auth/login` with new user's credentials
**Expected:** 200 OK. Response includes `must_change_password: true` in token payload.

---

## 3. Token Refresh

### TC-AUTH-020: Refresh with valid refresh token
**Priority:** P1
**Preconditions:** Valid `refresh_token` from a recent login
**Steps:**
1. `POST /api/v1/auth/refresh` with body:
   ```json
   { "refresh_token": "<valid_token>" }
   ```
**Expected:** 200 OK. New `access_token` returned. Old access_token still valid until expiry.

### TC-AUTH-021: Refresh with expired refresh token
**Priority:** P1
**Preconditions:** Expired `refresh_token` (7+ days old)
**Steps:**
1. `POST /api/v1/auth/refresh` with expired token
**Expected:** 401 Unauthorized. Token expired message.

### TC-AUTH-022: Refresh with invalid/tampered token
**Priority:** P2
**Preconditions:** None
**Steps:**
1. `POST /api/v1/auth/refresh` with body:
   ```json
   { "refresh_token": "invalid.token.value" }
   ```
**Expected:** 401 Unauthorized.

---

## 4. Logout

### TC-AUTH-030: Logout with valid access token
**Priority:** P1
**Preconditions:** Authenticated user
**Steps:**
1. `POST /api/v1/auth/logout` with `Authorization: Bearer <access_token>`
**Expected:** 200 OK. Session invalidated.
2. Use the same token to access `GET /api/v1/auth/me`
**Expected:** 401 Unauthorized (token blacklisted).

### TC-AUTH-031: Logout without token
**Priority:** P2
**Steps:**
1. `POST /api/v1/auth/logout` without Authorization header
**Expected:** 401 Unauthorized.

---

## 5. User Profile

### TC-AUTH-040: Get current user profile
**Priority:** P1
**Preconditions:** Authenticated as `admin`
**Steps:**
1. `GET /api/v1/auth/me` with valid bearer token
**Expected:** 200 OK. Response contains `id`, `username`, `email`, `is_active`.

### TC-AUTH-041: Get profile with expired token
**Priority:** P1
**Steps:**
1. `GET /api/v1/auth/me` with expired access token
**Expected:** 401 Unauthorized.

### TC-AUTH-042: Update user profile
**Priority:** P2
**Preconditions:** Authenticated user
**Steps:**
1. `PUT /api/v1/auth/profile` with body:
   ```json
   { "email": "updated@example.com" }
   ```
**Expected:** 200 OK. Profile updated. Subsequent `GET /auth/me` shows new email.

---

## 6. Change Password

### TC-AUTH-050: Change password with correct old password
**Priority:** P1
**Preconditions:** Authenticated user
**Steps:**
1. `POST /api/v1/auth/change-password` with body:
   ```json
   { "old_password": "admin123", "new_password": "NewSecure@1" }
   ```
**Expected:** 200 OK. Can login with new password. Old password fails.

### TC-AUTH-051: Change password with wrong old password
**Priority:** P1
**Preconditions:** Authenticated user
**Steps:**
1. `POST /api/v1/auth/change-password` with body:
   ```json
   { "old_password": "wrongold", "new_password": "NewSecure@1" }
   ```
**Expected:** 400 or 401. Old password incorrect.

### TC-AUTH-052: must_change_password blocks other endpoints
**Priority:** P1
**Preconditions:** User with `must_change_password=true` logged in
**Steps:**
1. `GET /api/v1/strategies` with access token
**Expected:** 403 Forbidden. Message indicates password change required.
2. `POST /api/v1/auth/change-password` is allowed
**Expected:** 200 OK after changing password. Subsequent requests work normally.

---

## 7. Multi-Factor Authentication (MFA)

### TC-AUTH-060: Setup MFA
**Priority:** P2
**Preconditions:** Authenticated user without MFA enabled
**Steps:**
1. `POST /api/v1/auth/mfa/setup`
**Expected:** 200 OK. Returns `secret`, `otpauth_uri`, and `recovery_codes`.

### TC-AUTH-061: Verify and enable MFA
**Priority:** P2
**Preconditions:** MFA setup completed, have `secret`
**Steps:**
1. Generate TOTP code from the secret
2. `POST /api/v1/auth/mfa/verify` with body:
   ```json
   { "code": "<6_digit_totp>" }
   ```
**Expected:** 200 OK. MFA enabled.

### TC-AUTH-062: Login with MFA enabled
**Priority:** P2
**Preconditions:** User with MFA enabled
**Steps:**
1. `POST /api/v1/auth/login` with credentials
2. If MFA challenge returned, submit TOTP code
**Expected:** 200 OK with tokens after MFA verification.

### TC-AUTH-063: Disable MFA
**Priority:** P2
**Preconditions:** User with MFA enabled
**Steps:**
1. `POST /api/v1/auth/mfa/disable` with TOTP code
**Expected:** 200 OK. MFA disabled. Login no longer requires TOTP.

### TC-AUTH-064: Use MFA recovery code
**Priority:** P3
**Preconditions:** MFA enabled, have recovery codes
**Steps:**
1. `POST /api/v1/auth/mfa/recovery` with one recovery code
**Expected:** 200 OK. Access granted. Recovery code consumed (cannot be reused).

---

## 8. Session Management

### TC-AUTH-070: List active sessions
**Priority:** P2
**Preconditions:** Authenticated user with multiple active sessions
**Steps:**
1. `GET /api/v1/auth/sessions/`
**Expected:** 200 OK. Array of sessions with `id`, `created_at`, `ip_address`, `user_agent`.

### TC-AUTH-071: Revoke specific session
**Priority:** P2
**Preconditions:** At least 2 active sessions
**Steps:**
1. `GET /api/v1/auth/sessions/` — note a session_id
2. `DELETE /api/v1/auth/sessions/{session_id}`
**Expected:** 200 OK. Session removed. That token no longer works.

### TC-AUTH-072: Revoke all sessions
**Priority:** P2
**Preconditions:** Multiple active sessions
**Steps:**
1. `DELETE /api/v1/auth/sessions/all`
**Expected:** 200 OK. All sessions revoked. Only the current token (if exempt) continues to work.

---

## 9. API Key Management

### TC-AUTH-080: Create API key
**Priority:** P2
**Preconditions:** Authenticated user
**Steps:**
1. `POST /api/v1/auth/api-keys/` with body:
   ```json
   { "name": "test-key", "permissions": ["read"] }
   ```
**Expected:** 201 Created. Returns `key_id`, `api_key` (shown only once), `api_secret`.

### TC-AUTH-081: List API keys
**Priority:** P2
**Preconditions:** At least 1 API key created
**Steps:**
1. `GET /api/v1/auth/api-keys/`
**Expected:** 200 OK. Array of keys. Secret is masked/not returned.

### TC-AUTH-082: Update API key
**Priority:** P3
**Preconditions:** Existing API key
**Steps:**
1. `PUT /api/v1/auth/api-keys/{key_id}` with updated permissions
**Expected:** 200 OK. Updated fields reflected.

### TC-AUTH-083: Delete API key
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/auth/api-keys/{key_id}`
**Expected:** 200 OK. Key removed. Using it returns 401.

### TC-AUTH-084: Regenerate API key secret
**Priority:** P3
**Steps:**
1. `POST /api/v1/auth/api-keys/{key_id}/regenerate`
**Expected:** 201 Created. New secret returned. Old secret invalidated.

---

## 10. KYC Verification

### TC-AUTH-090: Submit KYC application
**Priority:** P3
**Preconditions:** Authenticated user, KYC not submitted
**Steps:**
1. `POST /api/v1/kyc/submit` with required identity documents/data
**Expected:** 200 OK. KYC submission created with `pending` status.

### TC-AUTH-091: Check KYC status
**Priority:** P3
**Steps:**
1. `GET /api/v1/kyc/status`
**Expected:** 200 OK. Returns current KYC status (pending/approved/rejected).

### TC-AUTH-092: Admin list pending KYC submissions
**Priority:** P3
**Preconditions:** Authenticated as admin
**Steps:**
1. `GET /api/v1/kyc/pending`
**Expected:** 200 OK. List of pending KYC submissions.

### TC-AUTH-093: Admin review KYC submission
**Priority:** P3
**Preconditions:** At least one pending submission
**Steps:**
1. `POST /api/v1/kyc/{submission_id}/review` with body:
   ```json
   { "status": "approved", "notes": "Documents verified" }
   ```
**Expected:** 200 OK. Submission status updated to approved.

---

## 11. Audit Logging

### TC-AUTH-100: Query audit logs (Admin)
**Priority:** P2
**Preconditions:** Authenticated as admin
**Steps:**
1. Perform several operations (login, create strategy, etc.)
2. `GET /api/v1/audit/logs?limit=10`
**Expected:** 200 OK. Returns recent audit entries with `action`, `user_id`, `timestamp`, `details`.

### TC-AUTH-101: Export audit logs as JSON
**Priority:** P3
**Preconditions:** Authenticated as admin
**Steps:**
1. `GET /api/v1/audit/logs/export?format=json`
**Expected:** 200 OK. JSON file download with audit data.

### TC-AUTH-102: Export audit logs as CSV
**Priority:** P3
**Steps:**
1. `GET /api/v1/audit/logs/export?format=csv`
**Expected:** 200 OK. CSV file download.

### TC-AUTH-103: Non-admin access audit logs
**Priority:** P2
**Preconditions:** Authenticated as regular user
**Steps:**
1. `GET /api/v1/audit/logs`
**Expected:** 403 Forbidden. Admin-only endpoint.
