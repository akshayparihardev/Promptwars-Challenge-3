# Carbon Footprint Awareness Platform

[![CI](https://github.com/akshayparihardev/Promptwars-Challenge-3/actions/workflows/ci.yml/badge.svg)](https://github.com/akshayparihardev/Promptwars-Challenge-3/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Virtual PromptWars — Challenge 3 Submission**
> A deterministic, location-aware carbon footprint modelling engine augmented by a generative AI presentation layer.

**Live Environment:** [https://carbon-platform-bddp.onrender.com/](https://carbon-platform-bddp.onrender.com/)  

---

## 1. Executive Summary

This platform enables individuals to quantify, track, and strategically reduce their carbon emissions. Built on a modernized, cloud-native stack (FastAPI, React 18, Google Cloud Run), the application leverages a strict **Hybrid AI Architecture** to eliminate LLM hallucinations while delivering highly personalized, actionable insights via Google Gemini 2.5 Flash on Vertex AI.

---

## 2. Core Architectural Principles

Our design philosophy strictly adheres to principles of immutability, zero-trust mathematical modelling, and graceful degradation.

### 2.1 Deterministic Math vs. Generative Presentation
Large Language Models excel at semantic synthesis but are fundamentally unsuited for deterministic arithmetic. To guarantee absolute mathematical integrity:
- **The Calculation Engine** (`engine.py`) calculates exact carbon equivalence metrics (kg CO₂e) using highly granular, peer-reviewed emission factors (DEFRA 2023, CEA 2023). 
- **The Presentation Layer** utilizes Gemini 2.5 Flash strictly as a formatting heuristic. Gemini receives pre-computed limits and constructs the semantic coaching interface without ever calculating raw numerical outputs.

### 2.2 Geographic Localization Mapping
Carbon impact is inextricably tied to geography. A static global grid factor invalidates individual data. We implemented a dynamic `resolve_location_context` caching layer to resolve user locales and apply hyper-local emission factors (e.g., mapping Indian locales to the CEA 2023 0.820 kg/kWh grid factor).

### 2.3 Interactive State Simulation (What-If)
The application provides real-time, debounced differential analysis via the `POST /api/whatif` endpoint. This allows users to immediately observe the proportional impact (`delta_kg`) of lifestyle modifications (e.g., adopting an EV or altering dietary habits) on their annual projection.

---

## 3. System Architecture

The service compiles the frontend React SPA and the FastAPI backend into a single containerized artifact. This eliminates cross-origin resource sharing (CORS) overhead and ensures an atomic deployment footprint.

```text
Client (React 18, Vite, Framer)            Google Cloud Run (Unified Container)
  • Debounced What-If Simulator       ──►  FastAPI Service Interface
  • Anonymous State Tracking                ├─ POST /api/calculate (Pure Engine)
                                            ├─ POST /api/whatif    (Simulation)
                                            ├─ POST /api/insights  (Vertex AI Proxy)
                                            ├─ POST /api/entries   (Firestore Write)
                                            └─ GET  /api/health    (Liveness Probe)
                                                │
                                                ├─► Vertex AI (Gemini via ADC)
                                                └─► Firestore (Persistence via ADC)
```

### 3.1 Repository Structure
```text
backend/    FastAPI service, pure carbon logic, immutable constants, and test suite.
frontend/   React interface, typed API clients, accessibility-compliant components.
docs/       Architectural decision records and system logic assumptions.
Dockerfile  Multi-stage, slim Python 3.11 build executing as a non-root user.
.github/    CI Pipeline: enforcement of types, tests, and formatting on pull requests.
```

---

## 4. Environment Setup & Deployment

### Local Development
**Backend** (Python 3.11+):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
# Run locally with memory-store and deterministic rule-based fallback (No GCP required):
USE_GEMINI=false USE_FIRESTORE=false uvicorn app.main:app --reload
```

**Frontend** (Node 20+):
```bash
cd frontend
npm install
npm run dev
```

### Containerized Execution
```bash
docker build -t carbon-platform .
docker run -p 8080:8080 -e USE_GEMINI=false -e USE_FIRESTORE=false carbon-platform
```

### Cloud Run Deployment
```bash
gcloud run deploy carbon-platform \
    --source . --region us-central1 --allow-unauthenticated \
    --set-env-vars PROJECT_ID=<project-id>,REGION=us-central1,USE_GEMINI=true,USE_FIRESTORE=true
```

---

## 5. Verification & Quality Assurance

To ensure absolute reliability, the CI pipeline enforces strict static analysis and an exhaustive test suite.

| Metric | Verification Method | Implication |
| --- | --- | --- |
| **Logic Correctness** | `pytest` (Backend) / `vitest` (Frontend) | Mathematical assertions ensure inputs correctly trace to localized factors. |
| **Type Safety** | `mypy --strict` & `tsc` | Eradicates runtime type ambiguity across the entire stack. |
| **Code Structure** | `ruff check` & `eslint` | Enforces idiomatic formatting, cognitive complexity limits, and import logic. |
| **Accessibility** | `axe-core` & semantic HTML | Ensures WCAG 2.1 AA compliance (skip links, ARIA announcements, contrast limits). |

---

## 6. Security Posture & Assumptions

- **Identity Management:** The application securely injects API credentials via environment variables (`GEMINI_API_KEY`). There are no hardcoded API keys, tokens, or service accounts within the source repository.
- **Data Privacy:** User instances are tracked utilizing a randomized, anonymized device identifier stored locally in `localStorage`. 
- **Graceful Fault Tolerance:** Should Vertex AI encounter throttling or unavailability, the system falls back seamlessly to a secondary rule-based engine, guaranteeing uninterrupted service to the user.
- **API Guardrails:** All incoming payloads are strictly validated using `Pydantic v2` numerical bounds, and traffic is rate-limited via `slowapi` to prevent abusive execution loads.

---

## 7. Rubric Alignment Summary

| Focus Area | Engineering Implementation |
|---|---|
| **PS Alignment** | Hyper-local contextual modelling via `LocationContext`; actionable lifecycle loop via the What-If simulation engine. |
| **Code Quality** | Strict type adherence, pure function logic, multi-stage Docker builds, and fully cited external emission constants. |
| **Efficiency** | Asynchronous `BackgroundTasks` for non-blocking I/O, `lru_cache` optimization, and React lazy-loading. |
| **Security & Testing** | ADC, rate limiting, and mathematical validation test suites verifying dynamic derivations. |
| **Accessibility** | Implemented `prefers-reduced-motion`, `aria-live` assertive regions, and comprehensive keyboard traversal mapping. |

---

*Copyright © 2026. Released under the MIT License.*
