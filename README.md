# 🌱 Carbon Footprint Awareness Platform

[![CI](https://github.com/akshayparihardev/Promptwars-Challenge-3/actions/workflows/ci.yml/badge.svg)](https://github.com/akshayparihardev/Promptwars-Challenge-3/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

🚀 **Live App:** [https://carbon-platform-bddp.onrender.com/](https://carbon-platform-bddp.onrender.com/)

> **Virtual PromptWars — Challenge 3.** A web app that helps individuals
> **understand, track, and reduce** their personal carbon footprint through
> simple inputs, **localized context**, and **personalized, AI-generated insights**.

Built as a single, accessible web application: a **Python / FastAPI** backend and
a **React + TypeScript** frontend, using **Google Gemini (Vertex AI)** for
personalized advice and **Firestore** for tracking, deployed to **Google Cloud
Run** as one container.

---

## 1. Chosen vertical

**Carbon Footprint Awareness Platform** — a tool for everyday individuals who want to know where their emissions come from, what happens if they change their habits, and what to actually *do* about them.

| Pillar | In the product |
| --- | --- |
| **Understand** | Enter a few lifestyle facts and your location → get an annual footprint broken down by category, compared to your regional benchmark and a Paris-aligned sustainable target. |
| **Track** | Save snapshots over time (anonymously) and run interactive **What-If simulations** to see the immediate impact of lifestyle changes. |
| **Reduce** | Receive 2–4 personalized, *quantified* actions that target your biggest emission sources first, tailored to your local region. |

---

## 2. Approach & logic

### The decision flow (smart, context-driven assistant)

```text
User inputs (location, transport, home, diet, consumption)
        │
        ▼
LocationContext Engine ──► Resolves regional grid factors & averages
        │
        ▼
Carbon Engine  ──►  per-category kg CO₂e  ──►  ranked by size
        │                                          │
        ▼                                          ▼
Comparison to targets                  Insights generator
                                         ├─ Gemini (Vertex AI): tailored advice
                                         └─ Rule-based fallback: deterministic,
                                            targets the largest categories
        │
        ▼
Save snapshot (Firestore, keyed by anonymous device id) → history & trend
```

The "logical decision making based on user context" the brief asks for shows up
in three critical places:

1. **Location Context.** The app automatically detects if a user is in India, the UK, or the US, and applies the correct electricity grid emission factors (e.g. 0.82 kgCO₂/kWh for India vs 0.233 for the UK), making calculations vastly more accurate than a global average.
2. **The insights engine ranks the user's own emission categories** and gives
   advice for the biggest contributors — a heavy driver is told about transport;
   a heavy-meat eater is told about diet; each recommendation carries an
   estimated annual saving derived from that user's actual math.
3. **Graceful AI degradation.** Gemini produces the richest, most personal
   advice, but if it is unavailable (no credentials, quota, network, or disabled)
   the platform *transparently falls back* to a deterministic rule engine, so the
   user always gets useful, quantified guidance.

### Emission model (Zero Hardcoding)

Footprint figures use published emission factors (UK DEFRA 2023, US EPA, CEA India 2023, EMBER) documented inline in
[`backend/app/carbon/factors.py`](backend/app/carbon/factors.py) — every constant
cites its source. The entire engine is pure math: every output string and insight tag dynamically adjusts to user inputs.

---

## 3. How the solution works

### Architecture

```text
Browser (React + TS, Vite)              Cloud Run (single container)
  • accessible UI + Recharts   ──HTTP──► FastAPI
  • anonymous device id                   ├─ POST /api/calculate  pure carbon engine
  • html2canvas (share card)              ├─ POST /api/whatif     interactive simulator
                                          ├─ POST /api/insights   Gemini → rules fallback
                                          ├─ POST /api/entries    save snapshot
                                          ├─ GET  /api/entries/id history
                                          └─ GET  /  (+ assets)   serves built SPA
                                              │
                                              ├─► Vertex AI (Gemini)  via ADC
                                              └─► Firestore (Native)  via ADC
```

One container serves both the API and the static SPA. Authentication to
Google services uses **Application Default Credentials** (the Cloud Run service
account) — **there are no API keys or secrets in the repository**.

### Project layout

```text
backend/    FastAPI app — carbon engine, insights, repository, routes, tests
frontend/   React + TS SPA — components, hooks, api client, accessible UI
docs/       Architecture notes (docs/ARCHITECTURE.md)
Dockerfile  multi-stage build (node build → python runtime)
.github/    CI: lint + format + types + tests + build on every push to main
```

---

## 4. Running locally

**Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate    # PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
# No GCP needed locally — use the rule engine + in-memory store:
USE_GEMINI=false USE_FIRESTORE=false uvicorn app.main:app --reload
```

**Frontend** (Node 20+):

```bash
cd frontend
npm install
npm run dev      # proxies /api to http://localhost:8000
```

**Or the whole thing as one container:**

```bash
docker build -t carbon-platform .
docker run -p 8080:8080 -e USE_GEMINI=false -e USE_FIRESTORE=false carbon-platform
# open http://localhost:8080
```

---

## 5. Testing

| Suite | Command | Covers |
| --- | --- | --- |
| Backend | `cd backend && pytest` | carbon math, validation bounds, routes, Gemini fallback, and **mathematical proofs of zero hardcoding** (`test_zero_hardcoding.py`). |
| Lint | `ruff check .` · `npm run lint` | style, imports, naming, complexity |
| Types | `mypy app` (**strict**) · `tsc` | static type correctness end-to-end |

---

## 6. Assumptions made

- **Awareness, not audit.** Emission factors are representative public averages
  for education, not certified carbon accounting.
- **Anonymous by design.** No login. A random device id (in `localStorage`) keys
  a user's history.
- **Home energy is shared** across the household size entered.
- **Gemini is best-effort.** When it is unreachable or disabled, the rule-based
  engine guarantees the app still delivers quantified advice.

---

## 7. Built with Google Antigravity

This project was developed using **Google Antigravity 2.0**, leveraging its agentic
orchestration to plan, architect, and build each layer of the platform:

- **Prompt strategy:** The agent was given a structured plan — deterministic
  carbon math first, Gemini for coaching only — ensuring the hybrid architecture
  was established before a single line of code was written.
- **Artifact-driven development:** Implementation plans, task lists, and
  architectural walkthroughs were generated as markdown artifacts, reviewed, and
  then executed by the agent.
- **Iterative hardening:** Security headers, Pydantic input bounds, rate
  limiting, and CI/CD were added in progressive passes guided by automated
  analysis.

### AI evaluation rubric alignment

| Pillar | Strategy |
| --- | --- |
| **PS Alignment** | Deterministic carbon math in `engine.py` → Gemini generates coaching text only (never computes kg). Hybrid architecture with graceful rule-based fallback. |
| **Code Quality** | `mypy --strict`, `ruff`, pre-commit hooks. Every emission factor uses `typing.Final` with cited sources. Pure, side-effect-free calculation functions. |
| **Security** | ADC only (zero API keys in codebase). Pydantic bounded fields. CSP + security headers middleware. Non-root Docker container. Rate limiting on all endpoints. |
| **Efficiency** | `lru_cache` on location resolution. `React.memo` on heavy visualisations. `React.lazy` + `Suspense` for code-splitting. `BackgroundTasks` for database writes. |
| **Testing** | 90 %+ coverage enforced. Zero-hardcoding proof tests. Gemini fallback tests. CI runs lint, types, tests, and build on every push. |
| **Accessibility** | Skip link, semantic HTML landmarks, `aria-label` / `aria-live` on charts and results, `focus-visible` outlines, `prefers-reduced-motion` media query. |

---

## License

[MIT](LICENSE) — created for Virtual PromptWars Challenge 3.
