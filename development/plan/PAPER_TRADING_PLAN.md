# Paper Trading (模拟交易) — 需求、设计与实施计划

> **Status**: In Progress · **Issue**: #35 · **Priority**: P2  
> **Created**: 2026-03-26 · **Author**: QuantMate Team

---

## 1. 概述

在 QuantMate 平台实现完整的 **Paper Trading 模拟交易**功能：

- **独立虚拟账户** — 每个用户可创建多个 Paper Account，配置独立初始资金和市场
- **真实行情驱动撮合** — 通过腾讯行情 API 获取实时价格进行模拟撮合
- **策略自动/半自动执行** — 将策略一键部署至模拟交易，支持全自动下单或信号确认模式
- **全市场支持** — A 股（完整交易规则）、港股、美股
- **A 股完整交易规则模拟** — T+1、涨跌停、100 股整手交易、真实手续费

---

## 2. 当前状态分析

### 2.1 已完成（~70%）

| 模块 | 文件 | 状态 |
|------|------|------|
| Paper 部署管理 | `paper_trading_service.py` | ✅ deploy/stop/list |
| Paper 下单路由 | `paper_trading.py` (routes) | ✅ CRUD, 但撮合用固定价 |
| Paper 持仓计算 | `paper_trading_service.py` | ✅ 从 filled orders 聚合 |
| Paper 绩效概览 | `paper_trading_service.py` | ✅ 基础 P&L + 回撤 |
| 数据库表 | `orders`, `trades`, `paper_deployments` | ✅ 已存在 |
| 前端 UI | `PaperTrading.tsx` | ✅ 四 Tab |
| VNPy 网关管理 | `vnpy_trading_service.py` | ✅ CTP/XTP/SIM |
| CTA 策略执行器 | `cta_strategy_runner.py` | ✅ 编译启停 |
| 实时行情 | `realtime_quote_service.py` | ✅ 腾讯 API(A 股) |
| WebSocket 基础设施 | `websocket.py` | ✅ 连接管理、channel 定义 |

### 2.2 核心缺口

| 缺口 | 当前 | 目标 |
|------|------|------|
| 撮合引擎 | 市价单固定价成交 `price or 0` | 实时行情驱动 + 滑点 + 真实费率 |
| 独立账户 | 无 Paper Account 概念 | 多账户、多市场、独立资金 |
| 交易规则 | 无限制 | T+1、涨跌停、100 股整手 |
| 限价/止损单 | 不支持 | 挂单队列 + 行情触发 |
| 策略执行 | 部署仅记录元数据 | 策略实际运行并产生信号 |
| 资金管理 | 无冻结/释放 | 下单冻结→成交扣款→卖出释放 |
| 每日结算 | 无 | Mark-to-market + 净值记录 |
| 绩效分析 | 基础 P&L | Sharpe/Sortino/胜率/盈亏比/基准对比 |
| 多市场行情 | 仅 A 股 | +港股+美股 |
| WebSocket 推送 | Channel 为空 | 行情推送 + 订单状态推送 |

---

## 3. 架构设计

### 3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                          │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  ┌───────────┐ │
│  │ Accounts   │  │ Manual     │  │ Strategy  │  │ Signal    │ │
│  │ Management │  │ Order      │  │ Deploy    │  │ Confirm   │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘  └─────┬─────┘ │
│        │  REST API      │               │   WebSocket   │       │
└────────┼────────────────┼───────────────┼───────────────┼───────┘
         │                │               │               │
┌────────┼────────────────┼───────────────┼───────────────┼───────┐
│        ▼                ▼               ▼               ▼       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              FastAPI Routes (/paper-trade/*)             │    │
│  └────────┬──────────┬──────────┬──────────────────────────┘    │
│           │          │          │                                │
│  ┌────────▼──┐ ┌─────▼─────┐  ┌▼──────────────┐                │
│  │  Paper    │ │ Matching  │  │ Strategy       │                │
│  │  Account  │ │ Engine    │  │ Executor       │                │
│  │  Service  │ │           │  │ (Sandbox)      │                │
│  └─────┬─────┘ └─────┬─────┘  └───────┬───────┘                │
│        │              │                │                        │
│  ┌─────▼─────┐ ┌──────▼──────┐  ┌─────▼──────┐                 │
│  │ Market    │ │ Realtime    │  │ CTA        │                  │
│  │ Rules     │ │ Quote Svc   │  │ Runner     │                  │
│  │ Engine    │ │ (Tencent)   │  │ (VNPy)     │                  │
│  └───────────┘ └─────────────┘  └────────────┘                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Paper Matching Worker (Background Thread)              │    │
│  │  · 每 3s 轮询 pending orders                            │    │
│  │  · 获取实时行情 → 撮合判断 → 更新 DB → WebSocket 推送   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         Backend (FastAPI)                        │
└─────────────────────────────────────────────────────────────────┘
         │
    ┌────▼────┐    ┌──────────┐    ┌───────┐
    │ MySQL   │    │ Redis    │    │ VNPy  │
    │quantmate│    │ Pending  │    │ DB    │
    │         │    │ Orders   │    │       │
    └─────────┘    └──────────┘    └───────┘
```

### 3.2 数据模型

#### paper_accounts 表（新增）

```sql
paper_accounts (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  name            VARCHAR(100) NOT NULL,
  initial_capital DECIMAL(16,2) NOT NULL DEFAULT 1000000.00,
  balance         DECIMAL(16,2) NOT NULL,         -- 可用余额
  frozen          DECIMAL(16,2) NOT NULL DEFAULT 0, -- 冻结资金
  market_value    DECIMAL(16,2) NOT NULL DEFAULT 0, -- 持仓市值
  total_pnl       DECIMAL(16,2) NOT NULL DEFAULT 0, -- 累计盈亏
  currency        ENUM('CNY','HKD','USD') DEFAULT 'CNY',
  market          ENUM('CN','HK','US') DEFAULT 'CN',
  status          ENUM('active','closed') DEFAULT 'active',
  created_at, updated_at
)
```

#### paper_account_snapshots 表（新增）

```sql
paper_account_snapshots (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  account_id      INT NOT NULL,
  snapshot_date   DATE NOT NULL,
  balance         DECIMAL(16,2),
  market_value    DECIMAL(16,2),
  total_equity    DECIMAL(16,2),  -- balance + market_value
  daily_pnl       DECIMAL(16,2),
  UNIQUE KEY (account_id, snapshot_date)
)
```

#### paper_signals 表（新增）

```sql
paper_signals (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  paper_account_id INT NOT NULL,
  deployment_id    INT NOT NULL,
  symbol           VARCHAR(20) NOT NULL,
  direction        ENUM('buy','sell') NOT NULL,
  quantity         INT NOT NULL,
  suggested_price  DECIMAL(10,4),
  reason           TEXT,
  status           ENUM('pending','confirmed','rejected','expired') DEFAULT 'pending',
  created_at, confirmed_at
)
```

#### 现有表扩展

```sql
-- orders 表增加字段
ALTER TABLE orders ADD COLUMN paper_account_id INT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN buy_date DATE DEFAULT NULL;  -- T+1 判断用

-- paper_deployments 表增加字段
ALTER TABLE paper_deployments ADD COLUMN paper_account_id INT DEFAULT NULL;
ALTER TABLE paper_deployments ADD COLUMN execution_mode ENUM('auto','semi_auto') DEFAULT 'auto';
```

### 3.3 撮合引擎设计

#### 手续费模型

| 市场 | 佣金 | 印花税 | 过户费 | 其他 |
|------|------|--------|--------|------|
| A 股 | 万 2.5（最低 5 元）| 千 1（仅卖出）| 万 0.2 | — |
| 港股 | 万 2.5 | 千 1.3（双向）| — | 交易征费万 0.27 + 交收费万 0.05 |
| 美股 | $0.005/股（最低 $1）| — | — | SEC fee $0.0000278/$ |

#### 撮合逻辑

```
市价单:
  → 获取实时最新价 last_price
  → 买入: fill_price = last_price * (1 + slippage)
  → 卖出: fill_price = last_price * (1 - slippage)
  → 立即成交

限价单:
  → 写入 Redis pending queue
  → Worker 每 3s 检查:
    → 买单: 当 last_price <= limit_price → 成交
    → 卖单: 当 last_price >= limit_price → 成交

止损单:
  → 写入 Redis pending queue
  → Worker 每 3s 检查:
    → 买单: 当 last_price >= stop_price → 转市价成交
    → 卖单: 当 last_price <= stop_price → 转市价成交
```

#### A 股交易规则

| 规则 | 实现 |
|------|------|
| T+1 | 记录买入日期，当日买入次日方可卖出 |
| 涨跌停 | 主板 ±10%、科创板/创业板 ±20%、ST ±5% |
| 最小交易单位 | 100 股（科创板允许零股卖出） |
| 交易时段 | 9:30-11:30, 13:00-15:00 |
| 资金校验 | 可用余额 ≥ 订单金额 + 预估费用 |
| 持仓校验 | 可用持仓 ≥ 卖出数量 |

### 3.4 策略执行模式

| 模式 | 流程 |
|------|------|
| **全自动 (auto)** | 策略信号 → matching_engine → 直接下单成交 |
| **半自动 (semi_auto)** | 策略信号 → paper_signals 表 → WebSocket 通知用户 → 用户确认/拒绝 → 下单 |

---

## 4. 实施计划

### Phase 1: Paper Account 资金账户系统

**新增文件:**
- `quantmate/mysql/migrations/021_create_paper_accounts.sql`
- `quantmate/app/domains/trading/paper_account_service.py`
- `quantmate/app/domains/trading/dao/paper_account_dao.py`
- `quantmate/app/api/routes/paper_account.py`

**修改文件:**
- `quantmate/app/api/main.py` — 注册路由

**API 端点:**
- `POST /api/v1/paper-account` — 创建账户
- `GET /api/v1/paper-account` — 列出账户
- `GET /api/v1/paper-account/{id}` — 账户详情
- `GET /api/v1/paper-account/{id}/equity-curve` — 权益曲线
- `DELETE /api/v1/paper-account/{id}` — 关闭账户

### Phase 2: 撮合引擎 + 交易规则

**新增文件:**
- `quantmate/app/domains/trading/matching_engine.py`
- `quantmate/app/domains/trading/market_rules.py`
- `quantmate/app/domains/trading/paper_matching_worker.py`

**修改文件:**
- `quantmate/app/api/routes/paper_trading.py` — 增强下单逻辑
- `quantmate/app/domains/trading/paper_trading_service.py` — 集成撮合引擎

### Phase 3: 策略部署引擎

**新增文件:**
- `quantmate/app/domains/trading/paper_strategy_executor.py`
- `quantmate/mysql/migrations/022_create_paper_signals.sql`

**修改文件:**
- `quantmate/app/api/routes/paper_trading.py` — 增加信号端点
- `quantmate/mysql/migrations/021_create_paper_accounts.sql` — 含 ALTER 语句

### Phase 4: 实时行情增强

**修改文件:**
- `quantmate/app/domains/market/realtime_quote_service.py` — 多市场
- `quantmate/app/domains/market/realtime_quote_cache.py` — 缓存增强
- `quantmate/app/api/routes/websocket.py` — 行情+订单推送

### Phase 5: 前端 Paper Trading UI

**修改文件:**
- `quantmate-portal/src/pages/PaperTrading.tsx` — 重构
- `quantmate-portal/src/lib/api.ts` — 扩展 API
- `quantmate-portal/src/types/index.ts` — 新增类型

**新增文件:**
- `quantmate-portal/src/components/SignalNotification.tsx`
- `quantmate-portal/src/hooks/useRealtimeQuote.ts`

### Phase 6: 每日结算 + 绩效分析

**新增文件:**
- `quantmate/app/domains/trading/paper_settlement_service.py`
- `quantmate/app/domains/trading/paper_analytics_service.py`

### Phase 7: 导航 + 国际化

**修改文件:**
- `quantmate-portal/src/components/Layout.tsx` — 导航入口
- `quantmate-portal/src/i18n/` — 翻译文件

---

## 5. 关键决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 撮合引擎 | 自建（非 VNPy SIM） | VNPy SIM gateway 不支持 T+1/涨跌停 |
| 账户模型 | 独立 Paper Account | 不复用 Trading 页面，清晰隔离 |
| 实时数据源 | 腾讯行情 API | 免费、~3 秒延迟、稳定 |
| 执行模式 | 双模式（auto+semi_auto）| 满足不同用户偏好 |
| 分钟数据 | 不开启同步 | 需付费，用实时价格模拟 |

---

## 6. 验证标准

1. **单元测试**: 撮合引擎 / 交易规则 / 资金管理 所有场景覆盖
2. **集成测试**: 创建账户→下单→撮合→持仓→结算 全链路
3. **前端检查**: `typecheck` + `lint` + `test:run` 全部通过
4. **手动验证**: 创建 CN 账户(100 万) → 买入 100 股 → 验证 T+1 → 卖出 → 部署策略 → 验证信号
5. **CI**: `npm run check:ci-local` 通过
