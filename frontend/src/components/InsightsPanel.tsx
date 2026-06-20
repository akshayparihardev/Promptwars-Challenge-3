import React from "react";
import { InsightsResponse } from "../lib/types";
import { formatNumber } from "../lib/format";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingDown } from "lucide-react";

const DIFFICULTY_META = {
  easy:   { label: "Easy",   color: "#4ade80", bg: "rgba(34,197,94,0.08)" },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(245,158,11,0.08)" },
  hard:   { label: "Hard",   color: "#f87171", bg: "rgba(239,68,68,0.08)" },
};

function InsightsPanelInner({ insights }: { insights: InsightsResponse }) {
  return (
    <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-zinc-800 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-200">Personalized Insights</h3>
        </div>
        {insights.source === "gemini" && (
          <span className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            <Sparkles className="w-3 h-3" /> Gemini AI
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg p-3.5 border border-emerald-500/15 bg-emerald-500/5">
        <p className="text-sm text-zinc-300 leading-relaxed">{insights.summary}</p>
        {insights.comparison && (
          <p className="text-xs text-zinc-500 mt-2">{insights.comparison}</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Top Reduction Actions</h4>
        {insights.recommendations.map((rec, i) => {
          const diff = DIFFICULTY_META[rec.difficulty as keyof typeof DIFFICULTY_META] ?? DIFFICULTY_META.medium;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg p-3.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex gap-3"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ background: diff.bg }}>
                <TrendingDown className="w-3.5 h-3.5" style={{ color: diff.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rec.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: diff.color }}>{diff.label}</span>
                    <span className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">↓ {formatNumber(rec.estimated_annual_savings_kg)} kg/yr</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{rec.action}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export const InsightsPanel = React.memo(InsightsPanelInner);
