# 模板: 故障排除指南 (Troubleshooting)

**用�?*: 常见问题的诊断和解决方案  
**目标读�?*: 所有开发�?(自服�?  
**维护�?*: @coder, @operator

---

## 快速诊断流程图

```
问题现象 (错误/异常)
    �?[第一步] 查看日志 (docker-compose logs -f <service>)
    �?识别错误关键�?(Connection refused, Timeout, Permission denied)
    �?[第二步] 查找本目录相关章�?    �?执行修复步骤
    �?[第三步] 验证 (curl, pytest, 浏览�?
    �?问题解决? �?�?�?�?完成
    �?�?�?记录�?ISSUES.md 并联�?@operator
```

---

## 按类别的问题

### 🔌 连接问题

#### 问题: `Cannot connect to MySQL server on '127.0.0.1' (111)`

**可能原因**:
1. MySQL 容器/服务未启�?2. 密码错误
3. 网络配置问题 (bind-address)

**诊断**:
```bash
# 1. 检查MySQL状�?docker compose ps mysql  # Docker方式
# �?systemctl status mysql   # 本地方式

# 2. 测试连接
docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} -e "SELECT 1;"  # Docker
mysql -u root -p -e "SELECT 1;"  # 本地

# 3. 检查监听端�?netstat -tulpn | grep 3306
```

**修复**:
```bash
# 启动MySQL
docker compose up -d mysql  # Docker
sudo systemctl start mysql   # 本地

# 重置密码 (如果忘记)
docker compose exec mysql mysql -u root -e "ALTER USER 'root'@'%' IDENTIFIED BY 'new_password';"
# 更新 .env 中的 MYSQL_PASSWORD
```

---

#### 问题: `ConnectionError: Error 111 connecting to localhost:6379. Connection refused.`

**诊断和修�?* (类似MySQL，针对Redis):
```bash
docker compose ps redis
docker compose exec redis redis-cli ping  # 应返�?PONG
sudo systemctl status redis
redis-cli ping
```

---

### 🐍 Python 依赖问题

#### 问题: `ImportError: cannot import name 'XXX' from 'YYY'`

**原因**: 包版本冲突或未安�?
**诊断**:
```bash
# 检查已安装版本
pip list | grep YYY

# 验证依赖�?pip check
```

**修复**:
```bash
# 清除缓存重新安装
pip cache purge
pip install -r requirements.txt --force-reinstall

# 如果特定包冲�?pip install "YYY>=1.2.0,<2.0.0" --upgrade
```

---

#### 问题: `ModuleNotFoundError: No module named 'XXX'`

**修复**:
```bash
# 确保虚拟环境已激�?source .venv/bin/activate

# 安装缺失�?pip install XXX
# 或更新requirements.txt后重新安装全�?pip install -r requirements.txt
```

---

### 🌐 前端开发问�?
#### 问题: Vite HMR 不工作，代码修改无反�?
**原因**: 文件系统事件未触�?(Docker macOS/Linux 常见)

**诊断**:
```bash
# 检查容器日�?docker compose logs portal

# 查看文件是否被挂�?docker compose exec portal ls -la /app/src
```

**修复** (Docker开发模�?:
```bash
# 重启portal容器
docker compose restart portal

# 如果仍不行，增加Docker Desktop资源:
# Settings �?Resources �?File Sharing �?增加项目目录
# 或使�?polling 模式:
# �?.env.local 添加: CHOKIDAR_USEPOLLING=true
```

---

#### 问题: `Failed to fetch` API请求跨域错误

**原因**: CORS 配置或代理配置错�?
**诊断**:
```bash
# 检查API CORS配置
curl -I http://localhost:8000/docs | grep -i access-control

# 查看浏览器控制台Network标签
```

**修复** (开发环�?:
- 确保 `CORS_ORIGINS` 包含 `http://localhost:5173` (前端地址)
- 重启API容器: `docker compose restart api`
- 清除浏览器缓存或使用隐私模式

---

### 🗄�?数据库问�?
#### 问题: `OperationalError: (1049, "Unknown database 'QuantMate'")`

**原因**: 数据库未初始�?
**修复**:
```bash
# Docker方式
docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} < mysql/init/QuantMate.sql
docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} < mysql/init/vnpy.sql
docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} < mysql/init/tushare.sql

# 验证
docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} -e "SHOW DATABASES;"
```

---

#### 问题: `Duplicate entry '...' for key 'PRIMARY'` 或迁移失�?
**原因**: 初始化脚本重复执行，主键冲突

**修复**:
```bash
# 查看表结�?docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} -e "DESCRIBE QuantMate.strategies;"

# 如果数据可丢失，清空表后重试
docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} -e "TRUNCATE TABLE QuantMate.strategies;"

# 或创建全新数据库 (推荐开发环境重�?
docker compose down -v  # ⚠️ 删除所有数�?docker compose up -d
# 自动初始化脚本会重新执行
```

---

### 🐳 Docker 问题

#### 问题: `Error response from daemon: port is already allocated`

**原因**: 端口被其他进程占�?
**诊断**:
```bash
# 查找占用端口的进�?lsof -i :8000
# �?netstat -tulpn | grep :8000
```

**修复**:
```bash
# 杀死进�?kill -9 <PID>

# 或修�?docker-compose.dev.yml 端口映射
# �?"8000:8000" 改为 "8001:8000"
```

---

#### 问题: `Permission denied` 挂载卷错�?(Linux)

**原因**: 容器内用户UID不匹配宿主机文件权限

**修复**:
```bash
# 方案1: 修改文件权限 (推荐)
sudo chown -R 1000:1000 QuantMate/app  # 1000是容器内appuser UID

# 方案2: 临时用root启动 (仅开发调�?
# �?docker-compose.dev.yml 中添�? user: "root:root"

# 方案3: 使用匿名卷避免挂�?(代码放入镜像而非挂载)
# 修改 volumes 为空或删�?```

---

### 🔐 认证问题

#### 问题: `401 Unauthorized` �?`403 Forbidden`

**诊断**:
```bash
# 1. 获取token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"查看日志中的初始密码"}' | jq -r .access_token)

# 2. 验证token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/auth/me

# 3. 检查token过期
# JWT默认30分钟过期，需重新登录获取新token
```

**修复**:
- 开发环�? 重新登录获取新token
- 生产环境: 刷新 token (如果有refresh_token端点)

---

## 日志查看技�?
### 实时日志

```bash
# 所有服�?docker compose logs -f

# 单个服务
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f mysql

# 最�?00�?docker compose logs --tail=100 api

# 过去1小时
docker compose logs --since 1h api
```

### 日志搜索

```bash
# 搜索错误
docker compose logs api | grep -i error

# 搜索Exception栈跟�?docker compose logs api | grep -A 10 "Traceback"

# 导出日志到文�?docker compose logs --since 24h > api-logs-$(date +%F).log
```

---

## 性能问题

### 问题: API响应�?(>1s)

**诊断**:
```bash
# 1. 检查数据库查询�?docker compose logs mysql | grep -i "slow query"

# 2. 检查API延迟
time curl http://localhost:8000/api/strategies

# 3. 查看容器资源
docker stats
```

**可能原因和修�?*:
1. **缺少索引** �?查看 `mysql/init/*.sql` 添加 `INDEX()`
2. **N+1查询** �?使用SQLAlchemy `joinedload` 优化
3. **Redis�?* �?`redis-cli slowlog get`
4. **CPU/内存不足** �?`docker stats` 查看，增加资源限�?
---

## 测试问题

### 问题: pytest 测试失败但本地手动测试正�?
**原因**: 测试环境问题 (数据库状态、环境变�?

**修复**:
```bash
# 1. 确保测试数据库独�?# 检�?conftest.py 中是否使用独立测试数据库

# 2. 清理数据库状�?docker compose exec mysql mysql -u root -p${MYSQL_PASSWORD} -e "DROP DATABASE IF EXISTS QuantMate_test; CREATE DATABASE QuantMate_test;"

# 3. 运行单个测试查看详细输出
pytest tests/unit/test_auth.py::test_login -vv

# 4. 使用pytest调试�?pytest --pdb tests/unit/test_auth.py::test_login
```

---

## 收集帮助信息

如果上述解决方案无效，提供以下信息给 @operator:

```bash
# 1. 环境信息
docker-compose version
docker version
python --version
node --version

# 2. 服务状�?docker-compose ps

# 3. 相关日志 (过去10分钟)
docker-compose logs --since 10m > troubleshooting-logs.txt

# 4. 复现步骤 (精确到命令和输入)

# 5. 期望 vs 实际结果
```

---

## 报告新问�?
发现新bug或环境问�?

1. 检�?`ISSUES.md` 是否已记�?2. 如未记录，添加到 `validation-reports/ISSUES.md` 或创建新Issue
3. 按照上述格式提供诊断信息

---

**最后更�?*: 2026-03-03  
**待补�?*: WebSocket连接问题、异步任务失败、Redis内存不足�

