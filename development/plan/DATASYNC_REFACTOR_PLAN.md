# DataSync 多数据源重构方案

> **状态**: 实施中  
> **创建日期**: 2026-03-24  
> **目标**: 将硬编码的 11 步同步流程重构为插件式多数据源架构

---

## 一、需求规格

| 编号 | 需求 | 说明 |
|------|------|------|
| R1 | 多数据源 | 当前 Tushare + AkShare，未来扩展 Yahoo 等。每个数据源作为独立模块。 |
| R2 | Settings 管理 | 管理员在 Settings 配置数据源及接口开关。所有接口都列出（含无权限的），持久化到 `data_source_configs` + `data_source_items`。 |
| R3 | 数据库持久化 | 数据源、接口、开关状态保存在 quantmate DB。 |
| R4 | 数据分库存储 | AkShare → akshare DB、Tushare → tushare DB，按接口建表，建索引+唯一约束。 |
| R5 | 动态建表 | 接口开关打开时自动 CREATE TABLE IF NOT EXISTS，表创建后永不删除。当前已同步的接口作为系统初始默认开启。 |
| R6 | 每日同步 Job | 后台 daily job 同步所有开关打开的接口数据到本地数据库。 |
| R7 | 按交易日状态追踪 | 每个接口按交易日记录同步状态（pending/running/success/error）。每次 job 检查所有失败/未同步记录并重试。 |
| R8 | 前端同步状态 | Market Data → Data Synchronization tab 展示同步状态（按日期、接口、状态筛选）。 |
| R9 | VNPy 同步 Job | 独立定时 job，将最新 tushare 股票数据同步至 vnpy 数据库。 |
| R10 | 环境感知初始化 | dev=1年数据，staging=5年，prod=接口最大范围。首次安装时初始化默认接口开关并记录同步状态。 |
| R11 | 初始化 SQL | 所有表、数据源、接口、同步状态、配置的初始化 SQL 脚本。 |

---

## 二、架构设计

### 2.1 数据源插件目录结构

```
datasync/
├── main.py                     # 入口 + 调度器
├── registry.py                 # DataSourceRegistry（注册/发现所有数据源）
├── base.py                     # BaseDataSource 抽象基类 + BaseIngestInterface
├── scheduler.py                # 调度逻辑（daily sync + backfill + vnpy sync）
├── table_manager.py            # 动态建表管理器
├── metrics.py                  # Prometheus metrics（保留）
├── sources/
│   ├── __init__.py
│   ├── tushare/
│   │   ├── __init__.py
│   │   ├── source.py           # TushareDataSource（实现 BaseDataSource）
│   │   ├── interfaces.py       # 每个接口实现（StockDaily, AdjFactor, ...）
│   │   ├── rate_limiter.py     # Tushare 专用限速
│   │   └── ddl.py              # Tushare 所有表的 DDL 定义
│   ├── akshare/
│   │   ├── __init__.py
│   │   ├── source.py           # AkShareDataSource
│   │   ├── interfaces.py
│   │   ├── rate_limiter.py
│   │   └── ddl.py
│   └── yahoo/                  # 未来扩展（预留）
│       └── ...
└── service/
    ├── sync_engine.py          # 替代 data_sync_daemon.py 的核心同步引擎
    ├── vnpy_sync.py            # VNPy 同步（独立 job）
    └── init_service.py         # 初始化服务（环境感知）
```

### 2.2 核心抽象

**BaseDataSource**（每个数据源实现）:
- `source_key: str` — 如 "tushare", "akshare"
- `display_name: str`
- `requires_token: bool`
- `get_interfaces() → list[BaseIngestInterface]`
- `test_connection() → bool`

**BaseIngestInterface**（每个接口实现）:
- `interface_key: str` — 如 "stock_daily", "adj_factor"
- `display_name: str`
- `source_key: str`
- `target_database: str`
- `target_table: str`
- `get_ddl() → str` — CREATE TABLE SQL
- `sync_date(trade_date: date) → SyncResult` — 同步指定交易日
- `sync_range(start: date, end: date) → SyncResult` — 初始化/backfill 用
- `supports_batch: bool` — 是否支持按日期范围批量

**SyncResult**: `(status: str, rows_synced: int, error_message: str | None)`

### 2.3 数据库设计

#### `quantmate.data_source_configs`（增强）
```sql
CREATE TABLE data_source_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_key VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 0,
    config_json JSON DEFAULT NULL,
    requires_token TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `quantmate.data_source_items`（增强）
```sql
CREATE TABLE data_source_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    item_key VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 0,
    description TEXT DEFAULT NULL,
    requires_permission VARCHAR(50) DEFAULT NULL,
    target_database VARCHAR(50) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    table_created TINYINT(1) DEFAULT 0,
    sync_priority INT DEFAULT 100,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_source_item (source, item_key)
);
```

#### `quantmate.data_sync_status`（改造为动态）
```sql
CREATE TABLE data_sync_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sync_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL,
    interface_key VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    rows_synced INT DEFAULT 0,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_date_source_interface (sync_date, source, interface_key),
    INDEX idx_status (status),
    INDEX idx_sync_date (sync_date),
    INDEX idx_source_interface (source, interface_key)
);
```

### 2.4 同步引擎流程

**Daily Sync Job**（每日 02:00 上海时间）:
1. 从 `data_source_configs` 获取 `enabled=1` 的数据源
2. 从 `data_source_items` 获取 `enabled=1` 的接口，按 `sync_priority` 排序
3. 获取上一个交易日
4. 对每个接口：检查是否已 success → 跳过；否则调用 `interface.sync_date()` → 更新 status
5. continue_on_error

**Backfill Job**（每 6 小时）:
1. 获取锁
2. 查询 status=error/pending/partial 记录（最近 N 天）
3. 按 source+interface 分组重试
4. 释放锁

**VNPy Sync Job**（独立，daily sync 之后运行）:
1. 查询最新 success 的 tushare_stock_daily 日期
2. 转换 + upsert 到 vnpy.dbbardata

### 2.5 动态建表机制

管理员在 Settings 打开接口时:
1. API 更新 `data_source_items.enabled = 1`
2. 如果 `table_created = 0` → 执行 DDL → 更新 `table_created = 1`
3. 表一旦创建永不删除

### 2.6 环境感知初始化

`InitService.initialize(env)`:
1. 插入默认 data_source_configs + data_source_items
2. 为 enabled 接口创建目标表
3. 根据环境计算 start_date（dev=1yr, staging=5yr, prod=max）
4. 批量插入 data_sync_status（pending）
5. 逐接口执行 sync_range() 回填

---

## 三、实施阶段

### Phase 1: 数据库 Schema 迁移
- 迁移 SQL: 017_datasync_refactor.sql
- 更新 quantmate.sql init seed data
- quantmate/mysql/init/* 更新

### Phase 2: 后端核心抽象层
- datasync/base.py, registry.py, table_manager.py
- DAO 层适配

### Phase 3: 数据源插件实现
- datasync/sources/tushare/ 和 akshare/
- 保留现有 ingest 底层函数，接口层调用

### Phase 4: 同步引擎重写
- sync_engine.py, vnpy_sync.py, init_service.py
- 更新 main.py 调度器

### Phase 5: Settings API 完善
- 接口 enable 时触发建表
- Admin 权限检查

### Phase 6: Sync Status API + 前端
- GET /data/sync-status, /summary
- MarketData Sync Tab 实现
- Settings DataSource Tab 持久化

### Phase 7: 初始化 SQL 与脚本
- 完整 init SQL 和 seed data
- init_market_data.py 更新

---

## 四、关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| step_name 类型 | ENUM → VARCHAR | 动态支持新数据源接口 |
| 数据分库 | 保持现状 | 隔离性好 |
| 现有代码处理 | 保留底层函数，上层包装 | 最小改动、复用验证逻辑 |
| VNPy 同步 | 独立为单独 job | 解耦 |
| 表删除策略 | 永不删除 | 避免数据丢失 |
| 初始化时机 | 首次安装/手动触发 | 避免启动检查 |

---

## 五、排除范围

- 不涉及 Qlib 数据转换
- 不涉及实时行情推送
- Yahoo 数据源本次只预留接口
- 不改动 VNPy 表结构
- 不改动回测/策略代码
