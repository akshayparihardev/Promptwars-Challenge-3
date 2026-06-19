import { CarbonInput, FootprintResult, InsightsResponse, Entry, WhatIfOverride, WhatIfResult, ChallengesResponse } from "./types";

const API_BASE = "/api";

export async function calculateFootprint(data: CarbonInput): Promise<FootprintResult> {
  const res = await fetch(`${API_BASE}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to calculate footprint: ${JSON.stringify(errData)}`);
  }
  return res.json();
}

export async function getInsights(
  input: CarbonInput,
  result: FootprintResult
): Promise<InsightsResponse> {
  const res = await fetch(`${API_BASE}/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, result }),
  });
  if (!res.ok) throw new Error("Failed to generate insights");
  return res.json();
}

export async function getGamification(
  input: CarbonInput,
  result: FootprintResult
): Promise<ChallengesResponse> {
  const res = await fetch(`${API_BASE}/gamification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, result }),
  });
  if (!res.ok) throw new Error("Failed to load challenges");
  return res.json();
}

export async function simulateWhatIf(
  base_input: CarbonInput,
  override: WhatIfOverride
): Promise<WhatIfResult> {
  const res = await fetch(`${API_BASE}/whatif`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_input, override }),
  });
  if (!res.ok) throw new Error("Failed to simulate what-if");
  return res.json();
}

export async function saveEntry(
  device_id: string,
  input: CarbonInput,
  result: FootprintResult
): Promise<Entry> {
  const res = await fetch(`${API_BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id, input, result }),
  });
  if (!res.ok) throw new Error("Failed to save entry");
  return res.json();
}

export async function getHistory(device_id: string): Promise<Entry[]> {
  const res = await fetch(`${API_BASE}/entries/${device_id}`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}
