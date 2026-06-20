import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { EquivalencyDisplay } from '../components/EquivalencyDisplay';
import type { Equivalencies } from '../lib/types';

const mockEquivalencies: Equivalencies = {
  trees_needed: 200,
  flights_delhi_mumbai: 50,
  km_petrol_car: 20000,
  km_indian_rail: 120000,
};

describe('EquivalencyDisplay', () => {
  it('renders all four equivalency cards', () => {
    render(<EquivalencyDisplay eq={mockEquivalencies} />);
    expect(screen.getByText(/Tree seedlings/i)).toBeInTheDocument();
    expect(screen.getByText(/Delhi to Mumbai/i)).toBeInTheDocument();
    expect(screen.getByText(/petrol car/i)).toBeInTheDocument();
    expect(screen.getByText(/Indian Railways/i)).toBeInTheDocument();
  });

  it('displays correct numerical values', () => {
    render(<EquivalencyDisplay eq={mockEquivalencies} />);
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EquivalencyDisplay eq={mockEquivalencies} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
