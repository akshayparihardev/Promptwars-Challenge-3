import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { NumberField } from '../components/NumberField';

describe('NumberField', () => {
  it('renders correctly with label and hint', () => {
    render(<NumberField id="test" label="Test Label" value={0} onChange={() => {}} hint="Test Hint" min={0} max={10} />);
    expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Hint/i)).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    const handleChange = vi.fn();
    render(<NumberField id="test" label="Test Label" value={0} onChange={handleChange} min={0} max={10} />);
    const input = screen.getByLabelText(/Test Label/i);
    fireEvent.change(input, { target: { value: '5' } });
    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NumberField id="test" label="Test Label" value={0} onChange={() => {}} min={0} max={10} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
