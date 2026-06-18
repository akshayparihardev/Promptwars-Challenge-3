"""
Gemini-powered global footprint calculator.
"""

from __future__ import annotations

import json
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types

from app.config import settings
from app.schemas import OnboardingRequest, CarbonDataResult

router = APIRouter(prefix="/api/footprint", tags=["Footprint Engine"])

_client = genai.Client(api_key=settings.google_genai_api_key)

_SYSTEM_PROMPT = """You are an objective environmental scientist and carbon footprint analyst.
Your role:
Given a user's location, primary modes of transport, diet, and home energy source, estimate their annual carbon footprint in Tonnes of CO2e.
Provide hyper-local precision based on typical average consumption and emission factors of their specified location.
Output a strict JSON with exact keys:
{
  "transport": <float in Tonnes CO2e/year>,
  "food": <float in Tonnes CO2e/year>,
  "housing": <float in Tonnes CO2e/year>,
  "total": <float sum of the above>
}
Use realistic annual averages for the specified location (e.g., commute distances, grid emission factors, meat-heavy vs flexitarian diets). 
Do NOT wrap the JSON in markdown blocks. Return ONLY raw JSON.
"""

@router.post("/calculate", response_model=CarbonDataResult)
async def calculate_footprint(payload: OnboardingRequest) -> CarbonDataResult:
    user_message = f"Location: {payload.location}\nTransport: {', '.join(payload.transport)}\nDiet: {payload.diet}\nEnergy Source: {payload.energy}"
    
    try:
        response = _client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.2,
                max_output_tokens=500,
            ),
        )

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            lines = raw_text.split("\n")
            raw_text = "\n".join(lines[1:-1])

        parsed = json.loads(raw_text)

        return CarbonDataResult(
            transport=parsed.get("transport", 0.0),
            food=parsed.get("food", 0.0),
            housing=parsed.get("housing", 0.0),
            total=parsed.get("total", 0.0),
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")
