# Contributing Guide

Welcome to the Carbon Footprint Awareness Platform! We appreciate your interest in contributing. This document outlines the local setup, the strict quality gates enforced by our CI pipeline, and our coding standards.

---

## 1. Local Development Setup

### 1.1 Backend (FastAPI / Python 3.11+)
We utilize modern Python tooling for linting, typing, and testing.

1. **Create and activate a virtual environment:**
   ```bash
   cd backend
   python -m venv .venv
   
   # On macOS/Linux:
   source .venv/bin/activate
   # On Windows:
   .venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt -r requirements-dev.txt
   ```

3. **Run the local development server:**
   To run the backend without needing Google Cloud credentials (using the memory repo and rules engine):
   ```bash
   USE_GEMINI=false USE_FIRESTORE=false uvicorn app.main:app --reload
   ```

### 1.2 Frontend (React 18 / Node.js 20+)
1. **Install NPM packages:**
   ```bash
   cd frontend
   npm ci  # Use ci for strict lockfile adherence
   ```

2. **Run the Vite development server:**
   ```bash
   npm run dev
   ```

---

## 2. Quality Gates & CI Pipeline

We maintain an exceptionally high bar for code quality. Every pull request runs through a rigorous automated CI pipeline via GitHub Actions. **Code will be rejected if it fails any of the following gates.**

### 2.1 Backend Gates
| Tool | Threshold | Command to verify locally | Purpose |
| --- | --- | --- | --- |
| **Pytest** | ≥ 90% statement coverage | `pytest` | Validates logic mathematically. Coverage is enforced strictly. |
| **Mypy** | Strict typing compliance | `mypy app` | Eradicates runtime `TypeError` issues. |
| **Ruff** | Zero lint/format errors | `ruff check .` | Ensures idiomatic Python, checks cognitive complexity limits, and organizes imports. |

### 2.2 Frontend Gates
| Tool | Threshold | Command to verify locally | Purpose |
| --- | --- | --- | --- |
| **Vitest** | ≥ 75% statement coverage | `npm run test:coverage` | Unit tests for components and hooks. Includes `vitest-axe` for DOM accessibility assertions. |
| **TypeScript**| Zero compilation errors | `npx tsc --noEmit` | Strict type checking. |
| **ESLint** | Zero warnings (`--max-warnings=0`) | `npx eslint .` | Enforces React hooks rules and `jsx-a11y` accessibility standards. |

---

## 3. Engineering Guidelines & Coding Standards

### 3.1 The "Zero Hardcoding" Rule
Never place raw numerical constants or magic strings inside application logic. 
- All emission factors, grid averages, and scientific constants MUST be placed in `backend/app/carbon/factors.py`.
- This ensures that when global averages update (e.g., a new DEFRA report is released), we only need to update a single file.

### 3.2 Pure Functions for Math
Any function that calculates carbon logic must be pure.
- It must take inputs and return outputs without modifying global state.
- It must NOT make network requests or read from databases.
- If data is needed from a database, it must be fetched by the router and injected into the pure function.

### 3.3 Accessibility-First UI
The frontend must be usable by everyone.
- Ensure all interactive elements have proper `aria-labels` or `aria-labelledby` attributes.
- Use semantic HTML tags (`<main>`, `<nav>`, `role="region"`, `role="group"`).
- Ensure color contrast ratios exceed WCAG AA standards.
- Recharts graphics must include visually hidden `<table>` fallbacks for screen reader accessibility.

### 3.4 Git Workflow
1. Branch off `main` using the format `feature/<name>` or `fix/<name>`.
2. Ensure all local tests and linters pass.
3. Write clear, semantic commit messages (e.g., `feat: add hybrid car fuel calculations`).
4. Submit a Pull Request and ensure the CI pipeline runs completely green.
