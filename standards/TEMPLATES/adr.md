# 模板: 架构决策记录 (ADR)

**用�?*: 记录重要的架构决策及其上下文、权�? 
**目标读�?*: Coder, Operator, Main  
**维护�?*: @coder (技术决�?, @main (项目决策)

---

## 标题

格式: `[状态] 决策描述`  
状�? `Proposed` / `Accepted` / `Deprecated` / `Superseded`

**示例**: `[Accepted] 使用 Docker Compose 作为开发环境标准`

---

## 上下�?(Context)

描述问题的背景、约束条件和驱动因素:

- **问题**: 我们试图解决什么？
- **影响范围**: 哪些组件/团队受影�?- **约束**: 时间、资源、技术债务、合规要�?- **选项考虑**: 已调研的替代方案 (即使被拒�?

---

## 决策 (Decision)

明确陈述决策内容:

> 我们决定采用 **[具体方案]**，因�?**[理由]**�?
**具体细节**:
- 技术选型: Docker Compose v2
- 工具�? VS Code + Dev Containers
- 网络架构: �?bridge 网络 `QuantMate_network`
- 数据持久�? named volumes

---

## 替代方案 (Alternatives Considered)

### 方案A: Kubernetes

**优点**:
- 生产级编排，自动扩缩�?- 服务发现和负载均�?
**缺点**:
- 学习曲线陡峭
- 开发环境复�?- 资源消耗大

**拒绝理由**: 过度设计，当前规�?(<10服务) 不需要K8s复杂度�?
### 方案B: Vagrant + 手动安装

...

---

## 后果 (Consequences)

### 正面

- �?开发环境一致性好，新人上�?�?0分钟
- �?与生产环境一致，减少 "works on my machine"
- �?易于清理和重�?(`docker compose down -v`)
- �?资源隔离，不污染主机环境

### 负面

- ⚠️ Docker Desktop �?macOS 上占用内存较�?(~2GB)
- ⚠️ Windows 用户需�?WSL2 后端
- ⚠️ 文件系统性能: macOS 挂载大量小文件慢 (需优化 volumes)

### 风险与缓�?
| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Docker 镜像供应链攻�?| �?| �?| 使用官方镜像，定期扫�?(Trivy) |
| Docker Desktop 许可变更 | �?| �?| 保留 Docker Engine 备用方案 |
| 团队不熟�?Docker | �?| �?| 提供培训和文�?(ENVIRONMENT_SETUP.md) |

---

## 实施计划 (Implementation Plan)

| 任务 | 负责�?| 截止日期 | 状�?|
|------|--------|----------|------|
| 创建 docker-compose.dev.yml (开�? | @operator | 2026-03-05 | �?Done |
| 编写 ENVIRONMENT_SETUP.md | @writer | 2026-03-05 | �?Done |
| 团队培训 (1小时) | @coder | 2026-03-06 | 📅 Planned |
| 收集反馈并迭�?| @all | 2026-03-10 | �?Pending |

---

## 验证 (Validation)

如何验证决策是正确的:

- [ ] 所有开发者能�?小时内成功启动环�?- [ ] 没有 "Docker doesn't work on my machine" 问题报告
- [ ] CI/CD 使用相同环境 (镜像)
- [ ] 生产部署验证通过 (�?DEPLOYMENT_RUNBOOKS.md)

---

## 相关决策

- [Previous: 使用虚拟环境 vs Docker (Rejected)](adr-001-virtualenv.md)
- [Depends on: 选择FastAPI作为后端框架](./adr-002-fastapi.md)

---

## 参考文�?
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Dev Containers](https://containers.dev/)
- [QuantMate 环境配置](../development/ENVIRONMENT_SETUP.md)

---

**更新日志**:

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-03-03 | v1 | 初始决策记录 |
| 2026-03-10 | v1.1 | 增加团队培训反馈 |

**状�?*: `Accepted` (2026-03-03) - 已实施，预期3个月后复�

