/**
 * Zod validation schemas for frontend form inputs.
 *
 * Why we mirror backend Pydantic schemas: validates user input before
 * it hits the network, reducing unnecessary API calls and providing
 * instant feedback. Schema shape matches backend contracts exactly.
 */

import { z } from "zod/v4";

/** Vehicle emission types supported by Google Routes API. */
export const EmissionType = z.enum(["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]);
export type EmissionType = z.infer<typeof EmissionType>;

/** Public transit modes for Climatiq Scope 3 calculations. */
export const TransitMode = z.enum(["bus", "metro", "rail", "ferry"]);
export type TransitMode = z.infer<typeof TransitMode>;

/** Flight cabin classes for TIM API. */
export const CabinClass = z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]);
export type CabinClass = z.infer<typeof CabinClass>;

/** Geographic coordinate for route endpoints. */
export const WaypointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Route computation request — mirrors backend RouteRequest. */
export const RouteRequestSchema = z.object({
  origin: WaypointSchema,
  destination: WaypointSchema,
  emission_type: EmissionType.default("GASOLINE"),
});
export type RouteRequest = z.infer<typeof RouteRequestSchema>;

/** Climatiq estimation request — mirrors backend ClimatiqEstimateRequest. */
export const ClimatiqRequestSchema = z.object({
  transit_mode: TransitMode,
  distance_km: z.number().positive("Distance must be positive"),
  region: z.string().min(2).max(5).default("IN"),
  passengers: z.number().int().min(1).max(500).default(1),
});
export type ClimatiqRequest = z.infer<typeof ClimatiqRequestSchema>;

/** Flight leg — mirrors backend FlightLeg. */
export const FlightLegSchema = z.object({
  origin_airport: z.string().min(3).max(4).transform((v) => v.toUpperCase()),
  destination_airport: z.string().min(3).max(4).transform((v) => v.toUpperCase()),
  cabin_class: CabinClass.default("ECONOMY"),
});

/** Flight emissions request — mirrors backend FlightEmissionsRequest. */
export const FlightRequestSchema = z.object({
  flights: z.array(FlightLegSchema).min(1).max(10),
});
export type FlightRequest = z.infer<typeof FlightRequestSchema>;

// ---------------------------------------------------------------------------
// Response types (no validation needed — we trust our own backend)
// ---------------------------------------------------------------------------

export interface RouteResult {
  distance_meters: number;
  duration: string;
  fuel_consumption_microliters: number | null;
  route_label: string | null;
}

export interface RouteResponse {
  routes: RouteResult[];
}

export interface ClimatiqResult {
  co2e_kg: number;
  activity_id: string;
  emission_factor_name: string;
  region: string;
}

export interface FlightEmissionResult {
  origin: string;
  destination: string;
  emissions_kg_co2e: number;
  cabin_class: string;
}

export interface FlightEmissionsResponse {
  flight_emissions: FlightEmissionResult[];
}

export interface InsightResponse {
  summary: string;
  comparison: string;
  recommendations: string[];
  estimated_annual_savings_kg_co2: number | null;
}
