/**
 * API client for EcoAgent backend proxy.
 *
 * Why a centralized client: all fetch calls go through one module so
 * base URL, error handling, and header injection are consistent.
 * The backend runs on a different port in dev; in production, nginx
 * reverse-proxies /api/* to the FastAPI container.
 */

import type {
  RouteResponse,
  ClimatiqResult,
  FlightEmissionsResponse,
  InsightResponse,
} from "./schemas";

export interface CarbonDataResult {
  transport: number;
  food: number;
  housing: number;
  total: number;
}

/** Base URL for the FastAPI backend — configurable per environment. */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper with error normalization.
 *
 * Why we throw structured errors: downstream components can display
 * user-friendly messages without parsing raw HTTP responses.
 */
async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Compute driving routes with traffic-aware optimization.
 *
 * Why this proxies through FastAPI: the Google Routes API key stays
 * server-side, and field masking is enforced by the backend controller.
 */
export async function computeRoutes(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  emissionType: string = "GASOLINE"
): Promise<RouteResponse> {
  return apiFetch<RouteResponse>("/api/routes/compute", {
    origin,
    destination,
    emission_type: emissionType,
  });
}

/**
 * Estimate public transit emissions via Climatiq.
 *
 * Why region defaults to "IN": the primary target audience is Indian
 * commuters who benefit most from electrified metro comparisons.
 */
export async function estimateTransitEmissions(
  transitMode: string,
  distanceKm: number,
  region: string = "IN",
  passengers: number = 1
): Promise<ClimatiqResult> {
  return apiFetch<ClimatiqResult>("/api/climatiq/estimate", {
    transit_mode: transitMode,
    distance_km: distanceKm,
    region,
    passengers,
  });
}

/**
 * Compute flight emissions via Google Travel Impact Model.
 */
export async function computeFlightEmissions(
  flights: Array<{
    origin_airport: string;
    destination_airport: string;
    cabin_class?: string;
  }>
): Promise<FlightEmissionsResponse> {
  return apiFetch<FlightEmissionsResponse>("/api/flights/emissions", {
    flights,
  });
}

/**
 * Generate AI-powered environmental insights from aggregated data.
 *
 * Why we send raw API responses: the Gemini model needs the full
 * numerical context to produce meaningful comparative analysis.
 */
export async function generateInsight(
  routeData?: unknown,
  climatiqData?: unknown,
  flightData?: unknown,
  userContext?: string
): Promise<InsightResponse> {
  return apiFetch<InsightResponse>("/api/insights/generate", {
    route_data: routeData || null,
    climatiq_data: climatiqData || null,
    flight_data: flightData || null,
    user_context: userContext || null,
  });
}

/**
 * Calculate dynamic carbon footprint via Gemini engine.
 */
export async function calculateFootprint(
  location: string,
  transport: string[],
  diet: string,
  energy: string
): Promise<CarbonDataResult> {
  return apiFetch<CarbonDataResult>("/api/footprint/calculate", {
    location,
    transport,
    diet,
    energy,
  });
}
