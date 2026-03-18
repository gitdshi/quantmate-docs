# TC-COLLABORATION: Team Collaboration & AI Assistant

## Endpoints Covered

- `GET /api/v1/teams/workspaces`
- `POST /api/v1/teams/workspaces`
- `GET /api/v1/teams/workspaces/{workspace_id}`
- `PUT /api/v1/teams/workspaces/{workspace_id}`
- `DELETE /api/v1/teams/workspaces/{workspace_id}`
- `GET /api/v1/teams/workspaces/{workspace_id}/members`
- `POST /api/v1/teams/workspaces/{workspace_id}/members`
- `DELETE /api/v1/teams/workspaces/{workspace_id}/members/{user_id}`
- `GET /api/v1/teams/shares/received`
- `POST /api/v1/teams/shares`
- `DELETE /api/v1/teams/shares/{share_id}`
- `GET /api/v1/ai/conversations`
- `POST /api/v1/ai/conversations`
- `GET /api/v1/ai/conversations/{conversation_id}`
- `PUT /api/v1/ai/conversations/{conversation_id}`
- `DELETE /api/v1/ai/conversations/{conversation_id}`
- `GET /api/v1/ai/conversations/{conversation_id}/messages`
- `POST /api/v1/ai/conversations/{conversation_id}/messages`
- `GET /api/v1/ai/model-configs`
- `POST /api/v1/ai/model-configs`
- `PUT /api/v1/ai/model-configs/{config_id}`
- `DELETE /api/v1/ai/model-configs/{config_id}`

---

## 1. Team Workspaces

### TC-TEAM-001: List workspaces
**Priority:** P2
**Steps:**
1. `GET /api/v1/teams/workspaces`
**Expected:** 200 OK. List of workspaces user owns or is a member of.

### TC-TEAM-002: Create workspace
**Priority:** P2
**Steps:**
1. `POST /api/v1/teams/workspaces` with body:
   ```json
   { "name": "Quant Team Alpha", "description": "Research team workspace" }
   ```
**Expected:** 201 Created. Returns workspace with `id`, `name`, `owner_id`.

### TC-TEAM-003: Get workspace detail
**Priority:** P2
**Steps:**
1. `GET /api/v1/teams/workspaces/{workspace_id}`
**Expected:** 200 OK. Workspace with member count and details.

### TC-TEAM-004: Update workspace
**Priority:** P3
**Steps:**
1. `PUT /api/v1/teams/workspaces/{workspace_id}` with `{ "name": "Renamed" }`
**Expected:** 200 OK.

### TC-TEAM-005: Delete workspace (owner)
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/teams/workspaces/{workspace_id}` as owner
**Expected:** 204 No Content.

### TC-TEAM-006: Delete workspace (non-owner)
**Priority:** P2
**Steps:**
1. `DELETE /api/v1/teams/workspaces/{workspace_id}` as regular member
**Expected:** 403 Forbidden. Only owner can delete.

---

## 2. Team Members

### TC-TEAM-010: List workspace members
**Priority:** P2
**Steps:**
1. `GET /api/v1/teams/workspaces/{workspace_id}/members`
**Expected:** 200 OK. List of members with `user_id`, `role`, `joined_at`.

### TC-TEAM-011: Add member to workspace
**Priority:** P2
**Steps:**
1. `POST /api/v1/teams/workspaces/{workspace_id}/members` with body:
   ```json
   { "user_id": 2, "role": "member" }
   ```
**Expected:** 201 Created. Member added.

### TC-TEAM-012: Add duplicate member
**Priority:** P3
**Steps:**
1. Add same user_id again
**Expected:** 409 or 400. User already a member.

### TC-TEAM-013: Remove member
**Priority:** P2
**Steps:**
1. `DELETE /api/v1/teams/workspaces/{workspace_id}/members/{user_id}`
**Expected:** 204 No Content.

### TC-TEAM-014: Non-owner removes member
**Priority:** P2
**Steps:**
1. Regular member tries to remove another member
**Expected:** 403 Forbidden.

---

## 3. Strategy Sharing

### TC-TEAM-020: Share strategy
**Priority:** P2
**Steps:**
1. `POST /api/v1/teams/shares` with body:
   ```json
   { "strategy_id": 1, "target_user_id": 2, "permission": "read" }
   ```
**Expected:** 201 Created. Strategy shared.

### TC-TEAM-021: List strategies shared with me
**Priority:** P2
**Steps:**
1. `GET /api/v1/teams/shares/received`
**Expected:** 200 OK. List of strategies shared with current user.

### TC-TEAM-022: Revoke share
**Priority:** P2
**Steps:**
1. `DELETE /api/v1/teams/shares/{share_id}`
**Expected:** 204 No Content. Recipient can no longer access.

### TC-TEAM-023: Share non-owned strategy
**Priority:** P2
**Steps:**
1. Try to share a strategy you don't own
**Expected:** 403. Can only share own strategies.

---

## 4. AI Conversations

### TC-AI-001: Create conversation
**Priority:** P2
**Steps:**
1. `POST /api/v1/ai/conversations` with body:
   ```json
   { "title": "Strategy Analysis" }
   ```
**Expected:** 201 Created. Returns conversation with `id`, `title`, `created_at`.

### TC-AI-002: List conversations
**Priority:** P2
**Steps:**
1. `GET /api/v1/ai/conversations`
**Expected:** 200 OK. List of user's conversations.

### TC-AI-003: Get conversation detail
**Priority:** P2
**Steps:**
1. `GET /api/v1/ai/conversations/{conversation_id}`
**Expected:** 200 OK. Conversation metadata.

### TC-AI-004: Update conversation title
**Priority:** P3
**Steps:**
1. `PUT /api/v1/ai/conversations/{conversation_id}` with `{ "title": "Updated" }`
**Expected:** 200 OK.

### TC-AI-005: Delete conversation
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/ai/conversations/{conversation_id}`
**Expected:** 200 OK. Conversation and messages deleted.

### TC-AI-006: Send message
**Priority:** P1
**Preconditions:** Conversation exists
**Steps:**
1. `POST /api/v1/ai/conversations/{conversation_id}/messages` with body:
   ```json
   { "content": "Analyze my SMA crossover strategy for potential improvements" }
   ```
**Expected:** 201 Created. Returns AI response message.

### TC-AI-007: List messages in conversation
**Priority:** P2
**Steps:**
1. `GET /api/v1/ai/conversations/{conversation_id}/messages`
**Expected:** 200 OK. Ordered list of messages with `role` (user/assistant), `content`, `timestamp`.

### TC-AI-008: Access another user's conversation
**Priority:** P2
**Steps:**
1. `GET /api/v1/ai/conversations/{other_user_conversation_id}`
**Expected:** 403 or 404.

---

## 5. AI Model Configuration

### TC-AI-010: List model configs
**Priority:** P3
**Steps:**
1. `GET /api/v1/ai/model-configs`
**Expected:** 200 OK. List of available AI model configurations.

### TC-AI-011: Create model config
**Priority:** P3
**Steps:**
1. `POST /api/v1/ai/model-configs` with body:
   ```json
   {
     "name": "GPT-4 Config",
     "model": "gpt-4",
     "temperature": 0.7,
     "max_tokens": 2048
   }
   ```
**Expected:** 201 Created.

### TC-AI-012: Update model config
**Priority:** P3
**Steps:**
1. `PUT /api/v1/ai/model-configs/{config_id}` with updated temperature
**Expected:** 200 OK.

### TC-AI-013: Delete model config
**Priority:** P3
**Steps:**
1. `DELETE /api/v1/ai/model-configs/{config_id}`
**Expected:** 200 OK.
