import React from "react";
import { ChallengesResponse } from "../lib/types";
import { motion } from "framer-motion";
import { Target, Trophy } from "lucide-react";

const DIFF_COLORS = {
  easy: { color: "#4ade80", bg: "rgba(34,197,94,0.08)" },
  medium: { color: "#fbbf24", bg: "rgba(245,158,11,0.08)" },
  hard: { color: "#f87171", bg: "rgba(239,68,68,0.08)" },
};

function GamificationPanelInner({ data }: { data: ChallengesResponse }) {
  return (
    <div className="flex flex-col gap-5 mt-6 pt-6 border-t border-zinc-800">
      
      {/* Achievements Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-sm text-zinc-200">Achievements</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {data.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-lg p-2.5 border flex gap-2.5 items-center transition-all ${
                ach.unlocked
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-900/50 opacity-40 grayscale"
              }`}
            >
              <div className="text-xl">{ach.icon}</div>
              <div>
                <p className={`text-xs font-semibold ${ach.unlocked ? "text-amber-400" : "text-zinc-500"}`}>
                  {ach.title}
                </p>
                <p className="text-xs text-zinc-500 leading-tight mt-0.5">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-sm text-zinc-200">Eco-Challenges</h3>
        </div>
        <div className="flex flex-col gap-2.5">
          {data.challenges.length === 0 && (
            <p className="text-sm text-zinc-500">No challenges needed — you are doing great.</p>
          )}
          {data.challenges.map((challenge, i) => {
            const diff = DIFF_COLORS[challenge.difficulty as keyof typeof DIFF_COLORS] ?? DIFF_COLORS.medium;
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-lg p-3.5 border border-zinc-800 bg-zinc-900/40 flex gap-3 items-center"
              >
                <div className="text-2xl bg-zinc-900/80 w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 flex-shrink-0">
                  {challenge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <h4 className="font-semibold text-zinc-200 text-sm truncate">{challenge.title}</h4>
                    <span className="text-xs px-1.5 py-0.5 rounded border font-semibold"
                          style={{ borderColor: diff.color, color: diff.color, backgroundColor: diff.bg }}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-1.5">{challenge.description}</p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-zinc-500">{challenge.duration_days}d</span>
                    <span className="text-emerald-400">Save {challenge.estimated_savings_kg} kg</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export const GamificationPanel = React.memo(GamificationPanelInner);
