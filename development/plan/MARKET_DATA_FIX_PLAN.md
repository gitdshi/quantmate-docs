# 行情数据模块修复方案

> 创建时间: 2026-03-26
> 状态: 实施中

## 问题总览

| # | 问题 | 严重程度 | 根因 |
|---|------|----------|------|
| 1 | 实时行情数据请求超时 | 高 | AkShare批量接口无超时，下载全市场数据30s+；Tencent API 5s超时无重试 |
| 2 | K线图无法加载数据，股票选择框无法搜索symbol | 高 | 前端K线仅支持CN市场（`cnVtSymbol`为null时不请求）；symbol搜索只查CN |
| 3 | 数据同步首次加载缓慢且失败 | 中 | POST `/datasync/trigger` 同步阻塞HTTP请求，同步引擎逐项处理+限速 |
| 4 | 财经日历及市场情绪无数据 | 中 | 标签页为 "Coming soon" 占位，后端无API |

---

## Phase A: 实时行情可靠性 (Issue 1)

### A1: AkShare批量调用内存TTL缓存
- **文件**: `quantmate/app/domains/market/realtime_quote_service.py`
- **方案**: 模块级 `_BULK_CACHE: dict[str, tuple[float, DataFrame]]` + `threading.Lock` + 60s TTL
- 每个AkShare批量调用 (`stock_us_spot_em`, `stock_hk_spot`, `forex_spot_em`, `futures_zh_spot`, `crypto_js_spot`) 先查缓存，未命中或过期再请求并存储
- 防止多次并发轮询(overview 4卡片并行)重复下载30s的全量数据

### A2: Tencent接口重试+退避
- **文件**: `quantmate/app/domains/market/realtime_quote_service.py`
- `_fetch_tencent_quote()` 和 `_quote_hk_tencent()` 加2次重试、1s退避
- 超时从5s提高到8s

### A3: AkShare显式超时
- 用 `concurrent.futures.ThreadPoolExecutor` + `future.result(timeout=15)` 包装每个 `ak.*` 调用
- 超过15s抛出TimeoutError，触发缓存回退

### A4: 前端超时调整
- **文件**: `quantmate-portal/src/pages/MarketData.tsx`
- `fetchQuoteFast()` 超时: CN 8000ms, 其他 10000ms (原: CN 5000ms, 其他 3000ms)

---

## Phase B: K线全市场 + Symbol搜索 (Issue 2)

### B1: HK/US股票列表增加关键词搜索
- **文件**: `multi_market_dao.py`, `multi_market.py`
- `list_hk_stocks()` / `list_us_stocks()` 增加 `keyword` 参数
- SQL: `WHERE (ts_code LIKE :kw OR name LIKE :kw)` (keyword不为空时)
- 路由增加 `keyword` Query参数

### B2: CRYPTO/FUTURES历史K线端点
- **文件**: `quantmate/app/api/routes/data.py`
- 新端点 `GET /data/history-external/{market}/{symbol}` 
- CRYPTO: `ak.crypto_hist_em(symbol)` / FUTURES: `ak.futures_zh_daily_sina(symbol)` 
- Redis缓存1h TTL

### B3: 前端K线接入全市场
- **文件**: `MarketData.tsx`, `api.ts`
- 移除 `cnVtSymbol` 限制，根据 `klineMarket` 分发请求:
  - CN: `/data/history/{vtSymbol}` (已有)
  - HK: `/market/hk/daily?ts_code=...`
  - US: `/market/us/daily?ts_code=...`
  - CRYPTO/FUTURES: `/data/history-external/{market}/{symbol}`
- api.ts增加 `multiMarketAPI.hkDaily()`, `usDaily()`, `historyExternal()`
- 统一响应格式映射到 `OHLCBar`

### B4: 前端Symbol搜索全市场
- HK/US: 调用 `/market/hk/stocks?keyword=...`, `/market/us/stocks?keyword=...`
- CRYPTO/FUTURES: 继续使用 `QUICK_SYMBOLS`

---

## Phase C: 异步数据同步触发 (Issue 3)

### C1: RQ后台任务
- **文件**: `quantmate/app/worker/service/tasks.py`
- 新增 `run_datasync_task(target_date_str)` 函数
- 调用现有 `run_daily_sync(target_date)`

### C2: 异步触发端点
- **文件**: `quantmate/app/api/routes/datasync.py`
- `POST /datasync/trigger` 改为 `get_queue("default").enqueue(run_datasync_task, ...)`
- 立即返回 `{"status": "queued", "job_id": ...}`
- 新增 `GET /datasync/job/{job_id}` 查询任务状态

### C3: 前端轮询任务状态
- **文件**: `MarketData.tsx`, `api.ts`
- 触发后每3s轮询 `GET /datasync/job/{job_id}` 直到 finished/failed
- 显示进度指示器

---

## Phase D: 财经日历 + 市场情绪 (Issue 4)

### D1: 财经日历后端
- **新文件**: `quantmate/app/api/routes/calendar.py`
- `GET /calendar/trade-days` → 查 `trade_calendar` 表
- `GET /calendar/events` → 聚合:
  - AkShare宏观日历 (`ak.news_economic_baidu()`)
  - IPO日历 (tushare `new_share` 表)
  - 除权除息 (tushare `dividend` 表)
- 注册到 `main.py`

### D2: 市场情绪后端
- **新文件**: `quantmate/app/api/routes/sentiment.py`
- `GET /sentiment/overview`:
  - 涨跌家数比 (从 `stock_daily` 最新记录统计)
  - 成交量趋势 (今日 vs 5日/20日平均)
  - 指数动量 (从 `index_daily` 最新收益率)
- `GET /sentiment/fear-greed` → 0-100综合评分:
  - 市场广度 (涨跌比)
  - 成交量趋势
  - 指数波动率 (20日标准差)
  - 价格vs125日均线偏离
- 注册到 `main.py`

### D3: 财经日历前端
- 月历视图(交易日/非交易日色码) + 未来30天事件列表(IPO/除权/宏观)
- `calendarAPI` 对象

### D4: 市场情绪前端
- Fear & Greed 仪表盘(0-100) + 涨跌家数柱状图 + 成交量趋势 + 指数动量卡片
- `sentimentAPI` 对象

### D5: i18n
- `en/market.json` 和 `zh/market.json` 增加 calendar/sentiment 翻译键

---

## 验证计划

1. 实时行情: 每个市场(CN/HK/US/CRYPTO/FUTURES)请求15s内返回，第二次请求<1s(缓存)
2. K线: HK(00700), US(AAPL), CRYPTO(BTCUSDT), FUTURES(RB2410) 均可加载K线
3. Symbol搜索: HK模式输入"700"、US模式输入"AAPL"可搜到
4. 数据同步触发立即返回job_id，轮询显示进度
5. 财经日历显示交易日、IPO、除权除息事件
6. 市场情绪显示 Fear & Greed 评分和涨跌家数
