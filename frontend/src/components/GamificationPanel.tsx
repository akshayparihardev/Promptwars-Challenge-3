import React from "react";
import { ChallengesResponse } from "../lib/types";
import { motion } from "framer-motion";
import { Target, Trophy } from "lucide-react";

const DIFF_COLORS = {
  easy: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  hard: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

function GamificationPanelInner({ data }: { data: ChallengesResponse }) {
  return (
    <div className="flex flex-col gap-6 mt-6 pt-6 border-t border-gray-800">
      
      {/* Achievements Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white">Achievements Unlocked</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {data.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-xl p-3 border flex gap-3 items-center transition-all ${
                ach.unlocked
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-gray-800 bg-gray-900/50 opacity-50 grayscale"
              }`}
            >
              <div className="text-2xl">{ach.icon}</div>
              <div>
                <p className={`text-sm font-bold ${ach.unlocked ? "text-amber-400" : "text-gray-400"}`}>
                  {ach.title}
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white">Your Eco-Challenges</h3>
        </div>
        <div className="flex flex-col gap-3">
          {data.challenges.length === 0 && (
            <p className="text-sm text-gray-500">You are doing great! No immediate challenges suggested.</p>
          )}
          {data.challenges.map((challenge, i) => {
            const diff = DIFF_COLORS[challenge.difficulty as keyof typeof DIFF_COLORS] ?? DIFF_COLORS.medium;
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl p-4 border border-cyan-500/20 bg-cyan-500/5 flex gap-4 items-center"
              >
                <div className="text-3xl bg-gray-900/50 w-12 h-12 flex items-center justify-center rounded-full border border-gray-800 flex-shrink-0">
                  {challenge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h4 className="font-bold text-white text-sm truncate">{challenge.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded border uppercase font-bold tracking-wider"
                          style={{ borderColor: diff.color, color: diff.color, backgroundColor: diff.bg }}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{challenge.description}</p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-cyan-400">⏱️ {challenge.duration_days} Days</span>
                    <span className="text-emerald-400">🎯 Save {challenge.estimated_savings_kg} kg CO₂</span>
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
