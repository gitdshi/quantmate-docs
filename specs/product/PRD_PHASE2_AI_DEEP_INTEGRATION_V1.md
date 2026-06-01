# QuantMate PRD: AI 深度集成（Phase 2 — 中期 3-12 月）

> **版本**: V1.0 | **日期**: 2026-05-21 | **状态**: Draft for Review
> **关联文档**: [双路径产品战略分析报告](./QUANTMATE_DUAL_PATH_STRATEGY_ANALYSIS_V1.md) | [Phase 1 PRD](./PRD_PHASE1_WORKFLOW_CLOSURE_V1.md)
> **前置依赖**: Phase 1 工作流闭环已上线且稳定

---

## 目录

1. [概述与目标](#1-概述与目标)
2. [PRD-6: 可视化策略构建器 + NL 策略生成](#2-prd-6-可视化策略构建器--nl-策略生成)
3. [PRD-7: AutoPilot 2.0 — 多 Agent 自主策略研发](#3-prd-7-autopilot-20--多-agent-自主策略研发)
4. [PRD-8: AI 驱动策略优化](#4-prd-8-ai-驱动策略优化)
5. [PRD-9: 因子研究增强](#5-prd-9-因子研究增强)
6. [技术架构变更](#6-技术架构变更)
7. [验收测试总览](#7-验收测试总览)

---

## 1. 概述与目标

### 1.1 Phase 2 目标

在 Phase 1 工作流闭环的基础上，实现 AI 的深度产品化集成：

1. **路径一**：从"AI 辅助聊天"升级为"AI 驱动的策略开发体验"——可视化构建器 + 自然语言交互 + 智能优化建议
2. **路径二**：从"单 RD-Agent 因子挖掘"升级为"多 Agent 协作的自主策略研发"——因子挖掘 → 策略生成 → 回测 → 优化 → 模拟交易的完整自主循环

### 1.2 成功指标

| 指标 | Phase 1 基线（预估） | Phase 2 目标 |
|------|---------------------|-------------|
| 非技术用户可独立完成策略开发 | 0%（需写 Python 代码） | ≥ 30%（通过可视化构建器或 NL） |
| AI 自主完成完整策略研发的数量 | 0 | ≥ 10 个/月（通过 AutoPilot 2.0） |
| 策略优化效率提升 | 基线 | 3x（RL 优化 vs 传统网格搜索） |
| 预计算因子使用率 | 0%（没有预计算因子库） | ≥ 50% 的策略使用了预计算因子 |
| 自然语言策略创建占比 | 0% | ≥ 20% 的新策略通过 NL 创建 |

---

## 2. PRD-6: 可视化策略构建器 + NL 策略生成

### 2.1 需求概述

为路径一提供两种新的策略创建方式，降低策略开发门槛：

1. **可视化策略构建器**（Visual Strategy Builder）：拖拽式、低代码
2. **自然语言策略生成**（NL → Strategy）：用自然语言描述交易想法，AI 自动生成策略

### 2.2 功能需求 — 可视化策略构建器

#### F6.1: 可视化画布

**入口**: Workbench 策略构建阶段 → "可视化构建" Tab / Strategies 页面 → "可视化构建"按钮

**画布布局**:

```
┌─────────────────────────────────────────────────────────────────────┐
│  可视化策略构建器                              [代码预览] [保存] [回测] │
├────────────┬──────────────────────────────┬──────────────────────────┤
│            │                              │                          │
│  组件面板   │        策略画布               │     属性配置面板          │
│            │                              │                          │
│  📊 选股    │  ┌────────────┐              │  名称: 网格策略           │
│  ├─市值过滤  │  │ 选股：中盘股  │              │                          │
│  ├─PE过滤   │  │ 市值 50-200亿 │              │  参数:                   │
│  ├─成交量过滤 │  └─────┬──────┘              │  网格层数: 10             │
│  ├─行业过滤  │        │                     │  网格间距: 2%             │
│  └─自定义   │        ▼                     │  单层仓位: 10%            │
│            │  ┌────────────┐              │                          │
│  📈 择时    │  │ 择时：布林带  │              │  [应用]                   │
│  ├─均线交叉  │  │ 下轨买入     │              │                          │
│  ├─布林带   │  │ 上轨卖出     │              │                          │
│  ├─MACD    │  └─────┬──────┘              │                          │
│  ├─RSI     │        │                     │                          │
│  └─自定义   │        ▼                     │                          │
│            │  ┌────────────┐              │                          │
│  ⚖️ 仓位管理 │  │ 仓位：等权重  │              │                          │
│  ├─等权重   │  │ 单票仓位10%  │              │                          │
│  ├─Kelly   │  └─────┬──────┘              │                          │
│  ├─风险平价 │        │                     │                          │
│  └─自定义   │        ▼                     │                          │
│            │  ┌────────────┐              │                          │
│  🛡️ 风控    │  │ 风控：ATR止损 │             │                          │
│  ├─固定止损  │  │ 止损2倍ATR   │             │                          │
│  ├─ATR止损  │  │ 回撤>15%清仓 │             │                          │
│  ├─回撤清仓 │  └────────────┘              │                          │
│  └─自定义   │                              │                          │
│            │                              │                          │
└────────────┴──────────────────────────────┴──────────────────────────┘
```

**交互规则**:
- 左侧组件面板：分类展示可用策略组件（选股/择时/仓位/风控），拖拽到画布
- 中间画布：展示策略流程，节点可通过连线调整数据流
- 右侧属性面板：选中节点后显示可配置参数
- 底部"代码预览"标签：实时显示生成的策略代码

**组件注册机制**:

```python
# 每个组件是一个注册的可复用模块
@register_strategy_component(
    category="timing",
    name="布林带突破",
    description="价格突破布林带上轨买入，跌破下轨卖出",
    icon="bollinger"
)
class BollingerBreakoutComponent:
    params: {
        "period": {"type": "int", "default": 20, "min": 5, "max": 100},
        "std_multiplier": {"type": "float", "default": 2.0, "min": 1.0, "max": 3.0},
    }
    outputs: ["buy_signal", "sell_signal"]
```

#### F6.2: 代码生成

**目标**: 可视化画布配置 → 可执行的策略代码

**策略代码类型支持**:
1. vnpy CTA 策略代码（`.py`）
2. Qlib 模型配置（`.yaml` + 训练脚本）

**生成质量**:
- 代码通过现有 `strategy_code/lint` 接口校验，0 error
- 包含完整的参数注释和风险提示

### 2.3 功能需求 — 自然语言策略生成

#### F6.3: NL → 策略

**入口**: Workbench 策略构建阶段 / Strategies 页面 → "用自然语言描述"输入框

**交互流程**:

```
用户输入:
"创建一个基于中证500成分股的动量策略，20日涨幅排名前20%买入，
 持有10个交易日，单票仓位不超过15%，整体回撤超过10%清仓"

         │
         ▼
┌──────────────────────────────────────┐
│ Step 1: NL 解析                       │
│ LLM 提取结构化参数:                    │
│ {                                     │
│   "universe": "中证500成分股",          │
│   "signal": "20日动量排名前20%",        │
│   "holding_period": 10,               │
│   "position_limit": 0.15,             │
│   "risk_rule": "整体回撤>10%清仓"       │
│ }                                     │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Step 2: 策略预览（确认界面）             │
│ - 结构化参数展示（用户可修改）           │
│ - 策略逻辑说明（自然语言回译）            │
│ - 生成策略代码预览                      │
│                                        │
│ [确认并保存]  [修改描述]  [取消]         │
└────────────┬─────────────────────────┘
             │ 用户确认
             ▼
┌──────────────────────────────────────┐
│ Step 3: 策略创建                       │
│ - 保存策略记录                         │
│ - 关联因子（如果涉及）                   │
│ - 返回策略 ID                          │
└──────────────────────────────────────┘
```

**LLM Prompt 模板**:
```
你是一个量化交易策略专家。请根据用户的自然语言描述，提取策略参数并生成策略代码。

用户描述: {user_input}

可用因子库: {available_factors}
可用策略模板: {available_templates}

请输出 JSON:
{
  "strategy_name": "策略名称",
  "strategy_type": "cta" | "qlib",
  "universe": { "type": "index", "value": "000905.SH" },
  "factors": ["factor_name1", ...],
  "entry_conditions": [...],
  "exit_conditions": [...],
  "position_rules": {...},
  "risk_rules": [...],
  "explanation": "策略逻辑的自然语言说明",
  "limitations": ["已知局限1", "已知局限2"],
  "code": "生成的策略代码"
}
```

### 2.4 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC6.1 | 可视化构建器左侧展示分类组件面板（选股/择时/仓位/风控 ≥ 4类），每类 ≥ 3 个预设组件 | P0 |
| AC6.2 | 用户可从组件面板拖拽组件到画布，在画布上连接节点形成策略流程 | P0 |
| AC6.3 | 选中节点后右侧属性面板展示可配置参数，修改后实时生效 | P0 |
| AC6.4 | 可视化构建的策略能生成通过 lint 检查的 vnpy CTA 代码 | P0 |
| AC6.5 | NL 输入框支持用户用自然语言描述交易策略 | P0 |
| AC6.6 | NL 解析后展示结构化参数预览 + 策略逻辑说明 + 代码预览的三步确认界面 | P0 |
| AC6.7 | NL 描述不明确时，系统追问缺失参数（如未说明止损方式） | P0 |
| AC6.8 | 可视化构建器和 NL 生成都包含"已知局限"提示（如策略未考虑流动性、未考虑交易成本等） | P1 |
| AC6.9 | 支持开发者通过 `@register_strategy_component` 注册自定义组件 | P1 |
| AC6.10 | NL 策略生成成功率 ≥ 85%（用户自然语言 → 可保存的有效策略） | P1 |

---

## 3. PRD-7: AutoPilot 2.0 — 多 Agent 自主策略研发

### 3.1 需求概述

将当前单 RD-Agent 因子挖掘扩展为多 Agent 协作的自主策略研发系统。Agent 团队模拟量化研究团队的角色分工，从研究目标设定到策略交付全流程自主完成。

### 3.2 架构设计

#### F7.1: Multi-Agent 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    AutoPilot 2.0 架构                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户设定研究目标                                                  │
│  "寻找适合当前震荡市的低回撤策略，Sharpe > 1.5, MaxDD < 15%"         │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Orchestrator Agent（调度 Agent）              │    │
│  │                                                          │    │
│  │  职责: 解析目标 → 分解子任务 → 分配 → 收集结果 → 汇总报告    │    │
│  │  状态: 维护全局研究状态、Agent 注册表、任务队列               │    │
│  └───┬──────────┬──────────┬──────────┬───────────────────┘     │
│      │          │          │          │                          │
│  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐                        │
│  │Factor │ │Strat. │ │Backtest│ │ Risk  │                        │
│  │Agent  │ │Agent  │ │Agent   │ │Agent  │                        │
│  │       │ │       │ │        │ │       │                        │
│  │因子挖掘│ │策略合成│ │回测执行 │ │风险评估│                        │
│  │因子评估│ │代码生成│ │参数优化 │ │合规检查│                        │
│  │因子组合│ │模板匹配│ │结果分析 │ │压力测试│                        │
│  └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘                        │
│      │         │         │         │                              │
│      └─────────┴────┬────┴─────────┘                              │
│                     │                                             │
│          ┌──────────▼──────────┐                                  │
│          │   Shared Memory      │                                  │
│          │   (共享知识库)         │                                  │
│          │                     │                                  │
│          │ - 历史因子表现数据库   │                                  │
│          │ - 策略回测结果库      │                                  │
│          │ - 市场状态-策略映射库  │                                  │
│          │ - Agent 经验积累     │                                  │
│          └─────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### F7.2: Agent 角色定义

**Orchestrator Agent（调度器）**

| 属性 | 值 |
|------|-----|
| 模型 | GPT-4o / Claude Opus（可配置） |
| 输入 | 用户研究目标（自然语言） + 市场上下文 |
| 输出 | 子任务分解 + 任务分配 + 最终报告 |
| 工具 | `assign_task()`, `collect_results()`, `evaluate_progress()`, `generate_report()` |
| 决策能力 | 判断研究是否达到目标；决定是否需要额外迭代；任务优先级排序 |

**Factor Agent（因子研究员）**

| 属性 | 值 |
|------|-----|
| 模型 | GPT-4o / DeepSeek（可配置） |
| 输入 | 研究目标 + 市场上下文 + 历史有效因子 |
| 输出 | 候选因子表达式 + IC 评估 + 因子组合建议 |
| 工具 | RD-Agent 核心引擎, `evaluate_factor()`, `combine_factors()`, `screen_factors()` |
| 决策能力 | 判断因子是否有效；选择因子挖掘方向；决定是否需要更多数据 |

**Strategy Agent（策略工程师）**

| 属性 | 值 |
|------|-----|
| 模型 | GPT-4o / Claude Opus（可配置） |
| 输入 | 已验证因子 + 策略需求 + 可用模板 |
| 输出 | 策略代码 + 策略配置 + 策略说明 |
| 工具 | `generate_strategy_code()`, `match_template()`, `optimize_params()` |
| 决策能力 | 选择合适策略模板；判断代码质量；决定是否需要重构 |

**Backtest Agent（回测分析师）**

| 属性 | 值 |
|------|-----|
| 模型 | Claude Sonnet（性价比优先，可配置） |
| 输入 | 策略代码/配置 + 回测区间 + 标的列表 |
| 输出 | 回测统计 + 过拟合评估 + 优化建议 |
| 工具 | 回测引擎 API, `analyze_results()`, `detect_overfitting()`, `suggest_optimization()` |
| 决策能力 | 判断回测结果是否可信；识别数据挖掘偏误 |

**Risk Agent（风控官）**

| 属性 | 值 |
|------|-----|
| 模型 | Claude Sonnet（可配置） |
| 输入 | 策略逻辑 + 回测结果 + 市场环境 |
| 输出 | 风险评估报告 + 风控建议 + 合规检查 |
| 工具 | `compute_var()`, `stress_test()`, `scenario_analysis()` |
| 决策能力 | 判断风险是否可控；否决高风险策略 |

#### F7.3: Agent 通信协议

```python
# Agent 间消息格式
class AgentMessage:
    id: str
    from_agent: str          # "factor_agent"
    to_agent: str             # "strategy_agent" | "orchestrator" | "broadcast"
    type: str                 # "task_assign" | "result" | "query" | "feedback"
    payload: dict             # 具体数据
    priority: int             # 1-5, 5=最高
    correlation_id: str       # 关联同一个研究目标
    timestamp: datetime

# Shared Memory 访问
class MemoryQuery:
    query_type: str           # "similar_factors" | "market_regime" | "strategy_performance"
    filters: dict
    limit: int
```

#### F7.4: 研究目标设定界面

**入口**: AutoPilot 页面 → "新建研究目标"

**表单**:

```
┌──────────────────────────────────────────────────────────────┐
│  新建自主研究目标                                              │
│                                                               │
│  目标描述（自然语言）*                                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 寻找适合当前震荡市的低回撤策略，目标 Sharpe > 1.5，          │ │
│  │ 最大回撤 < 15%，适用标的：沪深300成分股                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                               │
│  约束条件                                                      │
│  □ 仅使用量价因子（不使用财务因子——降低过拟合风险）               │
│  □ 策略必须包含止损逻辑                                         │
│  □ 单策略最大持仓股票数: [20]                                   │
│                                                               │
│  研究深度                                                      │
│  ○ 快速探索（~2 小时，3-5 轮迭代）                              │
│  ● 标准研究（~8 小时，10-15 轮迭代）                            │
│  ○ 深度研究（~24 小时，30+ 轮迭代）                             │
│                                                               │
│  结果交付                                                      │
│  ☑ 自动部署 Top-3 策略到模拟交易                                │
│  □ 生成完整研究报告（PDF）                                      │
│                                                               │
│  [开始研究]                                                    │
└──────────────────────────────────────────────────────────────┘
```

#### F7.5: 研究过程监控

**实时进度面板**:

```
┌──────────────────────────────────────────────────────────────┐
│  研究进度: 寻找震荡市低回撤策略                                  │
│  状态: ● 运行中 | 已运行 3h 24m | 预计剩余 4h                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Orchestrator 日志:                                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [14:32] 目标分解完成，已分配4个子任务                         │ │
│  │ [14:35] Factor Agent 开始第1轮因子挖掘                       │ │
│  │ [15:10] Factor Agent 发现5个候选因子 (IC: 0.03-0.05)         │ │
│  │ [15:12] Strategy Agent 开始基于因子构建策略                   │ │
│  │ [15:45] Strategy Agent 生成3个策略候选                       │ │
│  │ [16:02] Backtest Agent 完成第1轮回测                        │ │
│  │ [16:05] Risk Agent 对策略#2提出风控改进建议                    │ │
│  │ [16:20] Strategy Agent 优化策略#2，改进止损逻辑               │ │
│  │ [17:12] 第2轮回测完成，Sharpe 1.62，MaxDD 12.3%              │ │
│  │ [17:15] 开始第3轮迭代...                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                               │
│  已发现策略:                          [按Sharpe排序 ▼]         │
│  ┌────┬──────────────────┬────────┬────────┬────────┬──────┐ │
│  │ #  │ 策略名称          │ Sharpe │ MaxDD  │ 年化收益│ 状态  │ │
│  ├────┼──────────────────┼────────┼────────┼────────┼──────┤ │
│  │ 1  │ GridMA_Strategy  │ 1.71   │ 11.8%  │ 23.5%  │ ✅   │ │
│  │ 2  │ BB_RSI_Strategy  │ 1.62   │ 12.3%  │ 20.1%  │ ✅   │ │
│  │ 3  │ MomReversal_Stgy │ 1.35   │ 16.2%  │ 25.8%  │ ⚠️   │ │
│  └────┴──────────────────┴────────┴────────┴────────┴──────┘ │
│                                                               │
│  [暂停研究] [查看详细日志] [提前终止并导出结果]                     │
└──────────────────────────────────────────────────────────────┘
```

#### F7.6: Agent 间消息流示例

```
研究开始:

1. Orchestrator → Factor Agent:
   "目标: 震荡市低回撤策略。市场上下文: 沪深300, 过去3个月波动率15%,
    处于横盘震荡。请挖掘或识别适合震荡市的因子。"

2. Factor Agent → Shared Memory (Query):
   "查询历史在震荡市中 IC > 0.03 的因子"

3. Factor Agent → Orchestrator:
   "发现5个候选因子: [vol_ratio_20d(IC=0.045), rsi_reversal_14d(IC=0.038),
    bb_width(IC=0.041), turnover_ma(IC=0.035), amplitude_ratio(IC=0.031)]"

4. Orchestrator → Strategy Agent:
   "基于以下因子构建策略: [...]。要求: 适合震荡市、低回撤、包含止损"

5. Strategy Agent → Orchestrator:
   "生成3个策略候选: [GridMA, BB_RSI, MomReversal]"

6. Orchestrator → Backtest Agent:
   "对3个策略候选进行回测。区间: 2023-01-01至2025-12-31。标的: 沪深300 Top-50"

7. Backtest Agent → Orchestrator:
   "回测结果: GridMA(Sharpe=1.71, MaxDD=11.8%), BB_RSI(Sharpe=1.62, 12.3%),
    MomReversal(Sharpe=1.35, MaxDD=16.2%)"

8. Orchestrator → Risk Agent:
   "评估MomReversal策略为何回撤超标，给出改进建议"

9. Risk Agent → Orchestrator:
   "MomReversal在2024年2月市场急跌时回撤超标。建议: 增加波动率过滤器，
    在VIX/波动率>阈值时降低仓位"

10. Orchestrator → Strategy Agent:
    "根据Risk Agent建议优化MomReversal策略"

... (迭代继续直到目标达成或时间耗尽)
```

### 3.3 后端架构

**技术栈选择**:
- Agent 框架：基于 RD-Agent 的 CoSTEER 扩展（Workspace + Tool Registry + Model Pool）
- Agent 通信：Redis Streams（发布/订阅 + 消费者组）
- Shared Memory：MySQL（结构化数据，如因子表现、策略结果）+ ChromaDB/pgvector（语义检索，如相似市场状态）
- LLM 调用：通过 `OPENCODE_AI_API_KEY` 统一入口，支持多模型路由

**新增数据库表**:

```sql
-- agent_research_runs: 研究运行记录
CREATE TABLE agent_research_runs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    goal            TEXT NOT NULL,
    constraints     JSON,
    depth           ENUM('quick','standard','deep') DEFAULT 'standard',
    status          ENUM('pending','running','paused','completed','failed') DEFAULT 'pending',
    orchestrator_log JSON,  -- 调度 Agent 的操作日志
    final_report    TEXT,
    started_at      TIMESTAMP NULL,
    completed_at    TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- agent_messages: Agent 间通信记录
CREATE TABLE agent_messages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id          INT NOT NULL,
    from_agent      VARCHAR(64) NOT NULL,
    to_agent        VARCHAR(64) NOT NULL,
    msg_type        VARCHAR(32) NOT NULL,
    payload         JSON NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_run (run_id)
);

-- agent_discoveries: Agent 发现/产出
CREATE TABLE agent_discoveries (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    run_id          INT NOT NULL,
    agent_type      VARCHAR(64) NOT NULL,
    discovery_type  ENUM('factor','strategy','insight','warning') NOT NULL,
    content         JSON NOT NULL,
    quality_score   DECIMAL(5,3),
    imported        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC7.1 | 用户可通过自然语言设定研究目标（目标描述 + 约束条件 + 研究深度 + 结果交付方式） | P0 |
| AC7.2 | Orchestrator Agent 自动将目标分解为子任务并分配给对应 Agent | P0 |
| AC7.3 | Factor Agent 基于 RD-Agent 引擎自动挖掘和评估因子 | P0 |
| AC7.4 | Strategy Agent 基于验证通过的因子自动生成策略代码 | P0 |
| AC7.5 | Backtest Agent 自动执行回测并返回结果 | P0 |
| AC7.6 | Risk Agent 评估策略风险并提供改进建议 | P0 |
| AC7.7 | 研究过程实时可见（Orchestrator 日志 + 已发现策略列表 + 各 Agent 状态） | P0 |
| AC7.8 | 用户可随时暂停/继续/终止研究 | P0 |
| AC7.9 | 研究完成后生成汇总报告（目标达成情况 + 策略列表 + 建议） | P0 |
| AC7.10 | 标准深度研究（10-15 轮迭代）在 8 小时内完成 | P1 |
| AC7.11 | 发现策略可一键导入到用户策略库 | P1 |
| AC7.12 | 研究日志和 Agent 消息可完整回溯 | P1 |

---

## 4. PRD-8: AI 驱动策略优化

### 4.1 需求概述

从传统参数搜索（Grid/Random/Bayesian）升级为 AI 驱动的智能优化，包括：
1. 过度拟合检测与预警
2. 自适应参数优化（RL 驱动）
3. 因子衰减监控与预警
4. Walk-Forward 分析增强

### 4.2 功能需求

#### F8.1: 过度拟合检测

**检测维度**:

| 检测项 | 方法 | 阈值 |
|--------|------|------|
| Deflated Sharpe Ratio | 多次抽样后计算 P(Sharpe > 0) | DSR < 0.05 = 过拟合风险高 |
| 参数敏感度 | 参数 ±10% 后 Sharpe 变化率 | 变化 > 30% = 不稳定 |
| 样本内外比 | WF-E = 样本外 Sharpe / 样本内 Sharpe | < 0.5 = 过拟合 |
| 交易次数 | 策略交易次数 < 30 笔 | 统计不显著风险 |

**展示方式**: 回测结果页 → "过拟合检测" 区域 → 四项检查结果 + 综合评分（A/B/C/D）

**主动告警**: 综合评分 C 或 D 时，Copilot 主动推送过拟合风险警告

#### F8.2: 自适应参数优化 (RL-based)

**目标**: 替代传统 Grid/Random Search，使用 RL 进行参数优化

**方法**: PPO 驱动的自适应参数搜索

```
传统网格搜索:                          RL 优化:
                                        
参数A: [1,2,3,4,5]                    ┌──────────────────┐
参数B: [0.1,0.2,0.3]                  │ RL Agent          │
参数C: [10,20,30]                     │                   │
       ↓                              │ State: 回测指标    │
45 种组合 × 每次 5min = 3.75h          │ Action: 调整参数   │
                                       │ Reward: Sharpe↑   │
                                       │         MaxDD↓   │
                                       └──────────────────┘
                                                  ↓
                                       自适应收敛到最优参数
                                       平均 30-50 次回测 (vs 45+)
                                       且可处理连续参数空间
```

**接口**:

```
POST /api/v1/strategies/{id}/rl-optimize
  Body: {
    param_ranges: { param_name: [min, max], ... },
    objective: "sharpe" | "calmar" | "sortino" | "custom",
    constraints: { max_drawdown?: float, min_trades?: int },
    max_iterations: int,  // 默认 50
    backtest_period: { start: date, end: date },
    symbols: string[]
  }
  Response: { optimization_job_id: int }
```

**结果展示**: 参数收敛路径图 + 最优参数组合 + 与传统方法对比

#### F8.3: 因子衰减监控

**功能**: 持续追踪已部署策略中使用的因子表现，检测 IC 衰减趋势。

**监控指标**:
- 因子 IC 20日滚动均值的趋势
- IC 衰减速率（线性回归斜率）
- 因子换手率变化

**告警规则**:
- IC 20日滚动均值跌破 0.01 → 🟡 预警
- IC 月度衰减率 > 20% → 🟠 警告
- IC 连续 2 个月负值 → 🔴 严重

**用户通知**:
```
📊 因子衰减预警

策略 "TripleMA_Strategy" 中使用的因子 "momentum_20d" 出现衰减：
- 近3月 IC: 0.045 → 0.028 → 0.015
- 月度衰减率: 27%
- 建议: 考虑替换为 "momentum_60d" (IC=0.042) 或 "rsi_reversal_14d" (IC=0.038)

[查看详情] [替换因子] [忽略]
```

### 4.3 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC8.1 | 回测结果页展示过度拟合检测结果（DSR + 参数敏感度 + 样本内外比 + 交易次数） | P0 |
| AC8.2 | 过拟合综合评分 < C 时，页面展示风险警告 | P0 |
| AC8.3 | RL 参数优化接口可用，支持连续参数空间搜索 | P1 |
| AC8.4 | RL 优化结果展示参数收敛路径图和最优参数组合 | P1 |
| AC8.5 | 因子衰减监控页面展示已用因子的 IC 趋势和衰减速率 | P1 |
| AC8.6 | 因子衰减触发阈值时，推送站内通知 | P1 |
| AC8.7 | 因子衰减通知包含替代因子建议，用户可一键替换 | P2 |

---

## 5. PRD-9: 因子研究增强

### 5.1 需求概述

提升 Factor Lab 的研究能力，主要包括：
1. 因子表达式 DSL（降低因子开发门槛）
2. 预计算因子库（≥ 500 个常用因子）
3. 因子看板（实时监控因子表现）

### 5.2 功能需求

#### F9.1: 因子表达式 DSL

**设计原则**: 参考 Qlib DSL，但针对 QuantMate 数据模型定制

**语法设计**:

```python
# 基础运算符
$close          # 收盘价
$open           # 开盘价
$high           # 最高价
$low            # 最低价
$volume         # 成交量
$amount         # 成交额
$vwap           # 均价

# 时间序列函数
Ref(x, d)       # d 天前的值
Mean(x, d)      # d 天均值
Std(x, d)       # d 天标准差
Max(x, d)       # d 天最大值
Min(x, d)       # d 天最小值
Sum(x, d)       # d 天累计
Corr(x, y, d)   # x 和 y 的 d 天相关系数
Cov(x, y, d)    # x 和 y 的 d 天协方差
Rank(x)         # 横截面排名 (0-1)
Scale(x)        # 横截面标准化 (Z-Score)
Delta(x, d)     # d 天变化量
ROC(x, d)       # d 天变化率

# 逻辑函数
If(cond, a, b)  # 条件选择
Abs(x)          # 绝对值
Log(x)          # 自然对数
Sign(x)         # 符号
Power(x, n)     # 幂
Sqrt(x)         # 平方根

# 示例表达式
# "20日动量因子"
ROC($close, 20)

# "布林带宽度"
(Mean($close, 20) + 2*Std($close, 20) - Mean($close, 20) + 2*Std($close, 20)) / Mean($close, 20)

# "量价背离因子"
Corr($close, $volume, 20)

# "反转因子"
-1 * ROC($close, 5)

# 等价简写版本
# "20日动量"
ROC(C, 20)

# "布林带宽度"
(MA(C,20) + 2*STD(C,20) - (MA(C,20) - 2*STD(C,20))) / MA(C,20)

# "量价背离"
CORR(C, V, 20)
```

**DSL 编辑器**:

Factor Lab 中新增 "表达式编辑器"：
- 左侧：表达式输入区（语法高亮 + 自动补全 + 实时语法检查）
- 右侧：因子预览（最近 N 个交易日的因子值表格 + 分布直方图）
- 底部：因子评估快捷按钮（一键计算 IC/ICIR）

**DSL 引擎**:

后端实现 DSL → Pandas 表达式编译器：

```python
class FactorDSLCompiler:
    """编译因子 DSL 表达式为可执行的 Pandas 操作"""
    
    TOKEN_MAP = {
        "C": "close", "O": "open", "H": "high", "L": "low",
        "V": "volume", "AMT": "amount", "VWAP": "vwap",
    }
    
    def compile(self, expression: str) -> FactorExpression:
        # Tokenize → Parse → Validate → Generate Pandas code
        ...
    
    def preview(self, expression: str, symbol: str, days: int = 60) -> pd.Series:
        # 编译并计算预览值
        ...
```

#### F9.2: 预计算因子库

**因子分类与数量**:

| 类别 | 因子数 | 示例 |
|------|--------|------|
| 动量因子 | ~80 | 5/10/20/60/120/250 日收益率、alpha 动量、残差动量 |
| 波动率因子 | ~60 | 历史波动率(多周期)、波动率变化率、振幅 |
| 成交量因子 | ~70 | 成交量比、换手率、量价相关、成交量突破 |
| 技术指标因子 | ~100 | MA/MACD/RSI/KDJ/BOLL 的各种变形 |
| 基本面因子 | ~80 | PE/PB/PS/PCF/ROE/ROA/毛利率的各种变形和衍生 |
| 情绪因子 | ~50 | 融资融券、北向资金、大宗交易 |
| 规模与流动性因子 | ~40 | 市值、流通市值、Amihud非流动性、买卖价差 |
| Qlib 内置因子 | ~100 | Alpha158/360/WQ101/GTJA191 中的精选因子 |
| **总计** | **~580** | |

**预计算策略**:

- 通过 DataSync 每日自动增量更新（新增交易日数据 → 增量计算因子）
- 全量回填通过 backfill 任务执行
- 因子值存储在 `factor_cache` 数据库表中，支持按 `(factor_name, ts_code, trade_date)` 快速查询

**数据库设计**:

```sql
CREATE TABLE factor_cache (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    factor_name VARCHAR(128) NOT NULL,
    ts_code     VARCHAR(32) NOT NULL,
    trade_date  DATE NOT NULL,
    value       DOUBLE DEFAULT NULL,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY ux_factor_cache (factor_name, ts_code, trade_date),
    INDEX idx_factor_date (factor_name, trade_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### F9.3: 因子看板

**入口**: Factor Lab → "因子看板" Tab

**内容**:
- 因子分类树（左侧导航）
- 选中分类/因子的表现总览：
  - IC 趋势图（可多因子对比）
  - 分组收益曲线（Top/Bottom 组）
  - 行业中性化前后对比
  - 因子相关性热力图
- 异常检测标注（IC 突降、相关性突增）

### 5.3 Acceptance Criteria

| AC# | 验收条件 | 优先级 |
|-----|----------|--------|
| AC9.1 | DSL 编辑器支持语法高亮、自动补全和实时语法检查 | P0 |
| AC9.2 | DSL 表达式可实时预览最近 60 个交易日的因子值 | P0 |
| AC9.3 | DSL 编译器支持全部定义的运算符和函数 | P0 |
| AC9.4 | 预计算因子库包含 ≥ 500 个因子，覆盖 5 个以上分类 | P0 |
| AC9.5 | 预计算因子每日自动增量更新，数据延迟 ≤ T+1 | P0 |
| AC9.6 | Factor Lab 中可直接搜索和使用预计算因子（无需手动定义表达式） | P0 |
| AC9.7 | 因子看板展示 IC 趋势图、分组收益曲线和行业中性化对比 | P1 |
| AC9.8 | 因子看板支持多因子对比（最多 5 个同时展示） | P1 |
| AC9.9 | DSL 表达式的执行性能 ≤ 500ms（5000 只股票 × 252 个交易日） | P1 |

---

## 6. 技术架构变更

### 6.1 新增组件

| 组件 | 技术选型 | 用途 |
|------|----------|------|
| Agent Runtime | 基于 RD-Agent CoSTEER 扩展 | 多 Agent 运行环境 |
| Agent Message Bus | Redis Streams | Agent 间异步通信 |
| Vector Store | pgvector (PostgreSQL) 或 ChromaDB | Shared Memory 语义检索 |
| DSL Compiler | 自研 Python | 因子表达式 DSL 编译 |
| Factor Cache Store | MySQL `factor_cache` 表 | 预计算因子值存储 |
| RL Optimizer | stable-baselines3 (PPO) | 自适应参数优化 |

### 6.2 新增 RQ 队列

| 队列 | 用途 | 并发 |
|------|------|------|
| `agent` | Agent 消息处理 | 5 |
| `factor_compute` | 预计算因子批量计算 | 3 |

### 6.3 前端新页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 可视化策略构建器 | `/strategies/builder` | 拖拽式策略构建 |
| NL策略生成 | `/strategies/builder?mode=nl` | 自然语言策略生成 |
| AutoPilot研究 | `/auto-pilot/research/:runId` | 研究进度监控 |
| 因子看板 | `/factor-lab/dashboard` | 因子表现监控 |

---

## 7. 验收测试总览

### 7.1 端到端测试场景

| # | 场景 | 预期结果 | 涉及 PRD |
|---|------|----------|----------|
| E1 | 非技术用户通过可视化构建器创建并回测策略 | 拖拽组件 → 配置参数 → 生成代码 → 回测成功 | PRD-6 |
| E2 | 用户用自然语言描述策略并保存 | 输入 NL → 参数预览 → 确认保存 → 代码通过 lint | PRD-6 |
| E3 | AutoPilot 2.0 标准深度研究 | 设定目标 → 多 Agent 协作 → 10+ 轮迭代 → 交付 ≥ 3 个策略 | PRD-7 |
| E4 | 回测过拟合检测 | 回测完成 → 四项检测指标展示 → 综合评分 | PRD-8 |
| E5 | 因子衰减监控 → 通知 → 替换 | 因子衰减触发告警 → 用户收到通知 → 一键替换因子 | PRD-8 |
| E6 | DSL表达式开发 → 因子评估 | 编写 DSL → 预览 → 评估 IC → 保存因子 | PRD-9 |
| E7 | 预计算因子 → 可视化策略构建 → 回测 | 选用预计算因子 → 构建策略 → 回测 | PRD-6,9 |

### 7.2 性能指标

| 指标 | 目标 |
|------|------|
| 可视化构建器画布渲染 | ≤ 1 秒 |
| DSL 表达式预览计算 | ≤ 500ms |
| NL 策略生成（端到端） | ≤ 30 秒 |
| RL 参数优化（50 轮） | ≤ 2 小时 |
| 预计算因子日增量更新 | ≤ 30 分钟 |
| Agent 间消息传递延迟 | ≤ 1 秒 |

---

> **下一步**: 技术设计文档（TDD）+ 技术原型验证（AutoPilot 2.0 多 Agent 协作 MVP）
> **Review 流程**: 产品经理 → 技术负责人 → AI/ML 负责人 → 前端 Lead → 后端 Lead
