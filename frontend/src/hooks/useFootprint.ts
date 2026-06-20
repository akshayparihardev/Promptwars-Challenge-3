import { useState } from "react";
import { CarbonInput, FootprintResult, InsightsResponse, ChallengesResponse } from "../lib/types";
import { calculateFootprint, getInsights, getGamification, saveEntry } from "../lib/api";
import { getDeviceId } from "../lib/deviceId";

export function useFootprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [gamification, setGamification] = useState<ChallengesResponse | null>(null);

  const calculate = async (input: CarbonInput) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Calculate the core footprint
      const res = await calculateFootprint(input);
      setResult(res);

      // 2. Fetch insights and gamification
      try {
        const [insResult, gamResult] = await Promise.allSettled([
          getInsights(input, res),
          getGamification(input, res)
        ]);

        if (insResult.status === "fulfilled") {
          setInsights(insResult.value);
        } else {
          console.error("Insights failed", insResult.reason);
        }

        if (gamResult.status === "fulfilled") {
          setGamification(gamResult.value);
        } else {
          console.error("Gamification failed", gamResult.reason);
        }
      } catch (e) {
        console.error("Secondary data fetch failed", e);
      }

      // 3. Save to history asynchronously
      try {
        saveEntry(getDeviceId(), input, res).catch((err) =>
          console.error("Failed to save history", err)
        );
      } catch {
        // Ignore history save errors
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { calculate, loading, error, result, insights, gamification };
}
