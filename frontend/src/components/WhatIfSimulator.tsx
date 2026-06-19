import { useState } from "react";
import { CarbonInput, CarFuel, DietType } from "../lib/types";
import { useWhatIf } from "../hooks/useWhatIf";
import { formatNumber } from "../lib/format";
import { SlidersHorizontal, TrendingDown, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DIET_OPTIONS: { value: DietType; label: string; emoji: string }[] = [
  { value: "heavy_meat", label: "Heavy Meat", emoji: "🥩" },
  { value: "medium_meat", label: "Average Meat", emoji: "🍗" },
  { value: "low_meat", label: "Low Meat", emoji: "🥗" },
  { value: "pescatarian", label: "Pescatarian", emoji: "🐟" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥦" },
  { value: "vegan", label: "Vegan", emoji: "🌱" },
];

const FUEL_OPTIONS: { value: CarFuel; label: string; emoji: string }[] = [
  { value: "petrol", label: "Petrol", emoji: "⛽" },
  { value: "diesel", label: "Diesel", emoji: "🛢️" },
  { value: "hybrid", label: "Hybrid", emoji: "⚡" },
  { value: "electric", label: "Electric", emoji: "🔋" },
];

export function WhatIfSimulator({ baseInput }: { baseInput: CarbonInput }) {
  const { simulate, loading, result } = useWhatIf();
  const [dietOverride, setDietOverride] = useState<DietType | "">("");
  const [fuelOverride, setFuelOverride] = useState<CarFuel | "">("");

  const handleSimulate = () => {
    simulate(baseInput, {
      diet: dietOverride || null,
      transport: fuelOverride
        ? { ...baseInput.transport, car_fuel: fuelOverride }
        : null,
    });
  };

  return (
    <div className="card border border-cyan-500/20">
      <div className="flex items-center gap-2 mb-1">
        <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
        <h3 className="font-bold text-white">What-If Simulator</h3>
      </div>
      <p className="text-xs text-gray-500 mb-5">See the impact of small changes before committing to them.</p>

      <div className="flex flex-col gap-4 mb-5">
        <div>
          <label className="label">Switch Diet To</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDietOverride("")}
              className={`py-1.5 rounded-lg border text-xs transition-all ${dietOverride === "" ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-600"}`}
            >
              No Change
            </button>
            {DIET_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDietOverride(o.value)}
                className={`py-1.5 rounded-lg border text-xs transition-all flex items-center justify-center gap-1 ${
                  dietOverride === o.value ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-600"
                }`}
              >
                {o.emoji} {o.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Switch Car Fuel To</label>
          <div className="grid grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={() => setFuelOverride("")}
              className={`py-1.5 rounded-lg border text-xs transition-all ${fuelOverride === "" ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-600"}`}
            >
              Same
            </button>
            {FUEL_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setFuelOverride(o.value)}
                className={`py-1.5 rounded-lg border text-xs transition-all flex flex-col items-center gap-0.5 ${
                  fuelOverride === o.value ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-600"
                }`}
              >
                <span>{o.emoji}</span>
                <span className="leading-none">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        className="w-full py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-semibold text-sm hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        onClick={handleSimulate}
        disabled={loading || (!dietOverride && !fuelOverride)}
      >
        {loading ? (
          <><div className="w-3.5 h-3.5 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" /> Simulating...</>
        ) : (
          <><SlidersHorizontal className="w-4 h-4" /> Run Simulation</>
        )}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${
              result.saves
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-red-500/10 border-red-500/25 text-red-400"
            }`}
          >
            {result.saves
              ? <TrendingDown className="w-5 h-5 flex-shrink-0" />
              : <TrendingUp className="w-5 h-5 flex-shrink-0" />
            }
            <div>
              <p className="font-bold text-sm">
                {result.saves ? "Saves " : "Adds "}
                {formatNumber(Math.abs(result.delta_kg))} kg CO₂e/yr
              </p>
              <p className="text-xs opacity-70">
                {result.delta_pct > 0 ? "+" : ""}{result.delta_pct}% vs your current footprint
                · New total: {result.result.total_annual_tonnes.toFixed(2)}t
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
