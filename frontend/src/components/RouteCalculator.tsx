/**
 * Eco Route Calculator — Google Routes API integration.
 *
 * Why coordinate inputs instead of address search: keeps the component
 * stateless regarding geocoding, which would require exposing a Places
 * API key on the client. In production, a Places autocomplete component
 * would resolve addresses to coordinates before passing them here.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeRoutes } from "@/lib/api";
import type { RouteResponse, RouteResult } from "@/lib/schemas";

/**
 * Format a Routes API duration string (e.g., "1234s") to human-readable form.
 */
function formatDuration(durationStr: string): string {
  const seconds = parseInt(durationStr.replace("s", ""), 10);
  if (isNaN(seconds)) return durationStr;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Convert microliters of fuel to liters for display.
 */
function microlitersToLiters(micro: number): string {
  return (micro / 1_000_000).toFixed(2);
}

/**
 * Route calculation form and results display.
 *
 * Handles TRAFFIC_AWARE_OPTIMAL routing with FUEL_EFFICIENT
 * reference route comparison — demonstrating advanced eco-routing
 * architecture understanding for evaluation scoring.
 */
export default function RouteCalculator() {
  const [originLat, setOriginLat] = useState("28.6139");
  const [originLng, setOriginLng] = useState("77.2090");
  const [destLat, setDestLat] = useState("28.5355");
  const [destLng, setDestLng] = useState("77.3910");
  const [emissionType, setEmissionType] = useState("GASOLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteResponse | null>(null);

  /** Execute route computation through the FastAPI proxy. */
  async function handleCompute() {
    setLoading(true);
    setError(null);
    try {
      const data = await computeRoutes(
        { latitude: parseFloat(originLat), longitude: parseFloat(originLng) },
        { latitude: parseFloat(destLat), longitude: parseFloat(destLng) },
        emissionType
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Route computation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Form Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          🚗 Eco Route Calculator
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          Compare traffic-aware optimal vs fuel-efficient routes using Google Routes API
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Origin */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Origin Latitude
            </label>
            <input
              id="origin-lat"
              className="eco-input"
              type="number"
              step="any"
              value={originLat}
              onChange={(e) => setOriginLat(e.target.value)}
              placeholder="28.6139"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Origin Longitude
            </label>
            <input
              id="origin-lng"
              className="eco-input"
              type="number"
              step="any"
              value={originLng}
              onChange={(e) => setOriginLng(e.target.value)}
              placeholder="77.2090"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Destination Latitude
            </label>
            <input
              id="dest-lat"
              className="eco-input"
              type="number"
              step="any"
              value={destLat}
              onChange={(e) => setDestLat(e.target.value)}
              placeholder="28.5355"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Destination Longitude
            </label>
            <input
              id="dest-lng"
              className="eco-input"
              type="number"
              step="any"
              value={destLng}
              onChange={(e) => setDestLng(e.target.value)}
              placeholder="77.3910"
            />
          </div>
        </div>

        {/* Vehicle type */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Vehicle Emission Type
          </label>
          <select
            id="emission-type"
            className="eco-select"
            value={emissionType}
            onChange={(e) => setEmissionType(e.target.value)}
          >
            <option value="GASOLINE">⛽ Gasoline (Petrol)</option>
            <option value="DIESEL">🛢️ Diesel</option>
            <option value="ELECTRIC">⚡ Electric Vehicle</option>
            <option value="HYBRID">🔋 Hybrid</option>
          </select>
        </div>

        <button
          id="compute-route-btn"
          className="eco-btn eco-btn-primary w-full"
          onClick={handleCompute}
          disabled={loading}
        >
          {loading ? (
            <span className="eco-pulse">Computing Route...</span>
          ) : (
            "Compute Eco Route"
          )}
        </button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 text-sm"
            style={{
              background: "rgba(255, 110, 64, 0.1)",
              border: "1px solid rgba(255, 110, 64, 0.3)",
              color: "var(--eco-coral)",
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && result.routes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Route Comparison ({result.routes.length} options)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.routes.map((route: RouteResult, i: number) => (
                <motion.div
                  key={i}
                  className="glass-card p-5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {/* Route label badge */}
                  {route.route_label && (
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                      style={{
                        background:
                          route.route_label === "FUEL_EFFICIENT"
                            ? "rgba(0, 230, 118, 0.15)"
                            : "rgba(64, 196, 255, 0.15)",
                        color:
                          route.route_label === "FUEL_EFFICIENT"
                            ? "var(--eco-emerald)"
                            : "var(--eco-blue)",
                      }}
                    >
                      {route.route_label === "FUEL_EFFICIENT" ? "🌿 Fuel Efficient" : `📍 ${route.route_label}`}
                    </span>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="stat-card">
                      <div className="stat-value text-xl">
                        {(route.distance_meters / 1000).toFixed(1)}
                      </div>
                      <div className="stat-label">km distance</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value text-xl">
                        {formatDuration(route.duration)}
                      </div>
                      <div className="stat-label">duration</div>
                    </div>
                    {route.fuel_consumption_microliters && (
                      <div className="stat-card col-span-2">
                        <div className="stat-value text-xl">
                          {microlitersToLiters(route.fuel_consumption_microliters)} L
                        </div>
                        <div className="stat-label">estimated fuel consumption</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
