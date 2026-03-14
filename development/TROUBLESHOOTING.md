# 开发环境故障排查

本文档针对当前开发模式（Docker 仅跑 MySQL/Redis，API 与前端本地运行）。

## 1. API 启动失败

检查日志：
```bash
tail -n 100 quantmate/logs/api.out
```

常见原因：
- `MYSQL_PASSWORD` 不匹配 MySQL 容器 root 密码
- `.env` 未加载（确认通过 `./scripts/api_service.sh start` 启动）
- 端口 8000 被占用

端口占用排查（Linux/WSL）：
```bash
ss -lntp | grep 8000
```

## 2. 前端启动失败或无法访问

检查 Vite 进程和日志：
```bash
pgrep -af vite
tail -n 100 /tmp/quantmate-portal.out
```

确认访问：
```bash
curl -I http://localhost:5173
```

## 3. 登录后跳回登录页

通常是 `/api/auth/me` 请求失败导致。

检查后端日志：
```bash
tail -n 200 quantmate/logs/api.out
```

清理本地 token（浏览器控制台）：
```js
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
sessionStorage.clear()
```

## 4. 必须修改密码循环跳转

首次 admin 登录必须修改密码。若改完仍跳回改密页：

1. 确认 `/api/auth/change-password` 返回 200  
2. 刷新页面后再次登录  
3. 清理本地 token 后重试（见上一节）

## 5. DataSync 初始化失败

查看日志：
```bash
tail -n 200 quantmate/logs/data_sync.out
```

常见原因：
- DNS 解析失败（Tushare/AkShare）
- `TUSHARE_TOKEN` 未设置或权限不足

## 6. DNS 解析失败（WSL）

症状：
```
Temporary failure in name resolution
```

临时验证方式（需 sudo）：
```bash
sudo cp /etc/resolv.conf /etc/resolv.conf.bak
printf 'nameserver 8.8.8.8\nnameserver 1.1.1.1\n' | sudo tee /etc/resolv.conf
```

测试：
```bash
python3 - <<'PY'
import socket
print(socket.getaddrinfo('api.waditu.com', 80))
PY
```

恢复：
```bash
sudo mv /etc/resolv.conf.bak /etc/resolv.conf
```

## 7. MySQL/Redis 容器异常

检查容器状态：
```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs --tail=100 mysql
docker compose -f docker-compose.dev.yml logs --tail=100 redis
```

如果数据损坏或权限异常：
```bash
docker compose -f docker-compose.dev.yml down
rm -rf quantmate/.data
docker compose -f docker-compose.dev.yml up -d
```
