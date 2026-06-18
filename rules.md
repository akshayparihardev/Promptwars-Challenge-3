# Antigravity Global Governance Rules

## Tone
Technical, concise, and objective.

## Efficiency
Skip apologies, greetings, and meta-commentary. Focus entirely on code and execution logs.

## Documentation (CRITICAL)
Every exported function, class, and critical variable must include comprehensive JSDoc/TSDoc annotations. Comments must explain the **"Why"** behind the architectural decision, not just the "What".

## Constraints
- No hardcoded mock data. All data must be fetched dynamically from external APIs.
- Repository size must remain strictly under 10 MB.
- Single `main` branch only.

## Security
- No API keys in the frontend client bundle.
- All third-party API calls must be proxied through the FastAPI backend.
- Secrets managed exclusively via `.env` (git-ignored).

## Architecture
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **Backend**: Python FastAPI with Pydantic validation
- **Deployment**: Multi-stage Docker (node:22-slim build → nginx:stable-alpine serve on :8080)
