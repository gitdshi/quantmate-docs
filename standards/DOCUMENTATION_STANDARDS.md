# Documentation Standards

This repository is the documentation root for QuantMate. Keep docs concise, accurate, and aligned with the current codebase.

## Principles

- **Accuracy first**: commands, paths, and configs must match the current repos.
- **Actionable**: include runnable steps and expected outcomes.
- **Minimal**: avoid duplication; link to the single source of truth.
- **Current**: mark historical snapshots explicitly.

## Structure

- Use the existing top-level folders: `development/`, `architecture/`, `deployment/`, `testing/`, `reference/`, `standards/`.
- Each folder should have a `README.md` that lists contents.
- Use relative links within the repo.

## Examples

Command blocks should include a language tag and reflect current file names:

```bash
docker compose -f docker-compose.dev.yml up -d mysql redis
```

## Naming

Prefer clear, descriptive file names. Keep changes consistent with existing naming conventions in this repo.
