# Qlib Factor Mining → Multi-Factor Strategy Integration Plan

> **Status**: In-Progress  
> **Created**: 2026-03-25  
> **Owner**: Daniel Shi

## 1. Overview

将 Qlib 的因子计算能力（Alpha158 / Alpha360 + 自定义表达式）接入现有 Factor Lab，实现：

1. **自动化因子计算** — 替换当前 stub，产出真实 IC/ICIR 指标
2. **批量因子挖掘** — 一键计算 Qlib 因子集 + 自动筛选有效因子
3. **因子→策略桥梁** — 在创建策略时选择因子、自动生成多因子策略代码
4. **前端完善** — FactorLab 占位 tab 填充 + 策略创建因子选择器

## 2. Current State

| 组件 | 状态 | 说明 |
|------|------|------|
| Factor CRUD (后端+DB) | ✅ | 完整 API + DAO |
| Qlib 模型训练/预测框架 | ✅ | 8 models, 2 datasets |
| `alpha_factor_values` 等 Qlib 表 | ✅ | 已建 |
| Factor 评估引擎 | ❌ Stub | 返回硬编码 `{ic_mean: 0.035, ic_ir: 0.42}` |
| 自动因子筛选 | ❌ | 不存在 |
| 策略↔因子关联 | ❌ | 零交集，无 FK / API / UI 连接 |
| 前端 ICIR/Combine/Backtest tab | ❌ | 占位符文本 |
| 策略创建因子选择器 | ❌ | 不存在 |

## 3. Phase 1 — 因子计算引擎（替换 Stub）

### 3.1 因子表达式解析器

新建 `quantmate/app/domains/factors/expression_engine.py`

- **Qlib 内置因子集** (Alpha158/Alpha360)：调用 `DataHandlerLP` 计算
- **自定义表达式因子**：安全 pandas eval 解析 `factor_definitions.expression`
- 计算结果写入 `qlib.alpha_factor_values`（自定义因子 `factor_set='custom'`）

### 3.2 替换 Stub 评估

修改 `quantmate/app/domains/factors/service.py` → `run_evaluation()`
- 调用表达式引擎获取因子值序列
- Spearman IC、rolling ICIR、换手率、多空收益
- 参考 `qlib_model_service._calculate_metrics()` 的 IC 实现

### 3.3 异步化

在 `quantmate/app/worker/service/qlib_tasks.py` 新增 `run_factor_evaluation_task()`
- 走 RQ 队列，更新 `factor_evaluations` 状态

## 4. Phase 2 — 自动因子挖掘

### 4.1 批量因子计算 API

扩展 `POST /factors/qlib/compute`：增加 universe + date_range 参数，结果写入 `alpha_factor_values`

### 4.2 因子筛选服务

新建 `quantmate/app/domains/factors/factor_screening.py`
- 批量 IC/ICIR 评估 → 按 ICIR 绝对值排序 → 相关性去重（>0.7 保留高 ICIR）
- 输出有效因子候选列表

### 4.3 DB Schema

新建 migration `019_factor_screening.sql`
- `factor_screening_runs`（user_id, factor_set, universe, date_range, status）
- `factor_screening_results`（screening_run_id, factor_name, ic_mean, ic_ir, is_selected）

### 4.4 一键挖掘任务

`qlib_tasks.py` 新增 `run_factor_mining_task()` = compute + screen

## 5. Phase 3 — 因子→策略桥梁

### 5.1 策略-因子关联表

新建 migration `020_strategy_factor_bridge.sql`
```sql
strategy_factors (
    strategy_id → strategies(id),
    factor_id → factor_definitions(id) NULLABLE,
    factor_source ENUM('custom','alpha158','alpha360'),
    factor_name VARCHAR(100),
    weight DECIMAL(8,4),
    direction ENUM('long','short','neutral')
)
```

### 5.2 多因子策略模板引擎

新建 `quantmate/app/domains/strategies/multi_factor_engine.py`
- 输入：因子列表 + 权重 + 组合方式（equal_weight / ic_weight）
- 输出：可执行 vnpy CtaTemplate Python 代码 + Qlib TopkDropout 配置
- 策略逻辑：每日获取因子值 → 加权打分 → 排名 → 生成信号

### 5.3 API 扩展

`POST /strategies` 增加可选 `factor_ids`, `factor_weights`, `combination_method`
- 提供 factor_ids 时自动调用模板引擎生成 code

### 5.4 Service 扩展

策略创建时写入 `strategy_factors` 关联表，回测时自动解析因子依赖

## 6. Phase 4 — 前端 UI

### 6.1 FactorLab ICIR Tab
- IC 时间序列图（Recharts line chart）
- 因子相关性热力图
- 因子筛选结果排行榜

### 6.2 因子挖掘入口
- "Auto Mining" 按钮触发 `POST /factors/qlib/compute` → 筛选 → 一键导入

### 6.3 策略创建因子选择器
- category = 'multi_factor' 时显示因子搜索/权重调节/组合方式/代码预览

### 6.4 FactorLab Combine Tab
- 多因子组合回测 + 组合后指标展示

## 7. File Inventory

| Path | Action |
|------|--------|
| `quantmate/app/domains/factors/expression_engine.py` | **新建** |
| `quantmate/app/domains/factors/factor_screening.py` | **新建** |
| `quantmate/app/domains/factors/service.py` | 修改：替换 stub |
| `quantmate/app/domains/strategies/multi_factor_engine.py` | **新建** |
| `quantmate/app/domains/strategies/service.py` | 修改：支持因子关联 |
| `quantmate/app/api/routes/factors.py` | 修改：扩展批量计算+筛选 |
| `quantmate/app/api/routes/strategies.py` | 修改：支持 factor_ids |
| `quantmate/app/api/models/strategy.py` | 修改：StrategyCreate 增加因子字段 |
| `quantmate/app/worker/service/qlib_tasks.py` | 修改：新增挖掘/评估任务 |
| `quantmate/mysql/migrations/019_factor_screening.sql` | **新建** |
| `quantmate/mysql/migrations/020_strategy_factor_bridge.sql` | **新建** |
| `quantmate-portal/src/pages/FactorLab.tsx` | 修改：ICIR/Combine/Mining |
| `quantmate-portal/src/components/StrategyForm.tsx` | 修改：因子选择器 |
| `quantmate-portal/src/lib/api.ts` | 修改：扩展 factorAPI |

## 8. Verification Criteria

1. **P1**: 创建因子 `close/delay(close,5)-1`，run evaluation → IC/ICIR 非固定值
2. **P2**: Alpha158 挖掘 → `alpha_factor_values` 有数据，`factor_screening_results` 有排序
3. **P3**: 创建 multi_factor 策略选 3 因子 + 等权 → 生成可执行 CtaTemplate
4. **P4**: 前端 ICIR tab 展示图表，策略创建 multi_factor 模式因子选择器可用

## 9. Key Decisions

- **表达式引擎**: Qlib `ExpressionOps`(标准因子集) + pandas eval(自定义)，不引入新依赖
- **代码生成 vs 配置**: 生成实际 Python 代码，保持与现有 vnpy 回测一致
- **双引擎回测**: 同时生成 vnpy CtaTemplate + Qlib TopkDropout 配置
- **因子存储**: 统一存入 `qlib.alpha_factor_values`，自定义因子 `factor_set='custom'`
- **异步执行**: 所有耗时操作走 RQ 队列，复用现有 worker
- **组合优化**: V1 只做等权 + IC 加权；均值方差优化留 V2
- **Qlib 降级**: 未安装 Qlib 时自定义表达式因子仍可用（纯 pandas）
