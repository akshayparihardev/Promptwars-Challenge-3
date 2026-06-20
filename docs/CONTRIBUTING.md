# Contributing Guide

## Environment Setup
1. Backend (Python 3.11+)
   - Create a virtual environment: `python -m venv .venv`
   - Activate: `source .venv/bin/activate` or `.venv\Scripts\activate` on Windows
   - Install dependencies: `pip install -r requirements.txt -r requirements-dev.txt`
2. Frontend (Node.js 20+)
   - Install dependencies: `npm install`

## Quality Gates
The CI pipeline is strictly enforced. Code will be rejected if it fails any of the following:

| Tool | Threshold | Command |
| --- | --- | --- |
| **Pytest** | ≥ 90% coverage | `pytest` |
| **Vitest** | ≥ 90% coverage | `npm run test:coverage` |
| **Mypy** | Strict typing | `mypy app` |
| **Ruff** | No linting errors | `ruff check .` |
| **ESLint** | No warnings | `npx eslint . --max-warnings=0` |
| **Axe-core**| No a11y violations| Covered by vitest |

## Guidelines
- Write pure, deterministic code in `app.carbon`.
- Never use raw numbers in code; add them to `constants.py`.
- Prefer accessibility-first UI components.
