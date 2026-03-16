# QuantMate 产品需求规格文档 (PRD)

> **版本**: V1.0  
> **创建日期**: 2026-03-14  
> **文档状态**: 初稿  
> **维护者**: QuantMate Team

---

## 目录

- [1. 文档概述](#1-文档概述)
- [2. 产品概述](#2-产品概述)
- [3. 功能需求](#3-功能需求)
  - [3.1 账户与权限模块](#31-账户与权限模块)
  - [3.2 数据与行情模块](#32-数据与行情模块)
  - [3.3 策略研究模块](#33-策略研究模块)
  - [3.4 回测与评估模块](#34-回测与评估模块)
  - [3.5 组合与风险模块](#35-组合与风险模块)
  - [3.6 交易执行模块](#36-交易执行模块)
  - [3.7 监控与告警模块](#37-监控与告警模块)
  - [3.8 报告与复盘模块](#38-报告与复盘模块)
  - [3.9 系统设置模块](#39-系统设置模块)
  - [3.10 协作与分享模块](#310-协作与分享模块)
- [4. 非功能需求](#4-非功能需求)
- [5. AI 与大模型集成需求](#5-ai-与大模型集成需求)
- [6. 数据模型](#6-数据模型)
- [7. API 接口清单](#7-api-接口清单)
- [8. 业务流程总览](#8-业务流程总览)
- [9. 优先级与里程碑](#9-优先级与里程碑)
- [附录](#附录)

---

## 1. 文档概述

### 1.1 目的与范围

本文档是 QuantMate 个人量化交易工具平台的产品需求规格文档（PRD），旨在：

- **全面梳理** 平台所有功能模块的需求，覆盖从数据接入到交易执行的完整链路
- **标注实现状态** 区分已实现、部分实现和待开发的功能，便于开发优先级判断
- **定义业务规则** 明确每个功能点的约束条件、前置/后置条件及交互逻辑
- **描述业务与交互流程** 为 UI/UX 设计和前后端开发提供行为参考
- **作为后续设计与开发的权威依据** 指导技术架构设计、接口设计、数据模型设计

**范围**：覆盖 QuantMate 平台全部 10 大功能模块（账户与权限、数据与行情、策略研究、回测与评估、组合与风险、交易执行、监控与告警、报告与复盘、系统设置、协作与分享），以及非功能需求、AI 集成、数据模型、API 清单、业务流程和里程碑规划。

### 1.2 读者对象

| 角色 | 关注重点 |
|------|----------|
| 产品经理 | 功能定义、业务规则、优先级 |
| UI/UX 设计师 | 交互流程、页面结构、用户旅程 |
| 后端开发 | API 接口、数据模型、业务规则 |
| 前端开发 | 交互流程、页面组件、状态管理 |
| 测试工程师 | 业务规则（可转化为测试用例） |
| 架构师 | 非功能需求、技术栈、扩展性 |

### 1.3 术语与缩略语

| 术语 | 说明 |
|------|------|
| 标的 (Symbol) | 可交易的金融工具，如股票、ETF、指数 |
| K 线 (Candlestick/Bar) | OHLCV（开高低收量）数据的图表表示 |
| 回测 (Backtest) | 使用历史数据模拟策略执行以评估绩效 |
| VNPy | 开源量化交易框架，QuantMate 后端使用其 CTA 引擎 |
| CTA | Commodity Trading Advisor，趋势跟踪策略框架 |
| RQ (Redis Queue) | 基于 Redis 的 Python 任务队列 |
| JWT | JSON Web Token，无状态认证令牌 |
| RBAC | Role-Based Access Control，基于角色的访问控制 |
| KYC | Know Your Customer，客户身份识别 |
| VaR | Value at Risk，在险价值 |
| TWAP | Time-Weighted Average Price，时间加权平均价格 |
| VWAP | Volume-Weighted Average Price，成交量加权平均价格 |
| Sharpe Ratio | 夏普比率，风险调整后收益度量 |
| Alpha/Beta | 超额收益/市场敏感度指标 |
| MFA | Multi-Factor Authentication，多因素认证 |

### 1.4 实现状态标记说明

本文档中每个功能点均标注当前实现状态：

| 标记 | 含义 | 说明 |
|------|------|------|
| ✅ 已实现 | 代码已完成，功能可用 | 标注具体代码文件和函数引用 |
| 🟡 部分实现 | 框架/脚手架存在，功能不完整 | 说明已完成和待完成的部分 |
| ❌ 未实现 | 需求明确，代码未开始 | 描述期望行为和业务规则 |

### 1.5 市场阶段标记说明

QuantMate 采用分阶段市场扩展策略：

| 标记 | 市场 | 数据源 | 说明 |
|------|------|--------|------|
| **[P1]** | A 股（沪深/北交所） | Tushare + AkShare | 当前阶段，已部分实现 |
| **[P2]** | 港股（港交所/港股通） | 待定（富途/雪球等） | 计划扩展 |
| **[P3]** | 美股（NYSE/NASDAQ） | 待定（Yahoo/Alpha Vantage 等） | 计划扩展 |
| **[P4]** | 其他（期货/期权/加密货币/外汇） | 待定 | 远期规划 |

### 1.6 参考文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 系统架构 | `quantmate-docs/architecture/SYSTEM_ARCHITECTURE.md` | 当前系统架构设计 |
| 数据库架构 | `quantmate-docs/architecture/DATABASE_ARCHITECTURE.md` | 数据库 Schema 设计 |
| 数据同步方案 | `quantmate-docs/architecture/DATA_SYNC_PLAN.md` | 数据同步详细方案 |
| API 文档 | `quantmate-docs/development/API_README.md` | 当前 API 端点文档 |
| 环境变量 | `quantmate-docs/development/ENV_VARIABLES_REFERENCE.md` | 配置项参考 |
| 开发指南 | `quantmate-docs/development/GETTING_STARTED.md` | 本地开发环境搭建 |

---

## 2. 产品概述

### 2.1 产品愿景与定位

**QuantMate** 是一款面向个人量化交易者的全链路工具平台，核心理念：

- **AI-First**：深度集成 AI 和大语言模型，从策略生成、智能选股到自动化报告，贯穿全流程
- **全链路覆盖**：从数据接入 → 策略研究 → 回测评估 → 风险管理 → 交易执行 → 监控复盘的完整闭环
- **自动化驱动**：最大程度减少人工干预，实现数据同步自动化、交易执行自动化、报告生成自动化
- **分阶段扩展**：从 A 股起步，逐步覆盖港股、美股及其他金融市场

**核心价值主张**：让个人交易者拥有机构级的量化交易能力。

### 2.2 目标用户画像

| 用户类型 | 特征 | 核心需求 |
|----------|------|----------|
| **个人量化交易者** | 有编程基础，使用 Python，管理个人资金 | 策略开发→回测→实盘的一站式工具 |
| **量化研究员** | 偏研究导向，关注因子和 Alpha | 数据探索、因子研究、可视化分析 |
| **算法交易爱好者** | 技术背景强，追求自动化 | 交易算法、API 接入、自动化执行 |
| **投资学习者** | 初学者，需要模板和指导 | 内置策略模板、AI 辅助、学习资源 |

### 2.3 系统架构概览

QuantMate 采用三层服务架构：

```
┌──────────────────────────────────────────────────────────────┐
│                     前端层 (quantmate-portal)                │
│          React 19 + TypeScript + Vite + Zustand              │
│     9 个页面 / 25 个组件 / Recharts 图表 / Monaco 编辑器      │
└────────────────────────┬─────────────────────────────────────┘
                         │ REST API (HTTP/JSON)
┌────────────────────────┴─────────────────────────────────────┐
│                    后端 API 层 (quantmate)                    │
│              FastAPI + VNPy CTA Engine + RQ Worker             │
│   28 个 API 端点 / 6 个领域模块 / JWT 认证 / 异步任务队列       │
├──────────────┬───────────────┬────────────────────────────────┤
│   API 服务    │  Worker 服务   │       DataSync 服务            │
│  (FastAPI)   │  (RQ Worker)  │  (Tushare/AkShare 数据同步)     │
└──────┬───────┴───────┬───────┴──────────┬────────────────────┘
       │               │                  │
┌──────┴───────────────┴──────────────────┴────────────────────┐
│                       数据层                                   │
│  MySQL 8.0 (4 库 / 68 表)          Redis 7 (任务队列 + 缓存)   │
│  quantmate / tushare / akshare / vnpy                        │
└──────────────────────────────────────────────────────────────┘
```

**服务组件说明**：

| 服务 | 端口 | 职责 |
|------|------|------|
| **API Server** | 8000 | FastAPI 应用，处理所有 HTTP 请求 |
| **Worker** | - | RQ Worker，执行回测/优化等耗时任务 |
| **DataSync Daemon** | - | 定时数据同步服务（Tushare + AkShare） |
| **MySQL** | 3306 | 持久化存储（业务数据 + 行情数据） |
| **Redis** | 6379 | 任务队列 + 任务元数据缓存（TTL 7 天） |
| **Frontend** | 5173 | Vite 开发服务器（生产环境通过 Nginx 代理） |

### 2.4 技术栈总结

**后端**：
- Python 3.11 + FastAPI（异步 Web 框架）
- VNPy（CTA 回测引擎）
- RQ（Redis Queue，异步任务）
- SQLAlchemy（数据库连接，raw SQL）
- Argon2（密码哈希，向后兼容 bcrypt）+ PyJWT（令牌签发）

**前端**：
- React 19 + TypeScript 5.9
- Vite 7（构建工具）
- Zustand 5（状态管理）
- TanStack React Query 5（数据获取/缓存）
- Recharts 3（图表库）
- Monaco Editor（代码编辑器）
- Tailwind CSS 3 + Lucide React（UI/图标）
- Axios（HTTP 客户端）

**数据层**：
- MySQL 8.0（4 个数据库 / 68 张表）
- Redis 7（任务队列 + 元数据缓存）

**部署**：
- Docker Compose（开发/Staging/生产）
- Nginx（反向代理/前端托管）
- GitHub Container Registry（镜像仓库）

### 2.5 市场支持路线图

```
Phase 1 [当前]           Phase 2              Phase 3            Phase 4
─────────────────── ──────────────────── ─────────────────── ───────────────────
  A 股                  + 港股               + 美股              + 其他
  ├─ 沪深主板           ├─ 港交所正股        ├─ NYSE             ├─ 期货(CTP)
  ├─ 创业板             ├─ 港股通            ├─ NASDAQ           ├─ 期权
  ├─ 科创板             ├─ 港股 ETF          ├─ ADR              ├─ 加密货币
  ├─ 北交所             └─ 相关指数          ├─ 美股 ETF         ├─ 外汇
  ├─ ETF                                    └─ 相关指数         └─ 大宗商品
  ├─ 指数
  └─ 可转债

  数据源:               数据源:              数据源:             数据源:
  Tushare + AkShare     富途/雪球/Wind       Yahoo/Alpha Vantage  CTP/交易所/CCXT
  
  券商:                 券商:                券商:               券商:
  A股量化接口(CTP等)    富途证券             IB/老虎/富途         按市场选择
```

**每阶段需解决的关键问题**：

| 阶段 | 数据源适配 | 交易通道 | 合规要求 | 技术挑战 |
|------|-----------|----------|---------|---------|
| P1-A股 | Tushare/AkShare ✅ | CTP/券商API | 实名认证 | 涨跌停/T+1 规则 |
| P2-港股 | 新数据源接入 | 富途OpenAPI | 港股通资格 | 港币/汇率/T+0 |
| P3-美股 | 新数据源接入 | IB API/老虎 | 海外券商开户 | 时区/盘前盘后/美元 |
| P4-其他 | 多源聚合 | 按市场选择 | 各市场合规 | 杠杆/保证金/24h交易 |

---

## 3. 功能需求

> 本章按 10 大功能模块逐一展开。每个功能点包含：功能描述、业务规则、业务/交互流程，以及当前实现状态和代码引用（已实现功能）。

---

### 3.1 账户与权限模块

本模块负责用户身份管理、认证授权和访问控制，是平台所有功能的基础门户。

#### 3.1.1 用户注册 ✅

**功能描述**：  
新用户通过注册页面创建账户，提供用户名、邮箱和密码。注册成功后可使用账户登录平台。

**业务规则**：
- 用户名全局唯一，不区分大小写
- 邮箱全局唯一，格式需符合 RFC 5322
- 密码最少 6 个字符（后续将升级为 8 位 + 复杂度要求）
- 注册成功后自动创建默认角色（当前为单一用户角色）
- 系统启动时自动创建管理员账户（从环境变量 `ADMIN_PASSWORD`/`ADMIN_EMAIL` 读取）

**交互流程**：
```
用户访问 /register 页面
  │
  ├─ 填写表单: 用户名 + 邮箱 + 密码 + 确认密码
  │    ├─ 前端校验: 密码≥6字符、两次密码一致
  │    └─ 校验失败 → 表单内红色错误提示
  │
  ├─ 提交注册 → POST /api/auth/register
  │    ├─ 后端校验: 用户名/邮箱唯一性
  │    │    └─ 冲突 → 返回 409，页面显示错误信息
  │    └─ 成功 → 返回 201
  │
  └─ 显示注册成功提示 → 自动跳转到 /login 页面
```

**现有实现**：
- 后端: `app/api/routes/auth.py` → `POST /api/auth/register`
- 后端服务: `app/domains/auth/auth_service.py` → `AuthService.register()`
- 后端 DAO: `app/domains/auth/user_dao.py` → `UserDao.username_exists()`, `email_exists()`, `insert_user()`
- 前端页面: `src/pages/auth/Register.tsx`
- 前端 API: `src/lib/api.ts` → `authAPI.register()`

---

#### 3.1.2 用户登录与会话管理 ✅

**功能描述**：  
用户通过用户名和密码登录，系统签发 JWT 双令牌（Access Token + Refresh Token）。前端持久化令牌并在后续请求中自动携带。支持令牌过期自动刷新和会话超时登出。

**业务规则**：
- Access Token 有效期默认 1440 分钟（24 小时），通过 `ACCESS_TOKEN_EXPIRE_MINUTES` 配置
- Refresh Token 有效期默认 7 天，通过 `REFRESH_TOKEN_EXPIRE_DAYS` 配置
- 密码使用 Argon2 哈希验证（向后兼容 bcrypt）
- 首次登录管理员账户时 `must_change_password=true`，强制跳转改密页面
- 令牌存储于 localStorage（键: `access_token`, `refresh_token`）
- Access Token 过期后自动使用 Refresh Token 刷新，刷新失败则登出
- 多端登录不互斥（无 Session 绑定）

**交互流程**：
```
用户访问 /login 页面（已登录则自动跳转 /dashboard）
  │
  ├─ 填写: 用户名 + 密码
  ├─ 提交 → POST /api/auth/login
  │    ├─ 认证失败 → 页面显示"用户名或密码错误"
  │    └─ 认证成功 → 返回 { access_token, refresh_token, must_change_password }
  │
  ├─ [must_change_password = true]
  │    └─ 强制跳转 /change-password → 改密成功后重新登录
  │
  ├─ [must_change_password = false]
  │    ├─ 存储双令牌到 localStorage
  │    ├─ 更新 Zustand auth store（user, tokens, isAuthenticated）
  │    └─ 跳转 /dashboard
  │
  └─ 后续请求自动携带 Authorization: Bearer <access_token>
       ├─ 401 响应 → 尝试用 refresh_token 刷新
       │    ├─ 刷新成功 → 更新 access_token → 重试原请求
       │    └─ 刷新失败 → 清除令牌 → 跳转 /login
       └─ 403 "password change required" → 跳转 /change-password
```

**现有实现**：
- 后端路由: `app/api/routes/auth.py` → `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`
- 后端服务: `app/domains/auth/auth_service.py` → `AuthService.login()`, `refresh()`, `me()`
- 令牌签发: `app/api/services/auth_service.py` → `create_access_token()`, `create_refresh_token()`, `decode_token()`
- 前端页面: `src/pages/auth/Login.tsx`
- 前端状态: `src/stores/auth.ts` → Zustand store with localStorage persistence
- 前端拦截器: `src/lib/api.ts` → Axios request/response interceptors

---

#### 3.1.3 密码管理 ✅

**功能描述**：  
支持用户修改密码，以及管理员首次登录时的强制改密流程。密码使用 Argon2 加密存储（向后兼容 bcrypt）。

**业务规则**：
- 修改密码需提供当前密码进行验证
- 新密码不能与当前密码相同
- 新密码最少 6 个字符
- 管理员首次登录后 `must_change_password` 标记为 `true`，改密成功后置为 `false`
- 改密成功后需重新登录（前端清除令牌并跳转登录页）

**交互流程**：
```
用户访问 /change-password 页面（受 PrivateRoute 保护）
  │
  ├─ 填写: 当前密码 + 新密码 + 确认新密码
  │    ├─ 前端校验: 新密码≥6字符、两次一致、新旧不同
  │    └─ 校验失败 → 表单内错误提示
  │
  ├─ 提交 → POST /api/auth/change-password
  │    ├─ 当前密码错误 → 返回 401，显示错误
  │    └─ 成功 → 返回 200
  │
  └─ 清除 localStorage 令牌 → 跳转 /login → 提示"请使用新密码登录"
```

**现有实现**：
- 后端: `app/api/routes/auth.py` → `POST /api/auth/change-password`
- 后端服务: `app/domains/auth/auth_service.py` → `AuthService.change_password()`
- 前端: `src/pages/auth/ChangePassword.tsx`

---

#### 3.1.4 KYC 身份验证 ❌

**功能描述**：  
用户实名认证流程，包括身份信息提交、证件照片上传和人脸识别验证。完成 KYC 后用户方可使用实盘交易功能。

**业务规则**：
- KYC 为实盘交易的前置条件；回测、策略研究等功能不要求 KYC
- KYC 状态: 未提交 → 待审核 → 已通过 / 已拒绝
- 需提交: 真实姓名、身份证号、身份证正反面照片
- [P1] A 股: 中国居民身份证
- [P2+] 港美股: 护照/港澳通行证等
- 证件照片需加密存储，仅授权人员可查看
- 审核可人工或接入第三方 KYC 服务自动化

**交互流程**：
```
用户进入"身份认证"页面（设置模块入口）
  │
  ├─ [未提交] 显示认证表单
  │    ├─ 填写: 真实姓名 + 身份证号
  │    ├─ 上传: 身份证正面 + 反面照片
  │    ├─ (可选) 人脸活体检测
  │    └─ 提交 → 状态变为"待审核"
  │
  ├─ [待审核] 显示等待审核提示 + 预计时间
  │
  ├─ [已通过] 显示认证信息摘要（姓名脱敏 + 认证日期）
  │    └─ 解锁实盘交易功能
  │
  └─ [已拒绝] 显示拒绝原因 + 允许重新提交
```

---

#### 3.1.5 角色与权限管理 (RBAC) ❌

**功能描述**：  
基于角色的访问控制系统，支持不同用户角色拥有不同的功能权限。管理员可管理角色定义和用户角色分配。

**业务规则**：
- 预置角色:

| 角色 | 说明 | 权限范围 |
|------|------|----------|
| **admin** | 系统管理员 | 全部功能 + 用户管理 + 系统配置 |
| **trader** | 普通交易者 | 策略/回测/交易/组合/报告 |
| **researcher** | 策略研究员 | 策略/回测/数据（无实盘交易权限） |
| **viewer** | 只读用户 | 仅查看仪表盘和报告 |

- 一个用户可拥有多个角色，权限取并集
- API 端点级别权限控制（装饰器/中间件）
- 管理员可创建自定义角色并分配权限点

**交互流程**：
```
管理员进入"用户管理"页面
  │
  ├─ 用户列表: 显示所有用户 + 当前角色
  │    └─ 操作: 编辑角色 / 启用 / 禁用
  │
  ├─ 角色管理: 查看/创建/编辑角色
  │    ├─ 角色名称 + 描述
  │    └─ 权限矩阵: 勾选各功能模块读/写/管理权限
  │
  └─ 普通用户: 个人设置中查看自有角色（只读）
```

---

#### 3.1.6 API Key 管理 ❌

**功能描述**：  
允许用户创建和管理 API Key，用于第三方程序或自动化脚本通过 REST API 访问 QuantMate 功能，无需交互式登录。

**业务规则**：
- 每个用户最多创建 5 个 API Key
- API Key 由 Key ID + Secret 组成，Secret 仅在创建时展示一次
- 每个 Key 可设置:
  - 权限范围（只读 / 读写 / 完整）
  - 过期时间（30/90/365 天 / 永不过期）
  - IP 白名单（可选）
  - 速率限制（默认 60 次/分钟）
- API Key 认证通过 `X-API-Key` Header 或 Bearer Token
- 可随时撤销（立即生效）
- 每次 API 调用记录到审计日志

**交互流程**：
```
用户进入"API Key 管理"页面
  │
  ├─ Key 列表: 显示已有 Key（Key ID、名称、创建日期、最后使用、状态）
  │
  ├─ 创建 Key:
  │    ├─ 输入: 名称 + 选择权限范围 + 设置过期时间 + IP 白名单(可选)
  │    ├─ 确认创建 → 弹窗显示 Secret（仅此一次，提示复制）
  │    └─ 关闭弹窗后 Secret 不可再查看
  │
  ├─ 管理 Key:
  │    ├─ 查看使用统计（调用次数/最后调用时间）
  │    ├─ 修改名称/IP 白名单
  │    └─ 撤销 Key → 确认弹窗 → 立即失效
  │
  └─ 使用说明: 展示 API Key 使用示例代码（curl / Python）
```

---

#### 3.1.7 多因素认证 (MFA) ❌

**功能描述**：  
在用户名密码基础上增加第二重认证，提高账户安全性。支持 TOTP 动态令牌和邮箱验证码两种方式。

**业务规则**：
- MFA 默认关闭，用户可在安全设置中启用
- 启用实盘交易功能时强制要求 MFA
- 支持方式:
  - TOTP（Google Authenticator / Microsoft Authenticator 等）
  - 邮箱验证码（备用方式）
- TOTP 设置流程: 生成 Secret → 展示二维码 → 用户扫码 → 输入验证码确认绑定
- 提供恢复码（一次性，8 个，创建时展示），用于设备丢失时恢复
- 登录时在密码验证通过后弹出 MFA 验证步骤

**交互流程**：
```
[启用 MFA]
安全设置 → 启用多因素认证
  ├─ 选择方式: TOTP / 邮箱
  ├─ [TOTP] 显示二维码 + Secret → 用户扫码 → 输入 6 位验证码确认
  ├─ [邮箱] 发送验证码 → 输入验证码确认
  └─ 展示恢复码（提示保存）→ 确认已保存 → MFA 启用完成

[登录使用 MFA]
输入用户名密码 → 密码验证通过 → 弹出 MFA 验证
  ├─ 输入 TOTP 验证码 / 邮箱验证码
  ├─ 验证通过 → 正常登录
  └─ 验证失败 → 提示错误 / 提供"使用恢复码"选项
```

---

### 3.2 数据与行情模块

本模块负责外部市场数据的接入、同步、存储和查询，是策略研究和回测的数据基础。

#### 3.2.1 数据源接入与管理 ✅

**功能描述**：  
QuantMate 通过数据源适配层接入外部行情数据。当前已实现 Tushare（A 股主数据源）和 AkShare（指数/交易日历）两个数据源，架构支持后续扩展更多数据源。

**业务规则**：
- 数据源通过环境变量配置（如 `TUSHARE_TOKEN`）
- 每个数据源有独立的速率限制配置（`TUSHARE_CALLS_PER_MIN` 默认 50）
- 支持按端点级别的精细速率控制
- 数据入库前进行格式标准化（统一字段名、日期格式、编码）
- 数据源异常时自动重试（指数退避策略）
- 同步状态持久化到 `data_sync_status` 表

**交互流程**：
```
Dashboard → 数据同步状态卡片
  │
  ├─ 显示各数据源状态: 正常/同步中/异常
  ├─ 最后同步时间 / 成功率 / 数据行数
  └─ 展开查看各端点级别同步详情
       ├─ stock_basic: 最后同步 + 行数 + 状态
       ├─ stock_daily: 最后同步 + 行数 + 缺失日期数
       └─ ...
```

**现有实现**：
- Tushare 同步: `app/datasync/service/tushare_ingest.py` → `call_ts()` (速率限制), 多端点同步函数
- AkShare 同步: `app/datasync/service/akshare_ingest.py` → `call_ak()`
- 同步状态: `app/domains/extdata/data_sync_status_dao.py`
- 前端展示: Dashboard 页面同步状态卡片

---

#### 3.2.2 数据同步服务 ✅

**功能描述**：  
独立的 DataSync Daemon 服务，负责定时从外部数据源拉取最新数据并写入本地数据库。支持初始化（历史数据回填）、每日增量同步和断点续传。

**业务规则**：
- 同步模式:
  - `init`：首次初始化，拉取最近 1 年历史数据（可通过 `INIT_LOOKBACK_YEARS` 调整）
  - `--daemon`：持续运行，每日 02:00（Asia/Shanghai）触发同步
  - `--daily`：单次每日同步
  - `--backfill`：回填历史缺失数据（默认回填 30 天，每 6 小时检查一次）
- 数据项开关过滤：同步前读取数据项开关配置（详见 [3.2.12 数据源/数据项开关管理](#3212-数据源数据项开关管理-❌)），仅处理 `enabled = true` 的数据项，跳过已关闭的数据项
- 断点续传：中断后从 `data_sync_status` + `init_progress` 表恢复进度
- 同步步骤（`step_name` 枚举）：stock_basic → stock_daily → adj_factor → daily_basic → stock_dividend → top10_holders → index_daily → trade_cal
- 每个步骤独立记录状态（pending → running → completed / failed）
- 失败后自动重试，重试间隔指数递增
- 幂等操作，安全重跑

**交互流程**：
```
[初始化流程 — 命令行触发]
./scripts/datasync_service.sh init
  │
  ├─ 创建数据库 Schema（幂等）
  ├─ 按步骤顺序执行初始化:
  │    ├─ stock_basic → 拉取全量股票列表
  │    ├─ stock_daily → 逐标的拉取日线（速率限制 50次/min）
  │    ├─ adj_factor → 复权因子
  │    ├─ ... (其他步骤)
  │    └─ 每步完成 → 更新 data_sync_status
  │
  ├─ [中断] → 重启后从最后完成步骤继续
  └─ [完成] → 记录初始化完成时间

[每日同步 — Daemon 自动触发]
02:00 触发（Asia/Shanghai）
  ├─ 检查上次同步日期 → 确定需同步的日期范围
  ├─ 按步骤增量拉取新数据
  ├─ 更新 data_sync_status
  └─ 前端 Dashboard 可查看同步结果
```

**现有实现**：
- 同步服务: `app/datasync/service/data_sync_daemon.py`
- 启动脚本: `scripts/datasync_service.sh`
- 初始化脚本: `scripts/init_market_data.py`
- 状态跟踪: `app/domains/extdata/data_sync_status_dao.py`, `app/domains/extdata/sync_log_dao.py`
- Docker: `docker-compose.dev.yml` → datasync service

---

#### 3.2.3 历史 K 线数据 ✅

**功能描述**：  
提供标的的历史 OHLCV（开高低收量）日线数据查询，支持日期范围筛选。数据来源于 Tushare，支持前/后复权。

**业务规则**：
- 查询参数: 标的代码（VNPy 格式如 `600000.SSE`）、开始日期、结束日期、复权类型
- 返回字段: 日期、开盘价、最高价、最低价、收盘价、成交量、成交额
- 数据按日期正序排列
- 复权处理: 通过 `adj_factor` 表计算前复权/后复权价格
- 无数据时返回空列表（非错误）
- 日期范围不得超过 10 年

**交互流程**：
```
Market Data 页面 → 左侧选择标的（通过 SymbolSearch）
  │
  ├─ 右侧自动加载该标的历史数据
  │    ├─ 默认显示最近 30 天
  │    ├─ 汇总卡片: 当前价(涨跌幅) / 最高 / 最低 / 平均成交量
  │    ├─ 柱状图: 30日价格走势
  │    └─ 历史数据表格: Date / Open / High / Low / Close / Volume（可滚动）
  │
  ├─ 用户可调整日期范围 → 重新请求数据 → 图表/表格刷新
  └─ 清除选择(×按钮) → 右侧恢复默认状态
```

**现有实现**：
- 后端: `app/api/routes/data.py` → `GET /api/data/history/{vt_symbol}`
- 后端服务: `app/api/services/data_service.py`
- 后端 DAO: `app/domains/market/tushare_market_dao.py`
- 前端: `src/components/MarketDataView.tsx`

---

#### 3.2.4 标的检索与筛选 ✅

**功能描述**：  
用户可通过关键词搜索标的（代码或名称），并按交易所、行业等维度筛选。支持模糊匹配和自动补全。

**业务规则**：
- 搜索字段: 标的代码（如 `600000`）或标的名称（如 `浦发银行`）
- 支持筛选条件: 交易所（SSE/SZSE/BSE）、关键词、偏移量分页
- 搜索输入防抖 250ms，避免频繁请求
- 返回字段: 标的代码、名称、交易所、行业
- [P2+] 增加市场筛选（A股/港股/美股）

**交互流程**：
```
SymbolSearch 组件（Market Data / Backtest 等页面复用）
  │
  ├─ 用户输入关键词（防抖 250ms）
  │    → GET /api/data/symbols?keyword=xxx
  │
  ├─ 下拉列表显示匹配结果:
  │    ├─ 每项: 代码 + 名称 + 市场标签(US/CN/HK)
  │    ├─ 已选择的标的显示 ✓ 标记
  │    └─ 无结果 → 显示"未找到匹配标的"
  │
  ├─ 单击选择 → 触发 onSelect 回调
  │    ├─ [单选模式] 直接选中
  │    └─ [多选模式] 加入已选列表（可用于批量回测）
  │
  └─ 市场筛选下拉: All / US / CN / HK → 过滤结果
```

**现有实现**：
- 后端: `app/api/routes/data.py` → `GET /api/data/symbols`
- 后端 DAO: `app/domains/market/tushare_symbol_dao.py`
- 前端: `src/components/SymbolSearch.tsx`

---

#### 3.2.5 技术指标计算 ✅

**功能描述**：  
基于历史 K 线数据，服务端计算常用技术指标并返回。支持的指标包括移动平均线、MACD、RSI 等。

**业务规则**：
- 已支持指标:

| 指标 | 参数 | 说明 |
|------|------|------|
| SMA | period (5/10/20/60) | 简单移动平均 |
| EMA | period (5/10/20/60) | 指数移动平均 |
| RSI | period (14) | 相对强弱指标 |
| MACD | fast(12)/slow(26)/signal(9) | 移动平均收敛散度 |

- 指标基于复权后的收盘价计算
- 数据不足以计算窗口期时，前 N 个值为 null
- 后续可扩展自定义指标注册机制

**交互流程**：
```
Market Data 页面 → 选择标的后 → 技术指标区域自动加载
  │
  ├─ 显示 TechnicalIndicators 组件
  │    ├─ 各指标以卡片/Badge 形式展示
  │    ├─ 数值 + 趋势方向标识
  │    └─ 颜色编码: 看涨(绿) / 看跌(红) / 中性(灰)
  │
  └─ 后续迭代: 指标叠加到K线图 / 自定义参数 / 更多指标类型
```

**现有实现**：
- 后端: `app/api/routes/data.py` → `GET /api/data/indicators/{vt_symbol}`
- 后端工具: `app/utils/ts_utils.py` → `moving_average()`, `pct_change()`
- 前端: `src/components/TechnicalIndicators.tsx`

---

#### 3.2.6 市场概览 ✅

**功能描述**：  
Dashboard 和 Market Data 页面展示市场全局概况，包括主要指数行情、涨跌统计和行业板块表现。

**业务规则**：
- 显示主要指数实时/最新行情（沪深 300、上证 50 等）
- 涨跌统计: 上涨/下跌/平盘数量
- 数据来源: `GET /api/data/overview`
- [P2+] 扩展港美股指数

**交互流程**：
```
Market Data 页面 → 顶部 Market Overview 区域
  │
  ├─ 3 个主要指数卡片:
  │    ├─ 指数名称 + 最新点位
  │    ├─ 涨跌额 + 涨跌幅%
  │    └─ 颜色: 涨(绿) / 跌(红)
  │
  └─ 后续迭代: 行业板块热力图 / 资金流向
```

**现有实现**：
- 后端: `app/api/routes/data.py` → `GET /api/data/overview`
- 后端服务: `app/domains/market/market_service.py` → `MarketService.market_overview()`
- 前端: `src/components/MarketOverview.tsx`

---

#### 3.2.7 实时行情推送 ❌

**功能描述**：  
通过 WebSocket 提供实时行情数据推送，用户订阅关注的标的后接收价格和成交量的实时更新。

**业务规则**：
- 推送协议: WebSocket（`ws://host/ws/market`）
- 订阅/取消订阅: 客户端发送标的代码列表
- 推送内容: 最新价、涨跌幅、成交量、买一/卖一（Level1）
- 推送频率: [P1] 3 秒/次快照；[P2+] 逐笔推送
- 心跳保活: 30 秒 ping/pong
- 连接断开自动重连（指数退避，最长 60 秒）
- 最大订阅数: 50 个标的/连接
- 数据来源: [P1] 定时轮询数据源缓存；[P2+] 实时数据流

**交互流程**：
```
用户在持仓页/自选列表/行情页打开标的
  │
  ├─ 前端建立 WebSocket 连接
  ├─ 发送订阅消息: { action: "subscribe", symbols: ["600000.SSE", ...] }
  │
  ├─ 服务端推送实时数据:
  │    └─ { symbol, price, change, change_pct, volume, bid1, ask1, timestamp }
  │
  ├─ 前端实时刷新:
  │    ├─ 持仓页: 更新当前价和浮动盈亏
  │    ├─ 行情页: 更新价格卡片和闪烁动画
  │    └─ 自选列表: 更新价格和涨跌幅
  │
  └─ 离开页面 → 发送取消订阅 → 关闭连接
```

---

#### 3.2.8 数据清洗与对齐 🟡

**功能描述**：  
对从外部数据源获取的原始数据进行清洗、标准化和对齐处理，确保数据质量满足策略研究和回测需要。

**业务规则**：
- 复权处理: 使用 `adj_factor` 对历史价格进行前复权/后复权（已实现）
- 缺失数据处理:
  - 停牌日: 标记为停牌，不插值
  - 非交易日: 按 `trade_cal`（交易日历）过滤（已实现）
  - 数据缺失: 检测并记录到 `data_sync_status.missing_dates`
- 异常值检测: 涨跌幅超过 ±20% 的非涨跌停数据标记告警
- 数据对齐: 多标的对齐到相同交易日序列（回测时处理）
- 字段标准化: Tushare 字段名 → 内部统一字段名
- [P2+] 多数据源交叉验证

**现有实现**（部分）：
- 复权: `adj_factor` 表 + 查询时复权计算
- 交易日历: `akshare.trade_cal` 表
- 缺失检测: 同步服务中的 consistency 检查

---

#### 3.2.9 多市场支持 ❌

**功能描述**：  
扩展数据层以支持多个金融市场的数据接入、存储和查询。需要统一标的编码、处理时区差异和币种转换。

**业务规则**：
- 统一标的编码方案:

| 市场 | 编码格式 | 示例 |
|------|----------|------|
| A 股 | `{代码}.{交易所}` | `600000.SSE`, `000001.SZSE` |
| 港股 | `{代码}.HKEX` | `00700.HKEX` |
| 美股 | `{代码}.{交易所}` | `AAPL.NASDAQ`, `TSLA.NYSE` |
| 期货 | `{合约代码}.{交易所}` | `IF2403.CFFEX` |

- 时区处理:
  - A 股: Asia/Shanghai (UTC+8)
  - 港股: Asia/Hong_Kong (UTC+8)
  - 美股: America/New_York (UTC-5/-4 DST)
  - 内部存储统一使用 UTC，查询时转换
- 币种: 数据库存储原始币种，支持按用户偏好币种展示
- 交易日历: 每个市场独立的交易日历
- 数据源映射: 通过适配器模式，不同市场使用不同数据源

**交互流程**：
```
Market Data 页面
  │
  ├─ 市场切换: 顶部下拉选择 A股 / 港股 / 美股 / 全部
  │    → 标的搜索范围限定到所选市场
  │
  ├─ 标的信息卡片: 显示市场/币种/时区标签
  │
  └─ 跨市场对比: 选择多市场标的叠加到同一图表
       └─ 自动处理时区对齐和币种换算
```

---

#### 3.2.10 分钟级/Tick 级数据 ❌

**功能描述**：  
除日线数据外，支持分钟级 K 线和逐笔成交（Tick）数据的存储和查询，满足高频策略和日内交易研究需求。

**业务规则**：
- 分钟 K 线: 1min / 5min / 15min / 30min / 60min
- Tick 数据: 逐笔成交（价格、数量、方向） + 五档盘口
- 存储策略: 分钟数据按月分表（数据量大）；Tick 数据按日分表
- 数据源: [P1] Tushare 分钟线（高级权限）；[P4] CTP/交易所实时 Tick
- 查询限制: 单次最多返回 10000 条分钟数据 / 50000 条 Tick 数据
- 已有 Schema 预留: `tushare.stock_minute`, `vnpy.dbtickdata`（未填充数据）

**交互流程**：
```
Market Data 页面 → 切换数据精度:
  │
  ├─ 精度选择器: 日线 / 60min / 30min / 15min / 5min / 1min / Tick
  │
  ├─ [分钟级] 显示分钟K线图 + 成交量柱
  │    └─ 日期范围限制: 1min 最多查 5 天, 5min 最多查 30 天
  │
  └─ [Tick级] 显示逐笔成交流水 + 盘口信息
       └─ 日期范围限制: 最多查 1 天
```

---

#### 3.2.11 数据集市场与数据治理 ❌

**功能描述**：  
提供可检索的数据集目录与治理体系，统一数据集元信息、版本管理和质量标签，支撑研究与回测的可复现性。

**业务规则**：
- 数据集分层:
  - 官方数据集（平台维护）
  - 第三方数据集（需授权）
  - 社区共享数据集（用户上传）
- 元信息规范:
  - 覆盖市场/资产类型/时间范围/频率
  - 数据延迟（实时/日终/周更）
  - 字段字典与口径说明
  - 授权与使用限制
- 质量标签:
  - 完整性/缺失率
  - 复权/公司行动处理说明
  - 是否 Point-in-Time（点时）与是否消除幸存者偏差
- 版本管理:
  - 数据集版本号 + 变更日志
  - 回测与报告记录使用的数据集版本
- 访问控制:
  - 订阅/权限控制（个人/团队）
  - 日/周调用配额限制

**交互流程**：
```
Data Marketplace 页面
  │
  ├─ 筛选: 市场 / 频率 / 类型 / 质量标签(PIT/非PIT)
  ├─ 数据集卡片: 名称 + 覆盖范围 + 更新频率 + 质量标签
  ├─ 详情页:
  │    ├─ 字段字典 + 口径说明
  │    ├─ 版本历史 + 变更日志
  │    └─ 订阅/授权
  └─ 订阅成功 → 出现在用户数据源列表
```

---

#### 3.2.12 数据源/数据项开关管理 ❌

**功能描述**：  
由于不同数据源的接口权限差异（如 Tushare 不同积分等级可调用的接口不同），需要提供对每个数据源下的每项数据/接口（数据项）进行启用/禁用开关的管理功能。开启的数据项在初始化及每日同步过程中会被同步处理；关闭的数据项在同步流程中将被跳过，不进行任何数据拉取操作。

**业务规则**：
- 每个数据源维护一份数据项清单，每项对应一个同步接口/端点
- 数据项开关状态持久化到数据库（`data_source_items` 表或 `data_sync_config` 表），包含字段：
  - `source`：数据源标识（如 `tushare`、`akshare`）
  - `item_key`：数据项标识（如 `stock_basic`、`stock_daily`、`adj_factor`、`daily_basic`、`stock_dividend`、`top10_holders`、`index_daily`、`trade_cal`）
  - `item_name`：数据项中文名称（如"股票列表"、"日线行情"、"复权因子"等）
  - `enabled`：是否启用（布尔值，默认 `true`）
  - `description`：数据项说明
  - `requires_permission`：所需权限等级/积分说明（如 Tushare 积分 ≥ 2000）
  - `updated_at`：最后修改时间
- 开关状态变更逻辑：
  - 关闭某数据项：该数据项在后续初始化（init）和每日同步（daily/daemon）中均被跳过
  - 开启某数据项：下次同步周期自动纳入同步范围；如该数据项从未同步过，系统自动触发该项的历史回填
  - 开关变更不影响已入库的历史数据（关闭不删除，仅停止增量同步）
- 初始化流程适配：
  - `init` 模式下，仅初始化 `enabled = true` 的数据项
  - 跳过的数据项在 `data_sync_status` 中记录为 `skipped` 状态
- 每日同步流程适配：
  - Daemon/Daily 模式下，同步前读取各数据项的开关配置
  - 仅对 `enabled = true` 的数据项执行数据拉取和入库
  - `enabled = false` 的数据项记录为 `skipped`，不消耗 API 调用额度
- 默认值：
  - 系统首次部署时，所有核心数据项默认启用（`stock_basic`、`stock_daily`、`adj_factor`、`trade_cal`）
  - 高级数据项默认关闭（如 `top10_holders`、`stock_dividend`），用户根据权限手动开启
- 批量操作：支持按数据源批量启用/禁用所有数据项
- 权限提示：前端展示每个数据项所需的接口权限等级，帮助用户判断是否有权限调用

**数据项清单（P1 - Tushare）**：

| 数据项 Key | 数据项名称 | 同步步骤 | 默认状态 | 权限要求 | 说明 |
|------------|-----------|----------|---------|----------|------|
| `stock_basic` | 股票列表 | stock_basic | ✅ 启用 | 基础 | 全量股票基本信息 |
| `stock_daily` | 日线行情 | stock_daily | ✅ 启用 | 基础 | 每日 OHLCV 数据 |
| `adj_factor` | 复权因子 | adj_factor | ✅ 启用 | 基础 | 前/后复权计算所需 |
| `daily_basic` | 每日基本指标 | daily_basic | ✅ 启用 | 积分 ≥ 2000 | 换手率/市盈率等 |
| `stock_dividend` | 分红送股 | stock_dividend | ❌ 关闭 | 积分 ≥ 2000 | 历史分红数据 |
| `top10_holders` | 十大股东 | top10_holders | ❌ 关闭 | 积分 ≥ 5000 | 十大流通股东 |
| `index_daily` | 指数日线 | index_daily | ✅ 启用 | 基础 | 主要指数行情 |
| `trade_cal` | 交易日历 | trade_cal | ✅ 启用 | 基础 | 交易日历表 |

**数据项清单（P1 - AkShare）**：

| 数据项 Key | 数据项名称 | 默认状态 | 权限要求 | 说明 |
|------------|-----------|---------|----------|------|
| `ak_trade_cal` | 交易日历 | ✅ 启用 | 无需Token | A股交易日历 |
| `ak_index_daily` | 指数日线 | ✅ 启用 | 无需Token | 指数行情补充 |

**交互流程**：
```
系统设置 → 数据源管理 → 数据项开关
  │
  ├─ 数据源列表（Tab 或 Accordion）:
  │    ├─ Tushare [P1]
  │    │    ├─ 全局开关: 启用/禁用整个数据源
  │    │    ├─ 批量操作: [全部启用] [全部禁用]
  │    │    └─ 数据项列表（表格形式）:
  │    │         ├─ 股票列表 (stock_basic) ─ [开关: ✅] ─ 权限: 基础 ─ 最后同步: 2026-03-14
  │    │         ├─ 日线行情 (stock_daily) ─ [开关: ✅] ─ 权限: 基础 ─ 最后同步: 2026-03-14
  │    │         ├─ 复权因子 (adj_factor) ─ [开关: ✅] ─ 权限: 基础 ─ 最后同步: 2026-03-14
  │    │         ├─ 每日指标 (daily_basic) ─ [开关: ✅] ─ 权限: 积分≥2000 ─ 最后同步: 2026-03-14
  │    │         ├─ 分红送股 (stock_dividend) ─ [开关: ❌] ─ 权限: 积分≥2000 ─ 未同步
  │    │         ├─ 十大股东 (top10_holders) ─ [开关: ❌] ─ 权限: 积分≥5000 ─ 未同步
  │    │         ├─ 指数日线 (index_daily) ─ [开关: ✅] ─ 权限: 基础 ─ 最后同步: 2026-03-14
  │    │         └─ 交易日历 (trade_cal) ─ [开关: ✅] ─ 权限: 基础 ─ 最后同步: 2026-03-14
  │    │
  │    └─ AkShare [P1]
  │         ├─ 全局开关: 启用/禁用整个数据源
  │         └─ 数据项列表...
  │
  ├─ 开关操作:
  │    ├─ 切换开关 → 即时保存到数据库
  │    ├─ 关闭确认: "关闭后该数据项将不再自动同步，已有数据不受影响。确认关闭？"
  │    └─ 开启提示: "开启后下次同步将自动包含该数据项。如首次启用，将自动回填历史数据。"
  │
  └─ 状态显示:
       ├─ 已启用数据项数 / 总数据项数
       ├─ 各项最后同步时间和状态
       └─ 权限不足提示（如用户 Tushare 积分不够）
```

**API 设计（目标）**：

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/api/settings/datasource-items?source=tushare` | 获取指定数据源的数据项列表及开关状态 |
| `PUT` | `/api/settings/datasource-items/{item_key}` | 更新单个数据项的开关状态 |
| `PUT` | `/api/settings/datasource-items/batch` | 批量更新数据项开关状态 |

---

### 3.3 策略研究模块

本模块提供策略全生命周期管理能力，从编写/导入策略代码、代码校验、版本管理到指标研究和因子分析。

#### 3.3.1 策略创建与编辑 ✅

**功能描述**：  
用户可通过内置 Monaco 代码编辑器编写 Python 策略代码，或上传 `.py` 策略文件。系统自动解析策略类名和默认参数。策略以数据库记录形式持久化，支持完整的 CRUD 操作。

**业务规则**：
- 策略字段: 名称（用户指定）、类名（从代码解析）、代码（Python 源码）、参数（JSON）、描述
- 名称在同一用户下唯一
- 策略代码必须继承 VNPy 的 `CtaTemplate` 基类
- 文件上传: 支持 `.py` 文件，自动解析提取 class 名、`parameters` 列表和默认值
- 参数以 JSON 格式存储，支持在提交回测时覆盖
- 每次保存自动递增版本号（`version` 字段）
- 删除策略为软删除/硬删除（当前为硬删除），关联回测历史保留

**交互流程**：
```
Strategies 页面 → 左侧策略列表 + 右侧详情区
  │
  ├─ [查看] 点击策略 → 右侧显示:
  │    ├─ 策略信息: 名称、类名、版本号、创建/更新时间
  │    ├─ 代码区: 语法高亮显示（只读）
  │    └─ 操作按钮: 编辑 / 删除 / 查看历史
  │
  ├─ [创建] 点击 "New" 按钮 → 打开 StrategyForm 弹窗:
  │    ├─ 输入: 策略名称 + 描述
  │    ├─ 代码编辑: Monaco Editor（Python语法高亮、全屏切换）
  │    │    └─ 或点击"上传文件" → 选择 .py → 自动填充代码+解析类名
  │    ├─ 参数: JSON 文本框（从代码自动提取默认值）
  │    ├─ 实时代码检查（防抖触发）:
  │    │    ├─ 优先尝试 Pyright 类型检查
  │    │    └─ 降级为 AST 语法检查
  │    │    └─ 错误显示为编辑器红色波浪线
  │    └─ 保存 → POST /api/strategies → 列表刷新 + 自动选中新策略
  │
  ├─ [编辑] 点击编辑按钮 → 打开 StrategyForm（预填充现有内容）
  │    └─ 保存 → PUT /api/strategies/{id} → 版本号+1
  │
  └─ [删除] 点击删除 → 确认弹窗 → DELETE /api/strategies/{id}
```

**现有实现**：
- 后端路由: `app/api/routes/strategies.py` → 完整 CRUD 端点
- 后端服务: `app/domains/strategies/strategies_service.py`
- 后端 DAO: `app/domains/strategies/strategy_dao.py`
- 代码校验: `app/api/services/strategy_service.py` → `validate_strategy_code()`, `parse_strategy_file()`
- 前端页面: `src/pages/Strategies.tsx`
- 前端组件: `src/components/StrategyForm.tsx`（Monaco 编辑器）, `src/components/StrategyList.tsx`

---

#### 3.3.2 内置策略库 ✅

**功能描述**：  
系统内置多个经典量化策略供用户直接使用或作为模板二次开发。用户可浏览内置策略库并一键导入为自有策略。

**业务规则**：
- 当前内置策略:

| 策略 | 类名 | 逻辑 | 关键参数 |
|------|------|------|----------|
| MACD 交叉 | `MACDStrategy` | MACD 金叉做多、死叉平仓 | fast=12, slow=26, signal=9 |
| 三均线 | `TripleMAStrategy` | 快>中>慢多头排列做多 + 止损 | fast=5, mid=10, slow=20 |
| 海龟交易 | `TurtleTradingStrategy` | 突破通道开仓 | entry_window, exit_window |

- 内置策略存储于服务端代码目录 `app/strategies/`
- 导入时复制一份到用户的策略列表，不影响原始内置策略
- 后续可扩展: 社区策略、AI 生成策略模板

**交互流程**：
```
Strategies 页面 → 点击 "内置策略" 按钮
  │
  ├─ 弹窗: BuiltinStrategiesModal
  │    ├─ 策略卡片列表: 名称 + 简介 + 参数概要
  │    └─ 每张卡片有 "导入" 按钮
  │
  ├─ 点击 "导入" → 创建策略副本到用户列表
  │    ├─ 名称: "MACD Strategy (Copy)"
  │    ├─ 代码: 完整策略源码
  │    └─ 参数: 默认参数值
  │
  └─ 导入成功 → 关闭弹窗 → 列表刷新 → 选中新导入策略可立即编辑
```

**现有实现**：
- 策略代码: `app/strategies/macd_strategy.py`, `triple_ma_strategy.py`, `turtle_trading.py`
- 止损模块: `app/strategies/stop_loss.py` → `StopLossManager`
- 前端: `src/components/BuiltinStrategiesModal.tsx`

---

#### 3.3.3 代码校验 ✅

**功能描述**：  
在策略编辑过程中实时校验代码质量，包括 Python 语法检查、类型检查、安全扫描（拦截危险导入和函数调用）。

**业务规则**：
- 校验层次:
  1. **语法检查**: Python AST 解析，检测语法错误
  2. **类型检查**: Pyright 静态分析（可选，降级为 AST）
  3. **安全扫描**: 
     - 拦截危险导入: `os`, `subprocess`, `sys`, `shutil` 等
     - 拦截危险函数: `exec()`, `eval()`, `__import__()`
     - 拦截文件/网络操作
  4. **结构验证**: 检查是否存在继承 `CtaTemplate` 的策略类，是否实现必要方法
- 校验在代码编辑时防抖触发（非实时逐键触发）
- 错误分级: Error（红色，阻止保存）/ Warning（黄色，可忽略）
- 校验结果在 Monaco Editor 中显示为波浪线标注

**交互流程**：
```
StrategyForm → 用户编辑代码
  │
  ├─ 停止输入后（防抖 ~500ms） → 自动触发校验
  │    ├─ POST /api/strategy-code/lint/pyright（优先）
  │    └─ 降级: POST /api/strategy-code/lint（AST 校验）
  │
  ├─ 校验结果返回:
  │    ├─ [通过] 编辑器无标注
  │    ├─ [Error] 红色波浪线 + 悬停显示错误信息 + 保存按钮禁用
  │    └─ [Warning] 黄色波浪线 + 悬停显示警告信息 + 可保存
  │
  └─ 手动触发: 点击 "解析" → POST /api/strategy-code/parse → 提取类名/方法列表
```

**现有实现**：
- 后端 lint: `app/api/routes/strategy_code.py` → `POST /api/strategy-code/lint`, `POST /api/strategy-code/lint/pyright`
- 后端解析: `app/api/routes/strategy_code.py` → `POST /api/strategy-code/parse`
- 安全检查: `app/api/services/strategy_service.py` → `validate_strategy_code()`
- 前端: `src/components/StrategyForm.tsx`（防抖调用 lint API → Monaco markers）

---

#### 3.3.4 策略版本历史 ✅

**功能描述**：  
每次策略代码保存时自动创建版本快照。用户可查看历史版本列表、对比不同版本代码、恢复到指定历史版本。

**业务规则**：
- 每次 PUT 更新策略时自动插入 `strategy_history` 记录
- 历史记录包含: 版本号、代码快照、创建时间
- 恢复操作: 将历史版本代码覆盖到当前策略，同时创建新的历史记录（可追溯）
- 历史记录不可删除（审计需要）
- 版本号全局递增

**交互流程**：
```
Strategies 页面 → 选择策略 → 点击 "历史记录" 按钮
  │
  ├─ 弹窗显示版本列表:
  │    ├─ 每行: 版本号 + 时间戳 + 操作按钮
  │    └─ GET /api/strategies/{id}/code-history
  │
  ├─ 点击某版本 → 展开显示该版本代码（只读）
  │    └─ GET /api/strategies/{id}/code-history/{history_id}
  │
  └─ 点击 "恢复" → 确认弹窗 → POST .../restore
       └─ 当前策略代码更新为该版本 → 版本号+1 → 刷新
```

**现有实现**：
- 后端路由: `app/api/routes/strategies.py` → `GET /{id}/code-history`, `GET /{id}/code-history/{hid}`, `POST /{id}/code-history/{hid}/restore`
- 后端 DAO: `app/domains/strategies/strategy_history_dao.py`

---

#### 3.3.5 参数管理 🟡

**功能描述**：  
管理策略参数的默认值、类型约束和可选范围。参数在策略编辑时设置默认值，在回测提交时可覆盖。

**业务规则**：
- 参数以 JSON 格式存储（已实现）
- 参数从策略代码 `parameters` 列表自动提取（已实现）
- 待完善:
  - 参数类型约束: int / float / string / bool / enum
  - 参数范围校验: min / max / step
  - UI 表单化: 根据参数元数据自动渲染输入控件（滑块/下拉/数字框）
  - 参数组: 将相关参数分组展示
  - 参数预设: 保存/加载常用参数组合

**交互流程**（当前）：
```
StrategyForm / BacktestForm → 参数区域
  │
  ├─ [当前] JSON 文本编辑器:
  │    ├─ 显示格式化的 JSON
  │    ├─ 从策略代码自动提取默认值填充
  │    └─ 回测时可手动修改参数值
  │
  └─ [目标] 参数表单界面:
       ├─ 每个参数独立输入控件（根据类型自动渲染）
       ├─ 参数名 + 描述 + 当前值 + 默认值 + 范围
       ├─ 验证: 类型检查 + 范围检查
       └─ 预设: 保存/加载按钮
```

**现有实现**（部分）：
- JSON 参数编辑: `src/components/StrategyForm.tsx`, `src/components/BacktestForm.tsx`
- 自动提取: `app/api/services/strategy_service.py` → `parse_strategy_file()`

---

#### 3.3.6 指标库 🟡

**功能描述**：  
提供丰富的技术指标库，用户可在策略研究和数据分析中使用。支持内置指标查询和后续的自定义指标扩展。

**业务规则**：
- 已实现指标: SMA, EMA, RSI, MACD（通过 API 计算返回）
- 待扩展:
  - 趋势类: BOLL, SAR, ADX, DMI
  - 震荡类: KDJ, CCI, WR, ROC
  - 成交量类: OBV, VWAP, MFI
  - 波动率类: ATR, 历史波动率, 隐含波动率
  - 自定义指标: 用户通过 Python 代码定义计算逻辑
- 指标注册机制: 通过统一接口注册新指标（名称+参数+计算函数）
- 指标可叠加到 K 线图上可视化

**交互流程**（目标状态）：
```
Market Data 页面 → 指标面板
  │
  ├─ 指标搜索/分类浏览: 趋势 / 震荡 / 成交量 / 波动率
  │
  ├─ 选择指标 → 设置参数 → 添加到图表
  │    ├─ 主图叠加: MA, BOLL 等
  │    └─ 副图: MACD, RSI, KDJ 等
  │
  ├─ 已添加指标列表 → 可删除/修改参数
  │
  └─ 自定义指标: "新建指标" → 代码编辑器 → 定义计算逻辑 → 保存 → 可复用
```

---

#### 3.3.7 因子研究平台 ❌

**功能描述**：  
提供量化因子的定义、计算、评估和筛选工具，帮助用户发现 Alpha 信号。支持从数据探索到因子合成的完整研究流程。

**业务规则**：
- 因子类型: 
  - 基本面因子: PE, PB, ROE, 营收增速等（数据来源: `tushare.daily_basic`）
  - 技术因子: 动量、波动率、换手率等
  - 另类因子: 资金流、大宗交易、机构持仓等
  - 自定义因子: 用户通过 Python/表达式定义
- 因子评估指标: IC（信息系数）, IR（信息比率）, 分组收益率, 换手率
- 因子合成: 多因子等权/IC加权/最优化合成
- 因子库: 保存已验证的因子供策略使用

**交互流程**：
```
因子研究页面（新页面）
  │
  ├─ 因子浏览器:
  │    ├─ 内置因子列表（按类别分组）
  │    ├─ 自定义因子列表
  │    └─ 搜索/筛选
  │
  ├─ 因子详情:
  │    ├─ 定义（计算公式/代码）
  │    ├─ IC/IR 时间序列图
  │    ├─ 分组收益率图（5/10分位）
  │    └─ 统计摘要: 均值/标准差/t值/有效覆盖率
  │
  ├─ 因子构建器:
  │    ├─ 选择基础数据字段
  │    ├─ 应用运算（排序/标准化/中性化/截面运算）
  │    ├─ 预览计算结果
  │    └─ 保存为自定义因子
  │
  └─ 因子合成:
       ├─ 选择多个因子
       ├─ 合成方式: 等权 / IC加权 / 最优化
       └─ 评估合成因子的 IC/IR → 保存
```

---

#### 3.3.8 可视化探索工具 ❌

**功能描述**：  
提供交互式数据可视化工具，用户可通过拖拽方式探索行情数据、因子数据和策略绩效，生成自定义图表。

**业务规则**：
- 支持图表类型: 折线图、K 线图、散点图、热力图、柱状图、箱线图、分布图
- 数据源: 行情数据、因子值、回测结果、组合数据
- 交互功能: 缩放、平移、十字光标、区间选择、标注
- 多图表联动: 选择一个图表的时间区间，其他图表同步
- 图表保存: 保存为图片（PNG/SVG）或保存布局配置
- 模板: 预设常用分析布局

**交互流程**：
```
可视化探索页面（新页面）
  │
  ├─ 数据选择面板（左侧）:
  │    ├─ 选择数据集: 行情 / 因子 / 回测
  │    ├─ 选择字段: 拖拽到图表区域
  │    └─ 筛选条件: 日期范围 / 标的 / 行业
  │
  ├─ 图表画布（中央）:
  │    ├─ 拖入字段 → 自动推荐图表类型
  │    ├─ 多图表自由布局（网格拖拽）
  │    ├─ 图表配置: 类型切换 / 颜色 / 标题 / 坐标轴
  │    └─ 交互: 缩放/平移/十字光标/区间选择
  │
  └─ 操作栏:
       ├─ 保存布局 / 加载布局
       ├─ 导出图片 (PNG/SVG)
       └─ 分享链接（协作模块）
```

---

#### 3.3.9 策略模板引擎 ❌

**功能描述**：  
提供参数化策略模板系统，用户可基于模板快速创建策略而无需从零编写代码。模板定义策略骨架和可配置参数。

**业务规则**：
- 模板类型:
  - 系统模板: 官方维护的经典策略模板（趋势跟踪、均值回归、动量等）
  - 社区模板: 来自模板市场的用户分享模板
  - AI 生成模板: 通过自然语言描述生成的策略模板
- 模板结构: 策略骨架代码 + 参数定义（类型/范围/默认值/说明）
- 从模板创建: 选择模板 → 填写参数 → 生成完整策略代码 → 保存为用户策略
- 模板版本化: 支持模板更新推送

**交互流程**：
```
Strategies 页面 → "从模板创建" 按钮
  │
  ├─ 模板浏览器弹窗:
  │    ├─ 分类: 趋势跟踪 / 均值回归 / 动量 / 多因子 / 其他
  │    ├─ 搜索: 关键词 / 标签
  │    ├─ 每个模板: 名称 + 描述 + 预览 + 评分 + 使用量
  │    └─ 选择模板
  │
  ├─ 参数配置界面:
  │    ├─ 根据模板参数定义自动渲染表单
  │    ├─ 每个参数: 名称 + 说明 + 输入控件 + 默认值
  │    └─ 预览: 实时显示生成的代码
  │
  └─ 确认创建 → 生成策略代码 → 保存 → 进入编辑器可进一步修改
```

---

#### 3.3.10 研究流水线与实验管理 ❌

**功能描述**：  
提供研究流水线编排与实验追踪能力，支持从数据准备、因子计算到回测评估的可复现研究流程。

**业务规则**：
- 流水线节点:
  - 数据准备 / 特征工程 / 策略回测 / 绩效评估 / 报告生成
- 编排方式:
  - DAG 依赖关系（前置完成后触发下一步）
  - 支持手动触发与定时调度
- 实验追踪:
  - 记录策略版本、参数、数据集版本、随机种子、运行环境
  - 每次运行生成唯一 Run ID
- 产出管理:
  - 保存日志、指标、图表与中间产物
  - 支持一键生成实验报告

**交互流程**：
```
Research Workspace 页面
  │
  ├─ 新建流水线:
  │    ├─ 拖拽节点 → 连接依赖
  │    └─ 配置每个节点参数
  ├─ 运行/调度:
  │    ├─ 立即运行 / 定时运行
  │    └─ 运行历史列表（状态/耗时/结果）
  └─ 实验详情:
       ├─ 参数与数据版本记录
       ├─ 指标与图表
       └─ 导出实验报告
```

---

### 3.4 回测与评估模块

本模块提供策略回测执行、结果分析和绩效评估能力，是策略研究到实盘交易的关键验证环节。

#### 3.4.1 单标的回测 ✅

**功能描述**：  
对单个标的执行策略回测。用户选择策略、标的和时间范围，系统通过 VNPy CTA 引擎在历史数据上模拟策略执行，计算绩效指标。回测以异步任务方式执行。

**业务规则**：
- 必填参数: 策略（选择已有策略）、标的代码、开始日期、结束日期
- 可选参数: 初始资金（默认 100,000）、手续费率(rate)、滑点(slippage)、合约乘数(size)、最小价格变动(pricetick)、基准指数、策略参数覆盖
- 回测引擎: VNPy `BacktestingEngine`（CTA 模式）
- 执行方式: 提交到 RQ 队列（BACKTEST 队列）异步执行
- 任务状态: PENDING → RUNNING → COMPLETED / FAILED
- 结果持久化到 `backtest_history` 表（MySQL）+ Redis 元数据缓存（TTL 7 天）
- 回测数据: 使用 `tushare.stock_daily` 转换为 VNPy 格式

**交互流程**：
```
Backtest 页面 → 点击 "New Backtest" 按钮
  │
  ├─ 打开 BacktestForm 弹窗 (两个 Tab):
  │    │
  │    ├─ [基本设置 Tab]:
  │    │    ├─ 策略: 下拉选择（从用户策略列表）
  │    │    ├─ 标的: SymbolSearch 组件搜索选择
  │    │    ├─ 日期范围: 开始/结束日期（默认最近1年）
  │    │    ├─ 初始资金: 数字输入（默认 100,000）
  │    │    ├─ 手续费率: 数字输入（默认 0.0003）
  │    │    ├─ 滑点: 数字输入（默认 0）
  │    │    └─ 基准指数: 下拉选择（沪深300等）
  │    │
  │    └─ [策略参数 Tab]:
  │         └─ JSON 编辑器（从策略默认参数预填充，可修改）
  │
  ├─ 提交 → POST /api/backtest → 返回 job_id
  │    ├─ 前端校验: 策略必选、标的必选、结束日期>开始日期
  │    └─ 提交成功 → 关闭弹窗 → 任务出现在下方任务列表
  │
  ├─ 任务列表自动轮询（5 秒间隔）:
  │    ├─ 每行: 状态图标 + Job ID + 策略名 + 标的 + 日期范围 + 时间
  │    ├─ 状态筛选按钮: All / Queued / Running / Finished / Failed
  │    └─ 操作: 查看结果 / 删除
  │
  └─ 任务完成 → 点击 "查看结果" → BacktestResults 弹窗:
       │
       ├─ [绩效 Tab]:
       │    ├─ 权益曲线图（EquityCurveChart）+ 基准对比叠加
       │    ├─ 绩效指标网格:
       │    │    ├─ 总收益率 / 年化收益率 / 最大回撤
       │    │    ├─ Sharpe 比率 / Sortino 比率
       │    │    ├─ 胜率 / 盈亏比
       │    │    └─ Alpha / Beta（vs 基准）
       │    └─ 交易图表（TradingChart）: K线 + 入场/出场标记（颜色区分多空）
       │
       ├─ [交易明细 Tab]:
       │    └─ 交易表格: 时间/标的/方向/数量/价格/盈亏/策略信号
       │
       └─ [配置 Tab]:
            └─ 回测参数总览（策略、标的、日期、资金、费用设置）
```

**现有实现**：
- 后端路由: `app/api/routes/backtest.py` → `POST /api/backtest`
- 后端服务: `app/api/services/backtest_service.py` → `BacktestServiceV2.submit_backtest()`
- 任务执行: `app/worker/service/tasks.py` → `run_backtest_task()`
- 结果存储: `app/domains/backtests/backtest_history_dao.py`
- 前端表单: `src/components/BacktestForm.tsx`
- 前端结果: `src/components/BacktestResults.tsx`
- 前端图表: `src/components/EquityCurveChart.tsx`, `src/components/TradingChart.tsx`

---

#### 3.4.2 批量回测 ✅

**功能描述**：  
对多个标的同时执行同一策略的回测。用户可按行业、交易所或手动选择标的列表，系统并行执行回测并汇总结果。

**业务规则**：
- 标的选择模式: 
  - 按行业筛选 → 全选该行业标的
  - 按交易所筛选 → 全选该交易所标的
  - 手动选择 → 多选标的
- 最少选择 1 个标的
- 所有标的使用相同策略、参数和日期范围
- 创建 1 个父任务（`bulk_backtest`）+ N 个子任务（每标的 1 个 `backtest_history`）
- 父任务跟踪: 总数 / 完成数 / 失败数 / 最佳标的/收益率
- 子任务独立执行，失败不影响其他子任务

**交互流程**：
```
Backtest 页面 → 点击 "Bulk Test" 按钮
  │
  ├─ 打开 BulkBacktestForm 弹窗 (三个 Tab):
  │    │
  │    ├─ [基本设置 Tab]: 策略 + 日期范围 + 资金 + 费用（同单回测）
  │    │
  │    ├─ [标的选择 Tab]:
  │    │    ├─ 选择模式: 行业 / 交易所 / 手动
  │    │    ├─ [行业] 行业列表 → 选择行业 → 显示该行业标的
  │    │    ├─ [交易所] 交易所列表 → 选择 → 显示标的
  │    │    ├─ [手动] SymbolSearch 逐个添加
  │    │    ├─ "全选" 按钮 → 选中当前筛选结果全部标的
  │    │    ├─ 已选列表: 标的代码 chips（可逐个删除）
  │    │    └─ 显示已选数量
  │    │
  │    └─ [策略参数 Tab]: JSON 参数覆盖
  │
  ├─ 提交 → POST /api/backtest/batch → 创建批量任务
  │
  ├─ 任务列表: 批量任务可展开查看子任务
  │    └─ 子任务显示各标的独立状态
  │
  └─ 全部完成 → 点击 "查看汇总" → BulkBacktestSummary 弹窗:
       ├─ 概览卡片: 总标的数 / 完成数 / 失败数 / 盈利数 / 亏损数
       ├─ 平均绩效指标: 平均收益率 / 平均Sharpe / 平均最大回撤
       ├─ 收益率分布图: 直方图
       ├─ Top 10 最佳表现标的（可点击查看个股回测详情）
       ├─ Bottom 10 最差表现标的
       └─ 胜率/盈亏比等聚合统计
```

**现有实现**：
- 后端路由: `app/api/routes/backtest.py` → `POST /api/backtest/batch`
- 后端服务: `app/api/services/backtest_service.py` → `BacktestServiceV2.submit_bulk_backtest()`
- 任务执行: `app/worker/service/tasks.py` → `run_bulk_backtest_task()`
- 父任务 DAO: `app/domains/backtests/bulk_backtest_dao.py`
- 子结果 DAO: `app/domains/backtests/bulk_results_dao.py`
- 前端: `src/components/BulkBacktestForm.tsx`, `src/components/BulkBacktestSummary.tsx`

---

#### 3.4.3 回测任务管理 ✅

**功能描述**：  
统一管理所有回测任务（单个/批量），包括任务列表查看、状态筛选、任务取消和删除。

**业务规则**：
- 任务类型: `backtest`（单个）/ `batch_backtest`（批量）/ `optimization`（优化）
- 任务状态: queued → started → finished / failed / cancelled
- 任务元数据存储: Redis（TTL 7 天） + MySQL（持久化）
- 取消: 仅 queued/started 状态可取消
- 删除: 级联删除关联结果（批量任务删除所有子任务结果）
- 任务列表按创建时间倒序
- 支持按状态筛选

**交互流程**：
```
Backtest 页面 → 任务列表区域
  │
  ├─ 筛选栏: [All] [Queued] [Running] [Finished] [Failed]
  │
  ├─ 任务行:
  │    ├─ 状态图标（颜色编码）+ Job ID
  │    ├─ 策略名 + 标的名/数量 + 日期范围
  │    ├─ 创建时间 + 完成时间
  │    ├─ [queued/running] "取消" 按钮 → POST /cancel
  │    ├─ [finished] "查看结果" 按钮
  │    └─ "删除" 按钮 → 确认弹窗 → DELETE
  │
  ├─ 批量任务: 可展开查看子任务列表
  │    └─ 子任务显示: 标的 + 状态 + 收益率
  │
  └─ 自动轮询（5秒）刷新任务状态
```

**现有实现**：
- 后端路由: `app/api/routes/queue.py` → `GET /api/queue/jobs`, `POST /cancel`, `DELETE /api/queue/jobs/{id}`
- 后端服务: `app/api/services/job_storage_service.py`, `app/domains/jobs/jobs_service.py`
- 前端: `src/components/BacktestJobList.tsx`

---

#### 3.4.4 回测结果展示 ✅

**功能描述**：  
以图表和数据表形式展示回测结果，包括权益曲线、交易标记图、绩效指标和交易明细。

**业务规则**：
- 结果展示三个维度:
  1. **绩效总览**: 权益曲线（带基准对比）+ 关键指标卡片
  2. **交易明细**: 每笔交易的时间、方向、价格、盈亏
  3. **配置回顾**: 回测使用的参数设置
- 权益曲线:
  - X 轴: 日期；Y 轴: 资产净值
  - 叠加基准线（如沪深300）
  - 叠加原始股价走势
- 交易标记:
  - 多头入场: 绿色向上箭头
  - 多头出场: 红色向下箭头
  - 空头入场/出场: 对应颜色标记
- 绩效指标: 总收益率、年化收益率、最大回撤、Sharpe Ratio、Sortino Ratio、胜率、盈亏比、Alpha、Beta

**现有实现**：
- 前端: `src/components/BacktestResults.tsx`（三 Tab 展示）
- 前端图表: `src/components/EquityCurveChart.tsx`（权益曲线+基准）, `src/components/TradingChart.tsx`（K线+交易标记）
- 后端: 结果存储在 `backtest_history.result`（JSON 字段）

---

#### 3.4.5 费用与成交假设 ✅

**功能描述**：  
回测时可配置真实的交易费用和成交假设，使回测结果更贴近实际交易情况。

**业务规则**：
- 可配置项:

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `rate` | 手续费率（双向） | 0.0003 (万三) |
| `slippage` | 滑点（固定值） | 0 |
| `size` | 合约乘数 | 1（股票为1） |
| `pricetick` | 最小价格变动 | 0.01 |
| `capital` | 初始资金 | 100,000 |

- 手续费 = 成交金额 × rate（买卖各收一次）
- 滑点: 买入价 +slippage，卖出价 -slippage
- [P4] 期货: size > 1，保证金模式
- 费用在每笔交易结算时扣除，反映在权益曲线中

**现有实现**：
- 前端表单: `src/components/BacktestForm.tsx`（rate / slippage / size / pricetick 输入项）
- 后端: `app/worker/service/tasks.py` → `run_backtest_task()` 传入 VNPy BacktestingEngine

---

#### 3.4.6 绩效指标 ✅

**功能描述**：  
回测完成后计算一系列关键绩效指标，帮助用户评估策略的收益能力、风险水平和稳定性。

**业务规则**：
- 已实现指标:

| 指标 | 计算方式 | 含义 |
|------|----------|------|
| 总收益率 | (末值-初值)/初值 | 策略总回报 |
| 年化收益率 | 总收益率 × (252/交易日数) | 年化后的回报 |
| 最大回撤 | 历史最高点到最低点的最大跌幅 | 最坏情况下的亏损 |
| Sharpe Ratio | (年化收益-无风险利率) / 年化波动率 | 风险调整收益 |
| 胜率 | 盈利交易数 / 总交易数 | 交易成功概率 |
| 盈亏比 | 平均盈利 / 平均亏损 | 每笔交易的风险回报 |
| Alpha | 超额收益（vs 基准） | 策略独立创造的价值 |
| Beta | 策略收益率对基准的回归系数 | 市场敏感度 |
| 总交易次数 | 开仓+平仓成对计数 | 策略活跃度 |

- Alpha / Beta 使用沪深 300（`akshare.index_daily`）作为基准
- 指标结果存储在 `backtest_history.result` JSON 字段的 `statistics` 部分

**现有实现**：
- 指标计算: VNPy BacktestingEngine 内置 + `app/worker/service/tasks.py` → `calculate_alpha_beta_for_worker()`
- 基准数据: `app/domains/backtests/akshare_benchmark_dao.py`
- 前端展示: `src/components/BacktestResults.tsx` 绩效指标网格

---

#### 3.4.7 基准对比 ✅

**功能描述**：  
将策略回测绩效与市场基准指数进行对比，直观展示策略的超额收益能力。

**业务规则**：
- 默认基准: 沪深 300 指数
- 可选基准: 上证 50、中证 500 等主要 A 股指数
- 对比方式:
  - 权益曲线叠加（归一化到同一起点）
  - Alpha / Beta 数值计算
  - 相对收益率时序图
- 基准数据来源: `akshare.index_daily`
- 基准期间与回测期间对齐

**现有实现**：
- 前端图表: `src/components/EquityCurveChart.tsx`（已实现基准叠加）
- 后端: `app/worker/service/tasks.py` → `get_benchmark_data_for_worker()`, `calculate_alpha_beta_for_worker()`
- 基准 DAO: `app/domains/backtests/akshare_benchmark_dao.py`

---

#### 3.4.8 多周期回测 🟡

**功能描述**：  
支持不同时间周期的 K 线数据进行回测，从日线扩展到分钟线和周/月线。

**业务规则**：
- 已支持: 日线（`1d`）
- 待扩展: 
  - 周线（`1w`）/ 月线（`1M`）— 日线数据聚合
  - 分钟线（1m/5m/15m/30m/60m）— 需接入分钟数据源
- 不同周期的滑点和手续费假设可能不同
- 分钟级回测需考虑日内时序（开盘集合竞价、午休等）
- VNPy 引擎原生支持多周期，需适配数据加载逻辑

**交互流程**：
```
BacktestForm → 新增/扩展"K线周期"下拉选择:
  ├─ 日线(默认) / 周线 / 月线
  ├─ [需分钟数据] 60min / 30min / 15min / 5min / 1min
  └─ 选择周期 → 影响数据加载范围限制提示
```

---

#### 3.4.9 参数优化 🟡

**功能描述**：  
对策略参数进行系统化搜索，找到在历史数据上表现最优的参数组合。支持网格搜索等优化方法。

**业务规则**：
- 优化方式:
  - 网格搜索: 穷举参数组合（已有任务队列定义）
  - 随机搜索: 随机采样参数空间（待实现）
  - 贝叶斯优化: 基于历史结果智能采样（待实现）
  - 参数扫描: 支持大规模并行扫描并输出 Top-K 组合
- 用户定义每个参数的:
  - 搜索范围: [min, max]
  - 步长: step
- 优化目标: Sharpe Ratio / 总收益率 / 最大回撤（用户选择）
- 任务提交到 OPTIMIZATION 队列
- 结果: 参数组合 × 目标值的完整矩阵 + 最优参数组合
 - 输出可直接用于后续 Walk-Forward 评估

**交互流程**：
```
Strategies 页面 → Optimize Tab
  │
  ├─ 选择策略 + 标的 + 日期范围
  │
  ├─ 参数配置:
  │    ├─ 每个参数:
  │    │    ├─ 参数名（自动从策略提取）
  │    │    ├─ 范围: [min] ~ [max]
  │    │    └─ 步长: step
  │    └─ 优化目标: 下拉选择 (Sharpe / Return / Drawdown)
  │
  ├─ 预计组合数计算并显示
  │
  ├─ 提交 → 异步优化任务
  │
  └─ 结果展示:
       ├─ 最优参数组合 + 对应绩效
       ├─ 参数热力图（2个参数维度的收益率色域图）
       └─ 全部组合的统计分布
```

**现有实现**（部分）：
- Worker 配置: `app/worker/service/config.py` → `OPTIMIZATION` 队列定义
- Worker 任务: `app/worker/service/tasks.py` → `run_optimization_task()`
- 前端: `src/components/StrategyOptimization.tsx`（表单部分）

---

#### 3.4.10 回测报告导出 ❌

**功能描述**：  
将回测结果导出为独立的报告文件，支持 PDF、HTML 和 CSV 格式，便于离线分析和分享。

**业务规则**：
- 导出格式:
  - **PDF**: 完整报告（图表 + 指标 + 交易明细），适合存档
  - **HTML**: 交互式报告（可缩放图表），适合分享
  - **CSV**: 原始数据（交易明细 + 每日净值），适合进一步分析
- 报告内容: 回测配置 + 绩效指标 + 权益曲线 + 基准对比 + 交易列表
- 批量回测: 支持汇总报告导出

**交互流程**：
```
BacktestResults 弹窗 → "导出" 按钮
  │
  ├─ 下拉菜单: PDF / HTML / CSV
  ├─ 选择格式 → 后端生成 → 下载文件
  └─ [批量回测] 导出汇总报告 + 各标的子报告打包(ZIP)
```

---

#### 3.4.11 稳健性评估（Walk-Forward / Monte Carlo） ❌

**功能描述**：  
提供 Walk-Forward 与 Monte Carlo 等稳健性评估方法，衡量策略在不同时间窗口与随机扰动下的稳定性。

**业务规则**：
- Walk-Forward:
  - 切分方式: 训练窗 / 验证窗 / 测试窗（可滚动）
  - 输出: 每个窗口的绩效指标 + OOS 汇总
- Monte Carlo:
  - 方式: 收益重采样 / 交易序列重排
  - 参数: 模拟次数、置信区间
  - 输出: 绩效指标分布 + 置信区间
- 过拟合检测:
  - 记录 IS/OOS 指标差异
  - 提供稳定性评分（基于回撤、夏普、胜率波动）

**交互流程**：
```
BacktestResults 弹窗 → "稳健性" Tab
  │
  ├─ Walk-Forward 配置:
  │    ├─ 窗口比例/滚动步长
  │    └─ 运行 → 显示每窗口结果
  ├─ Monte Carlo 配置:
  │    ├─ 模拟次数 + 置信区间
  │    └─ 运行 → 显示指标分布图
  └─ 汇总:
       ├─ IS vs OOS 对比
       └─ 稳定性评分
```

---

### 3.5 组合与风险模块

本模块负责投资组合管理和风险控制，覆盖持仓跟踪、仓位管理、风险度量和风险预警。

#### 3.5.1 持仓管理 🟡

**功能描述**：  
实时跟踪和展示用户当前持有的所有头寸，包括持仓数量、成本价、当前市价和浮动盈亏。

**业务规则**：
- 持仓来源: 模拟交易/实盘交易产生的持仓记录
- 持仓字段: 标的代码、标的名称、策略名、方向（多/空）、数量、入场价、当前价、浮动盈亏（金额+百分比）、入场日期
- 当前价: 通过行情数据更新（5 秒轮询）
- 浮动盈亏 = (当前价 - 入场价) × 数量 × 方向系数
- 汇总统计: 总市值、总浮动盈亏、持仓数量

**交互流程**：
```
Portfolio 页面
  │
  ├─ 顶部汇总卡片（3 个）:
  │    ├─ 总市值 + 持仓数量
  │    ├─ 未实现盈亏（5秒刷新，颜色编码涨跌）
  │    └─ 已实现盈亏 + 已平仓交易数
  │
  ├─ 持仓表格（Open Positions）:
  │    ├─ 列: 标的 / 策略 / 方向(多空Badge) / 数量 / 入场价 / 当前价 / 浮动盈亏($/%) / 入场日期 / [操作]
  │    ├─ 盈亏列: 正数绿色 / 负数红色
  │    ├─ 实时刷新当前价和浮动盈亏
  │    └─ 操作: "平仓" 按钮
  │
  └─ 后续迭代: 持仓分布饼图 / 行业/策略维度聚合
```

**现有实现**（部分）：
- 前端页面: `src/pages/Portfolio.tsx`
- 前端组件: `src/components/PortfolioManagement.tsx`
- 前端 API: `src/lib/api.ts` → `portfolioAPI.positions()`
- 后端 API: 部分搭建

---

#### 3.5.2 平仓操作 🟡

**功能描述**：  
用户可手动平仓已有持仓。平仓后持仓从"开放持仓"移动到"已平仓交易"，计算实现盈亏。

**业务规则**：
- 平仓需二次确认（确认弹窗）
- 平仓执行:
  - [模拟] 按当前市价立即成交
  - [实盘] 发送平仓订单到券商，等待成交回报
- 平仓后:
  - 持仓记录从 open → closed
  - 计算实现盈亏 = (出场价 - 入场价) × 数量 × 方向系数 - 费用
  - 记录到已平仓交易表
- 支持部分平仓（平掉部分数量）

**交互流程**：
```
Portfolio 页面 → 持仓表 → 点击某持仓的 "平仓" 按钮
  │
  ├─ 弹出确认弹窗:
  │    ├─ 显示: 标的 + 方向 + 数量 + 入场价 + 当前价 + 预估盈亏
  │    ├─ 可选: 平仓数量（默认全部）
  │    └─ [确认平仓] / [取消]
  │
  ├─ 确认 → 执行平仓:
  │    ├─ [成功] 该持仓从表格消失，出现在"已平仓交易"区域
  │    └─ [失败] 显示错误提示（如"市场已关闭"）
  │
  └─ 已平仓交易表格 (Closed Trades):
       └─ 列: 标的 / 策略 / 方向 / 数量 / 入场价 / 出场价 / 实现盈亏($/%) / 持仓天数 / 出场日期
```

**现有实现**（部分）：
- 前端: `src/components/PortfolioManagement.tsx`（平仓确认弹窗 + 已平仓表格）
- 前端 API: `src/lib/api.ts` → `portfolioAPI.closePosition()`

---

#### 3.5.3 仓位规模管理 ❌

**功能描述**：  
根据风险管理规则自动计算建仓时的头寸大小，避免单笔交易风险过大或总仓位失控。

**业务规则**：
- 仓位算法:

| 方法 | 计算公式 | 适用场景 |
|------|----------|----------|
| 固定金额 | 每笔 = 固定金额 | 简单，初学者 |
| 固定比例 | 每笔 = 总资金 × 比例 | 账户增长时增加仓位 |
| Kelly 公式 | f = (p × b - q) / b | 最优增长率 |
| 等风险 | 根据波动率反比分配 | 风险平均化 |
| 风险平价 | 各标的对组合风险贡献相等 | 组合级风险均衡 |

- 最大单标的仓位限制（如不超过总资金 20%）
- 最大总仓位限制（如满仓率不超过 80%）
- 分行业/分策略仓位限制

**交互流程**：
```
组合设置 → 仓位管理规则
  │
  ├─ 选择仓位模型: 固定金额 / 固定比例 / Kelly / 等风险 / 风险平价
  ├─ 配置参数（根据模型不同）:
  │    ├─ 固定金额: 每笔金额
  │    ├─ 固定比例: 比例(%)
  │    └─ Kelly: 预设胜率/盈亏比 或 自动从回测统计
  ├─ 限制条件:
  │    ├─ 单标的最大仓位: __% 
  │    ├─ 总仓位上限: __% 
  │    └─ 行业/策略集中度限制
  │
  └─ 下单时: 系统自动计算建议手数 → 用户确认/修改
```

---

#### 3.5.4 风险预算 ❌

**功能描述**：  
在组合层面设定风险预算，将总风险分配给不同策略或标的，确保组合整体风险可控。

**业务规则**：
- 风险度量: 年化波动率 / VaR / 最大回撤
- 风险预算层级:
  - 总组合: 全年最大可接受亏损（如总资金的 15%）
  - 策略级: 每个策略的风险预算配额
  - 标的级: 单标的最大风险
- 当某策略/标的的实际风险接近预算时触发预警
- 超出预算时: 禁止新增仓位 / 强制减仓 / 仅告警（可配置）

**交互流程**：
```
组合设置 → 风险预算配置
  │
  ├─ 总风险预算: 最大年化回撤 = __% / 最大亏损金额 = __
  │
  ├─ 策略分配:
  │    ├─ 策略A: 风险配额 30%
  │    ├─ 策略B: 风险配额 50%
  │    └─ 预留: 20%
  │
  ├─ 使用情况监控面板:
  │    ├─ 进度条: 已用风险 / 预算额度
  │    └─ 颜色: 绿(<60%) / 黄(60-80%) / 红(>80%)
  │
  └─ 超出时行为: [告警] / [禁止加仓] / [自动减仓]
```

---

#### 3.5.5 VaR 计算 ❌

**功能描述**：  
计算组合在给定置信水平下的最大预期亏损（Value at Risk），帮助量化尾部风险。

**业务规则**：
- 计算方法:
  - 历史模拟法: 基于过去 N 天收益率分布
  - 参数法（方差-协方差）: 假设正态分布
  - 蒙特卡洛: 随机模拟路径
- 置信水平: 95% / 99%（用户选择）
- 时间窗口: 1 天 / 5 天 / 10 天
- 计算粒度:
  - 单标的 VaR
  - 组合 VaR（考虑相关性，非简单加总）
  - 策略级 VaR
- 展示: VaR 数值 + 历史收益率分布图 + 尾部标注

**交互流程**：
```
Analytics 页面 → Risk Metrics Tab
  │
  ├─ VaR 计算卡片:
  │    ├─ 显示: 95%-VaR / 99%-VaR 数值
  │    ├─ 时间窗口选择: 1天 / 5天 / 10天
  │    ├─ 计算方法选择: 历史模拟 / 参数法 / 蒙特卡洛
  │    └─ 分解: 各标的贡献度
  │
  └─ 收益率分布图:
       ├─ 直方图 + 正态拟合线
       └─ VaR 阈值线标注
```

---

#### 3.5.6 回撤监控 🟡

**功能描述**：  
持续监控组合/策略的回撤情况，当回撤接近或突破预设阈值时触发预警。

**业务规则**：
- 回撤定义: 从历史最高净值到当前净值的百分比下降
- 回测中已实现最大回撤计算（✅）
- 待实现: 实盘/模拟的实时回撤监控
- 回撤阈值:
  - 警告级: 如 -5%（黄色提醒）
  - 严重级: 如 -10%（红色告警 + 通知）
  - 熔断级: 如 -15%（自动暂停策略）
- 回撤周期统计: 当前回撤 / 月内最大 / 年内最大

**交互流程**：
```
Analytics 页面 → 回撤监控区域
  │
  ├─ 当前回撤: -X.XX%（颜色编码）
  ├─ 回撤曲线图: 历史回撤走势
  ├─ 阈值参考线: 在图表上标注警告/严重/熔断线
  │
  └─ 设置回撤阈值:
       ├─ 警告: __% → 触发消息通知
       ├─ 严重: __% → 触发邮件/短信
       └─ 熔断: __% → 自动暂停交易
```

**现有实现**（部分）：
- 回测回撤: VNPy 引擎计算 `max_drawdown`，在 `BacktestResults` 显示
- 前端: `src/components/RiskMetrics.tsx`（Max Drawdown 展示卡片）

---

#### 3.5.7 风险预警 ❌

**功能描述**：  
配置式风险预警规则引擎，当组合状态触发预设条件时自动发出告警通知。

**业务规则**：
- 预警类型:

| 类型 | 触发条件示例 | 响应 |
|------|------------|------|
| 回撤预警 | 回撤 > 阈值 | 通知 + 可选暂停 |
| VaR 突破 | 实际亏损 > VaR 估计 | 通知 + 检查模型 |
| 集中度预警 | 单标的仓位 > 限制 | 通知 + 禁止加仓 |
| 相关性预警 | 持仓间相关系数 > 0.8 | 通知（风险未分散） |
| 流动性预警 | 持仓量 > 标的日成交量 × 比例 | 通知（难以退出） |
| 波动率预警 | 波动率突增（>2σ） | 通知（市场异常） |

- 预警通道: 系统内弹窗 / 邮件 / 短信 / IM（可配置）
- 预警合并: 相同类型预警在 N 分钟内不重复发送
- 预警记录: 所有触发的预警记入日志

**交互流程**：
```
系统设置 → 风险预警规则
  │
  ├─ 规则列表: 已配置的预警规则
  │    ├─ 每行: 类型 + 条件 + 通道 + 状态(启用/禁用)
  │    └─ 操作: 编辑 / 删除 / 启用/禁用切换
  │
  ├─ 新建规则:
  │    ├─ 选择类型: 回撤/VaR/集中度/相关性/...
  │    ├─ 设置条件: 阈值/比较运算/时间窗口
  │    ├─ 设置响应: 通知通道 + 自动动作(可选)
  │    └─ 保存
  │
  └─ 预警历史: 查看所有已触发的预警记录
       └─ 表格: 时间 / 类型 / 条件 / 详情 / 处理状态
```

---

#### 3.5.8 止损管理 ✅

**功能描述**：  
策略级别的自动止损机制，支持固定止损和移动止损两种模式。每个持仓独立跟踪止损状态。

**业务规则**：
- 止损模式:
  - **固定止损**: 入场价 - 2 × 标准差（基于近期波动率）
  - **移动止损**: 随价格上涨而上移（入场价 - 1 × 标准差），只上不下
- 每个持仓有独立的 `StopLossState`（入场价、止损价、最高价、是否触发）
- 止损触发后自动生成平仓信号
- 在策略 `on_bar()` 回调中检查止损条件

**现有实现**：
- 止损模块: `app/strategies/stop_loss.py` → `StopLossManager`, `StopLossState`
- 使用示例: `app/strategies/triple_ma_strategy.py`（三均线策略集成止损）

---

#### 3.5.9 压力测试 ❌

**功能描述**：  
在极端市场条件下模拟组合表现，评估策略在黑天鹅事件中的抗风险能力。

**业务规则**：
- 情景类型:
  - **历史情景**: 重放历史极端行情（2015 股灾、2020 疫情、2008 金融危机）
  - **假设情景**: 用户自定义（如"指数单日下跌 8%"、"连续 5 天下跌 3%"）
  - **蒙特卡洛情景**: 基于统计特征随机生成极端路径
- 输出: 情景下的组合盈亏、最大回撤、各标的表现
- 与当前持仓关联: 基于实际持仓计算压力下的损失

**交互流程**：
```
Analytics 页面 → 压力测试区域
  │
  ├─ 情景选择:
  │    ├─ 预置情景: 2015股灾 / 2020疫情 / 自定义
  │    ├─ 自定义: 设置价格冲击幅度 + 持续天数
  │    └─ 蒙特卡洛: 设置模拟次数 + 置信区间
  │
  ├─ 压力测试结果:
  │    ├─ 组合损失: 绝对金额 + 百分比
  │    ├─ 各标的损失分解
  │    └─ 与 VaR 对比
  │
  └─ 建议: 基于结果给出减仓/对冲建议
```

---

### 3.6 交易执行模块

本模块负责从策略信号到实际交易的全链路执行，包括模拟交易、实盘下单、订单管理、交易算法和风控拦截。

#### 3.6.1 模拟交易 ❌

**功能描述**：  
提供纸盘交易（Paper Trading）能力，使用真实行情数据但不真实下单，帮助用户在上线前验证策略的实时表现。

**业务规则**：
- 模拟账户: 独立的虚拟资金账户（初始金额可配置）
- 撮合方式: 按当前行情价格立即成交（简化模型）或按盘口模拟（含滑点）
- 资金: 虚拟资金，不影响真实账户
- 模拟交易记录与实盘交易格式一致（便于切换）
- 策略可在模拟/实盘间切换运行
- 每日结算: 计算日收益、更新持仓市值

**交互流程**：
```
交易面板 → 模式切换: [模拟交易] / [实盘交易]
  │
  ├─ [模拟交易模式]
  │    ├─ 账户信息: 虚拟资金余额 + 浮动盈亏 + 总资产
  │    ├─ 手动下单: 选择标的 → 买入/卖出 → 数量 → 确认
  │    ├─ 策略自动交易: 选择策略 → 启动 → 策略自动发出信号 → 模拟成交
  │    └─ 交易记录: 与实盘格式一致
  │
  └─ 模拟→实盘切换:
       ├─ 确认弹窗（提示风险）
       ├─ 验证: KYC 已完成 + 券商已连接
       └─ 切换后使用真实资金
```

---

#### 3.6.2 实盘下单 ❌

**功能描述**：  
通过券商 API 发送真实交易订单。支持手动下单和策略自动下单两种方式。

**业务规则**：
- 前置条件: KYC 已完成 + 券商已连接 + MFA 已启用
- 订单类型:

| 类型 | 说明 |
|------|------|
| 市价单 | 以市场最优价格成交 |
| 限价单 | 指定价格，等待成交 |
| 止损单 | 价格触及止损点时转为市价单 |
| 止盈单 | 价格触及目标位时卖出 |
| 条件单 | 自定义触发条件（价格/时间/指标） |

- A 股限制: T+1（当日买入次日才可卖出）、涨跌停限制（±10%/±20%）
- 批量下单: 支持一次提交多笔订单
- 订单确认: 手动下单显示确认弹窗；策略自动下单可设为免确认

**交互流程**：
```
交易面板 → [实盘交易模式]
  │
  ├─ [手动下单]:
  │    ├─ 选择标的（SymbolSearch）
  │    ├─ 选择方向: 买入 / 卖出
  │    ├─ 订单类型: 市价 / 限价 / 止损 / ...
  │    ├─ 数量: 手动输入或按仓位模型计算建议量
  │    ├─ [限价] 价格: 输入 / 从盘口选择
  │    ├─ 预估费用显示
  │    ├─ 风控检查: 通过/拒绝（显示原因）
  │    └─ 确认弹窗 → 提交到券商
  │
  ├─ [策略自动下单]:
  │    ├─ 选择策略 → 绑定实盘账户
  │    ├─ 设置: 最大单笔金额 / 最大持仓 / 是否需确认
  │    ├─ 启动策略 → 策略产生信号 → 风控检查 → 下单
  │    └─ 策略下单日志: 实时显示
  │
  └─ 订单状态追踪:
       └─ 实时更新: 提交 → 已报 → 已成交 / 部分成交 / 已拒绝 / 已撤销
```

---

#### 3.6.3 订单管理 ❌

**功能描述**：  
统一管理所有交易订单的生命周期，包括订单查看、状态跟踪、订单修改和撤销。

**业务规则**：
- 订单生命周期: 创建 → 提交 → 已报 → 已成交/部分成交/已拒绝/已撤销/已过期
- 订单字段: ID、标的、方向、类型、价格、数量、已成交量、状态、策略名、创建时间、更新时间
- 订单修改: 未成交的限价单可修改价格和数量
- 订单撤销: 未成交/部分成交的订单可撤销
- 成交回报: 实时接收券商成交回报 → 更新订单状态和持仓
- 成交拆分: 大单可能分多笔成交

**交互流程**：
```
订单管理页面（新页面 / 交易面板子页签）
  │
  ├─ 当日委托:
  │    ├─ 表格: 委托时间/标的/方向/类型/委托价/委托量/已成交量/状态/操作
  │    ├─ 筛选: 全部 / 待成交 / 已成交 / 已撤销
  │    └─ 操作: 改单(未成交) / 撤单(未成交)
  │
  ├─ 成交记录:
  │    ├─ 表格: 成交时间/标的/方向/成交价/成交量/手续费
  │    └─ 汇总: 当日成交金额 / 手续费合计
  │
  └─ 历史委托: 可按日期范围查询（关联审计日志）
```

---

#### 3.6.4 交易算法 ❌

**功能描述**：  
提供常用的算法交易执行策略，用于优化大单的执行质量，减少市场冲击。

**业务规则**：
- 支持算法:

| 算法 | 逻辑 | 参数 |
|------|------|------|
| TWAP | 时间均匀拆分 | 总量、时间窗口、拆分频率 |
| VWAP | 按成交量分布拆分 | 总量、时间窗口、成交量预测 |
| 冰山单 | 仅展示部分数量 | 总量、可见量、补单间隔 |
| 条件触发 | 条件满足后执行 | 触发条件、订单类型 |

- 算法订单可暂停/恢复/取消
- 执行中实时显示进度（已执行量/总量/平均价/vs VWAP偏差）
- 执行完成后生成执行质量报告

**交互流程**：
```
下单界面 → "算法执行" 选项
  │
  ├─ 选择算法: TWAP / VWAP / 冰山单 / 条件触发
  ├─ 配置参数:
  │    ├─ [TWAP] 总量: __ / 时间窗口: __ / 拆分频率: __
  │    ├─ [VWAP] 总量: __ / 参考日期（成交量预测）
  │    └─ [冰山] 总量: __ / 可见量: __
  ├─ 预览: 预期执行时间线
  │
  ├─ 启动 → 算法开始执行 → 实时进度面板:
  │    ├─ 进度条: 已执行 / 总量
  │    ├─ 平均成交价 vs 基准(VWAP)
  │    └─ 操作: 暂停 / 恢复 / 取消
  │
  └─ 完成 → 执行报告:
       ├─ 实际vs计划的偏差分析
       └─ 市场冲击估算
```

---

#### 3.6.5 风控拦截 ❌

**功能描述**：  
在订单执行前进行多层风控检查，拦截不合规或高风险的交易指令，确保交易安全。

**业务规则**：
- 风控检查层次:
  1. **合法性检查**: 品种是否可交易 / 是否在交易时段 / 是否停牌
  2. **资金检查**: 可用资金是否充足 / 保证金是否足够
  3. **仓位检查**: 是否超过单标的限额 / 总仓位限额 / 行业集中度
  4. **频率检查**: 是否超过交易频率限制（防止异常高频）
  5. **自定义规则**: 用户可配置的额外检查项
- 风控结果:
  - **通过**: 订单正常执行
  - **拦截**: 订单被阻止 + 显示原因（可强制覆盖，需额外确认）
  - **警告**: 订单可执行但显示风险提示
- 所有风控检查记录到审计日志

**交互流程**：
```
下单请求 → 风控引擎检查（后端）
  │
  ├─ [通过] → 正常执行下单
  │
  ├─ [警告] → 前端显示风险提示 + 用户确认后继续
  │    └─ 黄色提示: "该标的今日已交易 3 次，是否继续？"
  │
  └─ [拦截] → 前端显示拦截原因
       ├─ 红色提示: "可用资金不足" / "超出单标的仓位限制"
       └─ 可选: [申请豁免]（需管理员审批）
```

---

#### 3.6.6 券商接入 ❌

**功能描述**：  
通过统一交易网关抽象层对接不同券商的交易接口，实现下单、查询和结算功能。

**业务规则**：
- 交易网关抽象层:
  - 统一接口: `connect()`, `login()`, `send_order()`, `cancel_order()`, `query_position()`, `query_account()`
  - 事件回调: `on_order()`, `on_trade()`, `on_position()`, `on_account()`
- 券商接入路线:

| 阶段 | 券商/接口 | 市场 |
|------|-----------|------|
| [P1] | CTP / 恒生 / 券商开放平台 | A 股 |
| [P2] | 富途 OpenAPI / 老虎证券 | 港股 |
| [P3] | IB TWS API / 老虎 / 富途 | 美股 |

- 连接管理:
  - 自动重连（断线后指数退避重连）
  - 心跳检测（30 秒）
  - 多账户支持
- 测试模式: 对接券商的模拟交易环境

**交互流程**：
```
系统设置 → 券商接入
  │
  ├─ 券商列表: 显示已支持的券商
  │    └─ 每行: 券商名 + 状态(已连接/未连接) + 操作
  │
  ├─ 添加/配置券商:
  │    ├─ 选择券商类型
  │    ├─ 填写连接参数: 服务器地址 / 端口 / 账号 / 密码(加密存储)
  │    ├─ 测试连接 → 显示连接结果
  │    └─ 保存配置
  │
  ├─ 连接管理:
  │    ├─ 连接/断开 按钮
  │    ├─ 状态: 连接中 / 已连接 / 已断开 / 错误
  │    └─ 连接日志: 最近连接/断开/重连记录
  │
  └─ 账户信息: 连接后显示资金/持仓（只读同步）
```

---

#### 3.6.7 信号转订单 ❌

**功能描述**：  
连接策略引擎和交易执行，将策略产生的交易信号自动转化为可执行的订单指令。

**业务规则**：
- 信号来源: 策略引擎 `on_bar()` / `on_tick()` 产生的买卖信号
- 转换流程: 策略信号 → 仓位计算 → 风控检查 → 订单生成 → 执行
- 执行模式:

| 模式 | 说明 |
|------|------|
| 自动执行 | 信号直接转为订单（无人工干预） |
| 半自动 | 信号生成订单草稿 → 用户确认后执行 |
| 手动 | 信号仅作为提示，完全人工下单 |

- 信号日志: 记录每个信号的方向、标的、原因、转换结果
- 信号合并: 多策略对同一标的的信号进行综合（如 2 个策略买入 + 1 个卖出 → 净买入）

**交互流程**：
```
交易面板 → 信号监控区域
  │
  ├─ 实时信号流:
  │    ├─ 每条信号: 时间 + 策略名 + 标的 + 方向(买/卖) + 建议量 + 原因
  │    └─ 颜色: 买入(绿) / 卖出(红)
  │
  ├─ [自动模式] 信号直接执行 → 显示执行结果
  │
  ├─ [半自动模式] 信号生成待确认订单:
  │    ├─ 用户可修改价格/数量
  │    ├─ [确认] → 执行
  │    └─ [拒绝] → 跳过
  │
  └─ 信号历史: 所有信号记录（含执行结果/被拒绝/被风控拦截）
```

---

---

## 4. 非功能需求

### 4.1 性能需求

| 指标 | 目标值 | 备注 |
|------|--------|------|
| API 响应时间（P95） | < 500ms | 常规查询接口 |
| API 响应时间（P99） | < 2s | 复杂聚合查询 |
| K 线数据查询 | < 300ms（单股 1 年） | 含均线/指标计算 |
| 回测执行速度 | < 30s（单策略 5 年日线） | CTA 引擎 |
| 批量回测 | 支持 10 任务并发排队 | RQ Worker 可横向扩展 |
| 前端首屏加载 | < 2s（Gzip, CDN）| Vite 构建优化 |
| 前端交互响应 | < 100ms（用户操作反馈） | 乐观更新 |
| 数据同步吞吐 | > 500 条/秒（日线级） | Tushare 受速率限制 |
| WebSocket 推送延迟 | < 100ms（服务端 → 客户端） | 仅实时行情场景 |
| 数据库查询（简单） | < 50ms | 索引优化 |
| 数据库查询（复杂聚合） | < 3s | EXPLAIN 分析 + 必要时物化视图 |
| 并发用户 | ≥ 50 同时在线 | 个人/小团队场景 |

### 4.2 安全需求

#### 4.2.1 认证与授权

| 需求 | 描述 | 状态 |
|------|------|------|
| 密码存储 | bcrypt 哈希（cost factor ≥ 12） | ✅ 已实现 |
| JWT Token | HS256 签名, 有效期可配 | ✅ 已实现 |
| Token 刷新 | 自动刷新 / sliding window | ❌ 待实现 |
| RBAC | 基于角色的权限控制 | ❌ 待实现 |
| MFA | TOTP 二次验证 | ❌ 待实现 |
| API Key | 长期有效的API密钥（用于程序化访问） | ❌ 待实现 |
| 会话管理 | 可查看/踢出活跃会话 | ❌ 待实现 |

#### 4.2.2 数据安全

| 需求 | 描述 |
|------|------|
| 传输加密 | 全链路 HTTPS / TLS 1.2+ |
| 数据库加密 | 敏感字段加密存储（API Token, 券商凭证） |
| 密钥管理 | 环境变量注入，不硬编码；生产环境使用密钥管理服务 |
| SQL 注入防护 | SQLAlchemy ORM 参数化查询（已实现） |
| XSS 防护 | React 默认转义 + CSP 头 |
| CSRF 防护 | SameSite Cookie + CSRF Token |
| 日志脱敏 | 日志中不记录密码、Token 等敏感信息 |
| CORS | 仅允许指定域名（已配置 `CORS_ORIGINS`） |

#### 4.2.3 合规要求

- 隐私: 用户数据处理符合《个人信息保护法》
- 金融数据: 市场数据使用需符合数据源授权协议
- 审计: 核心操作保留审计日志（≥ 5 年）
- 数据出境: 跨境市场数据传输需遵守《数据安全法》

### 4.3 可用性与可靠性

| 需求 | 目标值 | 策略 |
|------|--------|------|
| 系统可用性 | ≥ 99.5%（非交易时段维护窗口除外） | Docker 自愈 + 健康检查 |
| RTO（恢复时间目标） | < 30 分钟 | 自动重启 + 备份恢复 |
| RPO（恢复点目标） | < 1 小时 | 定时数据库备份 |
| 故障隔离 | 单服务故障不影响其他服务 | Docker Compose 服务隔离 |
| 优雅降级 | 数据源不可用时显示缓存数据 | Redis 缓存层 |
| 部署零停机 | 蓝绿部署 / 滚动更新 | Docker Compose + Nginx |
| 健康检查 | 所有容器配置健康检查 | ✅ 已配置 |
| 自动重启 | 容器异常退出后自动重启 | Docker `restart: unless-stopped` |

### 4.4 可扩展性

| 维度 | 当前方案 | 扩展路径 |
|------|----------|----------|
| 应用层 | 单实例 | Nginx 负载均衡 + 多实例 |
| 后台任务 | 单 Worker | 多 Worker 实例（RQ 原生支持） |
| 数据库 | 单 MySQL | 读写分离 → 分库分表 |
| 缓存 | 单 Redis | Redis Sentinel / Cluster |
| 存储 | 本地磁盘 | 对象存储（MinIO / S3） |
| 数据量 | 百万行级 | 分区表 + 归档策略 |

### 4.5 备份与恢复

| 策略 | 描述 |
|------|------|
| 数据库备份 | MySQL: mysqldump 每日全备 + binlog 增量备份 |
| 备份保留 | 每日备份保留 7 天；每周备份保留 4 周；每月备份保留 12 月 |
| 备份验证 | 每月恢复测试（验证备份可用性） |
| 配置备份 | 环境变量 / Docker Compose / Nginx 配置版本化（Git） |
| 策略代码 | 用户策略代码版本化存储（数据库 + 可选 Git） |
| 灾难恢复 | 完整恢复文档 → 详见 `BACKUP_RECOVERY_PLAN.md` |

### 4.6 国际化与本地化

| 维度 | V1 目标 | 后续扩展 |
|------|---------|----------|
| 界面语言 | 中文 + 英文（i18n） | 按需增加语言包 |
| 日期格式 | 北京时间（默认）| 可选时区切换 |
| 数字格式 | 中国格式（-999,999.99） | 按 locale 自动 |
| 币种 | CNY（默认）| 多币种切换（含汇率） |
| 交易所时间 | A 股 → 北京时间 | HK/US 自动匹配交易所时区 |

### 4.7 可测试性

| 需求 | 描述 |
|------|------|
| 单元测试覆盖率 | ≥ 80%（核心业务逻辑） |
| 集成测试 | 覆盖所有 API 端点 |
| E2E 测试 | 覆盖核心用户流程（Playwright） |
| Mock 支持 | 数据源接口可 Mock（测试环境） |
| 测试数据 | 提供标准化测试数据集 |
| CI/CD | 提交自动触发测试 → 通过后自动部署 |

### 4.8 可观测性

| 需求 | 描述 |
|------|------|
| 日志 | 结构化日志（JSON 格式）+ 日志分级（DEBUG/INFO/WARN/ERROR） |
| 日志聚合 | ELK / Loki（可选） |
| 指标 | Prometheus 格式指标暴露 |
| 追踪 | 请求链路追踪（OpenTelemetry，可选） |
| 仪表盘 | Grafana Dashboard（系统指标 + 业务指标） |

---

## 5. AI 与大模型集成需求

> **定位**: 本章描述 AI/LLM 集成的功能需求和应用场景，设计决策（如模型选择、部署方式）留待设计阶段确定。

### 5.1 AI 辅助策略生成 ❌

**功能描述**：  
用户通过自然语言描述交易想法，AI 自动生成策略 Python 代码，降低量化策略编写门槛。

**业务规则**：
- 输入: 自然语言描述（如"当5日均线上穿20日均线时买入，跌破时卖出"）
- 输出: 符合平台策略框架的 Python 代码（CTA 策略模板或自定义模板）
- 生成流程:
  1. 用户输入自然语言描述
  2. AI 解析意图，提取交易条件
  3. 生成策略代码（含参数定义、信号逻辑、风控规则）
  4. 代码语法检查（Lint）
  5. 用户确认 / 修改 → 保存
- 安全: 生成代码在沙箱中运行（不允许文件 I/O、网络、系统调用）
- 迭代: 用户可基于已生成代码进行自然语言修改（"增加止损条件10%"）

**交互流程**：
```
策略编辑器 → "AI 生成" 按钮
  │
  ├─ AI 对话面板（侧边栏）:
  │    ├─ 输入: "我想要一个双均线策略，5日上穿20日买入，下穿卖出"
  │    ├─ AI 回复: 策略代码预览 + 解释
  │    ├─ 用户: "再加一个RSI过滤，RSI<30时才买入"
  │    ├─ AI 回复: 更新后的代码
  │    └─ "应用到编辑器" 按钮
  │
  ├─ 代码自动填入 Monaco 编辑器
  │    └─ 高亮 AI 生成部分（可区分手写与AI生成）
  │
  └─ Lint 检查 → 保存 → 可直接运行回测
```

### 5.2 智能选股推荐 ❌

**功能描述**：  
基于用户偏好、市场状态和多因子分析，AI 推荐潜在的投资标的。

**业务规则**：
- 推荐依据:
  - 用户历史交易偏好（行业/风格/市值偏好）
  - 多因子评分（量化因子分析）
  - 市场状态判断（牛市/震荡/熊市）
  - 技术面信号（突破/支撑/背离）
  - 基本面指标（PE/PB/ROE/营收增速）
- 推荐输出:
  - 标的列表（含推荐理由，自然语言）
  - 每个标的: 评分 + 推荐理由 + 关键指标 + 风险提示
- 合规声明: "推荐仅供参考，不构成投资建议"
- 更新频率: 每日收盘后更新
- 用户反馈: 可标记"有用"/"无用"（优化推荐模型）

**交互流程**：
```
Analytics 页面 → "AI 推荐" Tab
  │
  ├─ 偏好设置:
  │    ├─ 风格: 价值/成长/动量/混合
  │    ├─ 市值: 大盘/中盘/小盘
  │    ├─ 行业: 多选
  │    └─ 风险偏好: 保守/稳健/激进
  │
  ├─ 推荐列表:
  │    ├─ 每行: 标的名 + 评分 + AI推荐理由(一句话)
  │    ├─ 展开: 详细分析 + 因子雷达图 + 关键指标
  │    └─ 操作: 加入自选 / 加入策略 / 反馈
  │
  └─ 免责声明条
```

### 5.3 自然语言交互查询 ❌

**功能描述**：  
用户通过自然语言提问，AI 自动查询数据库并以图表或文字形式呈现结果。

**业务规则**：
- 支持查询类型:
  - 数据查询: "贵州茅台过去一年的走势是什么？"
  - 组合查询: "我的组合中哪个策略表现最好？"
  - 对比分析: "比较下中证500和沪深300今年的表现"
  - 回测查询: "上次双均线回测的最大回撤是多少？"
- 查询流程:
  1. NL → AI 理解意图 → 生成 SQL/API 调用
  2. 执行查询 → 获取结果
  3. AI 组织结果 → 自然语言回答 + 可选图表
- 安全: NL-to-SQL 仅允许 SELECT 操作，参数化查询防注入
- 上下文记忆: 多轮对话支持（"那如果换成周线呢？"）

**交互流程**：
```
全局 AI 助手（侧边浮窗 / 快捷键呼出）
  │
  ├─ 对话界面:
  │    ├─ 用户: "贵州茅台过去半年的走势"
  │    ├─ AI: K线图 + "贵州茅台近半年累计上涨12.3%..."
  │    ├─ 用户: "和五粮液比较一下"
  │    └─ AI: 对比折线图 + 对比分析文字
  │
  ├─ 快捷操作: AI 回复中可嵌入操作按钮
  │    └─ "查看详情" / "运行回测" / "加入自选"
  │
  └─ 历史对话: 可查看过往对话记录
```

### 5.4 异常检测与预警 ❌

**功能描述**：  
利用 AI/ML 模型检测市场异常和策略行为异常，超越传统规则引擎的检测能力。

**业务规则**：
- 检测模型:
  - 时间序列异常检测（价格/成交量异常）
  - 策略行为偏差检测（实盘 vs 回测偏差）
  - 相关性突变检测（板块/个股相关性断裂）
- 训练数据: 使用平台历史数据持续训练/更新模型
- 与规则引擎配合: AI 检测作为规则引擎的补充层
- 误报处理: 用户标记误报 → 优化模型

### 5.5 智能报告生成 ❌

**功能描述**：  
AI 自动生成自然语言的分析报告，将数据指标转化为可读的投资洞察。

**业务规则**：
- 报告类型:
  - 日/周/月绩效报告（参见 3.8 报告模块）
  - 策略分析报告
  - 选股分析报告
- 报告内容:
  - 数据驱动的自然语言总结
  - 关键发现和异常点提示
  - 趋势分析和前瞻建议
  - 配图和数据表格
- 输出格式: Markdown → 可导出 PDF/HTML
- 用户可自定义报告模板和关注点

### 5.6 市场情绪分析 ❌

**功能描述**：  
通过 NLP 分析新闻、公告、社交媒体等文本数据，量化市场情绪。

**业务规则**：
- 数据源:
  - 财经新闻（新浪财经/东方财富/同花顺）
  - 上市公司公告
  - 社交媒体（雪球/东方财富股吧）
  - 分析师报告摘要
- 输出:
  - 情绪指数（-1 ~ +1，极度看空 ~ 极度看多）
  - 热度指数（关注度排名）
  - 舆情事件时间线
  - 情绪与价格走势叠加图
- 告警: 情绪极端变化时触发告警（如个股舆论突然转负）
- 更新频率: 日内多次更新（延迟 < 30 分钟）

**交互流程**：
```
Analytics 页面 → "市场情绪" Tab
  │
  ├─ 市场整体情绪:
  │    ├─ 情绪仪表盘: 恐惧 ← → 贪婪（类似 CNN Fear & Greed）
  │    └─ 历史趋势: 情绪指数 + 大盘走势叠加
  │
  ├─ 个股情绪:
  │    ├─ 搜索标的 → 情绪指数 + 新闻列表 + 舆情事件
  │    └─ 情绪 vs 股价走势对比图
  │
  └─ 热点追踪:
       ├─ 今日热门话题: 标签云 / 列表
       └─ 行业情绪热力图
```

### 5.7 AI 模型管理 ❌

**功能描述**：  
管理平台使用的 AI/ML 模型，包括模型配置、版本管理和调用统计。

**业务规则**：
- 模型注册: 注册可用的模型（本地/API）
- 配置项:
  - LLM: 模型名 / API 端点 / API Key / temperature / max_tokens
  - ML: 模型文件 / 版本 / 训练集描述
- 版本管理: 每次模型更新保留历史版本
- 调用统计: Token 消耗 / 调用次数 / 延迟 / 费用
- 回退: 可快速回退到上一个模型版本
- A/B 测试: 支持多模型并行测试效果

---

### 3.7 监控与告警模块

本模块提供系统运行状态和交易活动的实时监控能力，以及可配置的多通道告警系统。

#### 3.7.1 系统仪表盘 ✅

**功能描述**：  
Dashboard 页面实时展示系统运行状态，包括任务队列统计、各服务健康状态和数据同步进度。

**业务规则**：
- 统计卡片（轮询 5 秒刷新）:
  - 活跃任务数 / 排队任务数 / 已完成任务数 / 失败任务数
- 队列状态: 按队列名分组显示任务数（high / default / backtest / optimization）
- 系统健康: API / Redis / Worker 服务状态（正常/异常）
- 数据同步状态（轮询 60 秒刷新）:
  - Daemon 运行状态
  - 各端点最后同步时间和行数
  - 缺失日期数量

**交互流程**：
```
Dashboard 页面（登录后默认首页）
  │
  ├─ 4个统计卡片:
  │    ├─ Active Jobs (蓝) / Queued (黄) / Completed (绿) / Failed (红)
  │    └─ 实时数值 + 图标
  │
  ├─ Queue Status 区域:
  │    └─ 每个队列: 名称 + 待处理数 + 执行中数
  │
  ├─ System Status 区域:
  │    ├─ API: ● 正常(绿) / ● 异常(红)
  │    ├─ Redis: ● 正常 / ● 异常
  │    └─ Workers: ● N个在线 / ● 无可用
  │
  └─ Data Sync Status 区域:
       ├─ Daemon: 运行中/已停止
       ├─ 各步骤: 名称 + 最后同步 + 行数 + 缺失日期
       └─ 一致性检查: 通过/异常
```

**现有实现**：
- 后端: `app/api/routes/queue.py` → `GET /api/queue/stats`; `app/api/routes/system.py` → `GET /api/system/sync-status`
- 前端: `src/pages/Dashboard.tsx`

---

#### 3.7.2 数据同步监控 ✅

**功能描述**：  
监控 DataSync 服务的运行状态、同步进度和数据完整性，及时发现数据缺失或同步异常。

**业务规则**：
- 监控维度:
  - Daemon 进程状态（运行/停止/异常）
  - 各端点同步状态（pending / running / completed / failed）
  - 最后成功同步时间
  - 累计同步行数
  - 缺失交易日检测
- 异常判断: 连续 2 天未同步新数据 → 标记异常

**现有实现**：
- 后端: `app/api/routes/system.py` → `GET /api/system/sync-status`
- 后端服务: `app/domains/extdata/sync_status_service.py`
- 前端: Dashboard 同步状态卡片

---

#### 3.7.3 实时盈亏监控 ❌

**功能描述**：  
实时追踪组合、策略和个股层面的盈亏状态，提供实时权益曲线和日内盈亏走势。

**业务规则**：
- 监控层级:
  - 组合级: 总资产、当日盈亏、累计盈亏
  - 策略级: 每个策略的贡献盈亏
  - 标的级: 每个持仓的浮动盈亏
- 更新频率: 依赖实时行情推送（3-5 秒）
- 展示: 实时权益曲线 + 日内盈亏走势 + 盈亏热力图
- 日结: 每日收盘后生成当日盈亏快照

**交互流程**：
```
监控面板（新页面 / Dashboard 扩展）
  │
  ├─ 顶部: 总资产 + 当日盈亏(金额+%) + 累计盈亏
  │
  ├─ 实时权益曲线: 日内走势（分钟级更新）
  │    └─ 叠加: 沪深300同期走势
  │
  ├─ 策略盈亏分解:
  │    └─ 表格: 策略名 / 持仓市值 / 当日盈亏 / 贡献度%
  │
  └─ 标的盈亏热力图:
       └─ 矩阵: 深绿(大涨)→浅绿→灰→浅红→深红(大跌)
```

---

#### 3.7.4 异常检测 ❌

**功能描述**：  
自动检测市场数据异常、策略行为异常和系统运行异常，及时预警潜在风险。

**业务规则**：
- 市场异常:
  - 价格闪崩: 单分钟跌幅 > 5%
  - 成交量异动: 超过 20 日均量 3 倍以上
  - 涨跌停: 触及涨跌停板
  - 集合竞价异常: 开盘价大幅偏离前收
- 策略行为异常:
  - 过度交易: 1 小时内交易次数 > 阈值
  - 单边持仓: 持仓方向严重偏斜
  - 策略回撤异常: 实际回撤大幅超过回测结果
- 系统异常:
  - 服务宕机 / 连接断开
  - 数据延迟 > 阈值
  - 队列积压 > 阈值
- 检测方法: 规则引擎 + 统计模型 + [未来] AI/ML 模型

**交互流程**：
```
异常检测面板
  │
  ├─ 实时异常流:
  │    ├─ 时间 + 类型 + 严重级别(信息/警告/严重) + 描述
  │    └─ 操作: 确认 / 忽略 / 查看详情
  │
  ├─ 异常统计: 今日告警数(按类型/级别)
  │
  └─ 异常规则配置:
       └─ 启用/禁用各检测项 + 调整阈值
```

---

#### 3.7.5 邮件告警 ❌

**功能描述**：  
通过 SMTP 邮件发送告警通知，支持告警模板配置和收件人管理。

**业务规则**：
- SMTP 配置: 服务器/端口/账号/密码/TLS（系统设置中配置）
- 告警模板: 按告警类型定义邮件标题和内容模板（支持变量插值）
- 收件人: 默认为用户注册邮箱，可添加额外收件人
- 发送限制: 同类告警 5 分钟内不重复发送
- 邮件记录: 所有发送记录可查询

---

#### 3.7.6 短信告警 ❌

**功能描述**：  
通过短信通道发送紧急告警通知，用于关键性事件（如大额亏损、系统宕机）。

**业务规则**：
- 短信服务: 接入第三方短信 API（如阿里云短信/腾讯云短信）
- 仅用于严重级别告警（避免滥用）
- 手机号验证: 发送前需验证手机号
- 发送限制: 每日最多 20 条
- 费用: 短信费用记录和提醒

---

#### 3.7.7 IM 告警 ❌

**功能描述**：  
通过即时通讯工具发送告警通知，支持微信、钉钉、Telegram、Slack 等 Webhook 集成。

**业务规则**：
- 支持通道:

| 通道 | 接入方式 | 特点 |
|------|----------|------|
| 微信（企业微信） | Webhook / 应用消息 | 国内首选 |
| 钉钉 | 机器人 Webhook | 企业常用 |
| Telegram | Bot API | 海外常用 |
| Slack | Webhook / Bot | 技术社区常用 |

- 告警级别映射:
  - 信息: 仅 IM 通知
  - 警告: IM + 邮件
  - 严重: IM + 邮件 + 短信
- Webhook 配置: URL + 可选的 Secret 签名
- 消息格式: 支持 Markdown（钉钉/企业微信/Telegram/Slack）

**交互流程**：
```
系统设置 → 通知通道配置
  │
  ├─ 通道列表: 已配置的通知通道
  │    ├─ 每行: 类型(邮件/短信/微信/钉钉/...) + 状态 + 操作
  │    └─ "测试" 按钮: 发送测试消息验证通道可用
  │
  ├─ 添加通道:
  │    ├─ 选择类型 → 填写配置参数
  │    ├─ [邮件] SMTP 服务器配置
  │    ├─ [短信] API Key + 手机号
  │    ├─ [微信] Webhook URL
  │    ├─ [钉钉] 机器人 Webhook + Secret
  │    └─ 测试 → 保存
  │
  └─ 告警级别 → 通道映射:
       ├─ 信息: ✓IM  ✗邮件  ✗短信
       ├─ 警告: ✓IM  ✓邮件  ✗短信
       └─ 严重: ✓IM  ✓邮件  ✓短信
```

---

#### 3.7.8 告警规则引擎 ❌

**功能描述**：  
可配置的告警规则系统，支持自定义触发条件、响应动作和告警策略（合并/静默/升级）。

**业务规则**：
- 规则定义:
  - 条件: 指标 + 比较运算 + 阈值 + 时间窗口
  - 动作: 通知 + 可选自动操作（如暂停策略）
  - 策略: 合并窗口 / 静默期 / 升级规则
- 规则模板: 预置常用规则模板（一键启用）
- 规则优先级: 高优先级规则可覆盖低优先级
- 告警历史: 全量记录所有触发的告警 + 处理状态（未处理/已确认/已解决）
- 告警统计: 按类型/级别/时间段统计告警数量和趋势

---

#### 3.7.9 Webhook 告警 ❌

**功能描述**：  
支持将告警事件以 Webhook 方式推送到外部系统（自建服务/自动化平台），便于联动执行与通知分发。

**业务规则**：
- Webhook 配置:
  - URL + Secret（可选）
  - 订阅事件类型（异常检测/风控拦截/数据延迟等）
- 消息格式: JSON（含事件类型、级别、时间、详情）
- 安全: 支持 HMAC 签名校验
- 可靠性:
  - 失败重试（指数退避，最多 5 次）
  - 幂等性（event_id 去重）
- 限流: 单通道 QPS 限制

---

### 3.8 报告与复盘模块

本模块提供交易复盘和绩效分析报告能力，帮助用户系统性地回顾和改进交易决策。

#### 3.8.1 回测报告 ✅

**功能描述**：  
回测完成后展示的绩效报告，包含权益曲线、关键指标和交易明细。详见 [3.4.4 回测结果展示](#344-回测结果展示-✅)。

**现有实现**：
- 前端: `src/components/BacktestResults.tsx`（三 Tab: 绩效/交易/配置）
- 图表: `src/components/EquityCurveChart.tsx`, `src/components/TradingChart.tsx`

---

#### 3.8.2 日报自动生成 ❌

**功能描述**：  
每日收盘后自动生成交易日报，汇总当日的持仓变化、盈亏情况和市场概况。支持 AI 辅助生成自然语言解读。

**业务规则**：
- 生成时机: 每日收盘后 30 分钟自动触发（A 股 15:30 后）
- 日报内容:
  - 账户概况: 总资产 / 当日盈亏 / 资金使用率
  - 持仓变化: 新开仓 / 加仓 / 减仓 / 平仓
  - 交易明细: 当日所有交易记录
  - 策略表现: 各策略当日贡献
  - 市场概况: 大盘走势 / 行业涨跌
  - [AI] 自然语言总结: "今日组合收益+0.8%，主要贡献来自XX策略的XX操作..."
- 日报推送: 通过已配置的通知通道自动发送
- 日报存档: 所有日报可在历史记录中查询

**交互流程**：
```
报告中心 → 日报列表
  │
  ├─ 日历视图: 选择日期查看对应日报
  │
  ├─ 日报详情:
  │    ├─ 账户概况卡片
  │    ├─ 持仓变化表格
  │    ├─ 交易明细表格
  │    ├─ 策略贡献柱状图
  │    ├─ AI 总结区域（自然语言描述今日表现）
  │    └─ 操作: 导出PDF / 分享链接
  │
  └─ 设置: 是否启用自动生成 / 推送通道 / 生成时间
```

---

#### 3.8.3 周报/月报 ❌

**功能描述**：  
按周/月周期生成聚合绩效报告，展示趋势分析和策略对比。

**业务规则**：
- 周报: 每周日晚自动生成，涵盖过去一周
- 月报: 每月末自动生成，涵盖当月
- 报告内容:
  - 周期内总收益/回撤/Sharpe
  - 与上一周期对比（环比）
  - 策略对比: 各策略本周期绩效排名
  - 持仓周期分析: 持仓天数分布
  - 行业配置变化
  - 交易行为分析: 频率/胜率/平均持仓时长
  - [AI] 趋势分析和改进建议
- 可自定义报告周期（如双周/季度）

**交互流程**：
```
报告中心 → 周报/月报 Tab
  │
  ├─ 报告列表: 按时间倒序
  │    └─ 每行: 周期 + 收益率 + Sharpe + 最大回撤
  │
  ├─ 报告详情:
  │    ├─ 绩效趋势图: 周收益率走势（折线图）
  │    ├─ 策略排名: 柱状图对比
  │    ├─ 交易行为: 频率/胜率/持仓天数分布
  │    ├─ AI 建议: "本周策略A表现优于策略B 15%，建议..."
  │    └─ 导出 / 分享
  │
  └─ 对比: 选择两个周期进行对比分析
```

---

#### 3.8.4 交易日志 ❌

**功能描述**：  
完整记录所有交易相关事件，形成不可篡改的交易流水，支持多维度查询和导出。

**业务规则**：
- 记录范围: 策略信号 / 风控检查 / 订单提交 / 成交回报 / 平仓结算
- 字段: 时间戳、事件类型、标的、方向、数量、价格、策略名、状态、备注
- 不可修改: 日志一旦写入不可删除或修改（审计要求）
- 查询条件: 日期范围 / 标的 / 策略 / 事件类型 / 方向
- 导出: CSV / Excel 格式
- 保留期限: 至少 3 年

**交互流程**：
```
报告中心 → 交易日志 Tab
  │
  ├─ 筛选栏:
  │    ├─ 日期范围: [开始] ~ [结束]
  │    ├─ 标的: SymbolSearch
  │    ├─ 策略: 下拉多选
  │    ├─ 事件类型: 信号/下单/成交/平仓
  │    └─ 搜索
  │
  ├─ 日志表格:
  │    ├─ 时间 / 事件 / 标的 / 方向 / 数量 / 价格 / 策略 / 状态 / 备注
  │    ├─ 颜色: 买入行(浅绿) / 卖出行(浅红)
  │    └─ 分页 + 排序
  │
  └─ 导出: [CSV] [Excel] → 下载文件
```

---

#### 3.8.5 绩效归因分析 ❌

**功能描述**：  
将投资组合的收益拆解到不同维度（策略/行业/个股/因子），帮助理解收益和亏损的来源。

**业务规则**：
- 归因维度:
  - **策略归因**: 各策略对总收益的贡献
  - **行业归因**: 各行业配置和选股效应
  - **Brinson 归因**: 配置效应 + 选择效应 + 交互效应
  - **因子归因**: Alpha + Beta + 行业 + 风格因子
- 归因周期: 日/周/月/自定义
- 展示: 瀑布图（各维度贡献叠加）、表格明细

**交互流程**：
```
Analytics 页面 → 归因分析区域
  │
  ├─ 归因维度选择: 策略 / 行业 / Brinson / 因子
  │
  ├─ 周期选择: 日 / 周 / 月 / 自定义范围
  │
  ├─ 归因结果:
  │    ├─ 瀑布图: 起始资产 → +策略A贡献 → +策略B → -策略C → 终值
  │    ├─ 明细表: 维度 / 贡献金额 / 贡献% / 排名
  │    └─ 趋势: 各维度贡献的时间序列
  │
  └─ AI 解读: "本月收益主要来自策略A在金融板块的选股能力..."
```

---

#### 3.8.6 报告导出与分享 ❌

**功能描述**：  
将各类报告导出为文件或生成分享链接，支持定时自动发送。

**业务规则**：
- 导出格式: PDF / HTML / Excel
- 分享方式:
  - 生成唯一分享链接（可设过期时间）
  - 邮件发送（附件或链接）
  - IM 通道推送
- 定时发送: 绑定报告类型 + 接收人 + 发送周期
- 权限: 分享链接可设为公开或需登录查看

---

### 3.9 系统设置模块

本模块提供平台级别的配置管理、外部系统接入和日志审计能力。

#### 3.9.1 数据源配置 🟡

**功能描述**：  
管理外部数据源的接入配置，包括 API 凭证、速率限制和连接状态。

**业务规则**：
- 当前: 通过环境变量配置（`TUSHARE_TOKEN`, `TUSHARE_CALLS_PER_MIN` 等）
- 目标: 提供前端配置界面
- 配置项: 数据源类型 / API Token / 速率限制 / 启用状态
- 数据项级开关: 每个数据源下的各数据项/接口支持独立启用/禁用，详见 [3.2.12 数据源/数据项开关管理](#3212-数据源数据项开关管理-❌)
- 连接测试: 可在界面上测试数据源连通性
- 数据源状态: 正常 / 速率受限 / 认证失败 / 不可用

**交互流程**（目标）：
```
系统设置 → 数据源管理
  │
  ├─ 数据源列表:
  │    ├─ Tushare: Token(脱敏) + 速率限制 + 状态 + 最后连接
  │    ├─ AkShare: 无需Token + 速率限制 + 状态
  │    └─ [P2+] 新数据源: 富途/雪球/Yahoo...
  │
  ├─ 编辑配置:
  │    ├─ API Token（密文输入）
  │    ├─ 速率限制: 每分钟调用次数
  │    ├─ 端点级速率: 对特定端点设置独立限制
  │    └─ 启用/禁用
  │
  ├─ 数据项开关管理:
  │    ├─ 按数据源分组展示所有数据项
  │    ├─ 每项显示: 名称 + 接口标识 + 开关状态 + 权限要求 + 同步状态
  │    ├─ 批量启用/禁用操作
  │    └─ 权限等级提示（如 Tushare 积分不足时标黄警告）
  │
  └─ 测试连接: 调用数据源API验证 → 显示结果
```

**现有实现**（部分）：
- 环境变量配置: `app/infrastructure/config/config.py` → Settings 类
- Tushare 速率控制: `app/datasync/service/tushare_ingest.py` → `_min_interval_for()`

---

#### 3.9.2 券商接入配置 ❌

**功能描述**：  
管理券商连接配置。详见 [3.6.6 券商接入](#366-券商接入-❌)。

---

#### 3.9.3 币种与时区设置 ❌

**功能描述**：  
配置平台的默认显示币种和时区偏好，支持多市场的本地化展示。

**业务规则**：
- 默认币种: CNY（人民币）
- 可选: CNY / HKD / USD / EUR
- 汇率: 每日自动更新（来源: 央行/外汇API）
- 展示: 所有金额按用户偏好币种显示（原始币种保留）
- 时区:
  - 系统时区: UTC（内部存储统一用UTC）
  - 用户时区: 可自定义（影响日期/时间展示）
  - 交易所时区: 固定（如 A股=Asia/Shanghai）
- 日期格式: YYYY-MM-DD / DD/MM/YYYY / MM/DD/YYYY（可选）

**交互流程**：
```
系统设置 → 区域偏好
  │
  ├─ 币种设置:
  │    ├─ 默认展示币种: [下拉选择]
  │    ├─ 汇率来源: [自动/手动]
  │    └─ 汇率刷新频率: [每日/实时]
  │
  ├─ 时区设置:
  │    ├─ 用户时区: [下拉选择]
  │    └─ 日期格式: [下拉选择]
  │
  └─ 预览: 示例数据按当前设置展示
```

---

#### 3.9.4 审计日志 ❌

**功能描述**：  
记录所有用户操作和系统事件，形成不可篡改的审计追踪，满足合规和安全审查需要。

**业务规则**：
- 记录范围:
  - 认证事件: 登录/登出/改密/MFA
  - 策略操作: 创建/编辑/删除/恢复版本
  - 交易操作: 下单/改单/撤单/平仓
  - 系统配置: 设置变更
  - 数据访问: 敏感数据查询
- 字段: 时间戳、用户ID、用户名、操作类型、资源类型、资源ID、操作详情、IP地址、User-Agent
- 不可删除/修改
- 保留期限: 至少 5 年
- 查询: 按用户/操作类型/时间范围/资源筛选
- 导出: CSV / JSON 格式

**交互流程**：
```
系统设置 → 审计日志（仅管理员可见）
  │
  ├─ 筛选栏:
  │    ├─ 时间范围 / 用户 / 操作类型 / 资源类型
  │    └─ 搜索
  │
  ├─ 日志表格:
  │    ├─ 时间 / 用户 / 操作 / 资源 / IP / 详情
  │    └─ 分页 + 排序
  │
  └─ 导出: [CSV] [JSON]
```

---

#### 3.9.5 系统健康检查 ✅

**功能描述**：  
提供系统各组件的健康状态检查端点，用于运维监控和自动化部署验证。

**业务规则**：
- 健康检查端点: `GET /health` → HTTP 200
- 检查项: API 进程存活 / MySQL 连接 / Redis 连接 / Worker 进程
- Docker 健康检查: 用于容器编排的自动重启判断
- 响应格式: JSON（各组件状态 + 版本信息）

**现有实现**：
- 后端: `app/api/main.py` → `/health` 端点
- Docker: `docker-compose.dev.yml` → healthcheck 配置（API/MySQL/Redis）

---

#### 3.9.6 系统参数配置 ❌

**功能描述**：  
提供全局系统参数的前端配置界面，避免所有配置都依赖环境变量。

**业务规则**：
- 可配置项:
  - 回测默认值: 初始资金、手续费率、滑点
  - 风控默认阈值: 最大仓位比例、最大回撤阈值
  - 数据同步: 同步时间、回填周期
  - 通知设置: 邮件/短信/IM 配置
- 配置层级: 系统级（管理员）/ 用户级（个人偏好）
- 用户级覆盖系统级默认值
- 配置变更记录到审计日志

---

#### 3.9.7 CLI 与本地运行工具 ❌

**功能描述**：  
提供命令行工具与本地运行能力，支持在本地/CI 中执行回测、数据同步与任务调度，实现端云一致。

**业务规则**：
- CLI 功能:
  - 数据同步（init/daily/backfill）
  - 回测与参数优化
  - 研究流水线运行与状态查询
- 配置:
  - Profile 管理（dev/prod）
  - Token/Key 本地安全存储
- 运行模式:
  - 仅本地运行 / 连接云端调度
- 输出:
  - 结构化日志（JSON 可选）
  - 运行报告导出

---

### 3.10 协作与分享模块

本模块支持策略分享、团队协作和社区交互，打造量化交易社区生态。

#### 3.10.1 策略分享 ❌

**功能描述**：  
用户可将自己的策略发布到平台，供其他用户查看、收藏或使用。支持多种可见性级别。

**业务规则**：
- 可见性级别:
  - **私有**: 仅自己可见（默认）
  - **指定用户**: 通过邀请链接分享给特定用户
  - **公开**: 所有平台用户可见
- 分享内容: 策略代码 / 仅回测结果 / 策略描述（不含代码）
- 版权保护: 代码分享可选择是否允许复制/下载
- 分享链接: 唯一URL，可设过期时间
- 撤销分享: 随时可以取消公开或收回分享权限

**交互流程**：
```
Strategies 页面 → 选择策略 → "分享" 按钮
  │
  ├─ 分享设置弹窗:
  │    ├─ 可见性: 私有 / 指定用户 / 公开
  │    ├─ 分享内容: 完整代码 / 仅结果 / 仅描述
  │    ├─ [指定用户] 输入用户名或邮箱
  │    ├─ 允许复制: 是/否
  │    ├─ 过期时间: 永久 / 7天 / 30天
  │    └─ 确认
  │
  ├─ 生成分享链接 → 一键复制
  │
  └─ 已分享策略管理:
       └─ 列表: 策略名 + 可见性 + 分享时间 + 查看次数 + 操作(撤销)
```

---

#### 3.10.2 策略评分与评论 ❌

**功能描述**：  
对公开分享的策略进行评分和评论，帮助社区发现优质策略。

**业务规则**：
- 评分: 1-5 星（每用户每策略仅一次，可修改）
- 评论: 文本评论（支持 Markdown）
- 排序: 按评分 / 使用量 / 最新 / 收藏数
- 审核: 评论内容需过滤敏感词
- 作者可回复评论

---

#### 3.10.3 权限共享 ❌

**功能描述**：  
多用户之间共享策略、回测结果和组合的查看/编辑权限，支持细粒度的权限控制。

**业务规则**：
- 可共享资源: 策略 / 回测结果 / 组合 / 报告
- 权限级别:
  - **只读**: 仅查看
  - **可编辑**: 查看 + 修改（不可删除）
  - **可执行**: 可使用策略运行回测/交易
  - **完全**: 所有权限（含删除）
- 权限管理: 资源所有者可随时添加/修改/撤销他人权限
- 操作日志: 被共享资源的操作记录对所有者可见

---

#### 3.10.4 模板市场 ❌

**功能描述**：  
策略模板交易市场，用户可上架自己的策略模板供其他用户使用，支持免费和付费两种模式。

**业务规则**：
- 模板类型: 策略模板 / 研究报告模板 / 分析布局模板
- 定价: 免费 / 付费（作者定价）
- 上架流程: 提交 → 审核 → 上架
- 审核标准: 代码安全性 / 回测结果真实性 / 描述完整性
- 收益分成: 平台抽佣比例（TBD）
- 退款: 购买后 7 天内如模板有严重缺陷可申请退款
- 评价: 购买后可评分和评论

**交互流程**：
```
模板市场页面（新页面）
  │
  ├─ 浏览区:
  │    ├─ 分类: 趋势策略 / 均值回归 / 多因子 / 高频 / ...
  │    ├─ 排序: 最热 / 最新 / 评分最高 / 收益最高
  │    ├─ 搜索: 关键词 / 标签
  │    └─ 每个模板卡片:
  │         ├─ 名称 + 作者 + 评分 + 使用量
  │         ├─ 简介 + 回测收益率摘要
  │         └─ 价格: 免费 / ¥XX
  │
  ├─ 模板详情:
  │    ├─ 完整描述 + 使用说明
  │    ├─ 回测绩效展示（作者提供）
  │    ├─ 评论区
  │    └─ [免费] 一键导入 / [付费] 购买 → 导入
  │
  └─ 我的模板（作者视角）:
       ├─ 已上架列表: 销量 + 收入 + 评分
       ├─ 上架新模板: 填写信息 + 上传 + 定价
       └─ 收入统计: 总收入 + 提现
```

---

#### 3.10.5 团队工作空间 ❌

**功能描述**：  
为团队/小组提供共享工作空间，成员可共享策略库、回测结果和研究成果。

**业务规则**：
- 工作空间: 独立的协作环境
- 成员角色: 管理员 / 成员 / 只读
- 共享内容: 策略 / 回测 / 数据集 / 报告 / 指标
- 操作日志: 工作空间内所有操作对管理员可见
- 限制: 每个工作空间最多 10 人（可扩展）

**交互流程**：
```
工作空间页面（新页面）
  │
  ├─ 我的工作空间列表:
  │    └─ 工作空间名 + 成员数 + 角色 + 最近活动
  │
  ├─ 创建工作空间:
  │    ├─ 名称 + 描述
  │    ├─ 邀请成员（用户名/邮箱）
  │    └─ 分配角色
  │
  └─ 进入工作空间:
       ├─ 共享策略库（团队策略列表）
       ├─ 共享回测结果
       ├─ 团队讨论区（简易消息）
       └─ 成员管理
```

---

#### 3.10.6 社区策略与生态分发 ❌

**功能描述**：  
建立社区策略生态，支持策略发布、订阅与版本迭代，方便用户发现、复用和对标优秀策略。

**业务规则**：
- 发布内容:
  - 策略代码（可选脱敏/不可下载）
  - 策略绩效摘要（回测区间、指标、风险）
  - 策略说明与适用市场
- 版本管理: 公开版本号与变更记录
- 真实性校验:
  - 平台回测验证（对外显示“已验证”标识）
  - 禁止伪造收益曲线
- 授权与收费:
  - 免费订阅 / 付费订阅（作者定价）
  - 许可协议（仅学习/可商用）
- 免责声明: 强制展示风险提示与历史业绩不代表未来

**交互流程**：
```
社区策略市场
  │
  ├─ 筛选: 市场/策略类型/收益率/回撤/评分
  ├─ 策略详情:
  │    ├─ 绩效摘要 + 风险指标
  │    ├─ 版本历史
  │    └─ 订阅/收藏
  └─ 作者中心:
       ├─ 发布策略 + 配置授权
       └─ 订阅与收益统计
```

---

---

## 6. 数据模型

### 6.1 数据库架构总览

系统采用 MySQL 8.0 多数据库架构，逻辑分离业务数据和市场数据：

| 数据库 | 用途 | 当前表数 | 状态 |
|--------|------|----------|------|
| `quantmate` | 核心业务数据（用户/策略/回测/组合） | 10 活跃 + 31 planned | 主库 |
| `tushare` | Tushare 数据源同步数据 | 4 活跃 + 14 planned | P1 A 股 |
| `akshare` | AkShare 数据源同步数据 | 2 活跃 + 5 planned | 辅助 |
| `vnpy` | VNPy 引擎内部数据 | 0 活跃 + 2 planned | 交易引擎 |

### 6.2 核心业务数据库 quantmate

#### 6.2.1 已实现表（10 表）

```
users                  -- 用户表
├── id (PK, INT AUTO_INCREMENT)
├── username (VARCHAR(50) UNIQUE NOT NULL)
├── email (VARCHAR(100) UNIQUE NOT NULL)
├── hashed_password (VARCHAR(255) NOT NULL)
├── is_active (BOOLEAN DEFAULT TRUE)
├── created_at (DATETIME)
└── updated_at (DATETIME)

strategies             -- 策略表
├── id (PK, INT AUTO_INCREMENT)
├── user_id (FK → users.id)
├── name (VARCHAR(100) NOT NULL)
├── description (TEXT)
├── code (LONGTEXT)         -- Python 策略代码
├── is_builtin (BOOLEAN)
├── strategy_type (VARCHAR(50))  -- CTA/Custom
├── created_at / updated_at
└── INDEX(user_id)

strategy_versions      -- 策略版本历史
├── id (PK)
├── strategy_id (FK → strategies.id, CASCADE)
├── version_number (INT)
├── code (LONGTEXT)
├── change_description (TEXT)
├── is_current (BOOLEAN)
├── created_at
└── UNIQUE(strategy_id, version_number)

backtests              -- 回测记录
├── id (PK)
├── strategy_id (FK → strategies.id)
├── user_id (FK → users.id)
├── vt_symbol (VARCHAR(20))
├── start_date / end_date (DATE)
├── capital (DECIMAL(15,2))
├── rate / slippage / size / pricetick
├── status (ENUM: pending/running/completed/failed/cancelled)
├── result_data (JSON)     -- 绩效指标
├── trade_data (JSON)      -- 交易记录
├── daily_data (JSON)      -- 每日权益
└── created_at / updated_at

batch_backtests        -- 批量回测任务
├── id (PK)
├── user_id (FK → users.id)
├── name / description
├── status / progress
├── total_tasks / completed_tasks / failed_tasks
├── settings (JSON)
└── created_at / updated_at

batch_backtest_tasks   -- 批量回测子任务
├── id (PK)
├── batch_id (FK → batch_backtests.id, CASCADE)
├── backtest_id (FK → backtests.id)
├── vt_symbol / status / result_summary (JSON)
└── created_at / updated_at

portfolios             -- 投资组合
├── id (PK)
├── user_id (FK → users.id)
├── name (VARCHAR(100))
├── description (TEXT)
├── initial_capital (DECIMAL(15,2))
├── is_active (BOOLEAN)
└── created_at / updated_at

portfolio_positions    -- 组合持仓
├── id (PK)
├── portfolio_id (FK → portfolios.id, CASCADE)
├── vt_symbol (VARCHAR(20))
├── strategy_id (FK → strategies.id, nullable)
├── quantity (DECIMAL(15,4))
├── avg_cost (DECIMAL(15,4))
├── current_price (DECIMAL(15,4))
├── unrealized_pnl (DECIMAL(15,2))
├── realized_pnl (DECIMAL(15,2))
└── updated_at

sync_tracking          -- 数据同步追踪
├── id (PK)
├── endpoint_name (VARCHAR(100))
├── sync_type (VARCHAR(50))
├── status (ENUM: pending/running/completed/failed)
├── records_synced (INT)
├── start_time / end_time
├── error_message (TEXT)
└── created_at

data_quality_log       -- 数据质量日志
├── id (PK)
├── table_name / check_type / check_date
├── status / details (JSON)
└── created_at
```

#### 6.2.2 待建设表（31 表）

| 表名 | 用途 | 关联模块 | 优先级 |
|------|------|----------|--------|
| `user_profiles` | 用户详细资料（KYC 信息） | 3.1 账户 | P1 |
| `user_roles` / `roles` / `permissions` | RBAC 权限模型 | 3.1 账户 | P1 |
| `api_keys` | API 密钥管理 | 3.1 账户 | P2 |
| `user_sessions` | 会话管理 | 3.1 账户 | P2 |
| `mfa_settings` | MFA 配置 | 3.1 账户 | P2 |
| `watchlists` / `watchlist_items` | 自选股列表 | 3.2 数据 | P1 |
| `indicator_configs` | 自定义指标参数 | 3.2 数据 | P2 |
| `strategy_tags` | 策略标签 | 3.3 策略 | P2 |
| `strategy_shares` | 策略分享记录 | 3.10 协作 | P3 |
| `optimization_tasks` / `optimization_results` | 参数优化 | 3.4 回测 | P2 |
| `portfolio_transactions` | 组合交易流水 | 3.5 组合 | P1 |
| `portfolio_snapshots` | 组合净值快照 | 3.5 组合 | P1 |
| `risk_rules` | 风控规则配置 | 3.5 风险 | P2 |
| `orders` | 订单表 | 3.6 交易 | P2 |
| `trades` | 成交记录 | 3.6 交易 | P2 |
| `broker_configs` | 券商配置 | 3.6 交易 | P2 |
| `alert_rules` | 告警规则 | 3.7 监控 | P2 |
| `alert_history` | 告警历史 | 3.7 监控 | P2 |
| `notification_channels` | 通知通道配置 | 3.7 监控 | P2 |
| `reports` | 报告存档 | 3.8 报告 | P2 |
| `trade_logs` | 交易日志（审计） | 3.8 报告 | P1 |
| `system_configs` | 系统配置 | 3.9 设置 | P2 |
| `audit_logs` | 审计日志 | 3.9 设置 | P1 |
| `data_source_configs` | 数据源配置 | 3.9 设置 | P2 |
| `team_workspaces` / `workspace_members` | 团队工作空间 | 3.10 协作 | P3 |
| `strategy_comments` / `strategy_ratings` | 社区评论评分 | 3.10 协作 | P3 |
| `marketplace_listings` | 模板市场 | 3.10 协作 | P4 |
| `ai_conversations` | AI 对话历史 | 5.0 AI | P3 |
| `ai_model_configs` | AI 模型配置 | 5.7 AI | P3 |

### 6.3 市场数据库 tushare

#### 6.3.1 已实现表（4 表）

```
stock_daily            -- A股日线数据
├── id (PK, BIGINT AUTO_INCREMENT)
├── ts_code (VARCHAR(20))      -- 标的代码 (000001.SZ)
├── trade_date (DATE)
├── open / high / low / close (DECIMAL)
├── pre_close / change / pct_chg
├── vol (DECIMAL)              -- 成交量（手）
├── amount (DECIMAL)           -- 成交额（千元）
├── UNIQUE(ts_code, trade_date)
└── INDEX(trade_date), INDEX(ts_code)

stock_basic            -- A股基本信息
├── id (PK)
├── ts_code (VARCHAR(20) UNIQUE)
├── symbol / name
├── area / industry / market
├── list_date / delist_date
├── list_status (VARCHAR(1))   -- L/D/P
└── exchange (VARCHAR(10))

trade_calendar         -- 交易日历
├── id (PK)
├── exchange (VARCHAR(10))
├── cal_date (DATE)
├── is_open (BOOLEAN)
├── pretrade_date (DATE)
└── UNIQUE(exchange, cal_date)

stock_daily_basic      -- 每日基本面指标
├── id (PK)
├── ts_code / trade_date
├── turnover_rate / turnover_rate_f
├── volume_ratio / pe / pe_ttm / pb / ps / ps_ttm
├── dv_ratio / dv_ttm
├── total_share / float_share / free_share
├── total_mv / circ_mv
└── UNIQUE(ts_code, trade_date)
```

#### 6.3.2 待建设表（14 表）

| 表名 | 数据内容 | 市场 | 优先级 |
|------|----------|------|--------|
| `stock_weekly` / `stock_monthly` | 周线/月线 | A 股 | P1 |
| `index_daily` | 指数日线 | A 股 | P1 |
| `adj_factor` | 复权因子 | A 股 | P1 |
| `money_flow` | 资金流向 | A 股 | P2 |
| `stk_limit` | 涨跌停 | A 股 | P2 |
| `margin_detail` | 融资融券 | A 股 | P2 |
| `block_trade` | 大宗交易 | A 股 | P2 |
| `stock_company` | 公司基本面 | A 股 | P2 |
| `fina_indicator` | 财务指标 | A 股 | P2 |
| `hk_daily` | 港股日线 | 港股 | P2 |
| `hk_basic` | 港股基本信息 | 港股 | P2 |
| `us_daily` | 美股日线 | 美股 | P3 |
| `us_basic` | 美股基本信息 | 美股 | P3 |
| `fx_daily` | 汇率日线 | 全球 | P3 |

### 6.4 辅助数据库 akshare

#### 6.4.1 已实现表（2 表）

```
stock_zh_index_daily   -- A股指数日线
├── date (DATE)
├── code (VARCHAR(20))
├── open / high / low / close / volume
└── UNIQUE(code, date)

tool_trade_date_hist   -- 交易日历（AkShare来源）
├── trade_date (DATE PRIMARY KEY)
└── INDEX(trade_date)
```

#### 6.4.2 待建设表（5 表）

| 表名 | 数据内容 | 优先级 |
|------|----------|--------|
| `stock_zh_index_spot` | 指数实时行情 | P2 |
| `macro_china` | 中国宏观经济数据 | P3 |
| `fund_etf_daily` | ETF 日线 | P2 |
| `bond_zh_daily` | 债券日线 | P3 |
| `news_sentiment` | 新闻情绪数据 | P3 |

### 6.5 交易引擎数据库 vnpy

| 表名 | 用途 | 优先级 |
|------|------|--------|
| `dbbardata` | VNPy 标准 K 线存储 | P2 |
| `dbtickdata` | VNPy Tick 数据存储 | P3 |

---

## 7. API 接口清单

### 7.1 已实现接口（28 个）

#### 认证模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 无 |
| POST | `/api/auth/login` | 用户登录（返回 JWT） | 无 |
| GET | `/api/auth/me` | 获取当前用户信息 | JWT |
| PUT | `/api/auth/change-password` | 修改密码 | JWT |

#### 策略模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/strategies` | 创建策略 | JWT |
| GET | `/api/strategies` | 获取策略列表 | JWT |
| GET | `/api/strategies/{id}` | 获取策略详情 | JWT |
| PUT | `/api/strategies/{id}` | 更新策略 | JWT |
| DELETE | `/api/strategies/{id}` | 删除策略 | JWT |
| POST | `/api/strategies/{id}/lint` | 语法检查 | JWT |
| GET | `/api/strategies/{id}/versions` | 获取版本列表 | JWT |
| PUT | `/api/strategies/{id}/restore/{ver}` | 恢复到指定版本 | JWT |

#### 回测模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/backtests` | 提交回测任务 | JWT |
| GET | `/api/backtests` | 获取回测列表 | JWT |
| GET | `/api/backtests/{id}` | 获取回测详情 | JWT |
| DELETE | `/api/backtests/{id}` | 取消/删除回测 | JWT |
| POST | `/api/backtests/batch` | 提交批量回测 | JWT |
| GET | `/api/backtests/batch` | 获取批量回测列表 | JWT |
| GET | `/api/backtests/batch/{id}` | 获取批量回测详情 | JWT |
| DELETE | `/api/backtests/batch/{id}` | 取消批量回测 | JWT |

#### 市场数据模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/market-data/kline` | 获取 K 线数据 | JWT |
| GET | `/api/market-data/search` | 搜索股票 | JWT |
| GET | `/api/market-data/indicators` | 获取技术指标 | JWT |
| GET | `/api/market-data/overview` | 市场概览 | JWT |

#### 系统与队列

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/health` | 健康检查 | 无 |
| GET | `/api/system/sync-status` | 数据同步状态 | JWT |
| GET | `/api/queue/stats` | 队列统计信息 | JWT |
| GET | `/api/queue/jobs/{queue}` | 获取队列任务列表 | JWT |

### 7.2 待建设接口

#### 组合管理（P1）

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/portfolios` | 创建组合 |
| GET | `/api/portfolios` | 组合列表 |
| GET | `/api/portfolios/{id}` | 组合详情（含持仓） |
| PUT | `/api/portfolios/{id}` | 更新组合 |
| DELETE | `/api/portfolios/{id}` | 删除组合 |
| POST | `/api/portfolios/{id}/positions` | 添加/调整持仓 |
| DELETE | `/api/portfolios/{id}/positions/{pos_id}` | 关闭持仓 |
| GET | `/api/portfolios/{id}/snapshots` | 组合历史快照 |
| GET | `/api/portfolios/{id}/performance` | 组合绩效 |

#### 交易执行（P2）

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/orders` | 提交订单 |
| GET | `/api/orders` | 订单列表 |
| GET | `/api/orders/{id}` | 订单详情 |
| PUT | `/api/orders/{id}/cancel` | 撤销订单 |
| GET | `/api/trades` | 成交记录 |
| POST | `/api/trading/paper/start` | 启动模拟交易 |
| POST | `/api/trading/paper/stop` | 停止模拟交易 |
| GET | `/api/trading/paper/status` | 模拟交易状态 |

#### 监控告警（P2）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/alerts/rules` | 告警规则列表 |
| POST | `/api/alerts/rules` | 创建告警规则 |
| PUT | `/api/alerts/rules/{id}` | 更新规则 |
| DELETE | `/api/alerts/rules/{id}` | 删除规则 |
| GET | `/api/alerts/history` | 告警历史 |
| PUT | `/api/alerts/{id}/acknowledge` | 确认告警 |
| POST | `/api/notifications/channels` | 配置通知通道 |
| POST | `/api/notifications/test` | 测试通知通道 |

#### 报告（P2）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/reports/daily` | 日报列表 |
| GET | `/api/reports/daily/{date}` | 指定日期日报 |
| GET | `/api/reports/weekly` | 周报列表 |
| GET | `/api/reports/monthly` | 月报列表 |
| GET | `/api/reports/{id}/export` | 导出报告 |
| GET | `/api/trade-logs` | 交易日志查询 |
| GET | `/api/analytics/attribution` | 绩效归因 |

#### 系统管理（P2）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/system/configs` | 获取系统配置 |
| PUT | `/api/system/configs` | 更新系统配置 |
| GET | `/api/system/audit-logs` | 审计日志查询 |
| POST | `/api/data-sources/test` | 测试数据源连接 |
| PUT | `/api/data-sources/{id}` | 更新数据源配置 |

#### AI 集成（P3）

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/ai/generate-strategy` | AI 生成策略 |
| POST | `/api/ai/chat` | AI 对话（NL 查询） |
| GET | `/api/ai/recommendations` | 智能选股推荐 |
| GET | `/api/ai/sentiment/{symbol}` | 个股情绪分析 |
| GET | `/api/ai/sentiment/market` | 市场整体情绪 |
| GET | `/api/ai/models` | AI 模型列表 |
| PUT | `/api/ai/models/{id}` | 更新模型配置 |

#### 协作模块（P3）

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/strategies/{id}/share` | 分享策略 |
| GET | `/api/strategies/shared` | 公开策略列表 |
| POST | `/api/strategies/{id}/rate` | 评分策略 |
| POST | `/api/strategies/{id}/comments` | 发表评论 |
| POST | `/api/workspaces` | 创建工作空间 |
| GET | `/api/workspaces` | 工作空间列表 |
| POST | `/api/workspaces/{id}/members` | 添加成员 |

---

## 8. 业务流程总览

### 8.1 用户旅程全景图

```
┌─────────────────────────────────────────────────────────────────┐
│                     QuantMate 用户旅程                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  注册/登录 ─→ 配置数据源 ─→ 浏览行情 ─→ 编写策略 ─→ 回测验证  │
│                                                                 │
│       ┌───────────────────────────────────────────────┐         │
│       │              数据闭环                          │         │
│       │  回测结果 ─→ 分析优化 ─→ 修改策略 ─→ 再次回测 │         │
│       └───────────────────────────────────────────────┘         │
│                          │                                      │
│                          ▼                                      │
│            策略满意 ─→ 模拟交易 ─→ 实盘交易                     │
│                          │                                      │
│                          ▼                                      │
│            组合管理 ─→ 风险监控 ─→ 日报复盘 ─→ 持续改进         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 策略全生命周期

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  创意阶段 │───→│  开发阶段 │───→│  验证阶段 │───→│  部署阶段 │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
      │               │               │               │
 ● 交易灵感      ● 编写代码      ● 单次回测      ● 模拟交易
 ● AI辅助生成    ● 语法检查      ● 批量回测      ● 实盘交易
 ● 因子研究      ● 版本管理      ● 参数优化      ● 风险监控
 ● 模板导入      ● 指标引用      ● 绩效评估      ● 自动止损
                                 ● 对比分析
      │               │               │               │
      ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  退役阶段 │←──│  监控阶段 │←──│  运营阶段 │←──│          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
      │               │               │
 ● 停止交易      ● 实时盈亏      ● 日报生成
 ● 清仓平仓      ● 异常检测      ● 绩效归因
 ● 策略归档      ● 告警通知      ● 组合再平衡
 ● 复盘总结      ● 行为监测      ● 风险预算
```

### 8.3 订单生命周期

```
策略信号
   │
   ▼
┌──────────────┐
│  信号生成     │  策略发出买/卖信号
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  风控检查     │  资金/仓位/频率/回撤检查
└──────┬───────┘
       │
  通过 │  不通过 ─→ 拒绝（记录原因）
       │
       ▼
┌──────────────┐
│  订单创建     │  状态: PENDING
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  交易所提交   │  状态: SUBMITTED
└──────┬───────┘
       │
  ┌────┼────────────┐
  │    │             │
  ▼    ▼             ▼
全部  部分         拒绝/失效
成交  成交         ┌──────────────┐
  │    │          │  REJECTED     │
  │    │          └──────────────┘
  ▼    ▼
┌──────────────┐
│  成交回报     │  状态: FILLED / PARTIALLY_FILLED
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  持仓更新     │  更新组合持仓 + 计算盈亏
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  日志记录     │  写入交易日志（审计追踪）
└──────────────┘
```

### 8.4 数据同步流程

```
┌─────────────────────────────────────────────────────────────┐
│                   DataSync 服务                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│  │ Scheduler │──→│ Pipeline  │──→│ Validator │              │
│  │ (定时/手动)│   │ (执行同步)│   │ (校验数据)│              │
│  └──────────┘   └──────────┘   └──────────┘               │
│       │               │               │                     │
│  ┌────▼────┐    ┌─────▼─────┐  ┌──────▼──────┐            │
│  │ 检查交易 │    │ Tushare   │  │ 数据完整性  │            │
│  │ 日历    │    │ API 调用  │  │ 检查        │            │
│  └────┬────┘    └─────┬─────┘  └──────┬──────┘            │
│       │               │               │                     │
│       │         ┌─────▼─────┐  ┌──────▼──────┐            │
│       │         │ 数据清洗   │  │ 回填缺失    │            │
│       │         │ 去重/格式化│  │ 数据        │            │
│       │         └─────┬─────┘  └─────────────┘            │
│       │               │                                     │
│       │         ┌─────▼─────┐                              │
│       │         │ 写入MySQL  │                              │
│       │         │ 批量UPSERT │                              │
│       │         └─────┬─────┘                              │
│       │               │                                     │
│       │         ┌─────▼─────┐                              │
│       │         │ 更新追踪   │                              │
│       │         │ sync_tracking│                            │
│       │         └───────────┘                              │
│                                                             │
│  同步步骤（顺序执行）:                                       │
│  1. trade_calendar  → 交易日历                               │
│  2. stock_basic     → 股票基本信息                           │
│  3. stock_daily     → 日线行情（含回填）                      │
│  4. daily_basic     → 每日指标                               │
│  5. index_daily     → 指数日线(AkShare)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.5 回测执行流程

```
用户提交回测
       │
       ▼
┌──────────────┐
│ 参数验证      │  校验标的/日期/资金合法性
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 创建回测记录  │  状态: PENDING, 写入 backtests 表
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 加入 RQ 队列  │  队列: backtest (专用)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Worker 取任务 │  状态 → RUNNING
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 加载策略代码  │  从数据库读取策略 Python 代码
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 获取历史数据  │  查询 tushare.stock_daily
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ VNPy CTA 引擎│  加载策略 → 回放数据 → 生成信号 → 撮合
│ 执行回测      │  计算每日权益、交易记录
└──────┬───────┘
       │
  成功 │  失败 ─→ 状态: FAILED, 记录 error_message
       │
       ▼
┌──────────────┐
│ 保存结果      │  状态: COMPLETED
│              │  result_data: {指标JSON}
│              │  trade_data:  {交易JSON}
│              │  daily_data:  {权益JSON}
└──────────────┘
```

---

## 9. 优先级与里程碑

### 9.1 优先级定义

| 优先级 | 定义 | 时间范围 |
|--------|------|----------|
| **P0** | 核心基础功能（系统可运行的最低要求） | 已完成 |
| **P1** | 高价值功能（主要使用流程完整） | 下一里程碑 |
| **P2** | 重要增强（体验提升与功能完善） | 中期 |
| **P3** | 扩展功能（高级特性与生态建设） | 远期 |
| **P4** | 远景功能（探索性 / 社区驱动） | 视需求 |

### 9.2 里程碑规划

#### M0 — 基础平台（已完成）✅

**已交付功能**：
- 用户注册/登录/JWT 认证
- 策略 CRUD + 版本管理 + 语法检查
- 4 个内置 CTA 策略
- 单次回测 + 批量回测（RQ 队列）
- 回测结果展示（权益曲线/交易列表/绩效指标）
- A 股日线数据同步（Tushare 5 endpoints）
- K 线图 + 技术指标 + 股票搜索 + 市场概览
- 系统仪表盘 + 数据同步监控 + 健康检查
- Docker Compose 部署（开发/预发布）
- 前端 React 19 + TypeScript 全栈

#### M1 — 组合管理与数据增强（P1）

**目标**: 完善组合管理、增强数据覆盖

| 功能 | 优先级 | 依赖 |
|------|--------|------|
| 组合 CRUD + 持仓管理 API | P1 | — |
| 组合持仓前端页面 | P1 | 组合 API |
| 组合绩效计算与展示 | P1 | 组合 API |
| 自选股列表 | P1 | — |
| 股票周线/月线同步 | P1 | DataSync |
| 指数数据同步 | P1 | DataSync |
| 复权因子同步 | P1 | DataSync |
| RBAC 权限模型 | P1 | — |
| 审计日志基础 | P1 | — |
| 交易日志表 | P1 | — |

#### M2 — 交易与监控（P2）

**目标**: 模拟交易、风控、告警系统

| 功能 | 优先级 | 依赖 |
|------|--------|------|
| 模拟交易引擎 | P2 | 组合管理 |
| 订单管理（CRUD + 状态机） | P2 | 模拟交易 |
| 风控规则引擎 | P2 | 订单管理 |
| 参数优化（网格搜索） | P2 | 回测引擎 |
| 告警规则配置 | P2 | — |
| 邮件/IM 通知通道 | P2 | 告警规则 |
| 日报自动生成 | P2 | 组合管理 |
| 周报/月报 | P2 | 日报 |
| 绩效归因分析 | P2 | 组合管理 |
| 数据源前端配置 | P2 | — |
| 券商接入配置 | P2 | — |
| 多周期回测 | P2 | 回测引擎 |
| 实时行情（WebSocket） | P2 | 数据源扩展 |
| Token 刷新 + MFA | P2 | 认证模块 |
| 报告导出（PDF/Excel） | P2 | 报告模块 |

#### M3 — AI 与生态（P3）

**目标**: AI 集成、多市场、社区功能

| 功能 | 优先级 | 依赖 |
|------|--------|------|
| AI 辅助策略生成 | P3 | LLM API |
| 自然语言交互查询 | P3 | LLM API |
| 智能选股推荐 | P3 | 因子库 |
| 市场情绪分析 | P3 | NLP + 外部数据 |
| 智能报告生成 | P3 | 报告模块 + LLM |
| 港股数据接入 [P2 市场] | P3 | DataSync |
| 策略分享 | P3 | RBAC |
| 团队工作空间 | P3 | RBAC |
| 因子库 | P3 | 数据增强 |
| 算法订单（TWAP/VWAP） | P3 | 交易引擎 |
| 实盘交易接入 | P3 | 券商接入 |

#### M4 — 远景功能（P4）

| 功能 | 优先级 |
|------|--------|
| 美股/其他市场接入 [P3/P4 市场] | P4 |
| 模板市场（付费交易） | P4 |
| 策略评分与评论社区 | P4 |
| Tick 级数据回测 | P4 |
| VaR / 压力测试 | P4 |
| 国际化（多语言） | P4 |
| 移动端适配 | P4 |

### 9.3 技术债清还计划

> 参考 `TECH_DEBT_INVENTORY.md`

| 技术债项 | 当前状态 | 影响 | 计划里程碑 |
|----------|----------|------|------------|
| 前端测试覆盖不足 | 仅 Vitest 配置, 无实质测试 | 回归风险 | M1 |
| API 无分页 | 全量返回 | 数据量增大后性能问题 | M1 |
| 缺少 API 版本管理 | 无 `/v1/` 前缀 | 未来升级困难 | M1 |
| 配置硬编码 | 部分默认值写在代码中 | 可维护性 | M2 |
| 缺少请求限流 | 无 Rate Limit | 安全风险 | M1 |
| 日志非结构化 | 纯文本日志 | 难以聚合分析 | M2 |
| 缺少数据库迁移工具 | 手动建表 | 升级风险 | M1 |

---

## 附录

### 附录 A: 技术栈清单

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **后端框架** | FastAPI | 0.100+ | REST API 服务 |
| **运行时** | Python | 3.11 | 后端语言 |
| **数据库** | MySQL | 8.0 | 关系型存储 |
| **缓存/队列** | Redis | 7.0 | 任务队列 + 缓存 |
| **任务队列** | RQ (Redis Queue) | 1.16+ | 异步任务调度 |
| **量化引擎** | VNPy (CTA) | 3.9+ | 回测 + 交易引擎 |
| **ORM** | SQLAlchemy | 2.0 | 数据库访问 |
| **认证** | PyJWT + bcrypt | — | JWT Token + 密码哈希 |
| **数据源** | Tushare Pro | — | A 股数据 API |
| **数据源** | AkShare | — | 指数 + 日历数据 |
| **前端框架** | React | 19.x | UI 框架 |
| **类型系统** | TypeScript | 5.9 | 类型安全 |
| **构建工具** | Vite | 7.x | 开发服务器 + 构建 |
| **状态管理** | Zustand | 5.x | 全局状态 |
| **数据请求** | TanStack Query | 5.x | 服务端状态 + 缓存 |
| **HTTP 客户端** | Axios | 1.x | API 调用 |
| **代码编辑器** | Monaco Editor | — | 策略代码编辑 |
| **图表** | Recharts | 3.x | 数据可视化 |
| **样式** | Tailwind CSS | 3.x | 原子化 CSS |
| **路由** | React Router | 7.x | 前端路由 |
| **容器化** | Docker + Compose | — | 部署编排 |
| **反向代理** | Nginx | — | 负载均衡 + 静态文件 |
| **CI/CD** | GitHub Actions | — | 持续集成 |
| **镜像仓库** | GHCR | — | Docker 镜像存储 |
| **前端测试** | Vitest + Playwright | — | 单元测试 + E2E |
| **后端测试** | Pytest | — | 单元 + 集成测试 |

### 附录 B: 环境变量参考

| 变量名 | 用途 | 默认值 | 必填 |
|--------|------|--------|------|
| `DATABASE_URL` | MySQL 连接字符串 | — | ✅ |
| `REDIS_URL` | Redis 连接字符串 | `redis://localhost:6379` | ✅ |
| `JWT_SECRET_KEY` | JWT 签名密钥 | — | ✅ |
| `JWT_ALGORITHM` | JWT 签名算法 | `HS256` | — |
| `JWT_EXPIRATION_MINUTES` | Token 有效期 | `1440` | — |
| `CORS_ORIGINS` | 允许的跨域来源 | `http://localhost:5173` | — |
| `TUSHARE_TOKEN` | Tushare Pro API Token | — | ✅ |
| `TUSHARE_CALLS_PER_MIN` | Tushare 速率限制 | `200` | — |
| `LOG_LEVEL` | 日志级别 | `INFO` | — |
| `WORKER_QUEUES` | Worker 监听队列 | `high,default,backtest,optimization` | — |

> 详细列表参见 `ENV_VARIABLES_REFERENCE.md`

### 附录 C: 术语表

| 术语 | 英文 | 定义 |
|------|------|------|
| CTA | Commodity Trading Advisor | 趋势跟踪策略框架 |
| 回测 | Backtest | 用历史数据验证策略的过程 |
| 滑点 | Slippage | 委托价与实际成交价之间的差异 |
| 夏普比率 | Sharpe Ratio | 超额收益与波动率之比，衡量风险调整后收益 |
| 最大回撤 | Max Drawdown | 从峰值到谷底的最大跌幅 |
| 权益曲线 | Equity Curve | 账户净值随时间变化的曲线 |
| K 线 | Candlestick / OHLC | 开盘价、最高价、最低价、收盘价的组合图形 |
| VaR | Value at Risk | 在给定置信水平下的最大可能损失 |
| 复权 | Adjusted Price | 消除分红、拆股等事件影响后的价格序列 |
| TWAP | Time-Weighted Average Price | 时间加权平均价格算法 |
| VWAP | Volume-Weighted Average Price | 成交量加权平均价格算法 |
| Brinson 归因 | Brinson Attribution | 投资绩效归因的经典模型 |
| Alpha | — | 超越基准的超额收益 |
| Beta | — | 组合相对基准的系统性风险敞口 |
| RQ | Redis Queue | 基于 Redis 的 Python 任务队列 |
| JWT | JSON Web Token | 无状态认证 Token 标准 |
| RBAC | Role-Based Access Control | 基于角色的访问控制 |
| MFA | Multi-Factor Authentication | 多因子认证 |

### 附录 D: 前端路由清单

| 路由 | 组件 | 描述 | 状态 |
|------|------|------|------|
| `/` | `Dashboard` | 系统仪表盘 | ✅ |
| `/login` | `Login` | 登录页 | ✅ |
| `/register` | `Register` | 注册页 | ✅ |
| `/strategies` | `StrategyList` | 策略列表 | ✅ |
| `/strategies/new` | `StrategyEditor` | 创建策略 | ✅ |
| `/strategies/:id` | `StrategyEditor` | 编辑策略 | ✅ |
| `/backtests` | `BacktestList` | 回测列表 | ✅ |
| `/market-data` | `MarketData` | 行情数据 | ✅ |
| `/analytics` | `Analytics` | 分析面板 | ✅ |
| `/portfolios` | — | 组合管理 | ❌ 待建 |
| `/reports` | — | 报告中心 | ❌ 待建 |
| `/trading` | — | 交易面板 | ❌ 待建 |
| `/alerts` | — | 告警管理 | ❌ 待建 |
| `/settings` | — | 系统设置 | ❌ 待建 |
| `/ai` | — | AI 助手 | ❌ 待建 |
| `/marketplace` | — | 模板市场 | ❌ 待建 |
| `/workspaces` | — | 团队工作空间 | ❌ 待建 |

### 附录 E: 功能点统计

| 模块 | ✅ 已实现 | 🟡 部分 | ❌ 待建 | 合计 |
|------|----------|---------|--------|------|
| 3.1 账户与权限 | 3 | 0 | 4 | 7 |
| 3.2 数据与行情 | 6 | 1 | 3 | 10 |
| 3.3 策略研究 | 3 | 2 | 4 | 9 |
| 3.4 回测与评估 | 7 | 2 | 1 | 10 |
| 3.5 组合与风险 | 1 | 3 | 5 | 9 |
| 3.6 交易执行 | 0 | 0 | 7 | 7 |
| 3.7 监控与告警 | 2 | 0 | 6 | 8 |
| 3.8 报告与复盘 | 1 | 0 | 5 | 6 |
| 3.9 系统设置 | 1 | 1 | 4 | 6 |
| 3.10 协作与分享 | 0 | 0 | 5 | 5 |
| **合计** | **24** | **9** | **44** | **77** |

> 完成率: 已实现 31% · 部分实现 12% · 待建设 57%

---

*文档结束 — PRODUCT_REQUIREMENTS_V1.md*  
*生成日期: 2025-01*  
*覆盖范围: 10 模块 · 77 功能点 · 28 已实现 API · 68 数据表*
