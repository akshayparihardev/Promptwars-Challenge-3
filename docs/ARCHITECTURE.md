# System Architecture

This document outlines the architectural decisions, system boundaries, and design principles of the Carbon Footprint Awareness Platform.

---

## 1. Core Architectural Principles

### 1.1 Domain-Driven Design (DDD)
The core logic of the platform (`app.carbon`) is strictly isolated from the HTTP delivery mechanism (`app.routes`) and the external persistence layers (`app.repository`).
- **Immutability:** Core mathematical operations in `engine.py` are pure functions. They take typed `Pydantic` inputs and return deterministic outputs.
- **Zero External Dependency in Core:** The engine does not know about FastAPI, HTTP requests, or the database.

### 1.2 Deterministic Math vs. Generative Presentation (Hybrid AI)
Large Language Models (LLMs) suffer from arithmetic hallucinations. To ensure absolute scientific integrity, we employ a strict boundary:
- **Math Layer:** All kg CO₂e calculations, localized grid factors, and equivalencies are processed deterministically using hardcoded, peer-reviewed constants (DEFRA, CEA) located in `factors.py`.
- **Presentation Layer:** Google Gemini 2.5 Flash is strictly used as a semantic presentation engine. It receives the *pre-calculated* deterministic results and generates localized, personalized advice. It is strictly forbidden from performing raw carbon calculations.

### 1.3 Graceful Degradation
The system is designed to be highly resilient:
- If the Gemini API is rate-limited, times out, or the `GEMINI_API_KEY` is missing, the application seamlessly falls back to a purely deterministic rule-based heuristic engine (`app.insights.rules`). The user experiences zero downtime.
- If Firestore is inaccessible, the system can operate entirely in-memory or gracefully reject history persistence while keeping the core calculator functional.

---

## 2. Component Diagram & Data Flow

```text
[ React SPA Frontend ]
       │
       │ (JSON via REST)
       ▼
[ FastAPI Routing Layer (app.routes) ] ───► [ Security & Validation (Pydantic / SlowAPI) ]
       │
       ├─► /api/calculate ────────────────► [ Core Carbon Engine (app.carbon.engine) ]
       │                                            │
       │                                            └──► [ Constants (app.carbon.factors) ]
       │
       ├─► /api/insights ─────────────────► [ Insight Orchestrator (app.insights) ]
       │                                            │
       │                                            ├─► [ Gemini Client (gemini.py) ]
       │                                            └─► [ Rules Fallback (rules.py) ]
       │
       └─► /api/entries ──────────────────► [ Repository Interface (app.repository.base) ]
                                                    │
                                                    ├─► [ Firestore Implementation ]
                                                    └─► [ In-Memory Implementation ]
```

---

## 3. Architectural Decision Records (ADRs)

### ADR 001: Unified Container Deployment
**Context:** Standard architectures separate frontend and backend into two distinct containers, requiring CORS configuration, separate CI pipelines, and dual hosting costs.
**Decision:** We compile the Vite React SPA into static files and mount them within the FastAPI application using `StaticFiles`. 
**Consequence:** A single, atomic Docker container. Zero CORS issues. Significantly reduced cloud resource overhead (optimal for Render/Cloud Run deployment).

### ADR 002: Dynamic Geographic Context Resolution
**Context:** A global average grid factor (e.g., 0.45 kg/kWh) wildly misrepresents local realities (e.g., India's coal-heavy grid vs. France's nuclear grid).
**Decision:** We implemented a `resolve_location_context` layer that maps the user's input locale to hyper-local emission factors.
**Consequence:** Calculations are hyper-accurate, but it requires maintaining a localized matrix in `factors.py`.

### ADR 003: Abstracted Repository Pattern
**Context:** We need to persist historical footprints, but deploying to GCP Firestore might be overkill for local development or testing.
**Decision:** We implemented an `EntryRepository` base class with two concrete implementations: `FirestoreEntryRepository` and `MemoryEntryRepository`.
**Consequence:** Local development requires zero infrastructure setup. Tests run instantaneously in memory. Dependency injection (`app.deps`) handles the interface binding.
