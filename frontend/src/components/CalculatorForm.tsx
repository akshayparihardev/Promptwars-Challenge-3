import { useState } from "react";
import { CarbonInput, CarFuel, DietType, emptyInput } from "../lib/types";
import { NumberField } from "./NumberField";
import { LocationPicker } from "./LocationPicker";
import { Zap } from "lucide-react";

interface Props {
  onSubmit: (input: CarbonInput) => void;
  loading: boolean;
}

const DIET_OPTIONS: { value: DietType; label: string; sub: string }[] = [
  { value: "heavy_meat",  label: "Heavy Meat",  sub: "3.3 t/yr" },
  { value: "medium_meat", label: "Average",      sub: "2.5 t/yr" },
  { value: "low_meat",    label: "Low Meat",     sub: "1.9 t/yr" },
  { value: "pescatarian", label: "Pescatarian",  sub: "1.7 t/yr" },
  { value: "vegetarian",  label: "Vegetarian",   sub: "1.5 t/yr" },
  { value: "vegan",       label: "Vegan",        sub: "1.0 t/yr" },
];

const FUEL_OPTIONS: { value: CarFuel; label: string }[] = [
  { value: "petrol",   label: "Petrol" },
  { value: "diesel",   label: "Diesel" },
  { value: "hybrid",   label: "Hybrid" },
  { value: "electric", label: "Electric" },
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
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Location */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-label">Location</div>
        <LocationPicker value={input.location} onChange={v => setInput(s => ({ ...s, location: v }))} />
      </div>

      {/* ── Transport ── */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginBottom: 18 }}>
        <div className="section-label">Transport</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <NumberField label="Car km / week" suffix="km" value={input.transport.car_km_per_week}
            onChange={v => pt({ car_km_per_week: Math.max(0, Math.min(5000, v)) })} />
          <NumberField label="Transit km / week" suffix="km" value={input.transport.public_transit_km_per_week}
            onChange={v => pt({ public_transit_km_per_week: Math.max(0, Math.min(5000, v)) })} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="label">Fuel type</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
            {FUEL_OPTIONS.map(o => (
              <button key={o.value} type="button"
                aria-label={`Select ${o.label} fuel type`}
                aria-pressed={input.transport.car_fuel === o.value}
                className={`pill${input.transport.car_fuel === o.value ? " active-green" : ""}`}
                onClick={() => pt({ car_fuel: o.value })}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumberField label="Short flights / yr" value={input.transport.short_haul_flights_per_year}
            onChange={v => pt({ short_haul_flights_per_year: Math.max(0, Math.min(200, Math.floor(v))) })} />
          <NumberField label="Long flights / yr" value={input.transport.long_haul_flights_per_year}
            onChange={v => pt({ long_haul_flights_per_year: Math.max(0, Math.min(100, Math.floor(v))) })} />
        </div>
      </div>

      {/* ── Home Energy ── */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginBottom: 18 }}>
        <div className="section-label">Home Energy</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <NumberField label="Electricity / month" suffix="kWh" value={input.home.electricity_kwh_per_month}
            onChange={v => ph({ electricity_kwh_per_month: Math.max(0, Math.min(50000, v)) })} />
          <NumberField label="Natural gas / month" suffix="kWh" value={input.home.natural_gas_kwh_per_month}
            onChange={v => ph({ natural_gas_kwh_per_month: Math.max(0, Math.min(50000, v)) })} />
          <NumberField label="Household size" min={1} value={input.home.household_size}
            onChange={v => ph({ household_size: Math.max(1, Math.min(20, Math.floor(v))) })}
            hint="Energy is divided equally" />
        </div>
      </div>

      {/* ── Diet ── */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginBottom: 18 }}>
        <div className="section-label">Diet</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {DIET_OPTIONS.map(o => (
            <button key={o.value} type="button"
              aria-label={`Select ${o.label} diet`}
              aria-pressed={input.diet === o.value}
              className={`pill${input.diet === o.value ? " active-green" : ""}`}
              onClick={() => setInput(s => ({ ...s, diet: o.value }))}
              style={{ flexDirection: "column", gap: 2, padding: "8px 4px", fontSize: 11, lineHeight: 1.3 }}>
              <span>{o.label}</span>
              {input.diet === o.value && <span style={{ color: "var(--accent)", fontSize: 10, opacity: 0.7 }}>{o.sub}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Goods & Waste ── */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginBottom: 22 }}>
        <div className="section-label">Goods & Waste</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumberField label="Goods spend / month" suffix="USD" value={input.consumption.goods_spend_usd_per_month}
            onChange={v => pc({ goods_spend_usd_per_month: Math.max(0, Math.min(100000, v)) })} />
          <NumberField label="Landfill waste / week" suffix="kg" value={input.consumption.waste_kg_per_week}
            onChange={v => pc({ waste_kg_per_week: Math.max(0, Math.min(1000, v)) })} />
        </div>
      </div>

      {/* CTA */}
      <button className="btn" type="submit"
        disabled={loading || !input.location.trim()}
        style={{ width: "100%", fontSize: 13, padding: "12px 20px" }}>
        {loading
          ? <><div style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.25)",borderTopColor:"#09090b",borderRadius:"50%" }} className="animate-spin" /> Calculating…</>
          : <><Zap size={15} /> Calculate Footprint</>
        }
      </button>
    </form>
  );
}
