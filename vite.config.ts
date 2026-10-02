import { defineConfig } from 'vitest/config';

// Until the cutover the rebuilt app is published under next/ next to the legacy one;
// scripts/assemble.mjs adds legacy-app/ and repositorios/ around it.
export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist/next',
    emptyOutDir: true,
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text-summary', 'lcov'],
    },
  },
});
