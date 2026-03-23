# QuantMate × Microsoft Qlib Integration Proposal

## 1. Document Purpose

This document evaluates how `microsoft/qlib` can be used in QuantMate and proposes a practical integration strategy.

The goal is not to replace QuantMate's product architecture with Qlib, but to determine:

- which parts of Qlib are valuable for QuantMate;
- which parts should remain outside the core product domain;
- how to integrate Qlib with minimal coupling;
- what a phased implementation path should look like.

## 2. Executive Summary

Qlib is a strong candidate for QuantMate's **quant research and model experimentation engine**, but it should **not** become QuantMate's primary application architecture.

Recommended positioning:

- **QuantMate owns the product layer**: users, projects, permissions, strategy definitions, task orchestration, audit, APIs, UI, and operational workflows.
- **Qlib owns the research engine layer**: data preparation for quant research, feature engineering, model training, prediction generation, backtesting, portfolio analysis, and rolling update workflows.

Recommended principle:

> QuantMate integrates Qlib as a replaceable research engine behind stable QuantMate domain APIs.

This allows QuantMate to gain fast access to mature quant research capabilities without tightly binding the product to Qlib's internal object model, data conventions, or workflow assumptions.

## 3. Why Qlib Is Relevant to QuantMate

Qlib is an open-source AI-oriented quantitative investment platform maintained by Microsoft. It provides a relatively complete research pipeline:

- market data ingestion and storage format support;
- factor and feature generation;
- dataset and handler abstractions;
- supervised learning model training;
- prediction and signal generation;
- backtesting and portfolio strategy evaluation;
- experiment recording;
- rolling retraining and online signal update workflows.

This is directly relevant to QuantMate because QuantMate needs a robust middle layer between raw market data and user-facing strategy/analysis capabilities.

In practical terms, Qlib can accelerate:

- factor research;
- baseline alpha modeling;
- experiment benchmarking;
- signal backtesting;
- scheduled retraining;
- quantitative research workflow standardization.

## 4. Strategic Fit Assessment

### 4.1 Where Qlib Fits Well

Qlib is a strong fit for the following QuantMate capability areas:

1. **Factor research**
   - expression-based factor generation;
   - built-in factor sets such as Alpha158 / Alpha360;
   - custom feature engineering pipeline support.

2. **Model experimentation**
   - baseline ML models for cross-sectional prediction;
   - standardized task configuration;
   - easier comparison across datasets, features, and models.

3. **Backtesting and portfolio research**
   - prediction-to-portfolio workflows;
   - built-in strategy examples such as `TopkDropoutStrategy`;
   - risk/return analysis and benchmark-relative evaluation.

4. **Experiment management**
   - recorder and run-tracking concepts;
   - artifact generation;
   - reusable research workflow definitions.

5. **Rolling training / signal refresh**
   - regular retraining;
   - rolling windows;
   - history-aware online management patterns.

### 4.2 Where Qlib Does Not Fit as the Main Product Backbone

Qlib is not designed to solve QuantMate's product-layer concerns, including:

- multi-tenant application design;
- RBAC and fine-grained authorization;
- user/project/workspace management;
- REST API product contracts for frontend consumption;
- audit logs and compliance workflows;
- job quotas, rate controls, and tenant isolation;
- account/portfolio ownership domain modeling;
- product-grade orchestration of asynchronous tasks;
- unified UX across research, trading, and operations.

These concerns must remain in QuantMate's own architecture.

## 5. Core Recommendation

### 5.1 Recommended Positioning

QuantMate should use Qlib as:

- a **research engine**;
- a **signal generation engine**;
- a **model/backtest execution engine**.

QuantMate should not use Qlib as:

- its user model;
- its permission model;
- its primary API model;
- its workflow orchestration boundary;
- its long-term domain abstraction.

### 5.2 Integration Principle

All Qlib access should be wrapped behind a QuantMate-owned adapter layer.

That means:

- frontend never depends on Qlib-specific structures;
- service-layer contracts are defined by QuantMate;
- Qlib configs and artifacts are internal implementation details;
- future replacement of Qlib remains possible.

## 6. Proposed Target Architecture

### 6.1 Layered Architecture

Recommended architecture:

1. **QuantMate Product Layer**
   - UI;
   - API gateway;
   - auth/RBAC;
   - project/strategy/run management;
   - audit and observability;
   - task submission and result retrieval.

2. **QuantMate Domain Services Layer**
   - research run service;
   - factor service;
   - model training service;
   - backtest service;
   - artifact service;
   - scheduling/orchestration service.

3. **Research Engine Adapter Layer**
   - Qlib adapter;
   - data conversion adapter;
   - experiment result mapper;
   - artifact extraction and normalization;
   - engine capability registry.

4. **Qlib Engine Layer**
   - Qlib data handlers;
   - model workflows;
   - strategy/backtest logic;
   - recorder;
   - rolling / online manager.

5. **Data Layer**
   - raw market data sources (e.g. tushare / akshare / internal feeds);
   - QuantMate canonical research schema;
   - Qlib-compatible binary/data storage;
   - metrics/artifact persistence.

### 6.2 Ownership Boundaries

**QuantMate owns**:

- users and auth;
- roles and permissions;
- project/workspace boundaries;
- strategy definitions visible to users;
- API contracts;
- scheduling rules;
- run history and audit access;
- UI presentation;
- tenant-safe storage and isolation.

**Qlib owns**:

- feature computation implementation;
- dataset building for model training;
- model fit/predict internals;
- backtest execution internals;
- strategy simulation internals;
- recorder-generated artifacts.

## 7. Concrete Capability Mapping

### 7.1 Data Layer

Qlib can help QuantMate with:

- standardized research data access;
- feature computation over OHLCV and derived fields;
- dataset slicing for train/valid/test periods;
- reusable data handlers and processors;
- caching for repeated experiments.

QuantMate should still define its own canonical market-data schema first, then convert to Qlib format as needed.

Reason:

- this preserves engine independence;
- avoids making Qlib's storage conventions the product source of truth;
- allows other engines to coexist later.

### 7.2 Factor Research

Qlib is highly valuable here.

Recommended usage:

- support built-in factor sets such as Alpha158 / Alpha360 as baseline templates;
- allow QuantMate-defined factor sets to compile into Qlib-compatible expressions or handlers;
- store factor definitions in QuantMate metadata tables, not only in Qlib configs.

Recommended product behavior:

- users choose a factor set via QuantMate UI/API;
- QuantMate resolves it into an internal factor spec;
- Qlib adapter maps that factor spec into the actual handler/dataset config.

### 7.3 Model Training

Qlib can support QuantMate's model experimentation with:

- LightGBM-like baseline models;
- time-series/deep learning models where appropriate;
- unified workflow definitions;
- experiment reproducibility.

Recommended product rule:

- QuantMate exposes only a curated model catalog in V1;
- advanced/raw Qlib model configuration stays internal or admin-only.

This reduces configuration sprawl and keeps the product understandable.

### 7.4 Prediction and Signal Generation

Qlib is suitable for:

- generating prediction scores;
- producing ranked signals;
- storing experiment outputs;
- supporting rolling prediction refresh.

QuantMate should transform raw Qlib outputs into a stable signal schema, for example:

- instrument;
- trade_date;
- score;
- rank;
- model_version;
- run_id;
- factor_set_id;
- confidence/diagnostics where available.

### 7.5 Backtesting and Portfolio Research

Qlib is useful for signal-based backtesting, especially for:

- ranking strategies;
- top-k selection strategies;
- benchmark-relative evaluation;
- portfolio risk/return analytics.

Recommended V1 usage:

- support a small set of strategy modes;
- start with `TopkDropoutStrategy` or equivalent ranking-based portfolio construction;
- normalize backtest outputs into QuantMate's own metrics schema.

### 7.6 Rolling and Online Workflows

Qlib provides useful patterns for:

- periodic retraining;
- rolling windows;
- online signal updates.

However, QuantMate should treat this as **Phase 2 or later**, not as the first integration goal.

Reason:

- online/rolling workflows increase operational complexity;
- they require stronger scheduling, observability, and failure recovery;
- MVP value is usually better captured by offline research and backtesting first.

## 8. What QuantMate Should Not Do

QuantMate should avoid the following mistakes:

### 8.1 Do Not Expose Raw Qlib Internals as Public Product API

Avoid leaking:

- Qlib class paths;
- Qlib YAML structure;
- recorder-specific artifact conventions;
- engine-specific naming into frontend contracts.

### 8.2 Do Not Make Qlib the Source of Truth for Product Entities

Do not store product concepts only in Qlib artifacts, such as:

- user-visible strategy definitions;
- project ownership;
- execution history for compliance;
- permission rules;
- lifecycle state of product jobs.

### 8.3 Do Not Start with the Entire Qlib Surface Area

Avoid trying to support in V1:

- every built-in model;
- RL workflows;
- high-frequency nested decision execution;
- broad online serving scenarios;
- every Qlib strategy abstraction.

This would create complexity without corresponding product value.

## 9. Proposed QuantMate Domain Abstractions

To keep the architecture clean, QuantMate should define engine-agnostic abstractions.

Recommended core abstractions:

### 9.1 DatasetSpec

Defines:

- market;
- frequency;
- instrument universe;
- feature fields;
- label source;
- train/valid/test segments;
- adjustment mode;
- benchmark.

### 9.2 FeatureSpec

Defines:

- factor set ID;
- built-in vs custom factors;
- expression-based or computed factors;
- preprocessing steps;
- availability constraints.

### 9.3 LabelSpec

Defines:

- prediction target;
- horizon;
- return calculation logic;
- exclusion rules;
- leakage constraints.

### 9.4 ModelSpec

Defines:

- model family;
- hyperparameters;
- training mode;
- rolling settings;
- reproducibility settings.

### 9.5 PortfolioSpec

Defines:

- ranking/selection logic;
- top-k settings;
- rebalance cadence;
- cost model;
- benchmark;
- optional risk constraints.

### 9.6 BacktestSpec

Defines:

- initial capital;
- fees/slippage;
- calendar;
- benchmark;
- execution assumptions;
- report granularity.

### 9.7 RunArtifact

Defines normalized references to:

- trained model file;
- predictions file;
- metrics report;
- factor diagnostics;
- charts;
- execution logs.

### 9.8 RunMetrics

Defines stable product metrics, such as:

- IC / RankIC;
- annualized return;
- excess return;
- volatility;
- max drawdown;
- Sharpe / Information Ratio;
- turnover;
- cost-adjusted return.

These abstractions let QuantMate support Qlib now and other engines later.

## 10. Phased Implementation Plan

### Phase 1: Minimal Valuable Integration

Objective: prove QuantMate can run a full research loop using Qlib.

Scope:

- market data to Qlib-compatible format conversion;
- one curated factor workflow;
- one curated model workflow;
- one signal ranking strategy;
- one normalized backtest result contract;
- run history and artifact retrieval through QuantMate APIs.

Recommended V1 choices:

- factor set: Alpha158 or one QuantMate-curated baseline set;
- model: LightGBM baseline;
- strategy: Top-k ranking strategy;
- result view: IC, RankIC, annualized return, max drawdown, turnover, excess return after cost.

Acceptance target:

- a user can submit one research run from QuantMate;
- the job executes via Qlib adapter;
- results are queryable from QuantMate APIs;
- frontend can render normalized metrics and basic signal outputs.

### Phase 2: Experiment Platformization

Objective: improve breadth and repeatability.

Scope:

- multiple curated model families;
- parameterized factor sets;
- rolling-window experiments;
- artifact/version comparison;
- better experiment management and reproducibility.

### Phase 3: Scheduled Retraining and Signal Refresh

Objective: move from offline research to recurring signal production.

Scope:

- scheduler integration;
- rolling retrain jobs;
- signal refresh jobs;
- model version promotion rules;
- failure recovery and monitoring;
- run approval workflow if needed.

### Phase 4: Advanced Research Features

Objective: selectively add more advanced capabilities.

Possible scope:

- enhanced indexing;
- richer portfolio optimization;
- model ensembling;
- more sophisticated risk models;
- selective online-serving extensions.

Not recommended until earlier phases are stable:

- RL-based workflows;
- high-frequency execution frameworks;
- broad direct exposure of raw Qlib internals.

## 11. Implementation Approach for QuantMate Repositories

Given the current QuantMate multi-repository setup, recommended responsibility split is:

### 11.1 `quantmate`

Primary responsibilities:

- Qlib adapter implementation;
- task orchestration;
- research run APIs;
- result normalization;
- artifact persistence;
- engine capability registration.

Suggested internal modules:

- `application/services/research_run_service.py`
- `application/services/factor_service.py`
- `application/services/backtest_service.py`
- `infrastructure/qlib/adapter.py`
- `infrastructure/qlib/data_converter.py`
- `infrastructure/qlib/result_mapper.py`
- `infrastructure/qlib/config_builder.py`

### 11.2 `quantmate-docs`

Primary responsibilities:

- architecture decisions;
- API contracts;
- factor/model catalog documentation;
- run lifecycle documentation;
- operational runbooks;
- integration constraints and known limitations.

### 11.3 `quantmate-portal`

Primary responsibilities:

- experiment creation UI;
- run list/detail views;
- factor/model selection interfaces;
- backtest metrics dashboards;
- artifact drill-down views.

## 12. API Direction

QuantMate should expose product-level APIs rather than engine-specific APIs.

Recommended API direction:

- `POST /api/research/runs`
- `GET /api/research/runs`
- `GET /api/research/runs/{run_id}`
- `GET /api/research/runs/{run_id}/signals`
- `GET /api/research/runs/{run_id}/metrics`
- `GET /api/research/catalog/models`
- `GET /api/research/catalog/factor-sets`
- `POST /api/research/data/conversions`

Avoid product-facing endpoint naming like:

- `/api/ai/qlib/*`

Reason:

- it leaks implementation details;
- makes future engine replacement harder;
- turns a backend dependency into a public contract.

If engine-specific admin/debug endpoints are required, keep them internal or admin-only.

## 13. Data and Storage Guidance

Recommended storage split:

1. **QuantMate source-of-truth metadata storage**
   - projects;
   - strategies;
   - runs;
   - artifacts metadata;
   - user ownership;
   - permission bindings;
   - audit events.

2. **Research data storage**
   - canonical cleaned market data;
   - factor inputs;
   - derived labels;
   - benchmark series.

3. **Qlib engine storage**
   - Qlib-compatible data directories;
   - temporary training artifacts;
   - recorder outputs;
   - engine-local cache.

4. **Result persistence**
   - normalized predictions;
   - normalized metrics;
   - normalized backtest outputs;
   - references to raw artifacts.

## 14. Key Risks and Mitigations

### Risk 1: Over-coupling to Qlib's internal model

**Risk**:
QuantMate becomes difficult to evolve if product APIs directly mirror Qlib.

**Mitigation**:
Introduce QuantMate-owned specs and adapter interfaces first.

### Risk 2: Scope explosion from too many supported models/features

**Risk**:
The team spends too much time exposing Qlib breadth instead of delivering product value.

**Mitigation**:
Curate a very small supported surface in V1.

### Risk 3: Data-format lock-in

**Risk**:
Qlib binary/data conventions become the only practical data path.

**Mitigation**:
Keep a QuantMate canonical schema and use one-way conversion into Qlib format.

### Risk 4: Operational instability in rolling/online jobs

**Risk**:
Recurring jobs fail silently or produce stale signals.

**Mitigation**:
Treat rolling and online flows as later-phase capabilities with dedicated monitoring and lifecycle management.

### Risk 5: Product confusion from engine-first UX

**Risk**:
Users see too many technical knobs and unclear research semantics.

**Mitigation**:
Expose curated templates, guided forms, and opinionated defaults.

## 15. Recommended V1 Decision

The recommended V1 decision is:

> Integrate Qlib as the execution engine for one curated QuantMate research workflow, with QuantMate retaining ownership of data contracts, run lifecycle, and user-facing APIs.

V1 should explicitly include:

- one baseline factor pipeline;
- one baseline model family;
- one ranking-based strategy;
- one normalized backtest result contract;
- one frontend flow for creating and reviewing a research run.

V1 should explicitly exclude:

- RL;
- high-frequency execution;
- broad online serving;
- unrestricted raw Qlib configuration exposure;
- engine-specific public API design.

## 16. Final Conclusion

Qlib is a strong accelerator for QuantMate's quant research capabilities.

Used correctly, it can significantly reduce time-to-value for:

- factor experimentation;
- model benchmarking;
- signal backtesting;
- rolling research workflows.

Used incorrectly, it could blur domain boundaries and turn QuantMate into a thin wrapper around a research framework.

Therefore the correct integration strategy is:

- **use Qlib deeply as an engine**;
- **hide Qlib carefully behind QuantMate abstractions**;
- **start with a narrow V1**;
- **expand only after the first closed research loop is stable**.

---

## Appendix A. Suggested Immediate Next Deliverables

1. `Qlib Adapter Technical Design`
   - adapter interface;
   - config builder;
   - result normalization rules;
   - artifact mapping.

2. `Research Run API Spec`
   - create/list/detail/signal/metrics endpoints;
   - request/response schema;
   - run status lifecycle.

3. `V1 Execution Flow`
   - data conversion;
   - training;
   - prediction;
   - backtest;
   - result persistence;
   - frontend presentation mapping.

4. `Catalog Definition`
   - supported factor sets;
   - supported models;
   - supported strategy templates;
   - unsupported features and rationale.
