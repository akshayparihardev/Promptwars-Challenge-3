/**
 * Flight Emissions Calculator — Google TIM API integration.
 *
 * Why TIM over manual calculation: Google's Travel Impact Model uses
 * proprietary fleet-level data that's more accurate than generic
 * per-km emission factors for aviation.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeFlightEmissions } from "@/lib/api";
import type { FlightEmissionsResponse } from "@/lib/schemas";

export default function FlightCalculator() {
  const [origin, setOrigin] = useState("DEL");
  const [destination, setDestination] = useState("BOM");
  const [cabin, setCabin] = useState("ECONOMY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlightEmissionsResponse | null>(null);

  async function handleCompute() {
    setLoading(true);
    setError(null);
    try {
      const data = await computeFlightEmissions([
        { origin_airport: origin, destination_airport: destination, cabin_class: cabin },
      ]);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Flight computation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>✈️ Aviation Impact</h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Calculate flight emissions using Google Travel Impact Model (TIM)</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Origin (IATA)</label>
            <input id="flight-origin" className="eco-input" type="text" maxLength={4} value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} placeholder="DEL" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Destination (IATA)</label>
            <input id="flight-dest" className="eco-input" type="text" maxLength={4} value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} placeholder="BOM" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Cabin Class</label>
            <select id="flight-cabin" className="eco-select" value={cabin} onChange={(e) => setCabin(e.target.value)}>
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
          </div>
        </div>

        <button id="compute-flight-btn" className="eco-btn eco-btn-primary w-full" onClick={handleCompute} disabled={loading}>
          {loading ? <span className="eco-pulse">Computing...</span> : "Compute Flight Emissions"}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl p-4 text-sm" style={{ background: "rgba(255, 110, 64, 0.1)", border: "1px solid rgba(255, 110, 64, 0.3)", color: "var(--eco-coral)" }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && result.flight_emissions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {result.flight_emissions.map((flight, i) => (
              <motion.div key={i} className="glass-card p-6 eco-glow" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">✈️</span>
                  <div>
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{flight.origin} → {flight.destination}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{flight.cabin_class}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{flight.emissions_kg_co2e}</div>
                  <div className="stat-label">kg CO₂e per passenger</div>
                </div>
                <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                  Equivalent to {(flight.emissions_kg_co2e / 0.021).toFixed(0)} km of driving
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
