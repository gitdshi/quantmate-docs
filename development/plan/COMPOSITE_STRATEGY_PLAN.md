# 量化策略分层组合架构设计

> **Status**: Draft  
> **Created**: 2026-03-26  
> **Author**: QuantMate Team

---

## 1. 概述

将量化策略从当前的「扁平分类」（CTA/Alpha/Grid/StatArb/AI/Custom）重构为 **选股策略 → 交易策略 → 风控策略** 三层组合架构，支持平台级编排组合。在 vnpy 之上构建 Orchestrator 编排层，vnpy 负责底层执行和交易网关。同时引入 Portfolio 管理层统一多品种资产配置。因子挖掘（FactorLab）作为选股策略的输入源，实现从因子→选股→交易→风控→Portfolio 的完整闭环。

---

## 2. 当前分类 vs 新分层映射

### 2.1 问题

当前 6 类策略（CTA、Alpha、Grid、StatArb、AI、Custom）是 **策略风格** 维度的分类，不是同一层面的概念：
- CTA 和 Grid 是**交易方式**
- Alpha 是**选股方法**
- StatArb 跨越选股+交易两层
- AI/ML 可用于任何层

这导致分类不正交、用户难以组合、回测链路不完整。

### 2.2 映射关系

| 当前分类 | 本质角色 | 新分层归属 |
|---------|---------|-----------|
| **CTA** (趋势跟踪) | 交易信号生成 | **交易策略层** — 趋势跟踪子类 |
| **Alpha** (多因子) | 选股 + 权重分配 | **选股策略层** — 因子选股子类 |
| **Grid** (网格交易) | 交易执行方式 | **交易策略层** — 区间交易子类 |
| **StatArb** (统计套利) | 跨层策略 | 选股层(配对筛选) + 交易层(价差交易) |
| **AI/ML** | 可用于任何层 | 选股(预测排名) / 交易(信号) / 风控(异常检测) |
| **Custom** | 自定义 | 保持为「整体策略」模式(不强制分层) |

---

## 3. 三层 + Portfolio 架构

```
┌──────────────────────────────────────────────────────────┐
│                 CompositeStrategy (组合策略)               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  选股策略层    │→│  交易策略层    │→│   风控策略层    │  │
│  │  (Universe)   │  │  (Trading)   │  │   (Risk)       │  │
│  │ 输出: 标的池   │  │ 输出: 交易信号 │  │ 输出: 最终订单  │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           Portfolio 管理层 (全局资产配置)               │ │
│  │     仓位分配 | 风险预算 | 再平衡 | 绩效归因             │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 3.1 选股策略层 (UniverseStrategy)

**职责**: 从全市场中筛选出交易标的池  
**输入**: 全市场股票/期货列表 + 行情数据 + 基本面数据  
**输出**: `List[Symbol]` — 当期标的池

| 子类型 | 说明 | FactorLab 集成 |
|--------|-----|--------------|
| 因子选股 | 多因子打分排名 (PE/ROE/动量等) | ✅ 直接使用 FactorLab 因子 |
| 技术面选股 | 突破/形态/量价筛选 | ✅ 技术因子表达式 |
| 事件驱动 | 财报超预期/股东增持/龙虎榜 | 事件因子 |
| AI/ML 选股 | Qlib 模型预测排名 | ✅ Alpha158/360 因子集 |
| 指数成分股 | 从沪深300/中证500等成分中选 | 行业/板块因子 |
| 配对选股 | 统计套利中的协整配对筛选 | 协整/相关性因子 |

### 3.2 交易策略层 (TradingStrategy)

**职责**: 对选股层输出的标的生成交易信号  
**输入**: `List[Symbol]` + 行情数据 + 持仓状态  
**输出**: `List[Signal(symbol, direction, strength)]`

| 子类型 | 说明 | 现有实现 |
|--------|------|---------|
| 趋势跟踪 | MA/MACD/Turtle 等 | ✅ MACD/TripleMA/Turtle |
| 均值回复 | 布林带/RSI 超卖超买 | ❌ 待实现 |
| 区间交易(网格) | 固定/动态网格 | ❌ 待实现 |
| 价差交易 | 配对标的价差交易 | ❌ 待实现 |
| 动量/反转 | 短期反转/中期动量 | 可通过因子引擎 |
| AI 信号 | ML 模型输出方向/强度 | 部分 (Qlib) |

### 3.3 风控策略层 (RiskStrategy)

**职责**: 对交易信号进行风险过滤和仓位约束  
**输入**: `List[Signal]` + 持仓 + 账户状态  
**输出**: `List[Order(symbol, direction, quantity, price)]` — 最终订单

| 子类型 | 说明 | 现有实现 |
|--------|------|---------|
| 止损止盈 | 固定/追踪/ATR 止损 | ✅ StopLossManager |
| 仓位管理 | 固定金额/Kelly/等风险/风险平价 | ✅ PositionSizingService |
| 风险限制 | 最大回撤/最大敞口/行业集中度 | 部分 (max_position_pct) |
| VaR 约束 | 组合 VaR 不超过阈值 | ✅ RiskAnalysisService |
| 市场规则 | T+1/涨跌停/整手约束 | 部分 (MatchingEngine) |

### 3.4 Portfolio 管理层

> **设计原则**: Portfolio 层拆分为 **Allocator (决策)** 和 **PortfolioLedger (账本)** 两个职责，避免一个对象同时承担"资金分配决策"和"持仓/交易/快照记录"。

#### 3.4.1 Strategy Allocator (策略配置器)

**职责**: 多策略的目标权重计算与资金分配决策  
**输入**: 多个组合策略的风险/收益特征 + 账户总资产  
**输出**: 各策略/品种的目标权重 `Dict[strategy_id, target_weight]`

| 能力 | 说明 | 现有实现 |
|------|------|---------|
| 权重分配 | 等权/市值加权/风险平价 | ✅ PositionSizingService (部分) |
| 风险预算 | 总 VaR/CVaR 预算分配到子策略 | ✅ RiskAnalysisService (部分) |
| 再平衡触发 | 定期/偏离阈值触发 | ❌ 待实现 |

#### 3.4.2 Portfolio Ledger (组合账本)

**职责**: 账户、持仓、交易流水、净值快照的真实记录  
**输入**: Allocator 的目标权重 + Executor 的成交回报  
**输出**: 持仓快照、净值曲线、交易记录

| 能力 | 说明 | 现有实现 |
|------|------|---------|
| 持仓追踪 | 多策略持仓合并/独立视图 | 部分 (单策略持仓) |
| 净值计算 | 基于真实行情的 NAV 计算 | ⚠️ 当前 paper trading 中 current_price=avg_cost, pnl=0 |
| 绩效归因 | Brinson 分解/因子归因 | ✅ AttributionService |
| 交易流水 | 完整成交记录 | ✅ trade_records 表 |

> **⚠️ 前置依赖**: Portfolio Ledger 的数据可信度依赖于 paper_trading_service 的真实行情接入。当前 `current_price = avg_cost, pnl = 0` 的简化实现必须先升级，否则 Portfolio 语义不可信。

### 3.5 执行策略 (Phase 2+)

| 类型 | 说明 |
|------|------|
| TWAP | 时间加权平均价格拆单 |
| VWAP | 成交量加权平均价格拆单 |
| 冰山单 | 分批隐藏大单 |
| 智能路由 | 最优执行路径 |

---

## 4. vnpy 集成方案

### 4.1 vnpy PortfolioStrategy 的局限

- 仅支持期货类 (T+0 双向)，对 A 股 T+1 支持弱
- 信号聚合逻辑需自己在策略代码中实现
- 没有内置的选股→交易→风控分层
- 不支持动态标的池

### 4.2 推荐方案: 混合架构

```
自建 Orchestrator (日频/事件驱动)
├── UniverseEngine (自建, 调用 FactorLab / expression_engine)
├── TradingEngine (双适配器)
│   ├── VnpyTradingAdapter (包装现有 CtaTemplate 策略)
│   └── NativeTradingAdapter (纯 Python 信号生成)
├── RiskEngine (自建, 复用 StopLossManager / PositionSizing / RiskAnalysis)
└── Executor
    ├── 回测模式: 自建 CompositeBacktestEngine (日K)
    ├── 模拟模式: PaperStrategyExecutor (已有)
    └── 实盘模式: vnpy Gateway (CTP 期货 / XTP 股票)
```

- vnpy 的 `CtaTemplate` 保留作为交易策略层的一种执行引擎
- vnpy 的 `BacktestingEngine` 用于单品种 CTA 回测
- vnpy 的 Gateway (CTP/XTP) 用于实盘下单
- 组合编排和回测在 Orchestrator 层自建

---

## 5. 组合策略回测

### 5.1 CompositeBacktestEngine

当前 vnpy 的 `BacktestingEngine` 是单品种逐 Bar 回测，不适合多品种选股类策略。自建日频组合回测引擎：

```python
# 伪代码
class CompositeBacktestEngine:
    def run(self, composite_strategy, date_range, initial_capital, benchmark):
        portfolio = Portfolio(initial_capital)
        constraints = MarketConstraints(composite_strategy.market_constraints)
        # constraints 包含: t_plus_n, lot_size, price_limit_pct, suspension_calendar
        
        for trading_day in date_range:
            # 0. 市场约束: 更新停牌/涨跌停/复权状态
            tradable = constraints.get_tradable_symbols(trading_day)
            
            # 1. 选股 (过滤不可交易标的)
            universe = self.universe_engine.select(trading_day, market_data)
            universe = [s for s in universe if s in tradable]
            
            # 2. 生成信号
            signals = []
            for symbol in universe:
                signal = self.trading_engine.on_bar(symbol, bars[symbol])
                signals.append(signal)
            
            # 3. 风控过滤 + 仓位分配
            orders = self.risk_engine.filter_and_size(signals, portfolio)
            
            # 4. T+1 约束: 过滤当日买入的卖出信号
            orders = constraints.apply_t_plus_n(orders, portfolio.position_history)
            
            # 5. 涨跌停约束: 移除触及涨跌停的订单
            orders = constraints.apply_price_limits(orders, close_prices[trading_day])
            
            # 6. 整手约束: 调整为 100 股整数倍
            orders = constraints.apply_lot_size(orders)
            
            # 7. 模拟成交 (使用调仓价, 非收盘价; 计入冲击成本)
            fill_prices = self._get_fill_prices(
                orders, trading_day,
                slippage_bps=constraints.slippage_bps,
                commission_rate=constraints.commission_rate
            )
            trades = self.execute_orders(orders, fill_prices)
            
            # 8. 更新组合净值 (使用复权后收盘价)
            adj_prices = market_data.get_adj_close(trading_day)
            portfolio.update(trades, adj_prices)
            
            # 9. 再平衡检查
            portfolio.check_rebalance()
        
        return BacktestResult(
            equity_curve=portfolio.equity_curve,
            position_history=portfolio.position_history,
            trade_log=portfolio.trade_log,
            metrics=compute_metrics(portfolio),
            attribution=compute_attribution(portfolio)
        )
```

> **市场约束 (market_constraints) 在引擎中的生效点**:
> | 约束 | 生效步骤 | 说明 |
> |------|---------|------|
> | 停牌 | Step 0 + Step 1 | 从选股结果中排除停牌标的 |
> | T+1 | Step 4 | 阻止当日买入标的的卖出信号 |
> | 涨跌停 | Step 5 | 触及涨跌停价格的订单不成交 |
> | 整手约束 | Step 6 | A 股 100 股整数倍 |
> | 复权 | Step 8 | 净值计算使用后复权价格 |
> | 冲击成本 | Step 7 | 按成交额/流动性计算滑点 |
> | 佣金 | Step 7 | 按固定费率 + 印花税 |

### 5.2 回测类型对比

| 回测类型 | 引擎 | 适用场景 |
|---------|------|---------|
| 单品种 CTA 回测 | vnpy BacktestingEngine | 单个交易策略评估 |
| 批量 CTA 回测 | vnpy × N 个 symbol | 交易策略多品种审计 |
| **组合策略回测** | **自建 CompositeBacktestEngine** | **选股+交易+风控完整链路** |
| 因子回测 (IC/ICIR) | FactorLab evaluation | 因子有效性验证 |
| 参数优化 | 遗传算法 (已有) | 可扩展到组合策略参数 |

### 5.3 回测结果

```
输出:
├── 净值曲线 (equity_curve) — 组合净值 vs 基准
├── 持仓变化 (position_history) — 每日持仓明细
├── 交易记录 (trade_log) — 所有买卖订单
├── 绩效指标
│   ├── 总收益率 / 年化收益率
│   ├── 最大回撤 / 夏普比率
│   ├── Alpha / Beta
│   ├── 胜率 / 盈亏比
│   └── 换手率
└── 归因分析
    ├── 选股贡献 (选对了哪些股？)
    ├── 交易贡献 (择时做对了多少？)
    └── 风控贡献 (止损避免了多少损失？)
```

---

## 6. 因子挖掘与策略类型的关系

### 6.1 因子 → 各层策略

```
FactorLab (因子挖掘)
├── 估值/质量因子 → 选股策略: 因子排名选股
├── Alpha158/360 → 选股策略: Qlib 模型选股
├── 技术/动量因子 → 交易策略: 信号因子(动量因子→趋势信号)
├── 波动率因子 → 风控策略: 风险因子(波动率→仓位调整)
└── 因子组合 → multi_factor_engine → 组合策略
```

### 6.2 因子在各层的应用

| 因子类型 | 选股层 | 交易层 | 风控层 |
|---------|---------|---------|---------|
| 估值因子 (PE/PB) | ✅ 选低估值 | — | — |
| 动量因子 | ✅ 选强动量 | ✅ 趋势信号 | — |
| 波动率因子 | — | — | ✅ 低波加仓 |
| 流动性因子 | ✅ 排除低流动性 | — | ✅ 流动性约束 |
| 相关性因子 | ✅ 配对选股 | ✅ 价差信号 | ✅ 分散度约束 |
| Qlib 预测因子 | ✅ 预测排名 | ✅ 方向预测 | — |

### 6.3 FactorLab 增强

当前 `multi_factor_engine.py` 只能生成 CTA 代码，需升级为：
1. 因子打标（适用层: universe / trading / risk）
2. 自动生成选股策略代码
3. 支持生成完整组合策略（三层均可基于因子驱动）

---

## 7. 数据模型

### 7.1 新增表

```sql
-- 策略组件表 (分层策略组件)
CREATE TABLE strategy_components (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  name            VARCHAR(100) NOT NULL,
  layer           ENUM('universe', 'trading', 'risk') NOT NULL,
  sub_type        VARCHAR(50) NOT NULL COMMENT '子类型: factor/technical/trend/grid/stop_loss/...',
  description     TEXT,
  -- 组件定义: code 或 config 二选一
  code            MEDIUMTEXT DEFAULT NULL COMMENT '可执行 Python 源码 (主要用于 trading 层)',
  config          JSON DEFAULT NULL COMMENT '声明式配置 (factor DSL / 规则参数 / 筛选条件)',
  parameters      JSON DEFAULT NULL,
  version         INT DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_layer (user_id, layer),
  INDEX idx_sub_type (sub_type)
);
-- 设计说明:
-- - Universe 组件更适合声明式 config (因子表达式 / 筛选 DSL / Qlib 模型引用)
-- - Trading 组件通常需要 code (可执行策略逻辑)
-- - Risk 组件更适合 config (规则参数: 止损比例/最大仓位/VaR 阈值)
-- - 同时保留 code + config 字段，按 sub_type 语义决定用哪个

-- 组合策略表
CREATE TABLE composite_strategies (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  name              VARCHAR(100) NOT NULL,
  description       TEXT,
  portfolio_config  JSON COMMENT '权重分配/再平衡配置',
  market_constraints JSON COMMENT 'T+1/涨跌停等市场约束',
  execution_mode    ENUM('backtest', 'paper', 'live') DEFAULT 'backtest',
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
);

-- 组合-组件绑定表 (支持每层多个组件)
CREATE TABLE composite_component_bindings (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  composite_strategy_id INT NOT NULL,
  component_id          INT NOT NULL,
  layer                 ENUM('universe', 'trading', 'risk') NOT NULL,
  ordinal               INT DEFAULT 0 COMMENT '同层内排序 (多组件时用于优先级/投票权重)',
  weight                DECIMAL(5,4) DEFAULT 1.0 COMMENT '同层多组件时的权重 (投票/合并)',
  config_override       JSON DEFAULT NULL COMMENT '组合级参数覆盖',
  FOREIGN KEY (composite_strategy_id) REFERENCES composite_strategies(id) ON DELETE CASCADE,
  FOREIGN KEY (component_id) REFERENCES strategy_components(id),
  INDEX idx_composite_layer (composite_strategy_id, layer)
);
-- 设计说明:
-- - 用 binding 表而非 3 个 FK 列，支持: 双选股来源合并、多交易子策略投票、多重风控规则链
-- - weight 用于同层多组件的信号合并 (如 2 个交易策略各占 50% 投票权)
-- - ordinal 用于风控层的规则链顺序 (止损→仓位→VaR 依次过滤)

-- 组合策略回测结果表
CREATE TABLE composite_backtests (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  job_id              VARCHAR(64) NOT NULL UNIQUE,
  user_id             INT NOT NULL,
  composite_strategy_id INT NOT NULL,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  initial_capital     DECIMAL(15,2) DEFAULT 1000000,
  benchmark           VARCHAR(30) DEFAULT '000300.SH',
  status              ENUM('queued','running','completed','failed') DEFAULT 'queued',
  result              JSON COMMENT '绩效指标+净值曲线+交易记录',
  attribution         JSON COMMENT '归因分析结果',
  error_message       TEXT,
  started_at          TIMESTAMP NULL,
  completed_at        TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_composite (composite_strategy_id),
  INDEX idx_status (status)
);
```

### 7.2 兼容性

- 现有 `strategies` 表不变 — 仍支持「整体策略」（legacy CTA 模式）
- 现有 CTA 策略可被引用为 trading 层组件 (通过 `composite_component_bindings` 绑定)
- 前端同时支持旧模式和新组合模式

> **⚠️ 双模型复杂度**: 旧策略 (strategy_id) 和组合策略 (composite_strategy_id) 并存会导致以下 UI/API 分叉:
> - 部署: 旧策略走 `/strategies/{id}/deploy` → paper_trading_service; 组合策略走 `/composite-strategies/{id}/deploy` → Orchestrator
> - 回测: 旧策略走 vnpy BacktestingEngine; 组合策略走 CompositeBacktestEngine
> - Dashboard/Portfolio 页面需同时展示两种策略的状态卡片
> - 模板市场需区分"单体策略模板"和"组合策略模板"
>
> **缓解策略**: Step 1 先不引入部署分叉，组合策略初期只支持 backtest 模式。等模型稳定后再对接 paper/live。

---

## 8. 当前代码现状评估

> 文档目标架构和代码现实之间存在明显落差，列举如下以确保实现计划充分考虑迁移成本。

### 8.1 后端

| 模块 | 当前状态 | 差距 |
|------|---------|------|
| **策略模型** (`api/models/strategy.py`) | 单体: name/class_name/code/parameters，无 layer/sub_type | 需引入第二套策略对象体系 |
| **策略服务** (`domains/strategies/service.py`) | 围绕单表 CRUD + 版本历史 | 需扩展组件 CRUD + 组合 CRUD |
| **Paper Trading** (`domains/trading/paper_trading_service.py`) | `current_price = avg_cost, pnl = 0` | Portfolio 语义不可信，需先接真实行情 |
| **Portfolio API** (`api/routes/portfolio.py`) | 仅 `/positions` GET + `/close` POST | 远非"资产配置中枢" |
| **MatchingEngine** | 简化撮合，不含 T+1/涨跌停完整约束 | 组合回测需加强市场规则 |

### 8.2 前端

| 模块 | 当前状态 | 差距 |
|------|---------|------|
| **Strategies.tsx** | category 仍为 `cta \| alpha \| statArb \| grid \| ai \| custom` | 需引入 layer/sub_type 二维分类 |
| **类型定义** (`types/index.ts`) | 无 StrategyComponent / CompositeStrategy 类型 | 需新增 |
| **导航** | 已有 Composite Strategies 入口 (原型) | 需在 portal 实现 |

### 8.3 关键前置条件

1. **paper_trading_service 真实行情接入** — Portfolio Ledger 可信度前置
2. **MatchingEngine 市场约束补全** — 组合回测准确性前置
3. **策略模板市场的双模型兼容设计** — 避免用户困惑

---

## 9. 实现步骤 (收敛后)

> 原 Phase 1~5 跨度过大 (从 strategy_components 到 Portfolio 引擎到 FactorLab 闭环)，容易把策略模型、回测、执行、前端导航、数据库迁移全部耦合在一起。以下收敛为 3 个更小的步骤，每步可独立交付和验证。

### Step 1: 策略元模型升级 (最小改动，不破坏现有流程)

**目标**: 给现有策略和新组件建立分层语义，但不改变现有 CRUD/部署/回测流程。

1. DB Migration: 新增 `strategy_components` 表 + `composite_strategies` 表 + `composite_component_bindings` 表
2. 后端: `StrategyComponent` Pydantic model + `CompositeStrategy` model
3. Service + DAO: `StrategyComponentService` CRUD, `CompositeStrategyService` CRUD
4. API: `/api/v1/strategy-components` CRUD, `/api/v1/composite-strategies` CRUD (仅定义，不含执行)
5. 前端: Composite Strategies 页面 (组件列表 + 组合定义)
6. **不做**: 不改现有 strategies 表/接口/页面，不做部署/执行

**验收**: 用户可创建 Universe/Trading/Risk 组件，组合成 CompositeStrategy，保存到数据库。但此时组合策略只是"定义"，不可运行。

### Step 2: 组合策略回测 (验证组合心智 + 回测结果结构)

**目标**: CompositeStrategy 可提交回测，验证三层编排的端到端链路。

7. `CompositeBacktestEngine` (日频回测 + 市场约束)
8. `CompositeStrategyOrchestrator` (编排 Universe→Trading→Risk 链路)
9. DB Migration: 新增 `composite_backtests` 表
10. RQ Worker 集成: composite backtest queue
11. 前端: 组合回测结果页 (净值曲线 + 三层归因分析)
12. **不做**: 不做 paper/live 部署，不做 Portfolio 多策略管理

**验收**: 用户创建 "因子选股 + MACD 交易 + 止损风控" 组合 → 提交回测 → 查看净值曲线 + 归因分析。

### Step 3: 组合 Portfolio + Paper/Live 部署

**前置**: paper_trading_service 已接入真实行情 (`current_price` 和 `pnl` 可信)

13. Strategy Allocator: 多组合策略权重分配
14. Portfolio Ledger: 持仓追踪 + 净值快照
15. Orchestrator 对接 PaperStrategyExecutor (paper 模式)
16. Orchestrator 对接 vnpy Gateway (live 模式)
17. 前端: Portfolio 仪表盘增强 (多策略持仓/权重/净值)

**验收**: 组合策略可部署到 paper trading，Portfolio 页展示多策略的真实持仓和 PnL。

### 后续: 因子→组合策略闭环 (依赖 Step 2+3)

18. FactorLab 增强: 因子打标 (适用层)
19. 自动选股策略生成
20. `multi_factor_engine` 升级 (支持组合策略)
21. 端到端向导: 因子→选股→交易→风控一键组合

> **产品交互建议**: Step 1-2 的前端优先用"模板向导"模式 (选股模板→交易模板→风控模板→资金配置→回测)，而非一上来就做三栏实时编排器。等模型稳定后再补充高级编排器。

---

## 10. 关键文件

### 需修改
- `quantmate/app/domains/strategies/service.py` — 扩展组件化
- `quantmate/app/domains/strategies/multi_factor_engine.py` — 升级支持组合策略
- `quantmate/app/api/models/strategy.py` — 新增分层模型
- `quantmate/app/api/routes/strategies.py` — 新增 API
- `quantmate-portal/src/pages/Strategies.tsx` — UI 重构
- `quantmate-portal/src/types/index.ts` — 类型定义

### 需新建
- `quantmate/mysql/migrations/0XX_create_composite_strategy_tables.sql`
- `quantmate/app/domains/composite/`
  - `orchestrator.py` — 编排引擎
  - `universe_engine.py` — 选股引擎
  - `trading_engine.py` — 交易信号引擎
  - `risk_engine.py` — 风控引擎
  - `composite_backtest_engine.py` — 组合回测引擎
  - `service.py` — 组合策略 Service
  - `dao/composite_strategy_dao.py` — DAO

### 可复用
- `quantmate/app/domains/factors/expression_engine.py` — 因子计算 (选股层)
- `quantmate/app/domains/factors/factor_screening.py` — 因子筛选 (选股层)
- `quantmate/app/domains/portfolio/position_sizing_service.py` — 仓位管理 (风控层)
- `quantmate/app/domains/portfolio/risk_analysis_service.py` — VaR 计算 (风控层)
- `quantmate/app/domains/portfolio/attribution_service.py` — 归因分析 (回测)
- `quantmate/app/strategies/stop_loss.py` — 止损管理 (风控层)
- `quantmate/app/domains/trading/matching_engine.py` — 撮合引擎 (回测执行)
- `quantmate/app/domains/trading/paper_strategy_executor.py` — 模拟执行

---

## 11. 验证

1. **单元测试**: 每个 Engine (Universe/Trading/Risk) 独立可测试
2. **集成测试**: Orchestrator 端到端: 因子选股 → MACD 交易 → 止损风控 → 日频回测
3. **回测对比**: 同一 CTA 策略, vnpy 单品种回测 vs 组合框架回测结果一致性
4. **前端 E2E**: 创建组合策略 → 配置参数 → 提交回测 → 查看结果

---

## 12. 决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 策略分层 | 三层 (选股+交易+风控) + Portfolio | 覆盖所有策略类型 |
| vnpy 角色 | 执行层 + 单品种 CTA 引擎 | 组合逻辑需要更灵活的自建编排 |
| 回测粒度 | Phase 1 日频 (日 K 线) | 选股类策略以日频为主 |
| 向后兼容 | 现有策略保持可用 | legacy 整体策略仍是 trading 层组件 |
| 目标市场 | 全市场 (A 股+期货+港美股) | 通过 market_constraints 配置差异 |
| 执行策略 | Phase 2+ | TWAP/VWAP 本次不含 |
| 组合表结构 | binding 关联表 (非 3 FK) | 支持每层多组件: 投票/链式/合并 |
| 组件载体 | code + config 双字段 | Universe/Risk 适合声明式，Trading 适合代码 |
| Portfolio 职责 | Allocator + Ledger 拆分 | 避免决策和账本职责混合 |
| 初始 scope | Step 1+2 仅 backtest | 降低风险，先验证组合心智 |

---

## 13. 待讨论 / 设计决策

### 13.1 已确认

1. **TradingEngine 适配器**: 提供 `VnpyTradingAdapter` (包装现有 CTA) + `NativeTradingAdapter` (纯 Python)，让用户选择
2. **多策略信号冲突**: 同一标的被多个交易策略产生矛盾信号时的处理 — 通过 `composite_component_bindings.weight` 加权投票 + 风控层裁决
3. **组合表结构**: 采用 `composite_component_bindings` 关联表而非 3 个 FK 列，支持每层多组件
4. **组件载体多样性**: strategy_components 同时支持 `code` (可执行 Python) 和 `config` (声明式 DSL/规则)，按 layer/sub_type 语义决定
5. **Portfolio 职责拆分**: 拆为 Strategy Allocator (决策) + Portfolio Ledger (账本)，避免单一对象承担过多职责
6. **初始 scope**: Step 1+2 仅支持 backtest 模式，不对接 paper/live 部署

### 13.2 待确认

1. **优先做什么**: "研究编排 + 组合回测" vs "真实运行的 strategy portfolio 管理"？
   - **建议**: 先做前者 (Step 1+2)，后者 (Step 3) 等 paper trading 行情可信后再做
2. **Universe 层对期货的适用性**: Universe 层主要面向股票/基金 (先选标的再交易)。期货策略通常直接交易固定合约，强行套 Universe 模型会变别扭
   - **建议**: 期货策略允许跳过 Universe 层 (universe binding 为空)，直接从 Trading 层开始
3. **Custom 类型在新体系中的定位**: 长期保留的 escape hatch，还是过渡兼容？
   - **建议**: 长期保留。Custom = "整体策略" 模式，不强制分层，但可通过 binding 表作为 trading 组件被组合引用
4. **实盘调度**: 日频策略用定时调度 (收盘后选股, 次日开盘下单) vs 实时流式
   - **待定**: 取决于目标用户的交易频率需求
5. **前端交互模式**: 三栏实时编排器 vs 模板向导
   - **建议**: Step 1-2 先做模板向导 (选股模板→交易模板→风控模板→回测)，模型稳定后再补三栏编排器
6. **产品术语区分**: "Strategy Portfolio" (策略组合/资金分配视角) vs "Holdings Portfolio" (账户持仓/交易结果视角)
   - **建议**: 在 UI 和 API 中明确区分，前端 Portfolio 页拆分为两个 Tab

---

## 14. 原型设计

参见 `quantmate-docs/prototype/` 下的 HTML 原型:
- `strategies.html` — 策略研究页 (更新: 增加组件视图)
- `composite-strategies.html` — 组合策略编排页 (**新增**)
- `backtest.html` — 回测页 (更新: 增加组合回测 Tab)
- `portfolio.html` — Portfolio 管理页 (更新: 增加多策略分配)
