# Dual Submission: LinkedIn Build-in-Public Post

*Copy and paste this directly to LinkedIn. It's written to sound authentic, technical, and engaging for other engineers, avoiding typical "AI buzzwords."*

---

Just wrapped up my submission for Google's PromptWars Challenge 3: a hyper-local Carbon Footprint platform 🌍💻

When building this, I noticed a trap a lot of AI apps fall into: trusting the LLM to do math. Instead of asking Gemini to compute carbon footprints (which almost guarantees hallucinations), I took a different approach 💡

Here’s the architecture I used to aim for Rank 1:

1️⃣ **Pure Math Engine**: I built a strictly deterministic Python backend (`engine.py`) using Pydantic validation. The math runs exactly the same every time based on DEFRA and CEA emission factors. No hallucinations, period.

2️⃣ **Contextual AI via Graceful Degradation**: Once the engine locks in the exact numbers, they are passed as strict context to Gemini 1.5 Flash on Vertex AI. Gemini’s *only* job is to consume those integers and generate personalized, coaching advice. If the Google Cloud API times out? The app silently falls back to a deterministic rules engine. 🛡️

3️⃣ **Hyper-Local Grids**: A kWh of electricity in Mumbai has a vastly different carbon impact than one in London. I implemented a caching layer that dynamically adjusts the underlying emission factors and regional benchmarks based purely on the user's location string.

4️⃣ **Premium Restraint UI**: Stripped out the glowing "AI" UI elements in favor of a minimalist, accessible `zinc` color palette with the Geist font. It feels like a premium SaaS tool, not a hackathon demo. 

Really proud of how this turned out. You can check out the live deployment on Render, and I've open-sourced the entire repository (FastAPI + React 18) below 👇

🔗 Live App: https://carbon-platform-bddp.onrender.com
💻 GitHub Repo: https://github.com/akshayparihardev/Promptwars-Challenge-3

#GoogleCloud #PromptWars #SoftwareEngineering #FastAPI #React #BuildInPublic #VertexAI
