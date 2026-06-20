import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ResultBreakdown } from '../components/ResultBreakdown';
import type { FootprintResult } from '../lib/types';

const mockResult: FootprintResult = {
  total_annual_kg: 5000,
  total_annual_tonnes: 5.0,
  breakdown_kg: {
    transport: 2000,
    home: 1500,
    diet: 1000,
    consumption: 500,
  },
  comparison: {
    global_average_annual_kg: 4800,
    sustainable_target_annual_kg: 2000,
    ratio_to_global_average: 1.04,
    ratio_to_sustainable_target: 2.5,
  },
  insight_tag: 'average',
  largest_category: 'transport',
  location_context: {
    region: 'india',
    grid_factor: 0.82,
    annual_km: 8000,
    benchmark_t: 1.9,
    benchmark_label: 'India average',
    local_transport_tip: 'Use metro',
    currency_symbol: '₹',
  },
  equivalencies: {
    trees_needed: 200,
    flights_delhi_mumbai: 50,
    km_petrol_car: 20000,
    km_indian_rail: 120000,
  },
};

describe('ResultBreakdown', () => {
  it('renders the total annual footprint', () => {
    render(<ResultBreakdown result={mockResult} />);
    expect(screen.getByText('5.00')).toBeInTheDocument();
  });

  it('shows the breakdown categories', () => {
    render(<ResultBreakdown result={mockResult} />);
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Diet')).toBeInTheDocument();
  });

  it('shows comparison to global average', () => {
    render(<ResultBreakdown result={mockResult} />);
    expect(screen.getByText(/1.04/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ResultBreakdown result={mockResult} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
