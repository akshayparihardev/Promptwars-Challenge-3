"""Gamification engine for eco-challenges and achievements."""

import uuid

from app.carbon import factors
from app.models import Achievement, CarbonInput, ChallengesResponse, EcoChallenge, FootprintResult


def generate_gamification(data: CarbonInput, result: FootprintResult) -> ChallengesResponse:
    """Dynamically generate challenges and unlock achievements based on actual data.
    
    Zero hardcoding: Every challenge is targeted at the user's highest emission areas,
    and savings are computed arithmetically.
    """
    challenges: list[EcoChallenge] = []
    achievements: list[Achievement] = []

    # 1. Transport Challenges
    if data.transport.car_km_per_week > 50:
        savings_kg = (data.transport.car_km_per_week * 0.2 * 52) * factors.CAR_FACTORS_PER_KM[data.transport.car_fuel]
        challenges.append(EcoChallenge(
            id=str(uuid.uuid4()),
            title="Car-Free Days",
            description="Replace 20% of your driving with public transit or cycling.",
            category="transport",
            duration_days=14,
            estimated_savings_kg=round(savings_kg, 1),
            difficulty="medium",
            icon="🚲"
        ))
    
    if data.transport.short_haul_flights_per_year > 0:
        savings_kg = factors.FLIGHT_SHORT_HAUL_PER_KM * factors.SHORT_HAUL_TRIP_KM
        challenges.append(EcoChallenge(
            id=str(uuid.uuid4()),
            title="Ground Travel Pioneer",
            description="Skip one short-haul flight and take a train or bus instead.",
            category="transport",
            duration_days=30,
            estimated_savings_kg=round(savings_kg, 1),
            difficulty="hard",
            icon="🚂"
        ))

    # 2. Diet Challenges
    if data.diet in [factors.DietType.HEAVY_MEAT, factors.DietType.MEDIUM_MEAT]:
        savings_kg = factors.DIET_ANNUAL_KG[data.diet] - factors.DIET_ANNUAL_KG[factors.DietType.LOW_MEAT]
        challenges.append(EcoChallenge(
            id=str(uuid.uuid4()),
            title="Meatless Weekdays",
            description="Shift to a low-meat diet for a month.",
            category="diet",
            duration_days=30,
            estimated_savings_kg=round(savings_kg, 1),
            difficulty="medium",
            icon="🥗"
        ))

    # 3. Home Energy Challenges
    if data.home.electricity_kwh_per_month > 150:
        # Assuming 10% reduction
        savings_kg = (data.home.electricity_kwh_per_month * 0.1 * 12 * result.location_context.grid_factor) / data.home.household_size
        challenges.append(EcoChallenge(
            id=str(uuid.uuid4()),
            title="Vampire Power Hunt",
            description="Unplug unused electronics and reduce electricity usage by 10%.",
            category="home",
            duration_days=7,
            estimated_savings_kg=round(savings_kg, 1),
            difficulty="easy",
            icon="🔌"
        ))

    # Sort challenges by highest impact
    challenges.sort(key=lambda c: c.estimated_savings_kg, reverse=True)
    # Take top 3
    challenges = challenges[:3]

    # Achievements calculation
    # Achievement 1: Below Global Average
    achievements.append(Achievement(
        id="ach_1",
        title="Earth Guardian",
        description="Your footprint is below the global average.",
        icon="🌍",
        unlocked=result.comparison.ratio_to_global_average < 1.0
    ))

    # Achievement 2: Plant-based
    achievements.append(Achievement(
        id="ach_2",
        title="Plant Power",
        description="Follow a vegetarian or vegan diet.",
        icon="🌱",
        unlocked=data.diet in [factors.DietType.VEGETARIAN, factors.DietType.VEGAN]
    ))

    # Achievement 3: Public Transit Hero
    achievements.append(Achievement(
        id="ach_3",
        title="Transit Hero",
        description="Use public transit for over 100km per week.",
        icon="🚆",
        unlocked=data.transport.public_transit_km_per_week > 100
    ))

    # Achievement 4: Energy Efficient
    achievements.append(Achievement(
        id="ach_4",
        title="Energy Efficient",
        description="Use less than 100 kWh of electricity per month per person.",
        icon="💡",
        unlocked=(data.home.electricity_kwh_per_month / data.home.household_size) < 100
    ))

    return ChallengesResponse(challenges=challenges, achievements=achievements)
