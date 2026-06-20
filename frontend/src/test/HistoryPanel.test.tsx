import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { HistoryPanel } from '../components/HistoryPanel';
import { vi } from 'vitest';

vi.mock('../lib/api', () => ({
  getHistory: vi.fn().mockResolvedValue([
    {
      id: '1',
      created_at: new Date().toISOString(),
      input: { location: 'India' } as unknown as import('../lib/types').CarbonInput,
      result: { total_annual_tonnes: 5.0 } as unknown as import('../lib/types').FootprintResult,
    }
  ])
}));

describe('HistoryPanel', () => {
  it('renders history entries', async () => {
    render(<HistoryPanel onSelectEntry={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('India')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HistoryPanel onSelectEntry={() => {}} />);
    await waitFor(() => screen.getByText('India'));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
