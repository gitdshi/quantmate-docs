# Documentation Structure

This repository is the documentation root (there is no `docs/` subfolder).

## Current Layout

```
quantmate-docs/
  README.md
  STRUCTURE_README.md
  SECURITY.md
  architecture/
  deployment/
  development/
  reference/
  standards/
  testing/
```

## Directory Purpose

- `development/` - local setup, API, frontend, troubleshooting
- `architecture/` - system, data sync, database design
- `deployment/` - production templates and ops guidance
- `testing/` - test strategy and validation reports
- `standards/` - documentation standards and templates
- `reference/` - external references and data dictionaries

## Conventions

- Each directory should have a `README.md` that lists its contents.
- Use relative links inside the repo.
- Mark historical snapshots explicitly (e.g. code review reports, validation reports).

## Notes

- The main code repo only ships `docker-compose.dev.yml` (MySQL/Redis for local dev).
- Production deployment artifacts in this repo are templates and must be adapted per environment.
