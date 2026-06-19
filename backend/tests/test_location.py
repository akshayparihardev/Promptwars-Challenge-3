"""Tests for LocationContext logic."""

from app.carbon import factors
from app.carbon.engine import resolve_location_context


def test_location_india():
    ctx = resolve_location_context("Mumbai, India")
    assert ctx.region == "india_urban"
    assert ctx.grid_factor == factors.GRID_FACTORS["india"]
    assert ctx.benchmark_t == factors.REGIONAL_BENCHMARKS_T["india"]
    assert ctx.annual_km == factors.ANNUAL_KM["india_urban"]
    assert ctx.currency_symbol == "₹"


def test_location_uk():
    ctx = resolve_location_context("London, UK")
    assert ctx.region == "developed"
    assert ctx.grid_factor == factors.GRID_FACTORS["uk"]
    assert ctx.benchmark_t == factors.REGIONAL_BENCHMARKS_T["uk"]
    assert ctx.currency_symbol == "£"


def test_location_global():
    ctx = resolve_location_context("Some Unknown Place")
    assert ctx.region == "developing"
    assert ctx.grid_factor == factors.GRID_FACTORS["default"]
    assert ctx.benchmark_t == factors.REGIONAL_BENCHMARKS_T["global"]
    assert ctx.currency_symbol == "$"
