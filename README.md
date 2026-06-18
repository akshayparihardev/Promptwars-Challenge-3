# 🌍 EcoAgent — Carbon Footprint Intelligence Platform

An enterprise-grade, AI-powered carbon footprint tracking assistant built for the **PromptWars Challenge 3**.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    nginx:stable-alpine (:8080)           │
│  ┌───────────────────┐    ┌──────────────────────────┐  │
│  │  Next.js 14 (SSG) │    │   FastAPI Backend Proxy   │  │
│  │  Static HTML/CSS/JS│───▶│                          │  │
│  │  Tailwind + Framer │    │  ┌────────────────────┐  │  │
│  └───────────────────┘    │  │  Routes Controller  │  │  │
│                           │  │  Climatiq Controller │  │  │
│                           │  │  Flights Controller  │  │  │
│                           │  │  Insight Engine      │  │  │
│                           │  └────────────────────┘  │  │
│                           └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
  Browser (No API Keys)    External APIs (Server-Side)
                           ├── Google Routes API
                           ├── Climatiq API
                           ├── Google TIM API
                           └── Gemini 2.5 Flash
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, Tailwind CSS v4, Framer Motion | SSG dashboard with fluid animations |
| Backend | Python FastAPI, Pydantic v2 | Secure API proxy with strict validation |
| AI Engine | Google GenAI SDK (Gemini 2.5 Flash) | Environmental insight generation |
| Deployment | Multi-stage Docker (nginx:stable-alpine) | Production image < 10MB |

## API Integrations

### Google Maps Routes API
- **Traffic-aware optimal routing** with `TRAFFIC_AWARE_OPTIMAL`
- **Fuel-efficient reference routes** via `requestedReferenceRoutes: ["FUEL_EFFICIENT"]`
- **Field masking** (`X-Goog-FieldMask`) for minimal payload bandwidth
- **Dynamic emission types**: GASOLINE, DIESEL, ELECTRIC, HYBRID

### Climatiq API
- **Scope 3 transit emissions** (bus, metro, rail, ferry)
- **Dynamic factor search** with `/search` endpoint
- **In-memory LRU cache** (TTL-based) to preserve API rate limits
- **Regional grid factors** (IN, US, GB, DE, JP, FR)

### Google Travel Impact Model (TIM)
- **Aviation emissions** via `computeFlightEmissions`
- **Cabin class-aware** calculations (Economy → First)
- **Per-passenger kgCO₂e** with driving equivalence

### Gemini 2.5 Flash
- **Environmental consultant** system prompt
- **Structured JSON output** with comparative analysis
- **Annual CO₂ savings** projections and actionable recommendations

## Quick Start

### Prerequisites
- Node.js 22+
- Python 3.12+
- Docker (for production)

### Development

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your API keys

# 2. Start backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Production (Docker)

```bash
docker compose --profile prod up --build
# App available at http://localhost:8080
```

## Project Structure

```
PromptWars/
├── rules.md                    # Governance rules
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # Dev + prod profiles
├── nginx.conf                  # Reverse proxy config
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── config.py           # Pydantic Settings
│       ├── schemas.py          # Request/response models
│       ├── main.py             # FastAPI entrypoint
│       └── controllers/
│           ├── routes_controller.py     # Google Routes API
│           ├── climatiq_controller.py   # Climatiq API
│           ├── flights_controller.py    # Google TIM API
│           └── insight_controller.py    # Gemini 2.5 Flash
└── frontend/
    ├── next.config.ts          # Static export config
    └── src/
        ├── lib/
        │   ├── schemas.ts      # Zod validation (mirrors Pydantic)
        │   └── api.ts          # Centralized fetch client
        ├── components/
        │   ├── Header.tsx
        │   ├── RouteCalculator.tsx
        │   ├── TransitCalculator.tsx
        │   ├── FlightCalculator.tsx
        │   └── InsightPanel.tsx
        └── app/
            ├── globals.css     # Design system tokens
            ├── layout.tsx      # Root layout + SEO
            └── page.tsx        # Dashboard orchestrator
```

## Security

- ✅ All API keys stored in `.env` (git-ignored)
- ✅ No secrets in frontend bundle — all external calls proxied through FastAPI
- ✅ Pydantic + Zod input validation at every boundary
- ✅ Security headers via nginx (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)

## License

MIT
