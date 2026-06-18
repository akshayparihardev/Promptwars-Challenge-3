/**
 * Transit Emissions Calculator — Climatiq API integration.
 *
 * Why a separate component from RouteCalculator: transit and driving
 * are fundamentally different emission models (Scope 3 per-passenger-km
 * vs direct fuel consumption).
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { estimateTransitEmissions } from "@/lib/api";
import type { ClimatiqResult } from "@/lib/schemas";

export default function TransitCalculator() {
  const [mode, setMode] = useState("metro");
  const [distance, setDistance] = useState("15");
  const [region, setRegion] = useState("IN");
  const [passengers, setPassengers] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClimatiqResult | null>(null);

  async function handleEstimate() {
    setLoading(true);
    setError(null);
    try {
      const data = await estimateTransitEmissions(mode, parseFloat(distance), region, parseInt(passengers, 10));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Estimation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>🚇 Public Transit Emissions</h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Calculate Scope 3 transit emissions using dynamic Climatiq emission factors</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Transit Mode</label>
            <select id="transit-mode" className="eco-select" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="metro">🚇 Metro / Subway</option>
              <option value="bus">🚌 Bus</option>
              <option value="rail">🚆 National Rail</option>
              <option value="ferry">⛴️ Ferry</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Distance (km)</label>
            <input id="transit-distance" className="eco-input" type="number" step="0.1" min="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Region</label>
            <select id="transit-region" className="eco-select" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="IN">🇮🇳 India</option>
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="DE">🇩🇪 Germany</option>
              <option value="JP">🇯🇵 Japan</option>
              <option value="FR">🇫🇷 France</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Passengers</label>
            <input id="transit-passengers" className="eco-input" type="number" min="1" max="500" value={passengers} onChange={(e) => setPassengers(e.target.value)} />
          </div>
        </div>

        <button id="estimate-transit-btn" className="eco-btn eco-btn-primary w-full" onClick={handleEstimate} disabled={loading}>
          {loading ? <span className="eco-pulse">Calculating...</span> : "Estimate Transit Emissions"}
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
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 eco-glow">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>Emission Estimate Result</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="stat-card">
                <div className="stat-value">{result.co2e_kg.toFixed(3)}</div>
                <div className="stat-label">kg CO₂e</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-lg" style={{ background: "var(--gradient-warm)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {(result.co2e_kg * 240).toFixed(1)}
                </div>
                <div className="stat-label">kg CO₂e / year (est.)</div>
              </div>
            </div>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Factor</span><span>{result.emission_factor_name}</span></div>
              <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Activity ID</span><span className="font-mono text-xs">{result.activity_id}</span></div>
              <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Region</span><span>{result.region}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
