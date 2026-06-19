"""Insights sub-package."""

from app.insights.gemini import generate_insights
from app.insights.rules import generate_rule_based_insights

__all__ = ["generate_insights", "generate_rule_based_insights"]
