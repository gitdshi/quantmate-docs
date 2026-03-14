# Production Deployment (Template)

This document is a high-level template. The main code repo only includes `docker-compose.dev.yml` for local development. For production, adapt `deployment/docker-compose.prod.yml` to your environment and deployment repo.

## Prerequisites

- Docker + Docker Compose v2
- Container registry access (if pulling prebuilt images)
- DNS + TLS termination (Traefik, Nginx, or external LB)
- MySQL 8.0 and Redis 7 resources sized for production

## Template Flow

1) Prepare environment variables (example `.env.prod`):

```bash
# core
SECRET_KEY=<strong>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# mysql
MYSQL_ROOT_PASSWORD=<root>
MYSQL_USER=quantmate
MYSQL_PASSWORD=<app>

# data
TUSHARE_TOKEN=<optional>

# routing
API_HOST=api.quantmate.com
FRONTEND_HOST=www.quantmate.com
```

2) Build or pull images

- API image: built from `quantmate` repo (FastAPI)
- Portal image: built from `quantmate-portal` repo (React)

3) Deploy with the template compose

```bash
docker compose -f deployment/docker-compose.prod.yml --env-file .env.prod up -d
```

## Notes

- `deployment/docker-compose.prod.yml` is an example; adjust build contexts, volumes, and network labels to match your infra.
- MySQL schema init scripts live in `quantmate/mysql/init/` and should be applied on first boot.
- Health checks should target `/health` on the API.
