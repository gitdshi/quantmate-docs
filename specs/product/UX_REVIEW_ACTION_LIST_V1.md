# QuantMate UX Review Action List v1

Owner: @designer  
Status: Draft

Sources:
- Review inputs from live test environment using real login and API checks
- PRD: `projects/QuantMate/quantmate-docs/requirements/PRODUCT_REQUIREMENTS_V1.md`
- Architecture: `projects/QuantMate/quantmate-docs/architecture/DETAILED_ARCHITECTURE.md`
- Frontend reference: `projects/QuantMate/quantmate-docs/development/frontend/FRONTEND_README.md`
- Prototypes: `projects/QuantMate/quantmate-docs/prototype/dashboard.html`, `projects/QuantMate/quantmate-docs/prototype/login.html`, `projects/QuantMate/quantmate-docs/prototype/analytics.html`, `projects/QuantMate/quantmate-docs/prototype/portfolio.html`

## 1. Purpose

This document turns the latest product/design review into an execution-oriented action list.

It focuses on four things:
- what is broken or weak today
- why it matters to user perception and task completion
- what should be fixed first
- how to sequence changes without scope creep

This is not a full redesign spec. It is the PM + design review worklist that should drive implementation slices.

## 2. Review Baseline

Observed facts from the latest review:
- login with `admin / admin123` succeeded
- core APIs were reachable, including:
  - `/auth/me`
  - `/queue/stats`
  - `/system/sync-status`
  - `/analytics/dashboard`
  - `/portfolio/positions`
  - `/trade/orders`
  - `/paper-trade/deployments`
- the product surface already includes many modules:
  - Dashboard
  - Strategy Research
  - Backtesting
  - Market Data
  - Portfolio
  - Trading
  - Paper Trading
  - Monitoring
  - Reports
  - AI Assistant
  - Factor Lab
  - Composite Strategies
  - Team Space
- environment data is currently sparse:
  - about 1,000,000 cash
  - no positions
  - no orders
  - no paper deployments
  - no meaningful analytics content
- one concrete defect was found:
  - `GET /api/v1/alerts/rules` returns HTTP 500
- system data consistency already indicates risk state:
  - `consistency.missing_count = 80`
  - `is_consistent = false`

## 3. Executive Judgment

The current state is best described as:
- backend capability is connected enough to demo the product skeleton
- frontend information architecture is broad and ambitious
- first-use experience is weak because empty data, system risk, and feature maturity are not framed for the user
- the product currently feels more like a feature inventory than a guided trading-research workflow

The main product risk is not just missing features. It is that users can easily misread the product state:
- broken modules look like bad quality
- empty modules look like no value
- inconsistent data looks like untrustworthy analysis
- advanced but immature modules look falsely production-ready

## 4. Priority Framework

Priority meanings:
- `P0`: broken trust or broken flow; should be fixed before polishing
- `P1`: first-use and task-completion blockers; should follow immediately after P0
- `P2`: structural improvements that make the product feel coherent
- `P3`: enhancements that improve clarity, maturity signaling, and long-term usability

## 5. Action List by Priority

## 5.1 P0 - Must Fix First

### A1. Fix monitoring alerts API failure

Problem:
- `GET /api/v1/alerts/rules` returns 500

Why it matters:
- this is not an empty state; it is a broken backend contract
- users will interpret the Monitoring/Alerts module as unreliable
- it damages trust in the rest of the system

Recommendation:
- fix backend route so rule list returns one of:
  - valid list data
  - empty list with 200
  - controlled error state with typed response
- frontend must show empty rules state, not raw crash behavior

Acceptance target:
- Monitoring page loads without server error
- empty rule list renders with clear CTA: create first alert rule

Suggested slice:
- backend bug fix
- frontend empty-state fallback
- add regression test for `GET /api/v1/alerts/rules`

### A2. Make test environment state explicit on login and after login

Problem:
- test environment currently feels like a normal production-style login entry
- public default credential impression makes the product feel like a demo shell

Why it matters:
- users may misunderstand where they are
- mistakes in test/staging environments become more likely
- maturity perception drops sharply

Recommendation:
- add visible `Test Environment` badge on login page and in app shell header
- add short environment note such as:
  - data may be incomplete
  - some modules are under validation
  - actions may use test brokers or mock data

Acceptance target:
- environment status is visible before login and after login
- no user can mistake the environment for production at first glance

### A3. Surface data consistency risk instead of silently showing empty results

Problem:
- backend already reports `missing_count = 80` and `is_consistent = false`
- pages can appear empty or partially valid without explaining that data integrity is degraded

Why it matters:
- users will blame product quality instead of understanding system state
- trust in analytics, market data, and portfolio views drops
- poor decision support is more dangerous than a clear warning

Recommendation:
- add global system health banner or status strip on Dashboard
- include:
  - sync consistency state
  - last sync time
  - missing date count
  - action link to system status / sync page
- use severity-based copy, not silent badges only

Acceptance target:
- when consistency is false, Dashboard top area clearly explains it
- downstream pages can reuse a lighter warning badge

## 5.2 P1 - First-Use Experience

### A4. Replace passive empty states with task-oriented onboarding

Problem:
- empty pages currently feel cold and static
- users land in a system with no momentum and no next step

Why it matters:
- first-session activation is weak
- users do not understand how to derive value from the platform
- empty state becomes synonymous with unfinished product

Recommendation:
- every core empty state must answer:
  - what is this page for
  - why is it empty now
  - what should I do next
  - what can I try if I do not have real data yet

Core CTA set to standardize:
- sync data
- create first strategy
- run first backtest
- explore market example
- create paper deployment
- import or create portfolio

Acceptance target:
- no major page ends at `暂无数据` or equivalent dead-end copy
- each empty state has 1 primary CTA and 1-2 secondary CTAs

### A5. Turn Dashboard into a command center, not a static summary page

Problem:
- current Dashboard concept is too data-summary-oriented for an empty or half-ready environment
- when there is little data, it becomes a dead surface

Why it matters:
- Dashboard is the default landing page after login
- its emotional job is to prove the product is alive, useful, and understandable

Recommendation:
- top: system health strip
- middle: action-oriented overview cards
- bottom: recent activity timeline or operational feed
- if no business data exists, prioritize activation over KPI density

Acceptance target:
- a first-time user can identify the next recommended action in under 5 seconds
- Dashboard remains useful both in empty and active accounts

### A6. Make analytics empty states route users back into research flow

Problem:
- analytics without selected symbols or data becomes passive and unclear

Why it matters:
- Analytics is one of the most value-demonstrating areas when connected to real workflow
- today it can feel like a blank advanced module

Recommendation:
- instead of generic no-data messaging, route users to:
  - choose a symbol from Market Data
  - open technical analysis
  - run a backtest first if no strategy exists
- add contextual CTA based on missing prerequisite

Acceptance target:
- analytics empty state explains missing prerequisite, not just missing result

### A7. Make portfolio empty states support three starting modes

Problem:
- empty portfolio currently reads as nothingness rather than setup opportunity

Why it matters:
- portfolio is central to user value perception
- if users see only cash and no action path, the product feels inert

Recommendation:
- offer three clear entries:
  - create simulated position
  - import positions
  - explore sample portfolio

Acceptance target:
- empty portfolio state supports both learning mode and real setup mode

## 5.3 P2 - Information Architecture and Navigation

### A8. Reframe the product around 3 core journeys

Problem:
- the current navigation is broad, but first-time cognition cost is high
- menu count currently exceeds the product's guided workflow clarity

Why it matters:
- users do not buy a menu; they buy progress toward outcomes
- too many equal-weight modules create decision fatigue

Recommendation:
- reorganize onboarding and Dashboard around three primary tracks:
  1. research strategy -> backtest -> optimize
  2. scan market -> find opportunity -> build portfolio
  3. paper trade -> monitor -> review report
- secondary/advanced modules remain accessible, but not equally emphasized for first entry

Acceptance target:
- new users understand the product's main paths without reading documentation

### A9. Separate mature features from exploratory or placeholder features

Problem:
- advanced modules such as AI Assistant, Factor Lab, Marketplace, Team Space, Composite Strategies can look production-ready even when they are not fully mature

Why it matters:
- users overestimate readiness and then feel disappointed
- perceived inconsistency hurts the whole product, not just those modules

Recommendation:
- add capability status tags where needed:
  - `Beta`
  - `Preview`
  - `Under Construction`
  - `Demo Data`
- optionally group these under a secondary navigation section such as `Explore`

Acceptance target:
- feature maturity is visible before the user clicks into a page

### A10. Split high-frequency settings from admin/system settings

Problem:
- settings depth is high and likely mixes end-user settings with admin/system operations

Why it matters:
- regular users should not front-load platform governance concepts
- admin operations are important but should not dominate the general experience

Recommendation:
- split into:
  - personal/account settings
  - trading/workspace preferences
  - admin/system settings
- hide or down-rank admin-only items for non-admin users later via RBAC

Acceptance target:
- ordinary users can find their own settings without parsing system internals

## 5.4 P3 - Content, Copy, and Presentation

### A11. Improve empty-state copy from system copy to task copy

Problem:
- many messages likely read like generic system notices

Why it matters:
- generic copy communicates absence, not action
- task copy makes the product feel guided and intentional

Recommendation:
- use formula:
  - current situation
  - next step
  - why it matters
- example:
  - avoid: `暂无回测数据`
  - prefer: `你还没有运行任何回测。先从一个内置模板开始，10 分钟内拿到第一份策略结果。`

Acceptance target:
- all primary empty states use action-oriented copy style

### A12. Keep Chinese primary, reduce English visual weight in CN-first environment

Problem:
- bilingual capability exists, but if target users are mainly Chinese-speaking, English may visually compete too much

Why it matters:
- default language should match target users' reading speed and trust expectations

Recommendation:
- keep Chinese as default primary language
- move language switch to a utility position instead of equal emphasis

Acceptance target:
- primary interface feels native to the main audience without removing English support

## 6. Recommended Delivery Sequence

### Phase 1 - Stop trust erosion
- A1 fix alerts/rules 500
- A2 add environment badge and test environment messaging
- A3 surface sync/data consistency warnings

### Phase 2 - Fix cold start
- A4 standard empty-state framework
- A5 Dashboard command-center upgrade
- A6 analytics prerequisite-driven empty state
- A7 portfolio starter actions

### Phase 3 - Reduce cognitive load
- A8 3-path product framing
- A9 maturity labels for advanced modules
- A10 settings restructuring proposal

### Phase 4 - Polish content and presentation
- A11 rewrite empty-state copy system
- A12 tune CN-first language emphasis

## 7. Suggested Implementation Slices

Small slices only, each independently reviewable:
- Slice 1: alerts page loads successfully with empty-state fallback
- Slice 2: login page + app shell show test environment badge
- Slice 3: Dashboard top health strip consumes sync status
- Slice 4: Dashboard empty-state CTA cards
- Slice 5: analytics empty-state with symbol-selection CTA
- Slice 6: portfolio empty-state with 3 entry actions
- Slice 7: feature maturity badge system
- Slice 8: settings IA split proposal and nav update
- Slice 9: copy pass across top 6 empty states

## 8. Design Principles Reinforced by This Review

- do not hide system instability behind blank UI
- empty state is part of the product, not an exception
- first-time users need journeys, not just modules
- broad capability must be framed by maturity and guidance
- the default landing page should create momentum, not silence

## 9. Open Questions

These should be answered before implementation expands:
- Should test/staging and production have different visual themes or only badges?
- Which advanced modules are truly beta versus merely underpopulated?
- Do we want sample/demo data in test environments to reduce cold start?
- Is Dashboard meant to optimize for operators, traders, or first-time evaluators?
- Should first-login flow go to Dashboard or to a guided setup wizard when account data is empty?

## 10. Outcome Expected After Applying This List

If the actions above are executed in order, QuantMate should shift from:
- feature-rich but emotionally empty
- broad but cognitively heavy
- technically connected but trust-fragile

to:
- honest about environment and data quality
- guided for first-time users
- clearer about what is ready versus exploratory
- more likely to communicate product value within the first session
