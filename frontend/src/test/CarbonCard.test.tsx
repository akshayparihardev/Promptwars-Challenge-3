import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CarbonCard } from '../components/CarbonCard';
import type { FootprintResult } from '../lib/types';

// Mock html2canvas since it requires a real DOM canvas
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,mock',
  }),
}));

const mockResult: FootprintResult = {
  total_annual_kg: 5000,
  total_annual_tonnes: 5.0,
  breakdown_kg: { transport: 2000, home: 1500, diet: 1000, consumption: 500 },
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
  equivalencies: { trees_needed: 200, flights_delhi_mumbai: 50, km_petrol_car: 20000, km_indian_rail: 120000 },
};

describe('CarbonCard', () => {
  it('renders the card with result data', () => {
    render(<CarbonCard result={mockResult} />);
    expect(screen.getByText(/CarbonZero/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual Footprint/i)).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('shows the share impact heading', () => {
    render(<CarbonCard result={mockResult} />);
    expect(screen.getByText(/Share your impact/i)).toBeInTheDocument();
  });

  it('displays region and largest category', () => {
    render(<CarbonCard result={mockResult} />);
    expect(screen.getByText(/transport/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CarbonCard result={mockResult} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
