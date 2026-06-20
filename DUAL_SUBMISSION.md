# Dual Submission: Building a "Rank 1" Carbon Footprint Awareness Platform

**Format**: LinkedIn Post / Technical Blog Post for the "Build-in-Public" Journey.

---

Hey network! 👋 I'm excited to share the culmination of my journey building the **Carbon Footprint Awareness Platform** for Google's PromptWars Challenge 3. 

When I set out to build this, my goal wasn't just to throw an LLM at a problem. The core objective of this challenge demanded logical decision-making based on user context, bulletproof carbon tracking, and "Green Software Engineering" principles. 

Here’s a deep dive into how I architected this application to aim for the absolute top rank:

### 🧠 1. The Hybrid AI Architecture (Zero Hardcoding & Zero Hallucinations)
The most critical design decision I made was splitting the application logic. LLMs are incredible at coaching, but they are notoriously bad at strict deterministic math. 

Instead of asking Gemini to compute carbon savings (which introduces hallucination risks), I built a **pure, side-effect-free deterministic engine** (`engine.py`) using cited emission factors from DEFRA 2023, CEA 2023, and the EPA. The engine precisely calculates `delta_kg` down to the decimal. 

Once the exact numbers are locked in, they are passed as strict context to **Gemini 2.5 Flash on Vertex AI**. Gemini's *only* job is to consume those pre-computed integers and generate highly personalized, motivational coaching text. This completely eliminates mathematical hallucinations.

### 📍 2. Hyper-Local Context Resolution
Carbon footprints are inherently geographic. A kWh of electricity in India (0.820 kg/kWh) has a vastly different impact than one in the UK (0.233 kg/kWh). 
I implemented a `resolve_location_context` caching layer that dynamically adjusts the underlying emission factors, grid benchmarks, and even local transport tips (e.g., suggesting *Indian Railways* vs *Public Transit*) based purely on the user's string location. 

### 🔐 3. Enterprise-Grade Security
Security isn't an afterthought. I deployed this app using **Application Default Credentials (ADC)**. If you audit the entire repository, you will find exactly **zero** API keys or secrets exposed. The frontend and backend are served securely via a single multi-stage, non-root Docker container on **Google Cloud Run**, protected by strict `slowapi` rate-limiting and robust Pydantic v2 bounding.

### ⚡ 4. Green Software Engineering & Accessibility
Every component matters. From a 300ms debounce on the What-If Simulator to `React.memo` for preventing unnecessary re-renders, the app is highly optimized. More importantly, it meets **WCAG 2.1 AA** accessibility standards, featuring a dedicated `.skip-link`, `aria-labels` on all interactive charts (powered by Recharts), and a `prefers-reduced-motion` media query to respect user preferences.

It was an incredible experience stitching together FastAPI, React 18, Firestore, and Vertex AI. Check out the open-source repository below and try out the live deployment on Cloud Run! 🌍💚

#GoogleCloud #PromptWars #Gemini #VertexAI #FastAPI #React #GreenTech #BuildInPublic #SoftwareEngineering
