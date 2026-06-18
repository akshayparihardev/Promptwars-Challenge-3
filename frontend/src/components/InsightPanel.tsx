/**
 * AI Insight Panel — Gemini 2.5 Flash integration.
 *
 * Why a dedicated insights tab: the cognitive engine synthesizes data
 * from all three API controllers. Having it as a separate view lets
 * users first gather data across tabs, then request holistic analysis.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateInsight } from "@/lib/api";
import type { InsightResponse } from "@/lib/schemas";

export default function InsightPanel() {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<InsightResponse | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await generateInsight(null, null, null, context || "Compare driving vs metro for a 15km daily commute in Delhi, India. I drive a gasoline car.");
      setInsight(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Insight generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>🧠 AI Environmental Consultant</h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Powered by Gemini 2.5 Flash — get personalized carbon reduction insights</p>

        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Describe your commute or travel scenario</label>
          <textarea
            id="insight-context"
            className="eco-input"
            rows={4}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., I drive a gasoline car 25km daily from Gurgaon to Delhi. What's the carbon impact compared to taking the Metro?"
            style={{ resize: "vertical" }}
          />
        </div>

        <button id="generate-insight-btn" className="eco-btn eco-btn-primary w-full" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <span className="eco-pulse">🧠 Analyzing with Gemini...</span>
          ) : (
            "Generate AI Insight"
          )}
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
        {insight && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Summary */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📊</span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--eco-emerald)" }}>Executive Summary</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{insight.summary}</p>
            </div>

            {/* Comparison */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚖️</span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--eco-teal)" }}>Multimodal Comparison</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{insight.comparison}</p>
            </div>

            {/* Annual Savings */}
            {insight.estimated_annual_savings_kg_co2 && (
              <div className="glass-card p-6 eco-glow">
                <div className="stat-card">
                  <div className="stat-value">{insight.estimated_annual_savings_kg_co2.toFixed(0)}</div>
                  <div className="stat-label">kg CO₂e potential annual savings</div>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  🌳 Equivalent to {(insight.estimated_annual_savings_kg_co2 / 21).toFixed(0)} trees absorbing CO₂ for one year
                </p>
              </div>
            )}

            {/* Recommendations */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--eco-amber)" }}>Actionable Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {insight.recommendations.map((rec, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="mt-0.5 shrink-0" style={{ color: "var(--eco-emerald)" }}>✓</span>
                    {rec}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
