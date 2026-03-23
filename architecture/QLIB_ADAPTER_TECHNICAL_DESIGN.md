# Qlib Adapter Technical Design

## 1. Purpose

This document defines the technical design for integrating Microsoft Qlib into QuantMate through a QuantMate-owned adapter layer.

It is the implementation-focused companion to:

- `architecture/QLIB_INTEGRATION_PROPOSAL.md`
- `architecture/DETAILED_ARCHITECTURE.md`
- `requirements/PRODUCT_REQUIREMENTS_V1.md`

This document answers the practical engineering questions:

- what modules need to be built;
- how requests flow through the system;
- how QuantMate maps its own domain model to Qlib execution objects;
- how results are normalized and persisted;
- how to keep Qlib isolated behind stable QuantMate service contracts.

## 2. Design Goals

### 2.1 Primary Goals

1. Integrate Qlib without exposing Qlib internals as QuantMate's public product contract.
2. Support a complete research loop in V1:
   - data conversion;
   - model training;
   - prediction generation;
   - signal backtesting;
   - normalized metrics retrieval.
3. Keep the integration replaceable by introducing a stable adapter interface.
4. Ensure product-layer concerns remain in QuantMate:
   - auth;
   - RBAC;
   - project ownership;
   - audit;
   - run lifecycle;
   - API shape.

### 2.2 Non-Goals

The V1 design does not attempt to implement:

- direct live trading via Qlib;
- broad RL workflow support;
- high-frequency nested execution support;
- unrestricted user-supplied raw Qlib config;
- engine-agnostic support for multiple backends in this phase.

The architecture should allow those later, but this document does not design them fully.

## 3. Requirements Context

Relevant PRD context from `requirements/PRODUCT_REQUIREMENTS_V1.md` includes:

- role-based access control in `3.1.5 角色与权限管理 (RBAC)`;
- user-facing product behavior should remain permission-aware;
- administrative actions must remain under product governance.

Implication:

- Qlib execution must be initiated and accessed through QuantMate service boundaries;
- all Qlib-backed operations must pass QuantMate auth/RBAC checks before any engine invocation;
- raw artifacts and engine logs must not bypass ownership checks.

## 4. High-Level Architecture

The integration is organized into five layers.

### 4.1 Product/API Layer

Responsibilities:

- accept user requests;
- validate auth and RBAC;
- resolve project/workspace ownership;
- expose product-level endpoints;
- return normalized run status and result payloads.

Example endpoints:

- `POST /api/research/runs`
- `GET /api/research/runs/{run_id}`
- `GET /api/research/runs/{run_id}/signals`
- `GET /api/research/runs/{run_id}/metrics`
- `GET /api/research/catalog/models`
- `GET /api/research/catalog/factor-sets`
- `POST /api/research/data/conversions`

### 4.2 Application Service Layer

Responsibilities:

- enforce business rules;
- create and update research runs;
- orchestrate async work submission;
- map product-level DTOs to engine requests;
- coordinate repositories and artifact services.

### 4.3 Adapter Layer

Responsibilities:

- translate QuantMate specs into Qlib configs;
- initialize and invoke Qlib safely;
- isolate Qlib-specific classes and file paths;
- map raw Qlib outputs into normalized QuantMate results.

### 4.4 Qlib Engine Layer

Responsibilities:

- data loading;
- feature handling;
- dataset preparation;
- model fit/predict;
- backtest execution;
- recorder artifact generation.

### 4.5 Persistence Layer

Responsibilities:

- store source-of-truth run metadata;
- persist normalized results;
- register artifact locations;
- track conversion jobs and execution logs.

## 5. Proposed Module Structure

Recommended module layout inside `quantmate`:

```text
quantmate/
  application/
    dto/
      research.py
    services/
      research_run_service.py
      research_catalog_service.py
      research_data_service.py
      backtest_result_service.py
  domain/
    research/
      entities.py
      enums.py
      specs.py
      policies.py
  infrastructure/
    qlib/
      adapter.py
      config_builder.py
      data_converter.py
      dataset_builder.py
      result_mapper.py
      artifact_store.py
      qlib_runtime.py
      registries.py
      validators.py
    repositories/
      research_run_repository.py
      signal_repository.py
      metric_repository.py
      artifact_repository.py
  interfaces/
    api/
      research_routes.py
      research_catalog_routes.py
      research_data_routes.py
  tasks/
    research_tasks.py
    qlib_tasks.py
```

## 6. Core Domain Model

QuantMate should own its own engine-agnostic research model.

### 6.1 ResearchRun

Suggested fields:

- `id`
- `project_id`
- `created_by`
- `engine_type` (`qlib` for V1)
- `status`
- `dataset_spec_json`
- `feature_spec_json`
- `label_spec_json`
- `model_spec_json`
- `portfolio_spec_json`
- `backtest_spec_json`
- `submitted_at`
- `started_at`
- `completed_at`
- `failed_at`
- `failure_code`
- `failure_message`
- `raw_engine_run_ref`
- `artifact_manifest_json`

### 6.2 SignalResult

Suggested fields:

- `id`
- `run_id`
- `trade_date`
- `instrument`
- `score`
- `rank`
- `signal_side` (optional for later)
- `metadata_json`

### 6.3 MetricResult

Suggested fields:

- `id`
- `run_id`
- `metric_group`
- `metric_name`
- `metric_value`
- `metric_unit`
- `scope`
- `as_of_date`
- `metadata_json`

### 6.4 ArtifactRecord

Suggested fields:

- `id`
- `run_id`
- `artifact_type`
- `storage_uri`
- `content_type`
- `size_bytes`
- `checksum`
- `is_raw_engine_artifact`
- `metadata_json`

### 6.5 DataConversionJob

Suggested fields:

- `id`
- `source_name`
- `dataset_scope`
- `date_range_start`
- `date_range_end`
- `status`
- `records_processed`
- `output_uri`
- `started_at`
- `completed_at`
- `failure_message`

## 7. Public Service Contracts

### 7.1 ResearchRunService

Primary responsibilities:

- validate create-run request;
- resolve project access;
- persist a `ResearchRun` in `pending` state;
- submit async task;
- return product-level run response.

Suggested interface:

```python
class ResearchRunService:
    def create_run(self, actor, request) -> ResearchRun: ...
    def get_run(self, actor, run_id) -> ResearchRun: ...
    def list_runs(self, actor, filters) -> list[ResearchRun]: ...
    def cancel_run(self, actor, run_id) -> None: ...
```

### 7.2 ResearchCatalogService

Responsibilities:

- expose curated model catalog;
- expose curated factor set catalog;
- expose supported strategy templates;
- hide raw Qlib implementation details when necessary.

### 7.3 ResearchDataService

Responsibilities:

- trigger data conversion jobs;
- query conversion status;
- validate conversion scope;
- map source datasets into Qlib-ready data paths.

## 8. Adapter Interface Design

The adapter boundary is the most important part of the design.

### 8.1 Engine Adapter Interface

Suggested interface:

```python
class ResearchEngineAdapter(Protocol):
    def validate_specs(self, run_spec: ResearchRunSpec) -> None: ...
    def prepare_data(self, conversion_spec: DataConversionSpec) -> ConversionResult: ...
    def execute_run(self, run_spec: ResearchRunSpec) -> EngineRunResult: ...
    def get_supported_models(self) -> list[ModelCatalogItem]: ...
    def get_supported_factor_sets(self) -> list[FactorSetCatalogItem]: ...
```

### 8.2 QlibAdapter Implementation

Responsibilities:

- validate supported model/factor combinations;
- build Qlib init config;
- build dataset/model/record sections;
- invoke Qlib workflow;
- collect raw recorder outputs;
- normalize predictions and metrics.

Suggested file:

- `infrastructure/qlib/adapter.py`

Suggested shape:

```python
class QlibAdapter(ResearchEngineAdapter):
    def __init__(self, config_builder, runtime, result_mapper, artifact_store):
        ...

    def validate_specs(self, run_spec):
        ...

    def prepare_data(self, conversion_spec):
        ...

    def execute_run(self, run_spec):
        ...

    def get_supported_models(self):
        ...

    def get_supported_factor_sets(self):
        ...
```

## 9. Configuration Builder Design

### 9.1 Responsibility

`config_builder.py` converts QuantMate-owned specs into Qlib executable configuration.

Input:

- `DatasetSpec`
- `FeatureSpec`
- `LabelSpec`
- `ModelSpec`
- `PortfolioSpec`
- `BacktestSpec`

Output:

- Qlib init payload;
- model config;
- dataset config;
- recorder config;
- backtest config.

### 9.2 Rules

The config builder must:

- reject unsupported combinations early;
- apply safe defaults for omitted values;
- avoid direct user injection into raw `module_path` or arbitrary Qlib class strings;
- resolve catalog entries from a curated registry.

### 9.3 Example Registry Approach

```python
MODEL_REGISTRY = {
    "lightgbm": {
        "class": "LGBModel",
        "module_path": "qlib.contrib.model.gbdt",
        "default_kwargs": {...},
    },
}

FACTOR_SET_REGISTRY = {
    "alpha158": {
        "class": "Alpha158",
        "module_path": "qlib.contrib.data.handler",
        "default_kwargs": {...},
    },
}
```

This keeps product-facing config simple while still allowing internal Qlib mapping.

## 10. Qlib Runtime Wrapper

### 10.1 Purpose

`qlib_runtime.py` provides a thin wrapper around:

- environment checks;
- Qlib initialization;
- path resolution;
- recorder context management;
- model execution lifecycle.

### 10.2 Responsibilities

- ensure Qlib is installed and importable;
- initialize provider URI and region;
- isolate working directories by run ID;
- catch and classify engine exceptions;
- return consistent failure codes.

Suggested failure codes:

- `QLIB_NOT_AVAILABLE`
- `INVALID_DATASET_SPEC`
- `UNSUPPORTED_MODEL`
- `DATA_PREPARATION_FAILED`
- `TRAINING_FAILED`
- `PREDICTION_FAILED`
- `BACKTEST_FAILED`
- `ARTIFACT_EXPORT_FAILED`

## 11. Data Conversion Design

### 11.1 Purpose

Qlib should consume a QuantMate-prepared research dataset rather than reading arbitrary product tables directly.

`data_converter.py` is responsible for converting canonical market data into Qlib-compatible format.

### 11.2 Inputs

Recommended source input shape:

- `instrument`
- `trade_date`
- `open`
- `high`
- `low`
- `close`
- `volume`
- `factor`
- optional custom fields used for factor generation

### 11.3 Output

- Qlib-compatible instrument naming;
- Qlib-compatible data directories;
- conversion manifest;
- health-check result summary.

### 11.4 Conversion Steps

1. Resolve data source and scope.
2. Pull canonical OHLCV + required extra fields.
3. Normalize instrument format.
4. Validate required fields and missing data thresholds.
5. Serialize to Qlib-compatible storage.
6. Write conversion manifest.
7. Persist `DataConversionJob` result.

### 11.5 Instrument Mapping

Example mapping rule:

- `000001.SZ` -> `SZ000001`
- `600000.SH` -> `SH600000`

This logic must be centralized in one utility and reused consistently.

## 12. Execution Flow Design

### 12.1 Create Research Run Flow

1. Client calls `POST /api/research/runs`.
2. API layer authenticates actor.
3. RBAC checks permission to create research runs.
4. `ResearchRunService.create_run()` validates request.
5. Service persists `ResearchRun(status="pending")`.
6. Service enqueues async task with `run_id`.
7. Task worker loads run spec and invokes `QlibAdapter.execute_run()`.
8. Adapter validates specs and prepares runtime config.
9. Qlib runtime executes training, prediction, and backtest.
10. Raw outputs are mapped by `result_mapper.py`.
11. Normalized signals, metrics, and artifact refs are persisted.
12. Run status updates to `completed` or `failed`.

### 12.2 Query Run Detail Flow

1. Client calls `GET /api/research/runs/{run_id}`.
2. API layer authenticates actor.
3. Ownership/RBAC check runs.
4. Service loads normalized run metadata and summary metrics.
5. Response returns product-level DTO only.

### 12.3 Query Signals Flow

1. Client calls `GET /api/research/runs/{run_id}/signals`.
2. Auth and ownership check.
3. Service loads normalized signal rows.
4. Service supports pagination and filters:
   - `trade_date`
   - `top_n`
   - `sort`
5. Product-level response is returned.

## 13. Result Mapping Design

### 13.1 Purpose

`result_mapper.py` converts raw Qlib artifacts into normalized QuantMate records.

### 13.2 Inputs

Potential Qlib outputs include:

- prediction scores;
- recorder metrics;
- backtest reports;
- portfolio analysis outputs;
- serialized model artifacts;
- plots and diagnostic files.

### 13.3 Output Mapping

#### Predictions -> SignalResult

Map:

- datetime -> `trade_date`
- instrument -> `instrument`
- score -> `score`
- ordering -> `rank`

#### Backtest Metrics -> MetricResult

Map examples:

- `annualized_return`
- `information_ratio`
- `max_drawdown`
- `turnover`
- `excess_return_without_cost`
- `excess_return_with_cost`
- `ic_mean`
- `rank_ic_mean`

#### Artifacts -> ArtifactRecord

Map examples:

- trained model pickle;
- prediction parquet/csv;
- backtest summary JSON;
- chart images;
- raw recorder directory tarball if needed.

## 14. Artifact Storage Design

### 14.1 Principles

- raw engine outputs should be retained for debugging;
- normalized artifacts should be separately registered;
- storage paths must be deterministic by `run_id`;
- product access should happen via metadata lookup, not guessed filesystem paths.

### 14.2 Suggested Storage Layout

```text
artifacts/
  research_runs/
    {run_id}/
      raw/
      normalized/
      logs/
      manifest.json
```

### 14.3 Manifest Contents

Suggested manifest fields:

- `run_id`
- `engine_type`
- `created_at`
- `raw_artifacts`
- `normalized_artifacts`
- `checksums`
- `metadata`

## 15. Async Task Design

### 15.1 Tasks

Suggested tasks:

- `enqueue_data_conversion(job_id)`
- `execute_data_conversion(job_id)`
- `enqueue_research_run(run_id)`
- `execute_research_run(run_id)`
- `collect_run_artifacts(run_id)`

### 15.2 Task State Model

Suggested run states:

- `pending`
- `queued`
- `running`
- `mapping_results`
- `completed`
- `failed`
- `cancelled`

### 15.3 Retry Rules

Retry only for clearly transient failures, such as:

- temporary data source outage;
- storage write error;
- worker interruption.

Do not auto-retry blindly for:

- invalid user config;
- unsupported model selection;
- data schema mismatch;
- deterministic engine exceptions caused by bad input.

## 16. Validation Rules

### 16.1 Request Validation

At API/application level validate:

- actor has permission;
- selected project exists and is accessible;
- model key is in supported catalog;
- factor set key is in supported catalog;
- dataset date ranges are valid;
- backtest date range does not exceed available data bounds;
- chosen strategy template is allowed for the selected model.

### 16.2 Adapter Validation

At adapter layer validate:

- model + factor set compatibility;
- dataset and label compatibility;
- required market fields exist;
- provider URI is available;
- output paths are writable.

## 17. Security and RBAC Considerations

This integration must follow QuantMate's RBAC policy, especially the PRD requirement in `3.1.5`.

### 17.1 Required Permission Points

Suggested permission keys:

- `research.run.create`
- `research.run.read`
- `research.run.cancel`
- `research.signal.read`
- `research.metric.read`
- `research.data.convert`
- `research.catalog.read`
- `research.admin.debug`

### 17.2 Access Rules

- only authorized users can create runs;
- only owners or admins can view raw artifacts;
- only privileged roles can trigger data conversion;
- engine debug details should be hidden from read-only roles by default.

### 17.3 Safe Configuration Exposure

Never allow untrusted clients to submit:

- arbitrary Python module paths;
- raw Qlib class names;
- filesystem paths;
- unrestricted recorder config;
- arbitrary execution scripts.

## 18. Observability and Audit Design

### 18.1 Structured Logging

Each run should emit structured logs with:

- `run_id`
- `project_id`
- `actor_id`
- `engine_type`
- `stage`
- `status`
- `elapsed_ms`
- `error_code`

### 18.2 Audit Events

Suggested audit events:

- `research_run_created`
- `research_run_started`
- `research_run_completed`
- `research_run_failed`
- `research_run_cancelled`
- `research_data_conversion_requested`
- `research_data_conversion_completed`

### 18.3 Metrics

Suggested operational metrics:

- run queue wait time;
- run execution duration;
- conversion duration;
- artifact export duration;
- failure rate by model/factor set;
- prediction row counts per run.

## 19. V1 Supported Catalog

Recommended V1 support surface:

### 19.1 Models

- `lightgbm`

Optional later additions:

- `linear`
- `lstm`
- `gru`
- `transformer`

### 19.2 Factor Sets

- `alpha158`

Optional later additions:

- `alpha360`
- selected QuantMate custom factor bundles

### 19.3 Strategy Templates

- `topk_daily_rebalance`

Optional later additions:

- benchmark-aware weighted strategy;
- enhanced indexing templates.

## 20. Example DTOs

### 20.1 Create Run Request

```json
{
  "projectId": "proj_123",
  "dataset": {
    "market": "cn",
    "universe": "csi300",
    "trainStart": "2018-01-01",
    "trainEnd": "2021-12-31",
    "validStart": "2022-01-01",
    "validEnd": "2022-12-31",
    "testStart": "2023-01-01",
    "testEnd": "2023-12-31"
  },
  "feature": {
    "factorSet": "alpha158"
  },
  "label": {
    "name": "next_5d_return"
  },
  "model": {
    "modelKey": "lightgbm"
  },
  "portfolio": {
    "strategyTemplate": "topk_daily_rebalance",
    "topk": 50,
    "drop": 5
  },
  "backtest": {
    "benchmark": "SH000300",
    "account": 100000000
  }
}
```

### 20.2 Run Detail Response

```json
{
  "runId": "run_123",
  "projectId": "proj_123",
  "engineType": "qlib",
  "status": "completed",
  "model": {
    "modelKey": "lightgbm"
  },
  "feature": {
    "factorSet": "alpha158"
  },
  "summaryMetrics": {
    "annualizedReturn": 0.12,
    "maxDrawdown": -0.08,
    "informationRatio": 1.10,
    "icMean": 0.03
  },
  "createdAt": "2026-03-23T14:00:00Z",
  "completedAt": "2026-03-23T14:12:00Z"
}
```

## 21. Suggested Implementation Sequence

### Step 1

Build domain specs and repositories:

- `ResearchRun`
- `SignalResult`
- `MetricResult`
- `ArtifactRecord`
- `DataConversionJob`

### Step 2

Build catalog registry and validation layer:

- model registry;
- factor set registry;
- strategy template registry;
- request validator.

### Step 3

Build Qlib runtime and config builder:

- import/init wrapper;
- provider URI resolution;
- config translation;
- failure classification.

### Step 4

Build data conversion path:

- canonical data extract;
- instrument normalization;
- Qlib format serialization;
- conversion manifest.

### Step 5

Build run execution path:

- async task;
- training;
- prediction;
- backtest;
- result mapping.

### Step 6

Expose product-level APIs and add RBAC.

### Step 7

Add observability, audit events, and admin debugging tools.

## 22. Open Questions

These should be resolved before implementation begins:

1. What is QuantMate's canonical source for research-grade market data in V1?
2. Will Qlib-ready data be stored on local filesystem only, or also registered in object storage?
3. What async task framework is the current backend using for long-running jobs?
4. Which user roles in the PRD are allowed to create research runs in V1?
5. Should raw engine artifacts be user-visible, admin-only, or hidden entirely by default?
6. What is the exact benchmark catalog for the first supported market?
7. Does the current backend already have a run/artifact table family that should be extended instead of creating new ones?

## 23. Final Recommendation

Implement Qlib integration behind a dedicated QuantMate adapter layer with:

- QuantMate-owned specs;
- curated model/factor catalogs;
- async run execution;
- normalized signal and metric persistence;
- RBAC-protected product APIs.

The design should remain opinionated and narrow in V1. That is the fastest path to a stable closed-loop research feature without turning QuantMate into a thin wrapper around Qlib internals.
