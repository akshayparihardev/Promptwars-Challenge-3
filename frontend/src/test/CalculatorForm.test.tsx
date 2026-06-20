import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CalculatorForm } from '../components/CalculatorForm';

describe('CalculatorForm', () => {
  it('renders correctly', () => {
    render(<CalculatorForm onSubmit={() => {}} onLocationChange={() => {}} location="us" />);
    expect(screen.getByText(/Home Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculate Footprint/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CalculatorForm onSubmit={() => {}} onLocationChange={() => {}} location="us" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
