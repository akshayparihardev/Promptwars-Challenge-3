import { InsightsResponse } from "../lib/types";
import { formatNumber } from "../lib/format";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingDown } from "lucide-react";

const DIFFICULTY_META = {
  easy:   { label: "Easy",   color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  hard:   { label: "Hard",   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export function InsightsPanel({ insights }: { insights: InsightsResponse }) {
  return (
    <div className="flex flex-col gap-5 mt-6 pt-6 border-t border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {insights.source === "gemini"
            ? <Sparkles className="w-5 h-5 text-yellow-400" />
            : <Brain className="w-5 h-5 text-purple-400" />
          }
          <h3 className="font-bold text-white">Personalized Insights</h3>
        </div>
        <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-full">
          via {insights.source === "gemini" ? "Gemini AI ✨" : "Rules Engine"}
        </span>
      </div>

      {/* Summary */}
      <div className="rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
        <p className="text-sm text-gray-300 leading-relaxed">{insights.summary}</p>
        {insights.comparison && (
          <p className="text-xs text-gray-500 mt-2">{insights.comparison}</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Top Reduction Actions</h4>
        {insights.recommendations.map((rec, i) => {
          const diff = DIFFICULTY_META[rec.difficulty as keyof typeof DIFFICULTY_META] ?? DIFFICULTY_META.medium;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-4 border border-gray-800 bg-gray-900/50 flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: diff.bg }}>
                <TrendingDown className="w-4 h-4" style={{ color: diff.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{rec.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: diff.color }}>{diff.label}</span>
                    <span className="text-xs text-emerald-400 font-medium">↓ {formatNumber(rec.estimated_annual_savings_kg)} kg/yr</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{rec.action}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
