# FactorLab Runtime Feedback Spec v1

Owner: @designer  
Status: Draft
Target: Factor evaluation, factor mining, factor creation, and follow-up research actions in Factor Lab

## 1. Problem

Current staging behavior shows a runtime feedback gap:
- users can trigger factor evaluation and see `评估中...`
- users can trigger factor mining and see `挖掘中...`
- during observed waits, the UI does not clearly communicate whether the action has completed, failed, queued, or stalled

This creates two risks:
1. users perceive the product as unreliable
2. users cannot distinguish backend processing from failure or empty result

## 2. Goal

Every long-running or consequential action in Factor Lab must produce:
- immediate acknowledgement
- visible in-progress state
- terminal completion state
- meaningful error or degraded-state explanation
- obvious next action

## 3. Scope

In scope:
- create factor
- run evaluation
- run mining
- generate code
- create multi-factor strategy
- factor backtest tab state

Out of scope:
- full queue-center redesign
- deep chart redesign
- backend algorithm changes except status-field support needed for UX

## 4. Principles

- never leave users guessing whether a click worked
- do not present degraded data as normal data
- every action should resolve to a visible outcome
- quant workflows require provenance, not just success toasts
- empty state after action is suspicious unless explicitly explained

## 5. State Model

## 5.1 Shared action states

All Factor Lab actions should map to a common state vocabulary:
- `idle`
- `submitted`
- `running`
- `completed`
- `completed_degraded`
- `failed`
- `timed_out`

## 5.2 User-visible mapping

- `idle`: no active action
- `submitted`: request accepted, waiting for backend execution
- `running`: backend is processing
- `completed`: valid result returned and rendered
- `completed_degraded`: result returned with warning, fallback, low coverage, or partial data
- `failed`: request rejected or processing error
- `timed_out`: client-side wait expired before completion was confirmed

## 6. UX Requirements by Action

## 6.1 Create Factor

### Trigger
User clicks `创建因子`

### Required feedback
- button enters pending state: `创建中...`
- modal stays open while request is running
- on success:
  - success toast
  - modal closes
  - new factor is visibly inserted or list is refreshed
- on validation error:
  - modal remains open
  - inline field-level error appears
- on server error:
  - modal remains open
  - top-level error banner appears in modal footer/body

### Additional requirements
- required fields must be visually marked
- submit must not fail silently through disabled-only logic
- modal must expose stable test hooks and semantic dialog attributes

## 6.2 Run Evaluation

### Trigger
User clicks `运行评估`

### Required feedback
- immediate status chip/block appears under action bar:
  - `已提交评估请求`
  - factor name
  - date range
  - submitted time
- button changes to pending
- if asynchronous:
  - show `任务编号`
  - show `查看状态`
- on completion:
  - refresh result table automatically
  - show result summary strip
- on degraded completion:
  - show warning badge and explanation
- on failure:
  - show explicit failure block with retry CTA

### Result summary strip
Must show at minimum:
- factor name
- status badge
- IC
- ICIR
- coverage
- observation count
- data source
- forward horizon
- completed time

## 6.3 Run Mining

### Trigger
User clicks `开始挖掘`

### Required feedback
- immediate status block appears with:
  - factor set
  - instruments/universe
  - date range
  - thresholds used
  - submitted time
- pending button state
- if long-running, show progress copy such as:
  - `正在扫描因子`
  - `正在进行相关性去重`
  - `正在生成 shortlist`

### Completion requirements
On completion, show a mining summary card before the result table:
- total features scanned
- after data/coverage filter
- after IC filter
- after correlation dedupe
- final shortlisted count
- top factor score range

### Error/degraded requirements
- if qlib unavailable: show environment/dependency error, not generic failure
- if result set is empty: explain whether due to no data, threshold too strict, or compute failure

## 6.4 Generate Code

### Required feedback
- `生成中...`
- generated code area skeleton or placeholder
- on completion, auto-scroll to code preview
- on failure, keep factors intact and show error

## 6.5 Create Multi-Factor Strategy

### Required feedback
- `创建中...`
- on success:
  - show strategy id or name
  - show CTA to open strategy detail or backtest next
- on failure:
  - keep current combine inputs
  - show explicit retryable error

## 6.6 Backtest Tab

### Required feedback
The backtest tab cannot be a dead-end text block.

Minimum viable redesign:
- if no current combination: explain prerequisite and link back to combine tab
- if combination exists but no backtest yet: show CTA to backtest current combination
- if jobs exist: show recent job cards with state badges
- if completed: show recent results summary

## 7. Status Block Component

Introduce a reusable `RunStatusCard` component.

### Props
- action type
- subject name
- submitted time
- current status
- optional job id
- optional warning message
- optional error message
- optional metrics summary
- optional CTA list

### Supported actions
- factor_create
- factor_evaluation
- factor_mining
- strategy_codegen
- strategy_create
- factor_backtest

## 8. Copy Guidelines

Use short, explicit, state-based copy.

Examples:
- `评估请求已提交，正在计算 IC/IR。`
- `评估完成，但仅使用了部分可用数据。`
- `因子挖掘已完成，共发现 12 个候选因子。`
- `本次挖掘未返回结果，原因可能是阈值过严或数据覆盖不足。`
- `创建失败：因子名称已存在。`

Avoid vague copy:
- `处理中...`
- `暂无数据`
- `请求失败`

## 9. Backend Support Needed

The frontend spec benefits from the backend returning richer status information.

Recommended response fields:
- `status`
- `message`
- `job_id` when applicable
- `warning_code`
- `warning_message`
- `coverage`
- `observation_count`
- `data_source`
- `forward_periods`
- `result_summary`
- `error_code`

## 10. Telemetry / Testing Requirements

### Telemetry
Track:
- action submitted
- action completed
- action failed
- duration bucket
- degraded completion rate

### Testing
Must cover:
- create-factor success and validation failure
- evaluation success, fallback, and failure
- mining success, empty result, and dependency failure
- status-card transitions
- backtest-tab actionable empty state

## 11. Acceptance Criteria

This spec is complete when:
- all key Factor Lab actions end in explicit UI-visible states
- degraded data is clearly marked
- users can identify the next action after completion or failure
- long-running operations no longer feel like silent stalls
- Playwright can assert state transitions using stable selectors

## 12. Recommended Delivery Slices

- Slice A: `RunStatusCard` component + evaluation state integration
- Slice B: mining state integration + summary card
- Slice C: create-factor validation/error treatment + modal semantics
- Slice D: backtest tab actionable redesign
- Slice E: telemetry + Playwright coverage
