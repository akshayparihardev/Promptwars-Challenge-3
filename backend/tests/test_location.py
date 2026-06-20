import pytest
from app.carbon import factors
from app.carbon.engine import resolve_location_context

def test_india_location_resolution():
    ctx = resolve_location_context("Mumbai, India")
    assert ctx.region == "india_urban"
    assert ctx.grid_factor == pytest.approx(factors.GRID_FACTORS["india"])
    assert ctx.benchmark_t == factors.REGIONAL_BENCHMARKS_T["india"]
    assert ctx.benchmark_label == "India average"
    assert ctx.local_transport_tip == "Indian Railways or metro"
    assert ctx.currency_symbol == "₹"

def test_uk_location_resolution():
    ctx = resolve_location_context("London, UK")
    assert ctx.region == "developed"
    assert ctx.grid_factor == pytest.approx(factors.GRID_FACTORS["uk"])
    assert ctx.currency_symbol == "$"

def test_us_location_resolution():
    ctx = resolve_location_context("New York, USA")
    assert ctx.region == "developed"
    assert ctx.grid_factor == pytest.approx(factors.GRID_FACTORS["us"])
    assert ctx.currency_symbol == "$"

def test_default_location_resolution():
    ctx = resolve_location_context("Unknown Place")
    assert ctx.region == "developing"
    assert ctx.grid_factor == pytest.approx(factors.GRID_FACTORS["default"])
    assert ctx.currency_symbol == "$"
