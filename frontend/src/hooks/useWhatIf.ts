import { useState } from "react";
import { CarbonInput, WhatIfOverride, WhatIfResult } from "../lib/types";
import { simulateWhatIf } from "../lib/api";

export function useWhatIf() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhatIfResult | null>(null);

  const simulate = async (baseInput: CarbonInput, override: WhatIfOverride) => {
    setLoading(true);
    setError(null);
    try {
      const res = await simulateWhatIf(baseInput, override);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "An error occurred during simulation");
    } finally {
      setLoading(false);
    }
  };

  return { simulate, loading, error, result };
}
