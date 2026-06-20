import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import App from '../App';

// Mock the API so App doesn't make real fetch calls
vi.mock('../lib/api', () => ({
  calculateFootprint: vi.fn(),
  getInsights: vi.fn(),
  getGamification: vi.fn(),
  simulateWhatIf: vi.fn(),
  saveEntry: vi.fn(),
  getHistory: vi.fn().mockResolvedValue([]),
}));

describe('App', () => {
  it('renders the main layout correctly', () => {
    render(<App />);
    expect(screen.getByText(/Carbon Footprint Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/CarbonZero/i)).toBeInTheDocument();
  });

  it('renders the form with a calculate button', () => {
    render(<App />);
    expect(screen.getByText(/Calculate Footprint/i)).toBeInTheDocument();
  });

  it('has a skip link for accessibility', () => {
    render(<App />);
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
  });

  it('has a theme toggle button', () => {
    render(<App />);
    expect(screen.getByLabelText(/Switch to/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
