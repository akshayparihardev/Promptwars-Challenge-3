import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { GamificationPanel } from '../components/GamificationPanel';

const mockGamification = {
  level: 5,
  points: 1500,
  next_level_points: 2000,
  achievements: [
    { id: '1', title: 'Eco Warrior', description: 'Save 1000kg CO2e', icon: 'Tree', unlocked: true }
  ],
  challenges: [],
};

describe('GamificationPanel', () => {
  it('renders badges', () => {
    render(<GamificationPanel data={mockGamification} />);
    expect(screen.getByText('Eco Warrior')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GamificationPanel data={mockGamification} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
