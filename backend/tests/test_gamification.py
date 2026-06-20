import pytest
from app.carbon.engine import calculate_footprint
from app.carbon.gamification import generate_gamification
from app.models import CarbonInput, DietType, HomeInput, TransportInput, CarFuel

def test_gamification_generation_heavy():
    # Provide inputs that trigger all heavy challenges
    data = CarbonInput(
        location="Global",
        diet=DietType.HEAVY_MEAT,
        transport=TransportInput(
            car_km_per_week=100, 
            car_fuel=CarFuel.PETROL, 
            public_transit_km_per_week=150, 
            short_haul_flights_per_year=2, 
            long_haul_flights_per_year=0
        ),
        home=HomeInput(
            electricity_kwh_per_month=300, 
            natural_gas_kwh_per_month=0, 
            household_size=1
        )
    )
    result = calculate_footprint(data)
    response = generate_gamification(data, result)
    
    assert len(response.challenges) <= 3
    
    # Check achievements
    achievements = {a.id: a for a in response.achievements}
    assert achievements["ach_1"].unlocked is False # Not below average
    assert achievements["ach_2"].unlocked is False # Not plant power
    assert achievements["ach_3"].unlocked is True  # Transit Hero
    assert achievements["ach_4"].unlocked is False # Not energy efficient

def test_gamification_generation_light():
    # Provide inputs that trigger no heavy challenges, unlock all good achievements
    data = CarbonInput(
        location="Global",
        diet=DietType.VEGAN,
        transport=TransportInput(
            car_km_per_week=10, 
            car_fuel=CarFuel.ELECTRIC, 
            public_transit_km_per_week=200, 
            short_haul_flights_per_year=0, 
            long_haul_flights_per_year=0
        ),
        home=HomeInput(
            electricity_kwh_per_month=50, 
            natural_gas_kwh_per_month=0, 
            household_size=1
        )
    )
    result = calculate_footprint(data)
    response = generate_gamification(data, result)
    
    assert achievements := {a.id: a for a in response.achievements}
    assert achievements["ach_1"].unlocked is True  # Below average
    assert achievements["ach_2"].unlocked is True  # Plant power
    assert achievements["ach_3"].unlocked is True  # Transit Hero
    assert achievements["ach_4"].unlocked is True  # Energy efficient
