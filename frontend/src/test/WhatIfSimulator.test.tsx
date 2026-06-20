import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import type { CarbonInput } from '../lib/types';

const mockInput: CarbonInput = {
  location: 'india',
  transport: {
    car_km_per_week: 100,
    car_fuel: 'petrol',
    public_transit_km_per_week: 0,
    short_haul_flights_per_year: 0,
    long_haul_flights_per_year: 0,
  },
  home: { electricity_kwh_per_month: 200, natural_gas_kwh_per_month: 0, household_size: 1 },
  diet: 'medium_meat',
  consumption: { goods_spend_usd_per_month: 0, waste_kg_per_week: 0 },
};

describe('WhatIfSimulator', () => {
  it('renders the simulator UI', () => {
    render(<WhatIfSimulator baseInput={mockInput} />);
    expect(screen.getByText(/What-If Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Run Simulation/i)).toBeInTheDocument();
  });

  it('shows diet and fuel options', () => {
    render(<WhatIfSimulator baseInput={mockInput} />);
    expect(screen.getByText('Vegan')).toBeInTheDocument();
    expect(screen.getByText('Electric')).toBeInTheDocument();
    expect(screen.getByText('No Change')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<WhatIfSimulator baseInput={mockInput} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
