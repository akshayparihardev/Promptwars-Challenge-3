# Architecture

## Core Principles
1. **Domain-Driven Design:** The core footprint calculation logic (`carbon/engine.py`) is entirely pure, side-effect free, and unaware of the web framework.
2. **Deterministic Fallbacks:** AI (Gemini) is an enhancement, not a dependency. If Gemini fails or is disabled, the app seamlessly falls back to a deterministic rules engine.
3. **Zero Hardcoding:** All insights and recommendations derive mathematically from user input.
4. **Single Container Deployment:** The React SPA is built and served as static files by the FastAPI application.

## Key Layers
- **API (`app.routes`):** FastAPI endpoints defining the HTTP interface.
- **Engine (`app.carbon`):** Pure Python math calculating the footprint from location and inputs.
- **Insights (`app.insights`):** Generates personalized recommendations using either Gemini or pure rules.
- **Persistence (`app.repository`):** Abstract interface (`base.py`) with multiple implementations (Firestore, Memory) for flexible deployment.
