# Testing

## Backend (quantmate)

```bash
cd quantmate
pip install -r requirements.txt
pytest -q
```

## Frontend (quantmate-portal)

```bash
cd quantmate-portal
npm install
npm run test:run
```

## E2E

See `development/frontend/E2E_README.md`.

## Notes

- Some tests require MySQL/Redis to be running (`docker-compose.dev.yml`).
- For a quick smoke test, run `pytest -q tests/` in the backend repo.
