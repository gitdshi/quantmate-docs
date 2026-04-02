# FactorLab Staging Review (2026-04-02)

## Scope

Review target: `https://test.quantmate.net`

Focus areas:
- Data UX and data trustworthiness
- Qlib factor mining workflow
- Factor evaluation, combination, and backtest continuity

Method:
- Verified staging build metadata from `runtime-config.js`
- Checked live entry HTML for deployed build assets
- Cross-checked current frontend and backend source implementation
- Performed real Playwright access against staging, including login, Factor Lab route access, factor creation via authenticated API, and post-login page-state inspection

Build observed:
- `PORTAL_BUILD_TIME: 2026-04-01T00:04:13Z`

Playwright-confirmed staging observations:
- Unauthenticated access redirects to `/login`
- Login with `admin / admin123` succeeds via the documented E2E auth flow
- Logged-in `admin` can access `/factor-lab`
- Factor Lab initially shows `共 0 个因子` for this account
- Creating a factor through authenticated API succeeds and the new factor appears in the library immediately
- In-browser create modal showed the `创建因子` button disabled during this session, so modal completion needs separate follow-up
- After selecting a factor and clicking `运行评估`, the UI changed to `评估中...`, but no result row appeared during the observed wait window
- After clicking `开始挖掘`, the UI changed to `挖掘中...`, but no mined-result table appeared during the observed wait window

---

## Executive Assessment

The previous round of suggestions has clearly moved FactorLab from a prototype-like placeholder toward a real product surface: the page now has live tabs, real API bindings, mining endpoints, multi-factor strategy generation, and persisted screening tables.

But the core issue is still not visual polish. It is decision confidence.

For a quant workflow, users must be able to answer three questions instantly:
1. Is this data real or fallback?
2. Can I trust this factor result enough to act on it?
3. What is the next valid action after mining or evaluating?

Right now FactorLab has made good progress on capability, but the UX still under-communicates state, provenance, and next-step flow. That is most visible in the Qlib mining and IC/IR areas.

---

## What Improved Since Last Round

1. **FactorLab is now wired to real APIs instead of pure mock UI**
   - Frontend uses `factorAPI.list`, `listEvaluations`, `runEvaluation`, `runMining`, and multi-factor strategy APIs.
   - Source: `quantmate-portal/src/pages/FactorLab.tsx:110`, `quantmate-portal/src/pages/FactorLab.tsx:142`, `quantmate-portal/src/pages/FactorLab.tsx:151`, `quantmate-portal/src/pages/FactorLab.tsx:162`, `quantmate-portal/src/pages/FactorLab.tsx:171`

2. **Qlib factor mining path now exists end-to-end**
   - Mining endpoint implemented at `/factors/mining/run`.
   - Screening persistence tables and migrations exist.
   - Source: `quantmate/app/api/routes/factors.py:282`, `quantmate/mysql/migrations/019_factor_screening.sql`, `quantmate/app/domains/factors/factor_screening.py:111`

3. **Factor-to-strategy bridge is implemented**
   - Multi-factor strategy generation and `strategy_factors` bridge table exist.
   - Source: `quantmate/app/api/routes/strategies.py:330`, `quantmate/mysql/migrations/020_strategy_factor_bridge.sql`, `quantmate/app/domains/strategies/multi_factor_engine.py:301`

4. **Staging is serving a fresh build**
   - The deployed page is not an old placeholder shell.
   - Source: live `runtime-config.js`

---

## Key Improvement Opportunities

### P0 — Evaluation and mining can enter pending states without clear completion feedback

Playwright observed two concrete runtime behaviors on staging:
- `运行评估` changed to `评估中...`, but no evaluation record appeared in the visible results table within the observed wait window.
- `开始挖掘` changed to `挖掘中...`, but no mined-result table appeared in the visible results area within the observed wait window.

Observed implication:
- Even before discussing quant rigor, the current runtime feedback loop is weak. Users can trigger long-running actions but are not clearly told whether the request was submitted, queued, still running, failed, or silently stalled.

Recommendation:
- Add explicit job/request lifecycle feedback for both actions: `submitted`, `running`, `completed`, `failed`, `timed out`.
- Show a timestamped last-run status block under the action bar.
- If the backend is asynchronous, expose queue/job id and a link to status.
- If the backend is synchronous, surface timeout/failure messaging instead of leaving users in a pending-looking state.

### P0 — Make evaluation credibility explicit

The biggest product risk is that users cannot tell whether evaluation results are based on real market data, partial data, or fallback zeros.

Backend behavior today:
- `run_evaluation()` attempts real computation.
- If OHLCV data is unavailable or any exception occurs, it silently falls back to `_stub_metrics()`.
- Stub values are all zeros.
- Source: `quantmate/app/domains/factors/service.py:56`, `quantmate/app/domains/factors/service.py:69`, `quantmate/app/domains/factors/service.py:77`, `quantmate/app/domains/factors/service.py:88`

Why this is a problem:
- A user can easily misread `IC=0`, `ICIR=0`, `turnover=0` as a genuine bad factor result rather than a data/system failure.
- In quant UX, that is dangerous because “bad alpha” and “no data / compute failed” are radically different decisions.

Recommendation:
- Add an explicit evaluation status field: `completed_real`, `completed_fallback`, `failed`, `insufficient_data`.
- Show a visible badge in IC/IR results: `Real Data`, `Fallback`, `Data Missing`, `Compute Failed`.
- Add provenance text: data source, universe, observation count, coverage ratio, forward-return horizon.
- Do not write fallback zeros as if they were normal evaluation rows without a warning banner.

Suggested UX copy:
- `This evaluation used fallback metrics because required OHLCV data was unavailable.`
- `Coverage 42% — interpret IC/IR with caution.`

### P0 — Close the workflow gap after factor mining

Current mining UX returns a table of ranked factors, but the user journey stops there.

Frontend behavior today:
- Mining results are displayed in a table.
- There is no obvious “save as factor”, “add to combine”, “promote to strategy”, or “compare with existing factors” action on each result.
- Source: `quantmate-portal/src/pages/FactorLab.tsx:422`, `quantmate-portal/src/pages/FactorLab.tsx:453`

Why this matters:
- Factor mining is not an insight destination; it is an input step in a longer research flow.
- Without follow-up actions, users get a ranked list but no efficient bridge into production work.

Recommendation:
- Add row actions on mining results:
  - `Add to Combine`
  - `Save to Factor Library`
  - `Preview Expression / Metadata`
  - `Backtest in Qlib`
- Add a top summary card after mining:
  - factor set used
  - date range
  - universe
  - raw factor count
  - after IC filter
  - after correlation dedupe
  - top factor score range
- Add “Mine -> Select -> Combine -> Backtest” breadcrumb or guided flow.

### P0 — Backtest tab is still a dead end

Current behavior:
- `backtest` tab only shows an empty-state sentence.
- Source: `quantmate-portal/src/pages/FactorLab.tsx:562`

Why this matters:
- The user mentally models FactorLab as a research workbench.
- If “combine” can create strategies, the next expected step is immediate backtest visibility.
- A dead-end tab reduces confidence and makes the feature feel half-shipped.

Recommendation:
- At minimum, replace the dead-end with a task-oriented state:
  - `No factor backtests yet`
  - CTA 1: `Backtest current combination`
  - CTA 2: `Open queue jobs`
  - CTA 3: `Use Qlib config`
- Prefer embedding recent backtest jobs/status cards inside this tab.
- Show both engines explicitly if both are supported: `vnpy` vs `qlib`.

### P1 — Expose mining controls that already exist in the backend design language

Current frontend mining inputs:
- instruments
- start date
- end date
- run button
- Source: `quantmate-portal/src/pages/FactorLab.tsx:428`

But the product language and backend support imply richer control is important:
- `ic_threshold`
- `corr_threshold`
- `top_n`
- `save_label`
- mining history
- Source: `quantmate/app/api/routes/factors.py:202`, `quantmate/app/api/routes/factors.py:217`, `quantmate-portal/src/i18n/locales/zh/social.json:194`

Observation:
- The i18n copy already includes labels for threshold/top-N/history, but the page does not render them.
- That means the product intent is ahead of the current UX.

Recommendation:
- Surface advanced controls behind an expandable section labeled `高级筛选条件`.
- Defaults are fine, but users need to know screening is not arbitrary.
- Add mining history panel using `/factors/screening/history`.

### P1 — Add data provenance and sample-size context to IC/IR view

Current IC/IR table columns:
- start date
- end date
- IC
- ICIR
- long-short return
- turnover
- created date
- Source: `quantmate-portal/src/pages/FactorLab.tsx:266`

What is missing for quant decision-making:
- number of instruments used
- number of dates used
- effective sample size
- factor coverage
- whether values came from custom expression or Qlib set
- return horizon (t+1, t+5)

Recommendation:
- Add compact metadata chips above the table.
- Add at least two new columns or expandable details:
  - `Coverage`
  - `Obs`
- If coverage is low, visually downgrade result confidence.

### P1 — The combine workflow lacks portfolio construction semantics

Current combine flow lets users set:
- factor list
- weight
- long/short direction
- strategy name
- class name
- Source: `quantmate-portal/src/pages/FactorLab.tsx:466`

Why this is insufficient:
- For users doing factor research, “combine” is not only code generation. It is portfolio construction.
- Missing decision parameters leave the mental model underdefined: rebalance frequency, normalization, z-score/rank method, missing-value handling, neutralization, weighting scheme, top-k selection.

Recommendation:
- Add a second section called `组合规则` with advanced defaults collapsed by default.
- Minimum useful settings:
  - factor normalization method
  - rebalance frequency
  - score aggregation method
  - ranking direction summary
  - top-k / holding count
- If these are intentionally backend defaults, show them explicitly rather than hiding them.

### P1 — Search and library management are too shallow for growing factor inventories

Current library supports only text search over name/category.
- Source: `quantmate-portal/src/pages/FactorLab.tsx:186`

Missing management features:
- filter by status
- filter by category
- sort by IC / updated time / validation state
- identify duplicates or near-duplicates
- show owner/source (`custom`, `Alpha158`, `Alpha360`, mined)

Recommendation:
- Evolve Factor Library from a generic CRUD table into a research inventory.
- Add columns for:
  - source
  - latest ICIR
  - last evaluated at
  - validation state
- Add filters for `custom`, `qlib`, `validated`, `testing`, `recently mined`.

### P1 — Create-factor modal needs a real usability pass

Playwright found a concrete UI issue here:
- The modal `创建因子` button remained disabled during direct browser interaction, even after filling factor name and formula.
- The same factor could be created successfully through the authenticated API and then appeared in the UI library, which suggests the product capability exists but the modal-state logic or validation affordance is weak.

Why this matters:
- This is a first-touch workflow. If users cannot reliably create the first factor from the UI, the rest of Factor Lab feels broken.

Recommendation:
- Audit the button enablement conditions.
- Make required fields visually explicit.
- If any hidden validation fails, show inline helper text instead of a silently disabled submit button.

### P2 — Creation modal contains fields that imply capability without effect

Current modal includes a frequency selector, but create request only sends `name`, `category`, and `expression`.
- Source: `quantmate-portal/src/pages/FactorLab.tsx:582`, `quantmate/app/api/routes/factors.py:15`

Why this matters:
- It creates expectation that frequency affects evaluation or storage, but it currently does not.
- This is small, but it weakens trust.

Recommendation:
- Either wire frequency through end-to-end, or remove/hide it until supported.
- Same principle applies to any UI copy suggesting deeper mining/history capabilities that are not yet surfaced.

---

## Data and Qlib-Specific Recommendations

### 1. Separate three layers clearly in the UI

Right now several concepts blur together:
- user-defined custom factor
- Qlib factor-set features (Alpha158/Alpha360)
- mined candidate factor results

Recommendation:
- Use explicit badges and language:
  - `Custom Factor`
  - `Qlib Built-in Feature`
  - `Mined Candidate`
  - `Strategy-linked`
- This prevents users from confusing raw Qlib feature columns with curated production factors.

### 2. Show the screening funnel, not just final ranked outputs

Mining is inherently a funnel:
- total features scanned
- after data coverage filter
- after IC threshold
- after correlation dedupe
- final shortlisted count

The backend already performs filtering and dedupe logic.
- Source: `quantmate/app/domains/factors/factor_screening.py:143`, `quantmate/app/domains/factors/factor_screening.py:155`

Recommendation:
- Turn this into a visible summary card.
- This is one of the highest-value improvements because it communicates rigor.

### 3. Make Qlib dependency state visible before the user runs mining

Backend explicitly checks whether Qlib is installed and available.
- Source: `quantmate/app/api/routes/factors.py:290`, `quantmate/app/infrastructure/qlib/qlib_config.py:76`

Recommendation:
- Add a small readiness indicator in the mining tab:
  - `Qlib Ready`
  - `Qlib Not Installed`
  - `Qlib Data Missing`
- This reduces mysterious failure states.

### 4. Distinguish factor discovery from production adoption

Best practice flow should be:
- discover -> validate -> compare -> adopt -> backtest -> deploy

Current UI jumps too quickly from discovered factor table to strategy generation conceptually, while still lacking comparison and confidence layers.

Recommendation:
- Add a middle state: `Promote to candidate` or `Add to research shortlist`.
- This makes the research pipeline feel disciplined instead of impulsive.

---

## Suggested Priority Roadmap

### Immediate (this week)
1. Add evaluation provenance/status badges
2. Replace backtest dead-end tab with actionable empty state
3. Add row actions to mining results (`Add to Combine`, `Save`, `Backtest`)
4. Surface advanced mining controls: IC threshold, correlation threshold, Top N

### Next iteration
1. Add mining history and screening summary cards
2. Add coverage / sample-size metadata to IC/IR evaluations
3. Add source badges and better library filters
4. Add combine-rule settings beyond raw weights

### Later
1. Add factor comparison workspace
2. Add chart-based IC time series and correlation heatmap
3. Add research lifecycle states: draft / candidate / validated / production

---

## Concrete Documentation / Product Spec Follow-Ups

I recommend creating follow-up implementation specs for these slices:

1. `FACTORLAB_EVALUATION_PROVENANCE_SPEC_V1.md`
   - evaluation state model
   - fallback visibility rules
   - UI badges and copy

2. `FACTORLAB_MINING_WORKFLOW_SPEC_V1.md`
   - mining controls
   - summary funnel card
   - result row actions
   - history panel

3. `FACTORLAB_BACKTEST_CONTINUITY_SPEC_V1.md`
   - backtest tab redesign
   - queue/job status integration
   - qlib/vnpy engine split

---

## Bottom Line

The staging version is materially better than before. It now has real product bones.

But for the data / Qlib factor-mining area, the next step is not “add more widgets”. It is to make the research workflow legible and trustworthy:
- show whether numbers are real
- show how shortlisted factors were produced
- give users the correct next action after mining/evaluation
- remove dead ends

If these four things are fixed, FactorLab will feel much closer to a serious quant research surface rather than a feature collection.

---

## Reference Paths

- `quantmate-portal/src/pages/FactorLab.tsx`
- `quantmate-portal/src/i18n/locales/zh/social.json`
- `quantmate/app/api/routes/factors.py`
- `quantmate/app/domains/factors/service.py`
- `quantmate/app/domains/factors/factor_screening.py`
- `quantmate/app/api/routes/strategies.py`
- `quantmate/mysql/migrations/019_factor_screening.sql`
- `quantmate/mysql/migrations/020_strategy_factor_bridge.sql`
