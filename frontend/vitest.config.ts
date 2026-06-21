import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/lib/types.ts',
        '.eslintrc.cjs',
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.ts',
        'vitest.config.ts',
      ],
      thresholds: {
        statements: 75,
        branches: 50,
        functions: 25,
        lines: 75,
      },
    },
  },
});
