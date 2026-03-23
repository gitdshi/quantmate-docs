# QuantMate 全量功能实现计划

> 生成日期: 2026-03-17
> 总计: 78 个 GitHub Issues (59 后端 + 19 前端)
> 里程碑: M1 → M2 → M3

---

## 约定

| 项目 | 规范 |
|------|------|
| 分支命名 | `feature/issue-{number}-{short-name}` |
| PR 策略 | 1 issue = 1 PR（原子化、可审查） |
| DB 迁移 | 手动 SQL 脚本 `mysql/migrations/{NNN}_{name}.sql` |
| 后端 repo | gitdshi/quantmate (issues #2-#59) |
| 前端 repo | gitdshi/quantmate-portal (issues #1-#19) |

## 每个 PR 必须包含

- [ ] 功能代码实现
- [ ] 数据库迁移 SQL 脚本（如有表变更）
- [ ] 单元测试（pytest / vitest）
- [ ] 接口自动化测试（pytest + httpx / vitest + MSW）
- [ ] E2E 测试（Playwright，用户可见功能）
- [ ] 测试案例说明（docstring 或 tests/README.md）
- [ ] 相关文档更新

---

## Issue 编号映射

### 后端 (quantmate repo)

| Issue # | Priority | Module | Title |
|---------|----------|--------|-------|
| #2 | P1 | Security | 审计日志系统 (Audit Logging) |
| #3 | P1 | Security | 登录暴力破解防护 (Brute-force Protection) |
| #4 | P1 | Security | CSP 安全头 (Content Security Policy) |
| #5 | P1 | Data | 数据源开关管理 (Data Source Item Toggle) |
| #6 | P1 | Data | 自选股管理 (Watchlist Management) |
| #7 | P1 | Account | 用户详细资料 API (User Profile) |
| #8 | P1 | Portfolio | 投资组合后端 API (Portfolio Backend) |
| #9 | P1 | Reports | 交易日志 (Trade Audit Log) |
| #10 | P1 | Data | 周线/月线/指数日线同步 |
| #11 | P1 | Analytics | 分析仪表盘后端 API |
| #12 | P1 | Infra | API 分页支持 (Pagination) |
| #13 | P1 | Infra | API 版本化 /v1/ (Versioning) |
| #14 | P1 | Infra | 请求频率限制 (Rate Limiting) |
| #15 | P1 | Infra | 数据库迁移工具 (DB Migration) |
| #16 | P1 | Infra | 统一错误响应格式 (Error Codes) |
| #17 | P1 | Infra | GitHub Actions CI 流水线 |
| #18 | P2 | Account | MFA 多因素认证 |
| #19 | P2 | Account | API Key 管理 |
| #20 | P2 | Account | 会话管理 (Session Management) |
| #21 | P2 | Data | WebSocket 实时行情推送 |
| #22 | P2 | Data | 数据清洗与对齐增强 |
| #23 | P2 | Data | Tushare 扩展数据同步 |
| #24 | P2 | Data | AkShare 数据源集成 |
| #25 | P2 | Data | 分钟级数据存储与查询 |
| #26 | P2 | Strategy | 参数管理增强 |
| #27 | P2 | Strategy | 指标库扩展 |
| #28 | P2 | Backtest | 参数优化完善 |
| #29 | P2 | Backtest | 多周期回测 |
| #30 | P2 | Backtest | 回测报告导出 |
| #31 | P2 | Backtest | Walk-Forward / Monte Carlo |
| #32 | P2 | Portfolio | 仓位管理 |
| #33 | P2 | Portfolio | 风险预算 |
| #34 | P2 | Portfolio | 回撤监控与风险告警 |
| #35 | P2 | Trading | 模拟交易 (Paper Trading) |
| #36 | P2 | Trading | 订单管理 |
| #37 | P2 | Trading | 风控拦截与信号转订单 |
| #38 | P2 | Trading | 券商配置管理 |
| #39 | P2 | Monitoring | 告警规则引擎与通知 |
| #40 | P2 | Monitoring | 实时 P&L 监控 |
| #41 | P2 | Reports | 日报/周报/月报生成 |
| #42 | P2 | Reports | 绩效归因分析 |
| #43 | P2 | Settings | 系统参数配置 |
| #44 | P2 | Infra | 过期任务清理与 DLQ |
| #45 | P2 | Infra | 结构化日志 |
| #46 | P2 | Infra | 自动部署 Staging |
| #47 | P2 | Settings | CLI 工具 |
| #48 | P3 | AI | 策略代码生成与 NL 查询 |
| #49 | P3 | AI | 智能选股与情感分析 |
| #50 | P3 | AI | 异常检测与报告生成 |
| #51 | P3 | AI | 模型管理 |
| #52 | P3 | Strategy | 因子研究平台 |
| #53 | P3 | Strategy | 策略模板引擎 |
| #54 | P3 | Collaboration | 策略分享与团队空间 |
| #55 | P3 | Data | 多市场支持 HK/US |
| #56 | P3 | Trading | 实盘交易与算法执行 |
| #57 | P4 | Portfolio | VaR 计算与压力测试 |
| #58 | P4 | Collaboration | 模板市场与评分 |
| #59 | P1 | Account | KYC 身份验证 |

### 前端 (quantmate-portal repo)

| Issue # | Priority | Module | Title |
|---------|----------|--------|-------|
| #1 | P1 | Data | 数据源管理页面 |
| #2 | P1 | Infra | 前端测试覆盖 (Vitest) |
| #3 | P1 | Infra | API 分页适配 |
| #4 | P1 | Infra | GitHub Actions CI |
| #5 | P2 | Trading | 交易执行页面 |
| #6 | P2 | Monitoring | 监控告警页面 |
| #7 | P2 | Reports | 报告复盘页面 |
| #8 | P2 | Settings | 系统设置增强 |
| #9 | P2 | Strategy | 参数表单自动渲染 |
| #10 | P2 | Backtest | 参数优化结果可视化 |
| #11 | P2 | Account | 账户安全设置 (MFA/API Key/Sessions) |
| #12 | P2 | Data | WebSocket 实时行情集成 |
| #13 | P2 | Account | RBAC 权限 UI |
| #14 | P2 | Infra | 自动部署 Staging |
| #15 | P3 | AI | AI 助手页面 |
| #16 | P3 | Strategy | 因子研究页面 |
| #17 | P3 | Collaboration | 团队空间页面 |
| #18 | P3 | Strategy | 可视化探索工具 |
| #19 | P4 | Collaboration | 模板市场页面 |

---

## 实施阶段

### Phase 1: M1 基础设施 (Sprint 1)

**目标**: 搭建所有功能共同依赖的基础设施层

| 顺序 | Issue | Branch | 关键交付 | 依赖 |
|------|-------|--------|---------|------|
| 1.1 | #16 统一错误响应格式 | `feature/issue-16-error-codes` | 错误码枚举, 全局异常处理中间件, 统一响应格式 | 无 |
| 1.2 | #13 API 版本化 | `feature/issue-13-api-versioning` | /api/v1/ 前缀, 旧路径 301 重定向, 前端更新 | 1.1 |
| 1.3 | #12 API 分页 | `feature/issue-12-pagination` | 分页工具函数, 统一 meta 响应, 列表端点适配 | 1.2 |
| 1.4 | #14 频率限制 | `feature/issue-14-rate-limiting` | Redis 滑动窗口, 429+Retry-After | 1.1 |
| 1.5 | #15 数据库迁移 | `feature/issue-15-db-migration` | mysql/migrations/ 目录, baseline SQL, 文档 | 无 |

**验证标准**: 所有现有端点在 /api/v1/ 下正常工作，列表API返回分页meta，超限返回429

---

### Phase 2: M1 安全与账户 (Sprint 2)

**目标**: 建立安全基线，审计所有操作

| 顺序 | Issue | Branch | 关键交付 | 依赖 |
|------|-------|--------|---------|------|
| 2.1 | #2 审计日志 | `feature/issue-2-audit-logging` | audit_logs 表, 审计中间件, 查询/导出 API | Phase 1 |
| 2.2 | #3 暴力破解防护 | `feature/issue-3-brute-force` | Redis 计数+锁定, 审计日志集成 | 2.1 |
| 2.3 | #4 CSP 安全头 | `feature/issue-4-csp-headers` | Nginx CSP/安全头配置 | 无 |
| 2.4 | #7 用户资料 API | `feature/issue-7-user-profile` | user_profiles 表, GET/PUT API | Phase 1 |
| 2.5 | #59 KYC 身份验证 | `feature/issue-59-kyc` | KYC 表, 提交/审核流程 | 2.4 |

**验证标准**: 所有 API 调用产生审计记录，5次失败登录触发锁定，CSP 头存在

---

### Phase 3: M1 核心功能 + 前端 + CI (Sprint 3-5)

**目标**: 完成所有 P1 功能特性

#### Sprint 3: 数据功能

| 顺序 | Issue | Branch | 关键交付 |
|------|-------|--------|---------|
| 3.1 | #5 数据源开关 | `feature/issue-5-datasource-toggle` | data_source_items 表, 3个API, DataSync集成 |
| 3.2 | #6 自选股管理 | `feature/issue-6-watchlist` | 2 表, 6 个 CRUD 端点 |
| 3.3 | #10 周月线同步 | `feature/issue-10-weekly-monthly-sync` | 4 张新表, ingest 函数 |

#### Sprint 4: 组合/分析/报表

| 顺序 | Issue | Branch | 关键交付 |
|------|-------|--------|---------|
| 4.1 | #8 投资组合后端 | `feature/issue-8-portfolio-api` | 2 表, 4 端点 |
| 4.2 | #11 分析仪表盘 | `feature/issue-11-analytics-dashboard` | analytics 路由, 2 端点 |
| 4.3 | #9 交易日志 | `feature/issue-9-trade-audit-log` | trade_logs 表, 查询/导出 |

#### Sprint 5: 前端 M1 + CI

| 顺序 | Issue (Portal) | Branch | 关键交付 |
|------|-------|--------|---------|
| 5.1 | Portal#2 测试覆盖 | `feature/issue-2-vitest-tests` | API/Store/组件测试 >80% |
| 5.2 | Portal#3 分页适配 | `feature/issue-3-pagination` | 分页组件+列表适配 |
| 5.3 | Portal#1 数据源 UI | `feature/issue-1-datasource-ui` | 数据源配置页面 |
| 5.4 | Portal#4 Portal CI | `feature/issue-4-portal-ci` | .github/workflows/ci.yml |
| 5.5 | #17 Backend CI | `feature/issue-17-backend-ci` | .github/workflows/ci.yml |

**M1 完成验证**: 所有 P1 功能端到端可用，CI 流水线绿色，测试覆盖 >80%

---

### Phase 4: M2 账户/数据/策略/回测 (Sprint 6-9P)

#### Sprint 6: 账户安全

| Issue | Branch |
|-------|--------|
| #18 MFA | `feature/issue-18-mfa` |
| #19 API Key | `feature/issue-19-api-keys` |
| #20 会话管理 | `feature/issue-20-session-management` |

#### Sprint 7: 数据扩展

| Issue | Branch |
|-------|--------|
| #23 Tushare 扩展 | `feature/issue-23-tushare-expansion` |
| #24 AkShare 集成 | `feature/issue-24-akshare-integration` |
| #22 数据清洗 | `feature/issue-22-data-cleaning` |
| #25 分钟级数据 | `feature/issue-25-minute-data` |
| #21 WebSocket | `feature/issue-21-websocket-market` |

#### Sprint 8: 策略增强

| Issue | Branch |
|-------|--------|
| #26 参数管理 | `feature/issue-26-param-management` |
| #27 指标库 | `feature/issue-27-indicator-library` |

#### Sprint 9: 回测增强

| Issue | Branch |
|-------|--------|
| #28 参数优化 | `feature/issue-28-param-optimization` |
| #29 多周期 | `feature/issue-29-multi-period` |
| #30 报告导出 | `feature/issue-30-report-export` |
| #31 WF/MC | `feature/issue-31-robustness-eval` |

#### Sprint 9P: 前端 M2 (Part 1)

| Issue (Portal) | Branch |
|-------|--------|
| Portal#9 参数表单 | `feature/issue-9-param-auto-form` |
| Portal#10 优化可视化 | `feature/issue-10-optim-visualization` |
| Portal#12 WebSocket | `feature/issue-12-portal-ws-market` |
| Portal#11 账户安全 | `feature/issue-11-portal-account-security` |

---

### Phase 5: M2 交易/组合/监控 (Sprint 10-13P)

#### Sprint 10: 交易系统

| Issue | Branch |
|-------|--------|
| #35 模拟交易 | `feature/issue-35-paper-trading` |
| #36 订单管理 | `feature/issue-36-order-management` |
| #37 风控拦截 | `feature/issue-37-risk-check` |
| #38 券商配置 | `feature/issue-38-broker-config` |

#### Sprint 11: 组合风控

| Issue | Branch |
|-------|--------|
| #32 仓位管理 | `feature/issue-32-position-sizing` |
| #33 风险预算 | `feature/issue-33-risk-budget` |
| #34 回撤监控 | `feature/issue-34-drawdown-monitoring` |

#### Sprint 12: 监控与报表

| Issue | Branch |
|-------|--------|
| #39 告警引擎 | `feature/issue-39-alert-engine` |
| #40 实时P&L | `feature/issue-40-realtime-pnl` |
| #41 日报周报 | `feature/issue-41-auto-reports` |
| #42 绩效归因 | `feature/issue-42-performance-attribution` |

#### Sprint 13: 设置与基建

| Issue | Branch |
|-------|--------|
| #43 系统参数 | `feature/issue-43-system-config` |
| #47 CLI 工具 | `feature/issue-47-cli-tools` |
| #44 任务清理 | `feature/issue-44-task-cleanup` |
| #45 结构化日志 | `feature/issue-45-structured-logging` |
| #46 自动部署 | `feature/issue-46-auto-deploy` |

#### Sprint 13P: 前端 M2 (Part 2)

| Issue (Portal) | Branch |
|-------|--------|
| Portal#5 交易页面 | `feature/issue-5-trading-page` |
| Portal#6 监控页面 | `feature/issue-6-monitoring-page` |
| Portal#7 报告页面 | `feature/issue-7-reports-page` |
| Portal#8 设置增强 | `feature/issue-8-settings-enhanced` |
| Portal#13 RBAC UI | `feature/issue-13-portal-rbac` |
| Portal#14 自动部署 | `feature/issue-14-portal-auto-deploy` |

---

### Phase 6: M3 AI 与高级策略 (Sprint 14-15P)

#### Sprint 14: AI 基础

| Issue | Branch |
|-------|--------|
| #51 模型管理 | `feature/issue-51-ai-model-mgmt` |
| #48 代码生成 | `feature/issue-48-ai-code-gen` |
| #49 智能选股 | `feature/issue-49-ai-stock-rec` |
| #50 异常检测 | `feature/issue-50-ai-anomaly` |

#### Sprint 15: 高级策略

| Issue | Branch |
|-------|--------|
| #52 因子研究 | `feature/issue-52-factor-lab` |
| #53 模板引擎 | `feature/issue-53-template-engine` |

#### Sprint 15P: 前端 M3

| Issue (Portal) | Branch |
|-------|--------|
| Portal#15 AI 助手 | `feature/issue-15-portal-ai-chat` |
| Portal#16 因子研究 | `feature/issue-16-portal-factor-lab` |
| Portal#18 可视化 | `feature/issue-18-portal-visual-explorer` |

---

### Phase 7: M3 协作/多市场/实盘 (Sprint 16-18P)

#### Sprint 16: 协作

| Issue | Branch |
|-------|--------|
| #54 策略分享 | `feature/issue-54-collaboration` |

#### Sprint 17: 高级交易与数据

| Issue | Branch |
|-------|--------|
| #55 多市场 | `feature/issue-55-multi-market` |
| #56 实盘交易 | `feature/issue-56-live-trading` |

#### Sprint 18: 高级分析

| Issue | Branch |
|-------|--------|
| #57 VaR | `feature/issue-57-var-stress-test` |
| #58 模板市场 | `feature/issue-58-marketplace` |

#### Sprint 18P: 前端 M3 (Part 2)

| Issue (Portal) | Branch |
|-------|--------|
| Portal#17 团队空间 | `feature/issue-17-portal-team-workspace` |
| Portal#19 模板市场 | `feature/issue-19-portal-marketplace` |

---

## 测试策略

### 后端测试

| 类型 | 目录 | 框架 | 覆盖目标 |
|------|------|------|---------|
| 单元测试 | `tests/unit/{module}/` | pytest | >80% |
| 接口测试 | `tests/integration/` | pytest + httpx AsyncClient | 全部 API 端点 |
| DataSync | `tests/datasync/` | pytest | 全部 ingest 函数 |
| 安全测试 | `tests/test_config_security.py` | pytest | Auth, 权限, 审计 |

命名规范: `test_{module}_{feature}.py`

### 前端测试

| 类型 | 目录 | 框架 | 覆盖目标 |
|------|------|------|---------|
| 单元测试 | `src/**/*.test.{ts,tsx}` | Vitest | >80% 核心模块 |
| 集成测试 | `src/test/integration.test.tsx` | Vitest + MSW | API 契约测试 |
| E2E 测试 | `e2e/*.spec.ts` | Playwright | 关键用户流程 |

### E2E 测试文件规划

| Feature | 文件 | 场景 |
|---------|------|------|
| Auth | `e2e/auth.spec.ts` | 登录, 注册, 锁定, MFA |
| Strategies | `e2e/strategies.spec.ts` | CRUD, 代码编辑, 版本历史 |
| Backtest | `e2e/backtest.spec.ts` | 运行, 结果, 导出 |
| Portfolio | `e2e/portfolio.spec.ts` | 持仓, 交易, P&L |
| Trading | `e2e/trading.spec.ts` | 模拟交易, 订单管理 |
| Data | `e2e/data.spec.ts` | 源配置, 自选股, 行情 |
| Settings | `e2e/settings.spec.ts` | 系统配置, 账户安全 |
| Reports | `e2e/reports.spec.ts` | 生成, 查看, 导出 |

---

## SQL 迁移策略

- 目录: `mysql/migrations/`
- 命名: `{NNN}_{feature_name}.sql`
- 每文件包含:
  ```sql
  -- Migration: {NNN} {description}
  -- Date: YYYY-MM-DD
  -- Issue: #{issue_number}
  -- Forward DDL + Default Data
  ```

### 新建表清单 (按实施顺序)

| Phase | # | 表名 | 数据库 |
|-------|---|------|--------|
| 2 | 1 | audit_logs | quantmate |
| 2 | 2 | user_profiles | quantmate |
| 2 | 3 | kyc_records | quantmate |
| 3 | 4 | data_source_items | quantmate |
| 3 | 5 | stock_weekly | tushare |
| 3 | 6 | stock_monthly | tushare |
| 3 | 7 | index_daily | tushare |
| 3 | 8 | portfolio_transactions | quantmate |
| 3 | 9 | portfolio_snapshots | quantmate |
| 3 | 10 | trade_logs | quantmate |
| 4 | 11 | mfa_settings | quantmate |
| 4 | 12 | api_keys | quantmate |
| 4 | 13 | user_sessions | quantmate |
| 4 | 14-22 | money_flow, fina_indicator 等 9 表 | tushare |
| 4 | 23-24 | stock_zh_index_spot, fund_etf_daily | akshare |
| 4 | 25 | indicator_configs | quantmate |
| 4 | 26 | optimization_tasks | quantmate |
| 5 | 27 | orders | quantmate |
| 5 | 28 | trades | quantmate |
| 5 | 29 | broker_configs | quantmate |
| 5 | 30 | risk_rules | quantmate |
| 5 | 31-33 | alert_rules, alert_history, notification_channels | quantmate |
| 5 | 34 | reports | quantmate |
| 5 | 35 | system_configs | quantmate |
| 5 | 36 | data_source_configs | quantmate |
| 6 | 37 | ai_conversations | quantmate |
| 6 | 38 | ai_model_configs | quantmate |
| 7 | 39-41 | strategy_shares, team_workspaces, workspace_members | quantmate |
| 7 | 42-44 | marketplace_listings, strategy_comments, strategy_ratings | quantmate |

---

## 文档更新清单

| Phase | 更新文档 |
|-------|---------|
| Phase 1 | API_CONTRACT_V1.yaml, GETTING_STARTED.md, ENV_VARIABLES_REFERENCE.md |
| Phase 2 | SECURITY_CHECKLIST.md, API 契约 (审计/认证/资料/KYC) |
| Phase 3 | API 契约 (数据/组合/分析/报表), DATASYNC_ROLLOUT_CHECKLIST.md |
| Phase 4 | API 契约 (MFA/API Key/策略/回测增强), testing/README.md |
| Phase 5 | API 契约 (交易/风控/监控/报表), DEPLOYMENT_RUNBOOKS.md |
| Phase 6 | API 契约 (AI 端点), 新建 AI_INTEGRATION.md |
| Phase 7 | API 契约 (协作/多市场), DEPLOYMENT.md (多市场配置) |

---

## 关键决策

1. **不使用 Alembic** — 继续手动 SQL 脚本，Issue #15 实现轻量级迁移框架
2. **1 issue = 1 PR** — 最大可追溯性和可审查性
3. **后端先于前端** — 后端 API 必须先于前端集成实现
4. **测试与代码同 PR** — 不单独拆分测试 PR
5. **分支命名** — `feature/issue-{number}-{short-name}`

## 范围

- **包含**: 全部 78 issues、完整测试覆盖、文档更新
- **不包含**: 生产部署、监控基础设施 (Prometheus/Grafana)、移动端、第三方 KYC 对接 (仅 stub)
