# QuantMate PRD: 双路径工作流闭环（Phase 1 — 短期 0-3 月）

> **版本**: V1.0 | **日期**: 2026-05-21 | **状态**: Draft for Review
> **关联文档**: [双路径产品战略分析报告](./QUANTMATE_DUAL_PATH_STRATEGY_ANALYSIS_V1.md)

---

## 目录

1. [概述与目标](#1-概述与目标)
2. [PRD-1: 统一工作台 Workbench](#2-prd-1-统一工作台-workbench)
3. [PRD-2: 上下文感知 AI Copilot](#3-prd-2-上下文感知-ai-copilot)
4. [PRD-3: 一键转化链路](#4-prd-3-一键转化链路)
5. [PRD-4: 回测结果 AI 解读](#5-prd-4-回测结果-ai-解读)
6. [PRD-5: RD-Agent 自动验证管道](#6-prd-5-rd-agent-自动验证管道)
7. [技术约束与依赖](#7-技术约束与依赖)
8. [验收测试总览](#8-验收测试总览)

---

## 1. 概述与目标

### 1.1 Phase 1 目标

打通 QuantMate 两条路径的**端到端工作流闭环**，让用户和 AI 都能完成"因子研究 → 策略构建 → 回测验证 → 模拟交易"的完整链路，无需在多个独立页面间手动切换。

### 1.2 成功指标 (Success Metrics)

| 指标 | 当前基线 | 目标值 | 测量方式 |
|------|----------|--------|----------|
| 完成一次完整工作流的平均时间 | ~45 分钟（跨4个页面） | ≤ 15 分钟（Workbench 内） | 用户操作时间埋点 |
| 从因子到策略创建的转化率 | < 10%（手动跨页面） | ≥ 40% | Factor Lab 操作日志 |
| AI Copilot 日活跃使用率 | < 5% | ≥ 30% | AI Chat 埋点 |
| RD-Agent 因子进入回测的比例 | 0%（手动） | ≥ 80%（自动） | RD-Agent + Backtest 日志 |
| 回测到模拟交易部署的转化率 | ~5%（手动） | ≥ 25% | Backtest + Paper Trading 日志 |

### 1.3 用户故事总览

```
路径一（人工+AI辅助）:
  作为量化研究员，我希望在一个统一的工作台中完成从因子研究到模拟交易的全流程，
  且 AI Copilot 能在我操作的每一步提供上下文相关的建议，
  以便我快速验证交易想法。

路径二（AI自主）：
  作为策略开发者，我希望 RD-Agent 发现的因子能自动进入回测验证管道，
  经过验证的因子能自动生成策略并部署到模拟交易进行观察，
  以便 AI 能自主完成策略研发的机械性工作。
```

---

## 2. PRD-1: 统一工作台 Workbench

### 2.1 需求概述

新建 `/workbench` 页面，作为路径一的主操作界面。替代当前用户在 Factor Lab、Strategies、Backtest、Paper Trading 四个独立页面间切换的模式。

### 2.2 功能需求

#### F1.1: Pipeline Canvas（管道画布）

**描述**: 顶部横向步骤条，展示当前工作流的四个阶段及进度。

```
┌──────────────────────────────────────────────────────────────┐
│  ● 因子研究 ──── ○ 策略构建 ──── ○ 回测验证 ──── ○ 模拟交易    │
│   (已完成)        (进行中)        (待开始)        (待开始)     │
└──────────────────────────────────────────────────────────────┘
```

**交互规则**:
- 四个阶段固定为：因子研究 → 策略构建 → 回测验证 → 模拟交易
- 已完成阶段显示绿色勾号，点击可回看结果
- 当前阶段高亮显示，不可跳过（但可回溯修改）
- 未开始阶段灰色显示
- 左侧 Panel 根据当前阶段动态切换内容

**状态机**:

```
因子研究 ──(因子已选定)──→ 策略构建 ──(策略已保存)──→ 回测验证
    ↑                          ↑                        │
    └────────(回溯修改)────────└────────(回溯修改)───────┤
                                                         │
                                                    (回测通过)
                                                         ↓
                                                     模拟交易
```

#### F1.2: 阶段一 — 因子研究面板

**描述**: 嵌入 Factor Lab 核心功能到 Workbench 左侧面板。

**包含内容**:
- 因子列表（复用 Factor Lab 现有因子数据，支持搜索/过滤）
- 因子详情快速预览（IC Mean / ICIR / 分组收益摘要）
- "选择因子" 按钮（多选，最少选1个）
- "AI 推荐因子" 快捷按钮（基于当前市场状态推荐 Top-5 因子）
- 确认选择 → Pipeline 推进到"策略构建"

**不包含**（仍链接到完整 Factor Lab 页面）：
- 因子创建/编辑表单
- Qlib 因子集管理
- RD-Agent 启动

#### F1.3: 阶段二 — 策略构建面板

**描述**: 基于选定的因子，快速构建策略。

**包含内容**:
- 策略名称输入（自动生成默认名：`{因子1}_{因子2}_Strategy_{日期}`）
- 策略类型选择：CTA 策略 / Qlib 模型策略
- 关键参数配置（根据策略类型动态表单）:
  - CTA：初始资金、手续费率、滑点、合约乘数
  - Qlib：模型类型、训练集比例、预测目标（Return/Rank）
- "生成策略代码" 按钮（调用现有多因子策略代码生成接口）
- 代码预览区（可编辑，带语法高亮）
- "保存并回测" 按钮 → Pipeline 推进到"回测验证"

#### F1.4: 阶段三 — 回测验证面板

**描述**: 配置并执行回测，实时查看结果。

**包含内容**:
- 回测参数配置：回测区间（开始日期-结束日期）、基准标的
- "开始回测" 按钮 → 提交 RQ 任务 → 轮询状态
- 回测进度条（任务状态 + 预估剩余时间）
- 结果摘要区（完成后展示）：
  - 总收益率、年化收益、Sharpe Ratio、最大回撤、胜率、Calmar Ratio
  - 收益曲线缩略图
  - AI 解读入口（链接到 PRD-4 的解读报告）
- "部署模拟交易" 按钮 → Pipeline 推进到"模拟交易"
- "回溯修改策略" / "回溯修改因子" 按钮

#### F1.5: 阶段四 — 模拟交易面板

**描述**: 将回测通过的策略部署到模拟交易环境。

**包含内容**:
- 模拟账户选择（复用现有 Paper Account 列表）
- 初始资金确认（默认继承回测参数）
- 运行模式选择：全自动 / 信号模式（半自动）
- "开始模拟交易" 按钮 → 调用 Paper Trading Deploy API
- 部署成功后的运行状态卡片：
  - 策略名称、账户、运行模式、启动时间
  - 实时收益、当前持仓数
  - "查看详情" 链接到 Paper Trading 详情页
  - "停止" 按钮

#### F1.6: Pipeline 状态持久化

**描述**: 用户可随时离开 Workbench，下次返回时恢复到上次进度。

- 每个用户的 Pipeline 状态持久化到数据库（`workbench_sessions` 表）
- 自动保存：阶段切换时保存
- 手动保存：显式"保存进度"按钮
- "新建工作流"按钮清空并重新开始
- 历史工作流列表（最近 10 条）

### 2.3 UI/UX 规格

**布局**: 三栏式
- 左侧 (60%)：当前阶段操作面板
- 右上 (40%)：AI Copilot（PRD-2）
- 右下 (40%)：阶段输出预览（因子图表 / 策略代码 / 回测曲线 / 交易状态）

**响应式**: 桌面端优先（≥1280px），平板端降级为上下布局

### 2.4 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC1.1 | 用户进入 `/workbench`，看到四个阶段的 Pipeline Canvas，第一阶段"因子研究"默认激活 | P0 |
| AC1.2 | 用户可从因子列表中选择 1-N 个因子，点击确认后 Pipeline 推进到"策略构建"，所选因子信息被携带 | P0 |
| AC1.3 | 策略构建面板根据策略类型（CTA/Qlib）展示不同的参数表单，用户填写后可生成策略代码并预览 | P0 |
| AC1.4 | 点击"保存并回测"，策略保存到数据库，Pipeline 推进到"回测验证" | P0 |
| AC1.5 | 回测提交后，进度条实时更新（轮询间隔 ≤ 3秒），完成后展示关键指标摘要 | P0 |
| AC1.6 | 回测结果页有"部署模拟交易"按钮，点击后进入模拟交易配置面板 | P0 |
| AC1.7 | 部署模拟交易成功后，展示运行状态卡片，包含实时收益和持仓数 | P0 |
| AC1.8 | Pipeline 状态在页面刷新后保持不变（持久化恢复） | P0 |
| AC1.9 | 用户可在任意阶段点击"回溯修改"，返回上一阶段，之前填写的数据保留 | P1 |
| AC1.10 | 历史工作流列表可查看、恢复最近 10 条记录 | P1 |
| AC1.11 | "AI 推荐因子"按钮调用后端推荐接口，返回 Top-5 因子并自动勾选 | P1 |
| AC1.12 | 策略代码预览区支持语法高亮和在线编辑 | P1 |

---

## 3. PRD-2: 上下文感知 AI Copilot

### 3.1 需求概述

将当前独立的 AI Chat（`/ai-assistant`）升级为嵌入 Workbench 的上下文感知 Copilot。Copilot 知道用户当前在哪个阶段、操作什么数据，并主动提供相关建议。

### 3.2 功能需求

#### F2.1: 上下文感知引擎

**描述**: 后端维护当前用户的 Workbench 上下文，Copilot 根据上下文生成针对性建议。

**上下文模型 (Context Model)**:

```python
class CopilotContext:
    pipeline_stage: str          # "factor" | "strategy" | "backtest" | "paper_trade"
    selected_factors: list[dict] # [{name, expression, ic_mean, icir}, ...]
    current_strategy: dict | None  # {name, type, code, params}
    backtest_result: dict | None   # {sharpe, max_dd, total_return, ...}
    paper_trade_status: dict | None # {account, mode, runtime, pnl}
    market_context: dict | None     # {market_regime, recent_volatility, ...}
```

**触发时机**:
- 阶段切换时 → 自动推送"阶段引导"消息
- 用户操作关键节点时 → 推送"主动建议"消息（如因子 IC 异常低、回测过拟合风险高）
- 用户主动输入问题时 → 结合上下文回答

#### F2.2: 主动推送消息类型

| 触发场景 | Copilot 消息模板 |
|----------|-----------------|
| 进入因子研究阶段 | "欢迎使用因子研究。当前市场处于{regime}状态，历史上在此阶段表现较好的因子类型有：{factor_types}。需要我帮你筛选吗？" |
| 因子选择后 | "你选择了 {N} 个因子。其中 {factor_name} 近3个月 IC 从 {old_ic} 降至 {new_ic}，衰减趋势值得关注。建议考虑加入 {alternative_factor} 增强稳定性。" |
| 策略代码生成后 | "策略代码已生成。我注意到代码中未设置止损逻辑，建议添加 ATR 动态止损。需要我帮你修改吗？" |
| 回测完成后 | "回测完成。Sharpe {value}、最大回撤 {value}%。需注意，回测区间仅覆盖 {bull/bear/range} 市场，在相反市场状态下的表现未验证。建议进行 Walk-Forward 分析。" |
| 回测结果异常好 | "⚠️ Sharpe Ratio > 3.0，需警惕过度拟合。建议检查：(1) 参数敏感度 (2) 样本外表现 (3) Deflated Sharpe Ratio。" |
| 回测结果差 | "回测效果不理想。可能原因：(1) 因子在当前市场状态失效 (2) 参数设置需要优化。需要我帮你分析吗？" |
| 模拟交易部署后 | "策略已开始模拟交易。我会持续监控表现，当出现以下情况时通知你：最大回撤超 {limit}%、连续亏损 {N} 笔、Sharpe 低于 {threshold}。" |

#### F2.3: 用户交互

**描述**: Copilot 面板支持以下交互方式：

- **主动消息**：系统根据上下文自动推送，出现在对话流中，带"阶段"标签
- **快捷操作**：每个主动消息后面带 1-3 个快捷按钮：
  - "帮我筛选因子" → 调用因子推荐 API
  - "帮我修改代码" → 触发代码修改对话
  - "进行分析" → 触发回测 AI 解读
  - "设置监控" → 创建模拟交易告警规则
- **自由对话**：用户可随时输入自然语言问题
- **消息持久化**：对话历史关联到 Workbench Session，保存到现有 `ai_conversations` 表

### 3.3 后端 API 新增/修改

#### 新增 API

```
POST /api/v1/workbench/copilot/context
  Body: { session_id, stage, factors?, strategy_id?, backtest_job_id?, paper_trade_id? }
  Response: { message: CopilotMessage }

POST /api/v1/workbench/copilot/chat
  Body: { session_id, message, context }
  Response: { reply: CopilotMessage, actions?: ActionButton[] }

GET /api/v1/workbench/copilot/recommend-factors
  Query: { market_regime?, limit? }
  Response: { factors: Factor[] }
```

#### 修改 API

- `POST /api/v1/ai/conversations/{id}/messages` — 新增 `context` 字段，关联 Workbench Session

### 3.4 数据模型

```sql
-- workbench_sessions 表
CREATE TABLE workbench_sessions (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    name          VARCHAR(255) DEFAULT NULL,
    pipeline_stage ENUM('factor','strategy','backtest','paper_trade') NOT NULL DEFAULT 'factor',
    context_data  JSON DEFAULT NULL,  -- 序列化的 CopilotContext
    status        ENUM('active','completed','archived') DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_status (user_id, status)
);
```

### 3.5 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC2.1 | 用户进入 Workbench 后，Copilot 面板自动显示欢迎消息，提及当前市场状态和推荐因子类型 | P0 |
| AC2.2 | 用户选择因子并进入策略构建阶段后，Copilot 自动推送消息，对选定因子的质量（IC 趋势/衰减）进行点评 | P0 |
| AC2.3 | 策略代码生成后，Copilot 检查代码并推送改进建议（如缺失止损、仓位管理等问题） | P0 |
| AC2.4 | 回测完成后，Copilot 自动推送回测结果摘要 + 过拟合风险评估 | P0 |
| AC2.5 | Copilot 主动消息附带 1-3 个快捷操作按钮，点击后触发对应功能 | P0 |
| AC2.6 | 用户可在 Copilot 面板自由输入自然语言问题，回答需结合当前 Pipeline 上下文 | P0 |
| AC2.7 | 模拟交易部署后，Copilot 推送监控设置建议，用户可一键创建告警规则 | P1 |
| AC2.8 | 用户切换到历史 Workbench Session 时，Copilot 恢复当时对话历史 | P1 |
| AC2.9 | Copilot 响应延迟 ≤ 3 秒（不含 LLM 推理时间） | P1 |

---

## 4. PRD-3: 一键转化链路

### 4.1 需求概述

在 Workbench 之外，为现有的独立页面添加"一键跳转+数据携带"能力，确保不从 Workbench 入口的用户也能享受到工作流串联的便利。

### 4.2 功能需求

#### F3.1: Factor Lab → Strategy（因子→策略一键创建）

**场景**: 用户在 Factor Lab 中评估了一个或一组因子，想直接创建策略。

**入口**: Factor Lab 因子详情/列表页 → "创建策略" 按钮

**行为**:
1. 点击"创建策略"
2. 弹出 Modal：选择策略类型（CTA / Qlib 模型）、输入策略名称（预填默认值）
3. 点击"确认创建"
4. 后端调用策略代码生成 → 创建 Strategy 记录 → 关联因子
5. 成功后跳转到策略编辑页（或 Workbench 策略构建阶段），携带新策略 ID

#### F3.2: Strategy → Backtest（策略→回测一键提交）

**场景**: 用户在策略编辑页保存后，想立即回测。

**入口**: Strategy 编辑页 → "保存并回测" 按钮（现有"保存"按钮旁边新增）

**行为**:
1. 保存策略
2. 自动跳转到 Backtest 提交页，预填：策略=当前策略、参数=策略默认值
3. 用户仅需确认回测区间和基准 → 提交

#### F3.3: Backtest → Paper Trading（回测→模拟交易一键部署）

**场景**: 用户对回测结果满意，想直接部署到模拟交易观察。

**入口**: Backtest 结果页 → "部署到模拟交易" 按钮

**行为**:
1. 点击按钮
2. 弹出 Modal：
   - 选择模拟账户（列表或新建）
   - 确认初始资金（默认=回测初始资金）
   - 选择运行模式（全自动/信号模式）
   - 设置监控告警阈值（可选，默认值）
3. 点击"确认部署"
4. 后端创建 Paper Trading Deployment
5. Modal 显示部署结果（成功/失败+原因）
6. "查看模拟交易"链接到 Paper Trading 详情页

### 4.3 后端 API 新增

```
POST /api/v1/factors/{id}/create-strategy
  Body: { strategy_type: "cta"|"qlib", name?: string }
  Response: { strategy_id: int }

POST /api/v1/backtest/{job_id}/deploy-paper-trade
  Body: { account_id: int, initial_capital: float, mode: "auto"|"signal",
          alerts?: { max_drawdown_pct?: float, consecutive_losses?: int } }
  Response: { deployment_id: int, status: string }
```

### 4.4 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC3.1 | Factor Lab 因子列表/详情页有"创建策略"按钮，点击后弹出策略类型和名称配置 Modal | P0 |
| AC3.2 | 确认创建策略后，系统自动生成策略代码、关联因子、创建策略记录 | P0 |
| AC3.3 | 策略编辑页有"保存并回测"按钮，保存后自动跳转到 Backtest 提交页且预填策略信息 | P0 |
| AC3.4 | Backtest 结果页有"部署到模拟交易"按钮，点击后弹出部署配置 Modal | P0 |
| AC3.5 | 部署 Modal 包含：账户选择、资金确认、运行模式、告警阈值设置 | P0 |
| AC3.6 | 部署成功后显示成功提示和"查看模拟交易"链接 | P0 |
| AC3.7 | 每个一键转化步骤中，若目标已存在关联记录（如同一因子已有策略），给出提示让用户选择"查看已有"或"新建" | P1 |
| AC3.8 | 一键转化链路中的每个跳转保留用户已填写的数据（通过 URL query 参数或 session 传递） | P1 |

---

## 5. PRD-4: 回测结果 AI 解读

### 5.1 需求概述

回测完成后，自动生成 AI 解读报告。报告不仅罗列数字，还要给出诊断结论和可操作建议。

### 5.2 功能需求

#### F5.1: 自动解读报告

**触发**: 回测任务完成（success 或 partial 状态）

**报告结构**:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 回测 AI 解读报告                                          │
│  策略: TripleMA_Strategy | 区间: 2024-01-01 ~ 2025-12-31     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 总体评价                                                  │
│     "该策略在回测区间内表现{优秀/良好/一般/较差}，                 │
│      年化收益 {x}%，跑赢基准 {y}%。策略在{牛市/熊市}中            │
│      表现更优。"                                              │
│                                                              │
│  2. 风险分析                                                  │
│     - 最大回撤 {x}% 发生在 {date}，持续时间 {N} 天               │
│     - VaR (95%): {x}% | CVaR: {y}%                            │
│     - "回撤恢复速度{b>快/中等/慢}，需关注极端行情下的回撤控制"       │
│                                                              │
│  3. 过度拟合评估 ⚠️                                            │
│     - Deflated Sharpe Ratio: {x} (阈值 0.05)                  │
│     - 参数敏感度: {高/中/低}                                    │
│     - "该策略{存在/不存在}明显过度拟合风险。"                      │
│     - 若存在风险："建议进行 Walk-Forward 验证或减少参数数量"       │
│                                                              │
│  4. 交易行为分析                                               │
│     - 总交易 {N} 笔，胜率 {x}%                                  │
│     - 平均持仓天数 {x}，换手率 {y}                               │
│     - 最大连续盈利 {x} 笔 / 最大连续亏损 {y} 笔                   │
│     - "交易频率{偏高/适中/偏低}，{可能/不}产生较高交易成本"          │
│                                                              │
│  5. 优化建议                                                  │
│     - 基于分析结果，给出 2-3 条具体优化建议                       │
│     - 每条建议附带"应用"按钮（如可行）                            │
│                                                              │
│  6. 市场适应性                                                 │
│     - 在不同市场状态下的分段表现（牛市/熊市/震荡市）                │
│     - "该策略在{状态A}中表现最佳，在{状态B}中显著走弱"              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### F5.2: 解读数据来源

以下数据由后端在回测完成后计算并存储：

| 指标 | 计算方式 | 数据来源 |
|------|----------|----------|
| Deflated Sharpe Ratio | DSR = P(Sharpe > 0) 基于多次抽样 | 回测日收益率序列 |
| 参数敏感度 | 参数 ±10% 后 Sharpe 变化幅度 | 参数配置 |
| 市场状态分段 | 基于基准指数的牛熊判断（20日均线 > 250日均线 = 牛市） | 基准日线数据 |
| Walk-Forward 效率 | WF-E = (样本外 Sharpe) / (样本内 Sharpe) | 分段回测 |

### 5.3 后端 API 新增

```
POST /api/v1/backtest/{job_id}/ai-analysis
  Response: { report: AISummary, status: "generating"|"completed" }

GET /api/v1/backtest/{job_id}/ai-analysis
  Response: { report: AISummary, generated_at: datetime }

POST /api/v1/backtest/{job_id}/ai-analysis/apply-suggestion
  Body: { suggestion_index: int }
  Response: { action: string, result: object }
```

### 5.4 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC4.1 | 回测完成（success/partial）后，系统自动触发 AI 解读生成（异步，RQ 任务） | P0 |
| AC4.2 | 解读报告包含：总体评价、风险分析、过度拟合评估、交易行为分析、优化建议、市场适应性 六个部分 | P0 |
| AC4.3 | 过度拟合评估使用 Deflated Sharpe Ratio 和参数敏感度作为判断依据 | P0 |
| AC4.4 | 报告中的数值指标与回测结果页的数值一致 | P0 |
| AC4.5 | 优化建议中的可自动操作项附带"应用"按钮（如"添加 ATR 止损"，点击后修改策略代码） | P1 |
| AC4.6 | AI 解读生成时间 ≤ 30 秒（从回测完成到报告可查看） | P1 |
| AC4.7 | 报告可导出为 PDF | P2 |
| AC4.8 | 每次回测生成独立的 AI 解读，历史解读可查看 | P1 |

---

## 5. PRD-5: RD-Agent 自动验证管道

### 5.1 需求概述

RD-Agent 发现的因子自动进入验证管道：因子评估 → 策略生成 → 回测 → 结果汇总。消除当前"RD-Agent 挖出因子 → 人工查看 → 手动导入 Factor Lab → 手动创建策略 → 手动回测"的冗长人工链路。

### 5.2 功能需求

#### F5.1: 自动验证触发

**触发条件**: RD-Agent 一次 Run 中迭代完成（单次 iteration 结束或整体 run 结束），发现新因子。

**行为**:
1. RD-Agent 因子写入 `qlib.discovered_factors` 表（现有逻辑）
2. 新增：发送 `factor_discovered` 事件
3. 验证管道监听事件，自动启动验证流程

#### F5.2: 验证管道流程

```
RD-Agent 发现因子
      │
      ▼
┌──────────────┐
│ 1. 因子评估   │ ← 复用 Factor Lab factor_screening 逻辑
│  IC/ICIR/分组  │    计算 IC Mean/Std/ICIR
│  筛选阈值:     │    过滤 IC < 0.02 或 ICIR < 0.3 的因子
│  IC>0.02      │
└──────┬───────┘
       │ 通过筛选的因子
       ▼
┌──────────────┐
│ 2. 策略生成   │ ← 调用多因子策略代码生成
│  自动组合通过  │    3-5 个因子一组
│  筛选的因子    │    生成 CTA 策略代码
└──────┬───────┘
       │ 生成的策略
       ▼
┌──────────────┐
│ 3. 批量回测   │ ← 复用批量回测接口
│  每个策略在    │    默认回测区间：最近3年
│  多个标的上    │    默认标的：沪深300成分股 Top-50
│  回测          │
└──────┬───────┘
       │ 回测结果
       ▼
┌──────────────┐
│ 4. 结果汇总   │ ← 生成 AutoPilot 报告
│  排序+AI解读  │    按 Sharpe/Calmar 排序
│  推送给用户    │    Top-5 进入"推荐策略"列表
└──────────────┘
```

#### F5.3: 管道配置

用户在 AutoPilot 页面可配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| 因子筛选阈值 | IC > 0.02, ICIR > 0.3 | 低于阈值的因子不进入策略生成 |
| 最大因子组合数 | 3 | 一个策略最多组合几个因子 |
| 回测区间 | 最近 3 年 | 回测数据范围 |
| 回测标的 | 沪深300 Top-50 | 在哪些标的上回测 |
| 自动部署到模拟交易 | 关闭（默认） | Top-N 策略是否自动部署 |
| 通知方式 | 站内通知 | 管道完成后的通知方式 |

#### F5.4: 结果展示

在 AutoPilot 页面新增 "验证管道" Tab：

- 管道运行状态（idle/running/completed）
- 各阶段进度（因子评估 15/20 → 策略生成 5/5 → 回测 3/5 → 完成）
- Top-5 策略结果列表（Sharpe/回撤/收益率/因子组成）
- 每个策略的操作按钮："导入我的策略" / "部署模拟交易" / "查看回测详情"

### 5.3 后端 API 新增/修改

```
POST /api/v1/rdagent/runs/{run_id}/start-validation
  Body: { config: PipelineConfig }
  Response: { pipeline_run_id: int, status: string }

GET /api/v1/rdagent/validation-pipelines/{pipeline_id}
  Response: { status, stages: StageProgress[], results: StrategyResult[] }

GET /api/v1/rdagent/runs/{run_id}/validation-results
  Response: { top_strategies: StrategyResult[], total_factors: int, passed: int }

PUT /api/v1/rdagent/pipeline-config
  Body: { factor_ic_threshold, max_factor_combo, backtest_period, ... }
```

### 5.4 新增 RQ 任务

```python
# quantmate/app/worker/tasks.py 新增

def run_factor_validation_pipeline(pipeline_run_id: int):
    """RD-Agent 因子验证管道"""
    # 1. 加载待验证因子
    # 2. 因子评估筛选
    # 3. 策略生成
    # 4. 批量回测
    # 5. 结果汇总
```

### 5.5 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC5.1 | RD-Agent Run 迭代完成并发现新因子后，自动触发验证管道 | P0 |
| AC5.2 | 验证管道按顺序执行：因子评估 → 策略生成 → 批量回测 → 结果汇总 | P0 |
| AC5.3 | 因子评估阶段过滤掉 IC < 0.02 或 ICIR < 0.3 的因子（阈值可配置） | P0 |
| AC5.4 | 策略生成阶段自动组合通过筛选的因子（默认 3 因子/策略） | P0 |
| AC5.5 | 批量回测在默认标的（沪深300 Top-50）上执行 | P0 |
| AC5.6 | AutoPilot 页面新增"验证管道"Tab，展示各阶段进度和 Top-5 结果 | P0 |
| AC5.7 | 管道配置页面可调整：因子阈值、最大因子组合数、回测区间、回测标的 | P1 |
| AC5.8 | 管道完成后推送站内通知给启动 RD-Agent Run 的用户 | P1 |
| AC5.9 | Top-5 策略结果每个都有"导入我的策略"按钮，点击后创建策略记录 | P1 |
| AC5.10 | 单个 RD-Agent Run 的完整验证管道执行时间 ≤ 2 小时（含回测） | P1 |

---

## 6. 技术约束与依赖

### 6.1 前端约束

| 约束 | 说明 |
|------|------|
| 浏览器兼容 | Chrome/Firefox/Edge 最近2个主版本；Safari 最近1个主版本 |
| 前端框架 | React 19 + TypeScript 5.9 + Vite 7 |
| 状态管理 | Workbench 状态使用 Zustand（持久化）；AI Chat 历史使用 TanStack Query |
| UI 库 | Tailwind CSS 3（现有），不引入新 UI 框架 |

### 6.2 后端约束

| 约束 | 说明 |
|------|------|
| 框架 | FastAPI，不引入新的 Web 框架 |
| LLM 调用 | 通过现有 `OPENCODE_AI_API_KEY` 配置的 LLM 服务 |
| 异步任务 | RQ（复用现有队列），长时间任务入 `default` 或新建 `copilot` 队列 |
| 数据存储 | MySQL `quantmate` 库，新增表通过 migration 系统部署 |

### 6.3 依赖项

| PRD | 依赖 | 状态 |
|-----|------|------|
| PRD-1 因子面板 | Factor Lab 现有功能 + API | 已就绪 |
| PRD-1 策略生成 | 多因子策略代码生成接口 | 已就绪 |
| PRD-1 回测 | Backtest RQ 任务 | 已就绪 |
| PRD-1 模拟交易 | Paper Trading Deploy API | 已就绪 |
| PRD-2 Copilot | AI Chat 现有基础设施 | 已有基础，需扩展 |
| PRD-3 一键转化 | 现有一键转化链路 | 新功能 |
| PRD-4 AI 解读 | 回测结果数据 + LLM | 回测数据就绪，LLM 需新接入 |
| PRD-5 验证管道 | RD-Agent + Factor Lab + Backtest | 均就绪，需编排 |

---

## 7. 验收测试总览

### 7.1 集成测试场景

| 场景 | 流程 | 涉及 PRD |
|------|------|----------|
| 路径一完整流程 | Workbench 入口 → 选因子 → 生成策略 → 回测 → 部署模拟交易 | PRD-1 |
| 路径一 Copilot 陪伴 | 上述全流程 + 每个阶段的 Copilot 主动推送 | PRD-1, PRD-2 |
| 路径一传统页面跳转 | Factor Lab → Strategy → Backtest → Paper Trading（独立页面） | PRD-3 |
| 路径二自动验证 | RD-Agent 完成 → 自动验证管道 → Top-5 结果 → 导入策略 | PRD-5 |
| 回测 AI 解读 | 任意回测完成 → 自动生成 AI 解读报告 | PRD-4 |

### 7.2 性能验收

| 指标 | 目标 |
|------|------|
| Workbench 页面首屏加载 | ≤ 2 秒 |
| Pipeline 阶段切换 | ≤ 500ms |
| Copilot 主动消息推送延迟 | ≤ 1 秒（上下文变化到消息出现） |
| 回测 AI 解读生成 | ≤ 30 秒 |
| 验证管道端到端（不含回测） | ≤ 10 分钟 |

---

> **下一步**: 各 PRD 的技术设计文档（TDD）由开发团队根据本 PRD 编写。
> **Review 流程**: 产品经理 → 技术负责人 → 前端 Lead → 后端 Lead → 迭代规划
