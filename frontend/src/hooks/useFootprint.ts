import { useState } from "react";
import { CarbonInput, FootprintResult, InsightsResponse } from "../lib/types";
import { calculateFootprint, getInsights, saveEntry } from "../lib/api";
import { getDeviceId } from "../lib/deviceId";

export function useFootprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);

  const calculate = async (input: CarbonInput) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Calculate the core footprint
      const res = await calculateFootprint(input);
      setResult(res);

      // 2. Fetch insights using the result
      try {
        const ins = await getInsights(input, res);
        setInsights(ins);
      } catch (e) {
        console.error("Insights failed, but footprint succeeded", e);
        // We still have the result, so don't completely fail
      }

      // 3. Save to history asynchronously
      try {
        saveEntry(getDeviceId(), input, res).catch((err) =>
          console.error("Failed to save history", err)
        );
      } catch (e) {
        // Ignore history save errors
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { calculate, loading, error, result, insights };
}
