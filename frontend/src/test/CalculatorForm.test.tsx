import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CalculatorForm } from '../components/CalculatorForm';

describe('CalculatorForm', () => {
  it('renders correctly', () => {
    render(<CalculatorForm onSubmit={() => {}} loading={false} />);
    expect(screen.getByText(/Home Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculate Footprint/i)).toBeInTheDocument();
  });

  it('shows calculating state when loading', () => {
    render(<CalculatorForm onSubmit={() => {}} loading={true} />);
    expect(screen.getByText(/Calculating/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculating/i })).toHaveAttribute('aria-busy', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CalculatorForm onSubmit={() => {}} loading={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
