"""Emission factors for carbon footprint estimation.

All factors are expressed in **kilograms of CO₂-equivalent (kg CO₂e)** and are
documented with their source so the numbers are auditable rather than magic
constants. Figures are rounded, representative averages intended for awareness
and education — not regulatory accounting.

Primary sources:
  * UK DEFRA / DESNZ 2023 Greenhouse Gas Conversion Factors
  * US EPA — Greenhouse Gas Emissions from a Typical Passenger Vehicle
  * Central Electricity Authority (CEA) India — CO₂ Baseline Database v18 (2023)
  * IEA Emissions Factors 2023
  * EMBER Global Electricity Review 2023
  * Our World in Data — Food & Energy Emissions (2023)
  * MoRTH India Road Transport Yearbook 2023
  * EPA Greenhouse Gas Equivalencies Calculator 2023
  * ICAO Carbon Emissions Calculator Methodology
"""

from __future__ import annotations

from enum import Enum
from typing import Final

# ─────────────────────── Time conversions ───────────────────────────
WEEKS_PER_YEAR: Final[int] = 52
MONTHS_PER_YEAR: Final[int] = 12

# ──────────────────────────── Transport ─────────────────────────────


class CarFuel(str, Enum):
    """Car drivetrain type, which determines the per-km emission factor."""

    PETROL = "petrol"
    DIESEL = "diesel"
    HYBRID = "hybrid"
    ELECTRIC = "electric"


# kg CO₂e per km driven (single occupant). Source: DEFRA 2023 average car.
CAR_FACTORS_PER_KM: Final[dict[CarFuel, float]] = {
    CarFuel.PETROL: 0.170,   # DEFRA 2023 average petrol car
    CarFuel.DIESEL: 0.171,   # DEFRA 2023 average diesel car
    CarFuel.HYBRID: 0.120,   # DEFRA 2023 average hybrid car
    CarFuel.ELECTRIC: 0.047, # DEFRA 2023 — includes grid generation emissions
}

# EV factor override for India grid (higher than global EV average).
# Source: CEA 2023 grid 0.82 kgCO₂/kWh × 0.065 kWh/km ≈ 0.053
CAR_EV_INDIA: Final[float] = 0.053

# kg CO₂e per passenger-km. Source: DEFRA 2023 (bus/rail averages).
PUBLIC_TRANSIT_PER_KM: Final[float] = 0.060

# kg CO₂e per passenger-km for flights (incl. radiative forcing uplift).
FLIGHT_SHORT_HAUL_PER_KM: Final[float] = 0.158  # DEFRA 2023 short-haul
FLIGHT_LONG_HAUL_PER_KM: Final[float] = 0.150   # DEFRA 2023 long-haul

# Representative one-way distances for converting flight counts → km.
SHORT_HAUL_TRIP_KM: Final[float] = 1100.0
LONG_HAUL_TRIP_KM: Final[float] = 6500.0

# ──────────────────────────── Home energy ───────────────────────────
# Default global grid factor (overridden by LocationContext).
# Source: IEA / Our World in Data ~2022 world average.
ELECTRICITY_PER_KWH: Final[float] = 0.450

# kg CO₂e per kWh of natural gas (heating). Source: DEFRA 2023.
NATURAL_GAS_PER_KWH: Final[float] = 0.183

# Grid emission factors by region (kgCO₂/kWh).
GRID_FACTORS: Final[dict[str, float]] = {
    "india": 0.820,    # CEA 2023 CO₂ Baseline Database v18
    "us": 0.386,       # EPA eGRID 2023
    "uk": 0.233,       # DEFRA 2023
    "eu": 0.251,       # EMBER Global Electricity Review 2023
    "default": 0.450,  # IEA global average 2023
}

# Annual driving distance assumptions (km/year).
# Source: MoRTH 2023 (India), IEA 2022 (developed), ITF 2023 (developing)
ANNUAL_KM: Final[dict[str, float]] = {
    "india_urban": 8000.0,   # MoRTH 2023 urban India average
    "india_rural": 5500.0,   # MoRTH 2023 rural India average
    "developed": 15000.0,    # IEA 2022 OECD average
    "developing": 7000.0,    # ITF 2023 non-OECD average
}

# Regional per-capita benchmarks (tonnes CO₂e/year).
# Source: Our World in Data 2023
REGIONAL_BENCHMARKS_T: Final[dict[str, float]] = {
    "india": 1.9,
    "global": 4.8,
    "us": 14.2,
    "uk": 5.5,
    "eu": 7.0,
    "paris_target": 1.5,
}

# ──────────────────────────────── Diet ──────────────────────────────


class DietType(str, Enum):
    """Diet profile, mapped to an annual food-production footprint."""

    HEAVY_MEAT = "heavy_meat"
    MEDIUM_MEAT = "medium_meat"
    LOW_MEAT = "low_meat"
    PESCATARIAN = "pescatarian"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"


# Annual kg CO₂e attributable to diet type.
# Source: Scarborough et al. 2014 / Our World in Data dietary footprints.
DIET_ANNUAL_KG: Final[dict[DietType, float]] = {
    DietType.HEAVY_MEAT: 3300.0,
    DietType.MEDIUM_MEAT: 2500.0,
    DietType.LOW_MEAT: 1900.0,
    DietType.PESCATARIAN: 1700.0,
    DietType.VEGETARIAN: 1500.0,
    DietType.VEGAN: 1050.0,
}

# ───────────────────────── Goods, services & waste ──────────────────
# kg CO₂e per USD spent on general consumer goods (rough EEIO-style intensity).
# Source: derived from EXIOBASE / consumer-spend emission intensity studies.
GOODS_PER_USD_MONTHLY: Final[float] = 0.40

# kg CO₂e per kg of landfilled waste (methane-weighted). Source: EPA WARM.
WASTE_PER_KG: Final[float] = 0.580

# ──────────────────────────── References ────────────────────────────
# Annual per-capita footprints for comparison (kg CO₂e/yr).
# Source: Our World in Data, 2022 per-capita consumption emissions.
GLOBAL_AVG_ANNUAL_KG: Final[float] = 4800.0
SUSTAINABLE_TARGET_ANNUAL_KG: Final[float] = 2000.0  # ~Paris-aligned 2030

# ──────────────────── CO₂ equivalencies per tonne ───────────────────
# Source: EPA Greenhouse Gas Equivalencies Calculator 2023
EQUIV_TREES_PER_TONNE: Final[float] = 40.0
EQUIV_FLIGHTS_DELHI_MUMBAI: Final[float] = 11.0  # ~91 kg one-way ICAO
EQUIV_KM_PETROL_CAR: Final[float] = 4167.0
EQUIV_KM_INDIAN_RAIL: Final[float] = 24390.0  # Indian Railways 0.041 kg/km

# Achievable reduction shares for rule-based recommendations.
FLIGHT_REDUCTION_SHARE: Final[float] = 0.5
HOME_REDUCTION_SHARE: Final[float] = 0.33
CONSUMPTION_REDUCTION_SHARE: Final[float] = 0.25
GENERIC_TRANSPORT_REDUCTION_SHARE: Final[float] = 0.2
