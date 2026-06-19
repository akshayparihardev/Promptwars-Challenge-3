import { useState } from "react";
import { CarbonInput, CarFuel, DietType, emptyInput } from "../lib/types";
import { NumberField } from "./NumberField";
import { LocationPicker } from "./LocationPicker";
import { Zap } from "lucide-react";

interface Props {
  onSubmit: (input: CarbonInput) => void;
  loading: boolean;
}

const DIET_OPTIONS: { value: DietType; label: string; emoji: string; sub: string }[] = [
  { value: "heavy_meat",  label: "Heavy Meat",  emoji: "🥩", sub: "3.3 t/yr" },
  { value: "medium_meat", label: "Average",     emoji: "🍗", sub: "2.5 t/yr" },
  { value: "low_meat",    label: "Low Meat",    emoji: "🥗", sub: "1.9 t/yr" },
  { value: "pescatarian", label: "Pescatarian", emoji: "🐟", sub: "1.7 t/yr" },
  { value: "vegetarian",  label: "Vegetarian",  emoji: "🥦", sub: "1.5 t/yr" },
  { value: "vegan",       label: "Vegan",       emoji: "🌱", sub: "1.0 t/yr" },
];

const FUEL_OPTIONS: { value: CarFuel; label: string; emoji: string }[] = [
  { value: "petrol",   label: "Petrol",   emoji: "⛽" },
  { value: "diesel",   label: "Diesel",   emoji: "🛢️" },
  { value: "hybrid",   label: "Hybrid",   emoji: "⚡" },
  { value: "electric", label: "Electric", emoji: "🔋" },
];

export function CalculatorForm({ onSubmit, loading }: Props) {
  const [input, setInput] = useState<CarbonInput>(emptyInput);

  const pt = (p: Partial<CarbonInput["transport"]>) =>
    setInput(s => ({ ...s, transport: { ...s.transport, ...p } }));
  const ph = (p: Partial<CarbonInput["home"]>) =>
    setInput(s => ({ ...s, home: { ...s.home, ...p } }));
  const pc = (p: Partial<CarbonInput["consumption"]>) =>
    setInput(s => ({ ...s, consumption: { ...s.consumption, ...p } }));

  const submit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(input); };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Location */}
      <div>
        <div className="section-label">
          <span>📍</span> Location
        </div>
        <LocationPicker value={input.location} onChange={v => setInput(s => ({ ...s, location: v }))} />
      </div>

      {/* 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* Transport */}
        <div style={{
          background: "rgba(0,200,150,0.04)",
          border: "1px solid rgba(0,200,150,0.12)",
          borderRadius: 14,
          padding: 16,
          display: "flex", flexDirection: "column", gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 18 }}>🚗</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--green)" }}>Transport</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <NumberField label="Car km/wk" suffix="km" value={input.transport.car_km_per_week}
              onChange={v => pt({ car_km_per_week: Math.max(0, v) })} />
            <NumberField label="Transit km/wk" suffix="km" value={input.transport.public_transit_km_per_week}
              onChange={v => pt({ public_transit_km_per_week: Math.max(0, v) })} />
          </div>

          <div>
            <div className="label">Fuel</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {FUEL_OPTIONS.map(o => (
                <button key={o.value} type="button"
                  className={`pill${input.transport.car_fuel === o.value ? " active-green" : ""}`}
                  onClick={() => pt({ car_fuel: o.value })}
                  style={{ fontSize: 11, padding: "6px 8px" }}>
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <NumberField label="Short flights/yr" value={input.transport.short_haul_flights_per_year}
              onChange={v => pt({ short_haul_flights_per_year: Math.max(0, Math.floor(v)) })} />
            <NumberField label="Long flights/yr" value={input.transport.long_haul_flights_per_year}
              onChange={v => pt({ long_haul_flights_per_year: Math.max(0, Math.floor(v)) })} />
          </div>
        </div>

        {/* Home Energy */}
        <div style={{
          background: "rgba(167,139,250,0.04)",
          border: "1px solid rgba(167,139,250,0.12)",
          borderRadius: 14,
          padding: 16,
          display: "flex", flexDirection: "column", gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 18 }}>🏠</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--purple)" }}>Home Energy</span>
          </div>
          <NumberField label="Electricity / month" suffix="kWh" value={input.home.electricity_kwh_per_month}
            onChange={v => ph({ electricity_kwh_per_month: Math.max(0, v) })} />
          <NumberField label="Natural gas / month" suffix="kWh" value={input.home.natural_gas_kwh_per_month}
            onChange={v => ph({ natural_gas_kwh_per_month: Math.max(0, v) })} />
          <NumberField label="People in household" min={1} value={input.home.household_size}
            onChange={v => ph({ household_size: Math.max(1, Math.floor(v)) })}
            hint="Energy divided equally" />
        </div>

        {/* Diet */}
        <div style={{
          background: "rgba(251,191,36,0.04)",
          border: "1px solid rgba(251,191,36,0.12)",
          borderRadius: 14,
          padding: 16,
          display: "flex", flexDirection: "column", gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 18 }}>🥗</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--amber)" }}>Diet</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {DIET_OPTIONS.map(o => (
              <button key={o.value} type="button"
                className={`pill${input.diet === o.value ? " active-amber" : ""}`}
                onClick={() => setInput(s => ({ ...s, diet: o.value }))}
                style={{ flexDirection: "column", gap: 3, padding: "8px 4px", fontSize: 10, lineHeight: 1.3 }}>
                <span style={{ fontSize: 16 }}>{o.emoji}</span>
                <span>{o.label}</span>
                {input.diet === o.value && <span style={{ color: "var(--amber)", fontSize: 9, opacity: 0.8 }}>{o.sub}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Goods & Waste */}
        <div style={{
          background: "rgba(6,182,212,0.04)",
          border: "1px solid rgba(6,182,212,0.12)",
          borderRadius: 14,
          padding: 16,
          display: "flex", flexDirection: "column", gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 18 }}>🛍️</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--cyan)" }}>Goods & Waste</span>
          </div>
          <NumberField label="Goods spending / month" suffix="USD" value={input.consumption.goods_spend_usd_per_month}
            onChange={v => pc({ goods_spend_usd_per_month: Math.max(0, v) })} />
          <NumberField label="Landfill waste / week" suffix="kg" value={input.consumption.waste_kg_per_week}
            onChange={v => pc({ waste_kg_per_week: Math.max(0, v) })} />
        </div>

      </div>

      {/* CTA */}
      <button className="btn" type="submit"
        disabled={loading || !input.location.trim()}
        style={{ width: "100%", fontSize: 15, padding: "14px 24px", borderRadius: 14 }}>
        {loading
          ? <><div style={{ width:16,height:16,border:"2px solid rgba(0,0,0,0.3)",borderTopColor:"#020408",borderRadius:"50%" }} className="animate-spin" /> Calculating…</>
          : <><Zap size={16} /> Calculate My Footprint</>
        }
      </button>
    </form>
  );
}
