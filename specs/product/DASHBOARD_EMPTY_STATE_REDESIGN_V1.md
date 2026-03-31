# Dashboard and Empty-State Redesign v1

Owner: @designer  
Status: Draft

Sources:
- Review findings from live environment validation
- PRD: `projects/QuantMate/quantmate-docs/requirements/PRODUCT_REQUIREMENTS_V1.md`
- Architecture: `projects/QuantMate/quantmate-docs/architecture/DETAILED_ARCHITECTURE.md`
- Frontend reference: `projects/QuantMate/quantmate-docs/development/frontend/FRONTEND_README.md`
- Existing prototypes:
  - `projects/QuantMate/quantmate-docs/prototype/dashboard.html`
  - `projects/QuantMate/quantmate-docs/prototype/login.html`
  - `projects/QuantMate/quantmate-docs/prototype/analytics.html`
  - `projects/QuantMate/quantmate-docs/prototype/portfolio.html`

## 1. Goal

This document defines a focused redesign for three tightly related surfaces:
- login entry experience
- post-login Dashboard
- core empty-state system across Dashboard, Analytics, and Portfolio

The goal is not visual novelty by itself. The goal is to make QuantMate feel:
- trustworthy in imperfect environments
- guided when data is empty
- action-oriented for first-time users
- explicit about system health and feature maturity

## 2. Product Problem Being Solved

Today the platform has a broad module surface, but a weak activation path.

Main issues:
- login gives too little environment context
- Dashboard behaves like a summary page even when there is nothing meaningful to summarize
- empty states communicate absence instead of next steps
- system data inconsistency is known by the backend but not framed clearly for the user
- advanced modules visually compete with the core path even when not all are mature

This redesign shifts the experience from `module discovery` to `task progression`.

## 3. Design Principles

- show system truth early; do not let users infer wrong conclusions from blank data
- treat empty state as guided setup, not failure copy
- make the first screen answer: what can I do next?
- keep advanced surfaces accessible, but do not let them dominate first-use attention
- make environment and maturity visible, not hidden in docs or assumptions

## 4. Primary User Moment

Primary moment addressed by this redesign:
- a user logs in successfully to an account with little or no activity data
- they need to understand product status and start a meaningful workflow quickly

Success means the user can do all three within the first minute:
- understand whether the system is healthy enough to trust
- identify the main paths available
- take one concrete next action

## 5. Login Page Redesign

## 5.1 UX Objective

Before credentials are submitted, the login page should already answer:
- which environment am I entering
- what kind of platform is this
- what should I expect after login

## 5.2 Proposed Structure

### Top Utility Strip
- environment badge: `Test Environment`
- optional status text: `For validation only - some modules may use mock or incomplete data`
- language switch in utility position, not hero position

### Left/Main Login Column
- product logo and concise promise
- credential form
- low-visibility secondary auth options if needed
- short trust note under form:
  - `首次管理员登录需修改密码`
  - `测试环境中的数据与交易行为不代表生产结果`

### Right Context Panel
Instead of generic marketing copy, use practical orientation blocks:
- `你将进入的能力`:
  - strategy research
  - backtesting
  - market analysis
  - portfolio and paper trading
- `当前环境提示`:
  - test environment
  - some data may be incomplete
  - system health is visible after login

## 5.3 Behavior Recommendations

- if `must_change_password=true`, do not treat it as a surprising redirect; pre-signal that first admin login requires password reset
- if environment is non-production, show badge persistently after login too

## 5.4 Login Copy Direction

Avoid generic B2B marketing copy.

Prefer:
- practical
- operational
- confidence-building
- concise

Example direction:
- title: `进入 QuantMate 测试环境`
- subtitle: `用于验证策略研究、回测、行情分析与模拟交易流程`
- helper note: `首次管理员登录后需要修改密码`

## 6. Dashboard Redesign

## 6.1 New Dashboard Role

Dashboard should stop behaving as a static KPI board.

New role:
- command center for system truth
- launchpad for the next best actions
- lightweight activity feed proving the product is alive

It should work in both states:
- no data / cold start
- active account with real activity

## 6.2 Dashboard Information Architecture

### Zone A - Global System Health Strip
Location:
- directly under page title, above any business KPI cards

Purpose:
- expose operational trust signals before business metrics

Contents:
- data sync status
- consistency state
- missing date count
- queue health
- last successful sync time
- recent failed task count

Visual behavior:
- green when healthy
- amber when partial issues exist
- red when consistency is false or core sync degraded

Primary CTA:
- `查看系统状态`

Secondary CTA:
- `去同步设置`

### Zone B - Next Best Actions
Purpose:
- make first-use activation explicit

Use card-based CTA launcher with 3-4 cards maximum.

Recommended cards:
- `同步第一批数据`
  - explanation: to unlock market, analytics, and portfolio views
  - CTA: `去同步`
- `创建第一个策略`
  - explanation: use template or import Python
  - CTA: `新建策略`
- `运行第一次回测`
  - explanation: validate idea with historical data
  - CTA: `开始回测`
- `查看行情示例`
  - explanation: explore a symbol before research
  - CTA: `打开行情`

Behavior rule:
- if user already has strategies but no backtests, promote backtest card first
- if user has backtests but no paper deployments, promote paper trading card

### Zone C - Business Summary Cards
Purpose:
- still show assets, strategies, alerts, tasks, but in a way that works with missing data

Suggested cards:
- assets / positions
- strategies / running jobs
- alerts
- paper trading deployments

When empty:
- show compact summary plus recommended action
- never leave cards visually blank

### Zone D - Activity Timeline
Purpose:
- make the system feel active and explain what happened recently

Include mixed events such as:
- sync completed / failed
- backtest submitted / finished
- optimization started
- alert triggered
- paper deployment created / stopped

When no history exists:
- show starter timeline with suggested first milestones, for example:
  - `同步市场数据`
  - `创建策略`
  - `运行回测`
  - `启动模拟交易`

## 6.3 Dashboard Layout Proposal

Recommended layout order:
1. page title + environment badge
2. system health strip
3. next best actions row
4. business summary row
5. activity timeline
6. detailed modules or lower-priority widgets

This is a deliberate inversion of the current KPI-first pattern.

## 6.4 Dashboard Empty State Rules

When account is effectively empty:
- do not render dead charts first
- prioritize actions and system orientation above charts
- optional charts can collapse into placeholders with CTA if no data exists

Examples:
- net asset chart empty -> `暂无净值曲线，因为你还没有任何持仓或回测结果`
- alerts empty -> `还没有告警规则，先创建一条价格提醒或风控告警`
- strategy panel empty -> `从内置模板开始创建第一条策略`

## 7. Core Empty-State System

## 7.1 Empty-State Framework

Every major empty state should contain 5 parts:
- title: what is missing
- reason: why it is missing right now
- next step: the clearest action to take
- optional secondary actions: 1-2 alternatives
- contextual reassurance: what value will unlock after action

Template:
- title
- one-sentence explanation
- primary CTA
- secondary CTA(s)
- optional helper text

## 7.2 Empty-State Types

### Type A - Setup Empty State
Use when the user has not completed a prerequisite.

Example:
- no synced market data
- no created strategy
- no configured portfolio

### Type B - Activity Empty State
Use when the surface is valid but no events/results exist yet.

Example:
- no recent orders
- no alert history
- no completed backtests

### Type C - Risk/Warning Empty State
Use when absence is caused by degraded system state or blocked trust.

Example:
- analytics unavailable because sync consistency is false
- partial market views because required data is missing

### Type D - Preview/Beta Empty State
Use when a feature exists but is not yet fully live or production-ready.

Example:
- AI Assistant preview
- Factor Lab beta
- Team Space under construction

## 8. Page-Specific Empty-State Specs

## 8.1 Dashboard Empty State

### Scenario D1 - New account, no strategy, no positions, no history

Title:
- `先让 QuantMate 动起来`

Explanation:
- `你已经登录成功，但当前账户还没有策略、持仓或历史任务。先完成一个起步动作，平台就会开始生成可用数据。`

Primary CTA:
- `创建第一个策略`

Secondary CTAs:
- `去同步数据`
- `查看行情示例`

Helper text:
- `完成一次回测后，这里会开始展示收益曲线、任务历史和关键指标。`

### Scenario D2 - Data inconsistency present

Title:
- `数据同步存在异常，分析结果可能不完整`

Explanation:
- `系统检测到缺失交易日数据，当前部分图表和结果可能失真。建议先查看同步状态后再做判断。`

Primary CTA:
- `查看系统状态`

Secondary CTA:
- `前往同步设置`

## 8.2 Analytics Empty State

### Scenario A1 - No symbol selected

Title:
- `先选择一个标的开始分析`

Explanation:
- `分析中心不会主动猜测你的研究对象。先从行情页选择一个标的，再查看技术、基本面和量化指标。`

Primary CTA:
- `去行情页选标的`

Secondary CTA:
- `查看示例标的`

### Scenario A2 - Symbol selected but no usable data

Title:
- `这个标的暂时没有可用分析数据`

Explanation:
- `可能原因是该标的尚未同步，或当前数据一致性不足，无法生成可靠分析结果。`

Primary CTA:
- `检查数据同步状态`

Secondary CTA:
- `切换到其他标的`

### Scenario A3 - No strategies/backtests to connect with analytics

Title:
- `先跑一次回测，再看更有意义的分析结果`

Explanation:
- `你可以先从内置模板开始回测。完成后，这里会更自然地承接绩效和风险分析。`

Primary CTA:
- `开始第一次回测`

Secondary CTA:
- `新建策略`

## 8.3 Portfolio Empty State

### Scenario P1 - No positions

Title:
- `你的组合还是空的`

Explanation:
- `目前账户里还没有任何持仓。你可以用模拟仓位开始，也可以导入现有持仓继续管理。`

Primary CTA:
- `创建模拟持仓`

Secondary CTAs:
- `导入持仓`
- `查看示例组合`

Helper text:
- `创建持仓后，这里会开始显示收益、风险和配置结构。`

### Scenario P2 - Only cash, no allocation logic yet

Title:
- `先建立第一版资产配置`

Explanation:
- `当前组合只有现金，系统还无法计算有效的仓位结构、行业暴露和风险画像。`

Primary CTA:
- `配置目标组合`

Secondary CTA:
- `从示例组合开始`

## 9. Feature Maturity Signaling

For advanced modules, use visible maturity tags in nav or page header.

Recommended labels:
- `Stable`
- `Beta`
- `Preview`
- `Demo Data`
- `Internal`

Initial candidates for non-Stable labels if still immature:
- AI Assistant
- Factor Lab
- Team Space
- Marketplace
- Composite Strategies

Rule:
- tags should reduce false expectation, not discourage exploration

## 10. Content Style Guide for Empty States

## 10.1 Tone
- direct
- calm
- operational
- confidence-building
- never apologetic by default

## 10.2 Copy Rules
- explain cause, not only absence
- recommend one primary action
- do not exceed 2 secondary actions
- avoid abstract product jargon
- mention value unlocked after the action when useful

## 10.3 Bad vs Better

Bad:
- `暂无数据`

Better:
- `你还没有运行任何回测。先从一个内置模板开始，拿到第一份策略结果。`

Bad:
- `获取失败`

Better:
- `告警规则暂时无法加载。请先确认监控服务可用，随后重试。`

Bad:
- `没有持仓`

Better:
- `你的组合还是空的。先创建模拟持仓，或导入现有仓位开始分析。`

## 11. Suggested Interaction Rules

- keep the primary CTA above the fold in empty states
- when a prerequisite is missing, link directly to the page that satisfies it
- use inline warning blocks for degraded data trust, not hidden tooltips only
- if a page is preview-only, say so immediately in page header
- use lightweight illustrations or icons only if they support orientation; do not turn empty states into decorative posters

## 12. Success Metrics

This redesign is working if:
- users can identify the next step within 5 seconds after login
- fewer users bounce after landing on empty Dashboard
- more users complete first strategy or first backtest in the first session
- support questions about empty pages decrease
- data inconsistency issues produce fewer trust complaints because the UI explains them early

## 13. Delivery Recommendations

Implement in small slices:
- Slice 1: login page environment badge and trust notes
- Slice 2: app-shell environment badge persistence
- Slice 3: Dashboard health strip
- Slice 4: Dashboard next-best-actions row
- Slice 5: Dashboard empty summary card behavior
- Slice 6: analytics empty-state rewrite
- Slice 7: portfolio empty-state rewrite
- Slice 8: maturity tags for advanced modules

## 14. Out of Scope for This Version

- complete visual redesign of all modules
- full navigation restructure for every route
- new onboarding wizard flow
- end-to-end content rewrite of the whole product
- data seeding strategy for demo accounts

## 15. Final Intent

The redesign should make QuantMate feel less like a wide but quiet control panel, and more like a guided quantitative workspace that:
- tells the truth about system state
- gives users momentum immediately after login
- turns emptiness into directed setup
- clarifies what is ready, what is risky, and what is exploratory
