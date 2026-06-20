import { useState } from "react";
import { CarbonInput, CarFuel, DietType } from "../lib/types";
import { useWhatIf } from "../hooks/useWhatIf";
import { formatNumber } from "../lib/format";
import { SlidersHorizontal, TrendingDown, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "heavy_meat", label: "Heavy Meat" },
  { value: "medium_meat", label: "Average" },
  { value: "low_meat", label: "Low Meat" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
];

const FUEL_OPTIONS: { value: CarFuel; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
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
    <div className="card border border-zinc-800">
      <div className="flex items-center gap-2 mb-1">
        <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
        <h3 className="font-semibold text-sm text-zinc-200">What-If Simulator</h3>
      </div>
      <p className="text-xs text-zinc-500 mb-4">See the impact of changes before committing.</p>

      <div className="flex flex-col gap-3.5 mb-4">
        <div>
          <label className="label">Switch diet to</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setDietOverride("")}
              className={`py-1.5 rounded-md border text-xs transition-all ${dietOverride === "" ? "border-cyan-500/40 bg-cyan-500/8 text-cyan-300" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}
            >
              No Change
            </button>
            {DIET_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDietOverride(o.value)}
                className={`py-1.5 rounded-md border text-xs transition-all ${
                  dietOverride === o.value ? "border-cyan-500/40 bg-cyan-500/8 text-cyan-300" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Switch fuel to</label>
          <div className="grid grid-cols-5 gap-1">
            <button
              type="button"
              onClick={() => setFuelOverride("")}
              className={`py-1.5 rounded-md border text-xs transition-all ${fuelOverride === "" ? "border-cyan-500/40 bg-cyan-500/8 text-cyan-300" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}
            >
              Same
            </button>
            {FUEL_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setFuelOverride(o.value)}
                className={`py-1.5 rounded-md border text-xs transition-all ${
                  fuelOverride === o.value ? "border-cyan-500/40 bg-cyan-500/8 text-cyan-300" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        className="w-full py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/6 text-cyan-300 font-medium text-sm hover:bg-cyan-500/12 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        onClick={handleSimulate}
        disabled={loading || (!dietOverride && !fuelOverride)}
      >
        {loading ? (
          <><div className="w-3 h-3 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" /> Simulating...</>
        ) : (
          <><SlidersHorizontal className="w-3.5 h-3.5" /> Run Simulation</>
        )}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`mt-3 p-3.5 rounded-lg border flex items-center gap-3 ${
              result.saves
                ? "bg-emerald-500/6 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/6 border-red-500/20 text-red-400"
            }`}
          >
            {result.saves
              ? <TrendingDown className="w-4 h-4 flex-shrink-0" />
              : <TrendingUp className="w-4 h-4 flex-shrink-0" />
            }
            <div>
              <p className="font-semibold text-sm">
                {result.saves ? "Saves " : "Adds "}
                {formatNumber(Math.abs(result.delta_kg))} kg CO₂e/yr
              </p>
              <p className="text-xs opacity-70">
                {result.delta_pct > 0 ? "+" : ""}{result.delta_pct}% vs current
                · New: {result.result.total_annual_tonnes.toFixed(2)}t
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
