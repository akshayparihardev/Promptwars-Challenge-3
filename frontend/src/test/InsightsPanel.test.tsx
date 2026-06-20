import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { InsightsPanel } from '../components/InsightsPanel';
import type { InsightsResponse } from '../lib/types';

const mockInsights: InsightsResponse = {
  source: 'gemini',
  summary: 'Test summary about your carbon impact.',
  comparison: 'You produce more than the global average.',
  recommendations: [
    {
      category: 'transport',
      action: 'Take the bus instead of driving',
      estimated_annual_savings_kg: 100,
      difficulty: 'easy',
    },
  ],
};

describe('InsightsPanel', () => {
  it('renders insights summary and recommendations', () => {
    render(<InsightsPanel insights={mockInsights} />);
    expect(screen.getByText(/Test summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Take the bus/i)).toBeInTheDocument();
  });

  it('shows gemini badge when source is gemini', () => {
    render(<InsightsPanel insights={mockInsights} />);
    expect(screen.getByText(/Gemini/i)).toBeInTheDocument();
  });

  it('does not show gemini badge when source is rules', () => {
    const rulesInsights = { ...mockInsights, source: 'rules' as const };
    render(<InsightsPanel insights={rulesInsights} />);
    expect(screen.queryByText(/Gemini/i)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<InsightsPanel insights={mockInsights} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
