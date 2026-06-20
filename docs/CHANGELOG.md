# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-20

### Added
- **Hybrid AI Architecture**: Direct Vertex AI REST integration for LLM-based insights, ensuring hallucination-free mathematical precision.
- **Graceful Degradation**: Fallback to deterministic rules engine when AI is unavailable or rate-limited.
- **Continuous Integration Quality Gates**: Added GitHub Actions pipeline with strict frontend component testing, `vitest`, `axe-core` accessibility checks, and backend 90%+ code coverage via `pytest`.

### Changed
- Replaced Google GenAI SDK with pure `httpx` implementation to circumvent dependency conflicts and maximize performance.
- Upgraded testing infrastructure to include ARIA accessibility assertions on all frontend components.

## [1.0.0] - 2026-06-18

### Added
- Initial release of the deterministic Carbon Footprint Awareness platform.
- React 18 SPA with Framer Motion animations.
- FastAPI backend with Firestore caching and Memory storage fallback.
- What-If simulator for real-time comparative analysis.
