# QuantMate UX Review Action List v2

Owner: @designer  
Status: Draft

Sources:
- `projects/QuantMate/quantmate-docs/specs/product/FACTORLAB_STAGING_REVIEW_2026-04-02.md`
- Live staging review via Playwright against `https://test.quantmate.net`
- Frontend source: `projects/QuantMate/quantmate-portal/src/pages/FactorLab.tsx`
- Frontend API client: `projects/QuantMate/quantmate-portal/src/lib/api.ts`
- Backend routes/services: `projects/QuantMate/quantmate/app/api/routes/factors.py`, `projects/QuantMate/quantmate/app/domains/factors/service.py`

## 1. Purpose

This document converts the latest Factor Lab staging review into a development-ready action list.

Focus:
- close real user-flow gaps found in Playwright review
- improve trust around factor data and qlib workflows
- turn Factor Lab from a feature surface into a usable research workflow

This is not a full redesign. It is an execution list ordered for delivery.

## 2. Verified Baseline

Observed in staging:
- unauthenticated users are redirected to `/login`
- login with `admin / admin123` succeeds
- `/factor-lab` is reachable after login
- Factor Lab loads successfully for `admin`
- the library initially showed `共 0 个因子`
- creating a factor through authenticated API succeeded and the factor appeared in the UI
- clicking `运行评估` changed the button to `评估中...`, but no visible result row appeared in the observed wait window
- clicking `开始挖掘` changed the button to `挖掘中...`, but no visible mining result table appeared in the observed wait window

Code-level observations:
- create-factor submit button is disabled only when `!formName.trim()` or `createMutation.isPending`
- the modal lacks semantic dialog attributes and stable test hooks
- evaluation backend may silently fall back to zero metrics when data or computation fails
- mining backend supports richer controls than current UI exposes

## 3. Priority Framework

- `P0`: broken runtime trust or broken action loop
- `P1`: workflow gaps that block serious factor research
- `P2`: information architecture and usability improvements
- `P3`: polish and instrumentation improvements

## 4. Action List

## 4.1 P0 - Must Fix Immediately

### F1. Give evaluation and mining explicit runtime lifecycle feedback

Problem:
- users can trigger `评估中...` and `挖掘中...`, but do not quickly learn whether the action succeeded, failed, queued, or stalled

Why it matters:
- this looks like a broken product even when backend work may still be happening
- users cannot distinguish slowness from failure

Recommendation:
- add visible lifecycle states: `submitted`, `running`, `completed`, `failed`, `timeout`
- show last-run timestamp and status under the action bar
- if asynchronous, show queue/job id with link to status
- if synchronous, show timeout/error copy instead of indefinite pending feel

Acceptance target:
- every run action ends in a visible terminal state within the UI
- users do not need DevTools or refresh guessing to know what happened

### F2. Mark fallback or degraded evaluation results explicitly

Problem:
- backend can write zero-value metrics when data is missing or computation fails
- users may misread zeros as real alpha judgment

Why it matters:
- this is a quant trust problem, not just a UI detail

Recommendation:
- add evaluation status field and badge: `Real Data`, `Fallback`, `Insufficient Data`, `Failed`
- add inline explanation when fallback is used
- include provenance: observation count, coverage, horizon, data source

Acceptance target:
- no fallback metrics are visually indistinguishable from valid metrics

### F3. Fix first-factor creation reliability and diagnosability

Problem:
- factor creation capability exists, but modal interaction is not well-instrumented or easily diagnosable
- current Modal component has no `role="dialog"`, no `aria-modal`, no stable test id

Why it matters:
- first-use factor creation is a gateway flow
- weak semantics hurt both accessibility and automated validation

Recommendation:
- add semantic modal attributes and stable test hooks
- make required fields explicit
- show inline validation text instead of silent disabled state

Acceptance target:
- first factor can be created through UI with deterministic success and testability

## 4.2 P1 - Workflow Completion

### F4. Add row actions to mining results

Problem:
- mining results stop at a ranked table

Recommendation:
- add `Add to Combine`
- add `Save to Library`
- add `Preview Metadata`
- add `Backtest`

Acceptance target:
- users can continue from discovery to next action without switching mental context

### F5. Replace dead-end backtest tab with actionable state

Problem:
- backtest tab is currently a dead-end empty state

Recommendation:
- add CTA-based empty state:
  - `Backtest current combination`
  - `Open recent jobs`
  - `Generate Qlib config`
- later: show recent factor backtest jobs inline

Acceptance target:
- backtest tab supports the next step in the research workflow

### F6. Surface advanced mining controls already supported by backend

Problem:
- backend and i18n support `ic_threshold`, `corr_threshold`, `top_n`, `save_label`, history
- UI currently exposes only instruments and date range

Recommendation:
- add collapsible advanced controls section
- add mining history panel
- show defaults explicitly so the screening logic does not feel opaque

Acceptance target:
- users can understand and tune how mining shortlists are produced

### F7. Add evaluation metadata that supports quant judgment

Problem:
- current evaluation table is too thin for research decisions

Recommendation:
- add coverage
- add observation count
- add source type (`custom`, `qlib`, `mined`)
- add forward-return horizon

Acceptance target:
- users can judge result reliability without leaving the page

## 4.3 P2 - Structure and Clarity

### F8. Reframe Factor Library as a research inventory

Recommendation:
- add filters for status, source, category
- add sort by latest ICIR and updated time
- add columns for source and last evaluated time

### F9. Add workflow framing across tabs

Recommendation:
- present a visible journey: `Library -> Evaluate -> Mine -> Combine -> Backtest`
- use helper text or lightweight stepper copy

### F10. Add factor lifecycle states

Recommendation:
- distinguish `draft`, `testing`, `validated`, `candidate`, `production-linked`
- do not flatten all factors into one undifferentiated list

## 4.4 P3 - Polish and Observability

### F11. Add chart-based evaluation views

Recommendation:
- IC time series
- distribution summary
- factor correlation heatmap

### F12. Improve instrumentation for future review/testing

Recommendation:
- add stable `data-testid` hooks to key Factor Lab actions
- add modal semantics
- add event logging around run/complete/fail transitions

## 5. Recommended Delivery Sequence

### Phase 1 - Restore runtime trust
- F1 lifecycle feedback
- F2 fallback visibility
- F3 factor creation reliability

### Phase 2 - Close the research loop
- F4 mining row actions
- F5 backtest tab continuity
- F6 advanced mining controls
- F7 evaluation metadata

### Phase 3 - Improve research ergonomics
- F8 library as inventory
- F9 workflow framing
- F10 lifecycle states

### Phase 4 - Deepen analysis and testability
- F11 charts and comparison
- F12 instrumentation and test hooks

## 6. Suggested Small Slices

- Slice 1: runtime status block for evaluation and mining
- Slice 2: evaluation status badge + fallback copy
- Slice 3: modal semantics + stable test ids + inline validation
- Slice 4: mining result row actions
- Slice 5: backtest tab actionable empty state
- Slice 6: advanced mining controls
- Slice 7: evaluation metadata chips
- Slice 8: library filters and source badges

## 7. Outcome Expected

After these fixes, Factor Lab should move from:
- technically connected but ambiguous
- capable but workflow-incomplete
- quant-oriented but low-confidence

to:
- explicit about system state
- legible as a research pipeline
- trustworthy enough for iterative factor work
