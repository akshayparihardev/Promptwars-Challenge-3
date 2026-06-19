// Shared types mirroring the backend Pydantic schema

export type CarFuel = "petrol" | "diesel" | "hybrid" | "electric";

export type DietType =
  | "heavy_meat"
  | "medium_meat"
  | "low_meat"
  | "pescatarian"
  | "vegetarian"
  | "vegan";

export interface CarbonInput {
  location: string;
  transport: {
    car_km_per_week: number;
    car_fuel: CarFuel;
    public_transit_km_per_week: number;
    short_haul_flights_per_year: number;
    long_haul_flights_per_year: number;
  };
  home: {
    electricity_kwh_per_month: number;
    natural_gas_kwh_per_month: number;
    household_size: number;
  };
  diet: DietType;
  consumption: {
    goods_spend_usd_per_month: number;
    waste_kg_per_week: number;
  };
}

export interface Comparison {
  global_average_annual_kg: number;
  sustainable_target_annual_kg: number;
  ratio_to_global_average: number;
  ratio_to_sustainable_target: number;
}

export interface LocationContext {
  region: string;
  grid_factor: number;
  annual_km: number;
  benchmark_t: number;
  benchmark_label: string;
  local_transport_tip: string;
  currency_symbol: string;
}

export interface Equivalencies {
  trees_needed: number;
  flights_delhi_mumbai: number;
  km_petrol_car: number;
  km_indian_rail: number;
}

export interface FootprintResult {
  breakdown_kg: Record<string, number>;
  total_annual_kg: number;
  total_annual_tonnes: number;
  comparison: Comparison;
  insight_tag: string;
  largest_category: string;
  location_context: LocationContext;
  equivalencies: Equivalencies;
}

export interface Recommendation {
  category: string;
  action: string;
  estimated_annual_savings_kg: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface InsightsResponse {
  summary: string;
  comparison: string;
  recommendations: Recommendation[];
  source: "gemini" | "rules";
}

export interface WhatIfOverride {
  location?: string | null;
  transport?: Partial<CarbonInput["transport"]> | null;
  home?: Partial<CarbonInput["home"]> | null;
  diet?: DietType | null;
  consumption?: Partial<CarbonInput["consumption"]> | null;
}

export interface WhatIfResult {
  result: FootprintResult;
  delta_kg: number;
  delta_pct: number;
  saves: boolean;
}

export interface Entry {
  id: string;
  created_at: string;
  device_id: string;
  input: CarbonInput;
  result: FootprintResult;
}

export const emptyInput = (): CarbonInput => ({
  location: "",
  transport: {
    car_km_per_week: 0,
    car_fuel: "petrol",
    public_transit_km_per_week: 0,
    short_haul_flights_per_year: 0,
    long_haul_flights_per_year: 0,
  },
  home: {
    electricity_kwh_per_month: 0,
    natural_gas_kwh_per_month: 0,
    household_size: 1,
  },
  diet: "medium_meat",
  consumption: {
    goods_spend_usd_per_month: 0,
    waste_kg_per_week: 0,
  },
});
