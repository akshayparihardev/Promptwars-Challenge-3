import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Recharts ResponsiveContainer for jsdom
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual<Record<string, unknown>>('recharts');
  const React = await import('react');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => 
      React.createElement(OriginalModule.ResponsiveContainer as React.ElementType, { width: 800, height: 800 }, children)
  };
});
