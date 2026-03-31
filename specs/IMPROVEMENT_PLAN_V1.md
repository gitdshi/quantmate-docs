# QuantMate 改进计划 v1

Owner: @daniel.shi  
Status: Draft  
Date: 2026-03-31

来源文档:
- `specs/product/UX_REVIEW_ACTION_LIST_V1.md` — UX 审核行动清单
- `specs/product/DASHBOARD_EMPTY_STATE_REDESIGN_V1.md` — Dashboard 与空状态重设计
- `specs/security/RBAC_SPEC_V1.md` — RBAC 权限模型规格
- `specs/security/AUDIT_LOG_SPEC_V1.md` — 审计日志规格

---

## 1. 总览

其他 Agent 对 QuantMate 进行了全面审核，产出了 4 份文档，涉及两大方向:

| 方向 | 文档 | 核心问题 |
|------|------|----------|
| **产品 / UX** | UX_REVIEW_ACTION_LIST_V1 | 信任缺失、空状态死板、首次体验弱 |
| **产品 / UX** | DASHBOARD_EMPTY_STATE_REDESIGN_V1 | Dashboard/Login/空状态的具体重设计方案 |
| **安全** | RBAC_SPEC_V1 | 无权限控制，所有 API 裸奔 |
| **安全** | AUDIT_LOG_SPEC_V1 | 审计日志 admin 硬编码，coverage 不足 |

经代码比对分析，当前 codebase 与 spec 之间存在以下关键差距:

| Gap | 严重程度 | 当前状态 |
|-----|----------|----------|
| RBAC 后端完全缺失 | **Critical** | 前端有 `usePermission` hook，但后端无 roles/permissions 表、无权限中间件 |
| 审计日志 admin 检查硬编码 | **High** | `username == "admin"` 而非 RBAC |
| 审计事件类型覆盖不足 | **Medium** | 仅 14 种 operation type，缺 trading/portfolio/config 事件 |
| 无环境标识 | **High** | Login/App Shell 无法显示 dev/staging/prod |
| Dashboard 无空状态引导 | **High** | 空数据时显示空白 KPI 卡片，无行动引导 |
| 无系统健康条 | **High** | `sync-status` API 返回 `is_consistent=false` 但前端未展示 |
| 无可复用 EmptyState 组件 | **Medium** | 各页面独立硬编码空状态文案 |
| 功能成熟度标签缺失 | **Low** | Beta/Preview 模块与 Stable 模块视觉层级相同 |

---

## 2. 分阶段实施计划

### Phase 1: 信任修复 (P0)

解决用户对产品质量产生误判的最核心问题。

#### Slice 1.1: 修复 Alerts/Rules API

> Spec 来源: UX_REVIEW_ACTION_LIST A1

**问题**: `GET /api/v1/alerts/rules` 返回 500

**当前分析**:
- 后端路由 `quantmate/app/api/routes/alerts.py` 逻辑正确
- `AlertRuleDao.list_by_user()` 在 `alert_rules` 表不存在时会抛异常
- Migration `011_create_alerts_reports_tables.sql` 可能在测试环境未执行

**后端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate/app/domains/monitoring/dao/alert_dao.py` | `list_by_user()` 加 try/except，表不存在时返回空列表 |
| `quantmate/app/api/routes/alerts.py` | `list_alert_rules()` 加错误兜底 → 200 + 空列表 |

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/pages/Monitoring.tsx` | rules 为空时展示 EmptyState: "还没有告警规则，先创建一条价格提醒或风控告警" + CTA 按钮 |

**测试**:
- 后端: regression test — `GET /alerts/rules` 在表存在/不存在两种情况下均返回 200
- 前端: 空列表时 CTA 按钮可见、可点击

---

#### Slice 1.2: 环境标识 (Login + App Shell)

> Spec 来源: UX_REVIEW_ACTION_LIST A2, DASHBOARD_EMPTY_STATE_REDESIGN §5

**问题**: 用户无法区分测试环境与生产环境

**后端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate/app/infrastructure/config/config.py` | 新增 `ENVIRONMENT` 配置项，默认值 `"development"`，从环境变量 `QUANTMATE_ENV` 读取 |
| `quantmate/app/api/routes/system.py` | `/system/version` 响应新增 `environment` 字段 |

**响应示例**:
```json
{
  "name": "QuantMate",
  "version": "0.5.0",
  "build_time": "2026-03-30T00:00:00",
  "environment": "development"
}
```

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/pages/auth/Login.tsx` | ① 顶部增加环境角标 (`测试环境` 黄色 badge) ② 表单下方增加信任提示: `首次管理员登录需修改密码` / `测试环境中的数据与交易行为不代表生产结果` ③ 右侧面板改为能力导览 + 环境提示 |
| `quantmate-portal/src/components/Layout.tsx` | header 区域增加持久环境 badge，非 `production` 时始终可见 |
| `quantmate-portal/src/lib/api.ts` | `systemAPI` 增加 `getVersion()` 类型定义，包含 `environment` 字段 |

**设计方案**:

```
┌──────────────────────────────────────────────────────┐
│ 🟡 测试环境  ·  仅用于验证，数据可能不完整            │  ← 顶部角标
├────────────────────────┬─────────────────────────────┤
│                        │  你将进入的能力:              │
│   QuantMate Logo       │  · 策略研究与回测             │
│                        │  · 行情分析与技术指标         │
│   ┌──────────────┐     │  · 组合管理与模拟交易         │
│   │ 用户名        │     │                             │
│   ├──────────────┤     │  当前环境提示:                │
│   │ 密码          │     │  · 测试环境                  │
│   ├──────────────┤     │  · 部分数据可能不完整         │
│   │   登 录       │     │  · 登录后可查看系统健康状态   │
│   └──────────────┘     │                             │
│                        │                             │
│   首次管理员登录需修改密码│                             │
│   测试环境中的数据与交易  │                             │
│   行为不代表生产结果      │                             │
└────────────────────────┴─────────────────────────────┘
```

---

#### Slice 1.3: 数据一致性健康条

> Spec 来源: UX_REVIEW_ACTION_LIST A3, DASHBOARD_EMPTY_STATE_REDESIGN §6.2 Zone A

**问题**: 后端 `sync-status` 已返回 `is_consistent=false, missing_count=80`，但前端无任何展示

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/components/SystemHealthStrip.tsx` | **新建** — 可复用健康条组件 |
| `quantmate-portal/src/pages/Dashboard.tsx` | 在 KPI 卡片上方插入 `SystemHealthStrip` |

**组件设计**:

```tsx
interface SystemHealthStripProps {
  className?: string;
}

// 内部调用 systemAPI.getSyncStatus()
// 状态:
//   green  → 数据同步正常，最近同步: {time}
//   amber  → 存在部分数据缺失 ({missing_count} 个交易日)
//   red    → 数据一致性异常，分析结果可能不完整
// CTA: "查看系统状态" → /settings (sync tab)
// Secondary: "去同步设置"
```

**视觉层级**:
```
┌──────────────────────────────────────────────────────┐
│ ⚠️ 数据同步存在缺失: 80个交易日  ·  最近同步: 3/30   │
│ 分析结果可能不完整。                                  │
│                     [查看系统状态]  [去同步设置]       │
└──────────────────────────────────────────────────────┘
```

---

### Phase 2: 冷启动修复 (P1)

解决空账户/新用户首次登录后的体验断裂。

#### Slice 2.1: 可复用 EmptyState 组件

> Spec 来源: DASHBOARD_EMPTY_STATE_REDESIGN §7

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/components/EmptyState.tsx` | **新建** — 通用空状态框架组件 |

**组件 API**:
```tsx
interface EmptyStateProps {
  type: 'setup' | 'activity' | 'risk' | 'preview';
  icon?: React.ReactNode;
  title: string;
  explanation: string;
  primaryCTA: { label: string; href?: string; onClick?: () => void };
  secondaryCTAs?: Array<{ label: string; href?: string; onClick?: () => void }>;
  helperText?: string;
}
```

**类型对应**:
| Type | 用途 | 色彩基调 |
|------|------|----------|
| `setup` | 用户未完成前置条件 (无策略/无同步) | blue/primary |
| `activity` | 功能正常但无历史数据 (无订单/无回测) | gray/neutral |
| `risk` | 系统状态降级导致不可用 (数据不一致) | amber/warning |
| `preview` | 功能尚未成熟 (Beta/Preview) | purple/info |

**i18n**: 所有文本通过 `t()` 传入，组件本身不含硬编码文案。

---

#### Slice 2.2: Dashboard 重设计

> Spec 来源: DASHBOARD_EMPTY_STATE_REDESIGN §6

**问题**: Dashboard 是 KPI-first 布局，空账户时全是空白卡片

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/pages/Dashboard.tsx` | 重构布局层级 |

**新布局层级**:

```
1. 页面标题 + 环境 badge
2. SystemHealthStrip (Phase 1.3)
3. NextBestActions 行动引导行 (新)
4. 业务概览卡片 (现有 KPI 卡片，改造空状态)
5. 活动时间线 (新)
6. 图表 + 详细表格 (现有，下移)
```

**NextBestActions 逻辑**:
```
条件判断 → 推荐卡片 (最多 4 张):

无同步数据:      → "同步第一批数据"       CTA: 去同步
无策略:          → "创建第一个策略"       CTA: 新建策略
有策略，无回测:   → "运行第一次回测"       CTA: 开始回测
有回测，无模拟交易: → "启动模拟交易"       CTA: 去模拟交易
数据都有:         → 隐藏此行
```

**空状态场景**:

| 场景 | 标题 | 主 CTA |
|------|------|--------|
| D1: 新账户 | `先让 QuantMate 动起来` | `创建第一个策略` |
| D2: 数据异常 | `数据同步存在异常，分析结果可能不完整` | `查看系统状态` |

**KPI 卡片空状态改造**:
- 净值曲线空 → `暂无净值曲线，因为你还没有任何持仓或回测结果`
- 策略面板空 → `从内置模板开始创建第一条策略`
- 告警空 → `还没有告警规则，先创建一条价格提醒或风控告警`

---

#### Slice 2.3: Analytics 空状态

> Spec 来源: DASHBOARD_EMPTY_STATE_REDESIGN §8.2

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/pages/Analytics.tsx` | 用 `EmptyState` 替换当前的空状态处理 |

**场景**:
| 场景 | 标题 | 主 CTA |
|------|------|--------|
| A1: 未选标的 | `先选择一个标的开始分析` | `去行情页选标的` → /market-data |
| A2: 标的无数据 | `这个标的暂时没有可用分析数据` | `检查数据同步状态` → /settings |
| A3: 无策略/回测 | `先跑一次回测，再看更有意义的分析结果` | `开始第一次回测` → /backtest |

---

#### Slice 2.4: Portfolio 空状态

> Spec 来源: DASHBOARD_EMPTY_STATE_REDESIGN §8.3

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/pages/Portfolio.tsx` | 用 `EmptyState` 替换当前的空状态处理 |

**场景**:
| 场景 | 标题 | 主 CTA | 次 CTA |
|------|------|--------|--------|
| P1: 无持仓 | `你的组合还是空的` | `创建模拟持仓` | `导入持仓` / `查看示例组合` |
| P2: 仅现金 | `先建立第一版资产配置` | `配置目标组合` | `从示例组合开始` |

---

### Phase 3: 安全基础 — RBAC + 审计日志

解决所有 API 端点权限裸奔和审计硬编码问题。

#### Slice 3.1: RBAC 数据库迁移

> Spec 来源: RBAC_SPEC_V1 §9

**后端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate/mysql/migrations/026_create_rbac_tables.sql` | **新建** — 创建 4 张表 + 种子数据 |

**表结构**:

```sql
-- roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_system BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- permissions
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  is_system BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_resource_action (resource, action)
);

-- role_permissions
CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- user_roles
CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_by INT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (user_id, role_id),
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

**种子数据** (per RBAC_SPEC_V1 §9.5):
- 4 roles: `admin`, `trader`, `researcher`, `viewer` (is_system=true)
- 33 permissions: 11 resources × 3 actions (read/write/manage)
- role_permissions: 按权限矩阵分配
- user_roles: 将已有 admin 用户关联 admin 角色

---

#### Slice 3.2: RBAC 后端核心

> Spec 来源: RBAC_SPEC_V1 §6

**后端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate/app/domains/rbac/__init__.py` | **新建** |
| `quantmate/app/domains/rbac/dao/rbac_dao.py` | **新建** — RoleDao, PermissionDao, UserRoleDao |
| `quantmate/app/domains/rbac/service/rbac_service.py` | **新建** — 权限查询服务 |
| `quantmate/app/api/dependencies/permissions.py` | **新建** — `require_permission()` FastAPI 依赖 |

**核心函数**:

```python
# rbac_service.py
class RbacService:
    def get_user_permissions(self, user_id: int) -> set[str]:
        """返回用户所有有效权限的 'resource.action' 集合"""
        # 1. 查询 user_roles (is_active=true)
        # 2. 查询 role_permissions → permissions
        # 3. 去重合并
        ...

    def check_permission(self, user_id: int, resource: str, action: str) -> bool:
        """检查用户是否拥有指定权限"""
        ...
```

```python
# permissions.py
def require_permission(resource: str, action: str, scope: str | None = None):
    """FastAPI Depends 工厂函数"""
    async def _check(current_user: TokenData = Depends(get_current_user)):
        rbac = RbacService()
        if not rbac.check_permission(current_user.user_id, resource, action):
            # 写审计日志: auth.permission_denied
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "FORBIDDEN",
                    "message": "Permission denied",
                    "details": {"resource": resource, "action": action}
                }
            )
        return current_user
    return Depends(_check)
```

**Rollout 安全策略**:
- 如果用户在 `user_roles` 中无记录，默认赋予 `trader` 角色权限
- 这确保 RBAC 迁移期间不会锁死已有用户

---

#### Slice 3.3: 路由权限挂载

> Spec 来源: RBAC_SPEC_V1 §7

**后端改动 — 逐路由添加 `require_permission` 依赖**:

| 文件 | 权限映射 |
|------|----------|
| `quantmate/app/api/routes/strategies.py` | `POST` → strategies:write, `GET` → strategies:read, `PUT/DELETE` → strategies:write |
| `quantmate/app/api/routes/backtests.py` | `POST` → backtests:write, `GET` → backtests:read, `DELETE` → backtests:write |
| `quantmate/app/api/routes/market_data.py` | `GET` → data:read, `POST/PUT/DELETE watchlists` → data:write |
| `quantmate/app/api/routes/portfolio.py` | `POST` → portfolios:write, `GET` → portfolios:read |
| `quantmate/app/api/routes/alerts.py` | `GET` → alerts:read, `POST/PUT/DELETE` → alerts:write, channels → alerts:manage |

**实施原则**: 每个文件独立 PR，逐步挂载，确保不影响现有功能。

---

#### Slice 3.4: RBAC Admin API

> Spec 来源: RBAC_SPEC_V1 §8

**后端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate/app/api/routes/admin.py` | **新建** — 角色/权限/用户管理 API |

**端点列表**:
| Method | Path | 功能 |
|--------|------|------|
| `GET` | `/api/admin/roles` | 列出所有角色 |
| `POST` | `/api/admin/roles` | 创建自定义角色 |
| `PUT` | `/api/admin/roles/{id}` | 更新角色描述 |
| `DELETE` | `/api/admin/roles/{id}` | 删除角色 (系统角色禁止删除) |
| `GET` | `/api/admin/permissions` | 列出所有权限 |
| `PUT` | `/api/admin/roles/{id}/permissions` | 分配角色权限 |
| `GET` | `/api/admin/users` | 列出用户及角色 |
| `PUT` | `/api/admin/users/{id}/roles` | 分配用户角色 |
| `PUT` | `/api/admin/users/{id}/status` | 启用/禁用用户 |

所有端点要求 `require_permission("account", "manage")`。

---

#### Slice 3.5: 审计日志改进

> Spec 来源: AUDIT_LOG_SPEC_V1 §10.1, §13

**后端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate/app/api/routes/audit.py` | 将 `_require_admin()` 中 `username == "admin"` 替换为 `require_permission("system", "manage")` |
| `quantmate/app/api/audit_middleware.py` | 扩展 `_OPERATION_MAP`，新增 trading/portfolio/config 事件类型 |

**`_OPERATION_MAP` 扩展**:
```python
# 新增映射
("POST", "/api/v1/orders"):       ("TRADING_ORDER_CREATE", "order"),
("PUT",  "/api/v1/orders"):       ("TRADING_ORDER_CANCEL", "order"),
("POST", "/api/v1/portfolios"):   ("PORTFOLIO_CREATE",     "portfolio"),
("PUT",  "/api/v1/portfolios"):   ("PORTFOLIO_UPDATE",     "portfolio"),
("DELETE","/api/v1/portfolios"):  ("PORTFOLIO_DELETE",      "portfolio"),
("PUT",  "/api/v1/system/configs"):("CONFIG_UPDATE",        "system_config"),
("PUT",  "/api/v1/data-sources"): ("DATA_SOURCE_UPDATE",   "data_source"),
("POST", "/api/v1/trading/paper/start"): ("PAPER_TRADE_START", "paper_deployment"),
("POST", "/api/v1/trading/paper/stop"):  ("PAPER_TRADE_STOP",  "paper_deployment"),
```

---

### Phase 4: 信息架构 (P2)

#### Slice 4.1: 功能成熟度标签

> Spec 来源: UX_REVIEW_ACTION_LIST A9, DASHBOARD_EMPTY_STATE_REDESIGN §9

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/components/Layout.tsx` | 导航项配置增加可选 `badge` 属性 |

**标签分配**:
| 模块 | 标签 | 理由 |
|------|------|------|
| AI Assistant | `Preview` | 功能实验性，未对接成熟模型 |
| Factor Lab | `Beta` | 核心逻辑在建设中 |
| Team Space | `Preview` | 协作功能初步搭建 |
| Marketplace | `Beta` | 模板市场已有内容但 UX 待完善 |
| Composite Strategies | `Beta` | 组合策略功能可用但尚在迭代 |

**视觉**:
```
├── 📊  Factor Lab      [Beta]
├── 🤖  AI Assistant    [Preview]
├── 🛒  Marketplace     [Beta]
```

Badge 样式: 小型圆角 chip，不遮挡操作。`Beta` 蓝色，`Preview` 紫色。

---

#### Slice 4.2: Settings 分区

> Spec 来源: UX_REVIEW_ACTION_LIST A10

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/pages/Settings.tsx` | Tab 拆分为 3 区 |

**Tab 结构**:
| Tab | 包含内容 | 可见性 |
|-----|---------|--------|
| 个人设置 | 密码、语言、时区、通知偏好 | 所有用户 |
| 交易偏好 | 默认交易参数、风控阈值、显示设置 | 所有用户 |
| 系统管理 | 数据源、同步、系统配置、审计日志 | 仅 `system.manage` 权限 |

---

### Phase 5: 内容与文案 (P3)

#### Slice 5.1: 空状态文案系统化

> Spec 来源: UX_REVIEW_ACTION_LIST A11, DASHBOARD_EMPTY_STATE_REDESIGN §10

**前端改动**: 更新所有 i18n locale 文件

**文案改写原则**:
- ❌ 避免: `暂无数据`
- ✅ 改为: `你还没有运行任何回测。先从一个内置模板开始，10 分钟内拿到第一份策略结果。`

**公式**: 当前状况 → 下一步操作 → 完成后的价值

**需改写的页面** (按优先级):
1. Dashboard (D1/D2 场景)
2. Analytics (A1/A2/A3 场景)
3. Portfolio (P1/P2 场景)
4. Strategies / Backtests 列表页
5. Market Data 空状态
6. Reports 空状态

---

#### Slice 5.2: 中文优先调优

> Spec 来源: UX_REVIEW_ACTION_LIST A12

**前端改动**:
| 文件 | 改动 |
|------|------|
| `quantmate-portal/src/i18n/index.ts` | 确认默认语言为 `zh`，fallback 为 `en` |
| `quantmate-portal/src/components/Layout.tsx` | 语言切换移至 footer utility 区域，降低视觉权重 |

---

## 3. 文件变更总览

### 新增文件

| 文件 | Phase | 说明 |
|------|-------|------|
| `quantmate/mysql/migrations/026_create_rbac_tables.sql` | 3.1 | RBAC 4 表 + 种子数据 |
| `quantmate/app/domains/rbac/__init__.py` | 3.2 | RBAC domain package |
| `quantmate/app/domains/rbac/dao/rbac_dao.py` | 3.2 | 角色/权限 DAO |
| `quantmate/app/domains/rbac/service/rbac_service.py` | 3.2 | 权限查询服务 |
| `quantmate/app/api/dependencies/permissions.py` | 3.2 | `require_permission()` 中间件 |
| `quantmate/app/api/routes/admin.py` | 3.4 | RBAC 管理 API |
| `quantmate-portal/src/components/SystemHealthStrip.tsx` | 1.3 | 系统健康条组件 |
| `quantmate-portal/src/components/EmptyState.tsx` | 2.1 | 通用空状态框架 |

### 修改文件

| 文件 | Phase | 说明 |
|------|-------|------|
| `quantmate/app/infrastructure/config/config.py` | 1.2 | 新增 ENVIRONMENT 配置 |
| `quantmate/app/api/routes/system.py` | 1.2 | version API 增加 environment |
| `quantmate/app/domains/monitoring/dao/alert_dao.py` | 1.1 | 防御性错误处理 |
| `quantmate/app/api/routes/alerts.py` | 1.1, 3.3 | 空状态兜底 + RBAC |
| `quantmate/app/api/routes/audit.py` | 3.5 | admin 检查改 RBAC |
| `quantmate/app/api/audit_middleware.py` | 3.5 | 扩展事件类型 |
| `quantmate/app/api/routes/strategies.py` | 3.3 | 挂载权限 |
| `quantmate/app/api/routes/backtests.py` | 3.3 | 挂载权限 |
| `quantmate/app/api/routes/market_data.py` | 3.3 | 挂载权限 |
| `quantmate/app/api/routes/portfolio.py` | 3.3 | 挂载权限 |
| `quantmate-portal/src/pages/auth/Login.tsx` | 1.2 | 环境标识 + 信任提示 |
| `quantmate-portal/src/components/Layout.tsx` | 1.2, 4.1, 5.2 | 环境 badge + 成熟度标签 + 语言位置 |
| `quantmate-portal/src/pages/Dashboard.tsx` | 1.3, 2.2 | 健康条 + 布局重构 + 空状态 |
| `quantmate-portal/src/pages/Analytics.tsx` | 2.3 | EmptyState 组件接入 |
| `quantmate-portal/src/pages/Portfolio.tsx` | 2.4 | EmptyState 组件接入 |
| `quantmate-portal/src/pages/Monitoring.tsx` | 1.1 | alerts 空状态 |
| `quantmate-portal/src/pages/Settings.tsx` | 4.2 | Tab 三分区 |
| `quantmate-portal/src/lib/api.ts` | 1.2 | systemAPI 类型更新 |
| i18n locale files (zh + en) | 2.x, 5.1 | 空状态文案 |

---

## 4. 执行排期建议

```
Phase 1 (P0 信任修复)         ████████░░░░░░░░░░░░  Week 1-2
  Slice 1.1 Alerts 修复       ██
  Slice 1.2 环境标识          ████
  Slice 1.3 健康条            ██

Phase 2 (P1 冷启动修复)       ░░░░░░░░████████░░░░  Week 3-4
  Slice 2.1 EmptyState 组件   ██
  Slice 2.2 Dashboard 重设计  ████
  Slice 2.3 Analytics 空状态  ██
  Slice 2.4 Portfolio 空状态  ██

Phase 3 (安全基础)            ░░░░░░░░░░░░██████████ Week 5-7
  Slice 3.1 RBAC Migration    ██
  Slice 3.2 RBAC 核心逻辑     ████
  Slice 3.3 路由权限挂载      ████
  Slice 3.4 Admin API         ████
  Slice 3.5 审计日志改进      ██

Phase 4 (P2 信息架构)         ░░░░░░░░░░░░░░░░████  Week 7-8
  Slice 4.1 成熟度标签        ██
  Slice 4.2 Settings 分区     ██

Phase 5 (P3 文案)             ░░░░░░░░░░░░░░░░░███  Week 8
  Slice 5.1 空状态文案        ████
  Slice 5.2 中文优先          █
```

---

## 5. 验收清单

| # | 验收项 | Phase |
|---|--------|-------|
| 1 | `GET /api/v1/alerts/rules` 返回 200 (空列表或真实数据) | 1.1 |
| 2 | Login 页非 production 时显示环境 badge | 1.2 |
| 3 | App Shell header 显示持久环境 badge | 1.2 |
| 4 | Dashboard 顶部显示数据健康条，消费 sync-status | 1.3 |
| 5 | `EmptyState` 组件可在 3+ 页面复用 | 2.1 |
| 6 | 空账户 Dashboard 显示行动引导，非空白 KPI | 2.2 |
| 7 | Analytics 空状态有明确的前置条件提示和 CTA | 2.3 |
| 8 | Portfolio 空状态支持 3 种入口模式 | 2.4 |
| 9 | Migration 026 在 dev DB 执行成功 | 3.1 |
| 10 | `POST /api/strategies` 对无权限用户返回 403 | 3.3 |
| 11 | `GET /api/admin/roles` 对非 admin 用户返回 403 | 3.4 |
| 12 | `GET /api/v1/audit/logs` 通过 RBAC 鉴权 (非 username 硬编码) | 3.5 |
| 13 | 导航栏 AI Assistant/Factor Lab 等显示 Beta/Preview 标签 | 4.1 |
| 14 | Settings 分为 3 个 Tab，系统管理仅 admin 可见 | 4.2 |
| 15 | `npx tsc --noEmit` 通过，0 TypeScript 错误 | All |

---

## 6. 决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 环境标识来源 | 运行时 API `/system/version` | 同一构建可部署至不同环境，无需重新编译 |
| RBAC 过渡策略 | 无 user_roles 记录时默认 trader 权限 | 避免迁移期间锁死已有用户 |
| 空状态组件策略 | 通用 `EmptyState` 组件 + i18n | 避免各页面重复实现，统一视觉和交互 |
| Alerts 500 处理 | 防御性 DAO + 空列表返回 | 根因可能是 migration 未执行，代码层面需兜底 |
| Demo 数据种子 | 暂不实施 | DASHBOARD_EMPTY_STATE_REDESIGN §14 明确 out of scope |
| Admin 审计检查 | 迁移至 RBAC 后替换 | Phase 3.2 完成后才可替换 3.5 的 audit admin check |

---

## 7. 开放问题

| # | 问题 | 影响范围 | 建议 |
|---|------|----------|------|
| 1 | 测试/生产环境是否使用不同视觉主题还是仅 badge？ | Phase 1.2 | 建议 P1 仅 badge + 顶部条，P2 再考虑主题 |
| 2 | 哪些高级模块是真正的 Beta vs 仅是数据不足？ | Phase 4.1 | 由产品确认，初始按 UX Review 建议标注 |
| 3 | 是否需要在测试环境植入样本数据？ | Phase 2 | 建议开设独立 seed data story |
| 4 | 首次登录空账户应进 Dashboard 还是引导向导？ | Phase 2.2 | P1 先优化 Dashboard 本身，向导作为 P3 |
| 5 | RBAC 迁移时已有用户如何批量分配角色？ | Phase 3.1 | Migration seed 中将 admin 用户绑定 admin 角色，其余默认 trader |
