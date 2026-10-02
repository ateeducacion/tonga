import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

// Until the cutover the rebuilt app is published under next/ next to the legacy one;
// scripts/assemble.mjs adds legacy-app/ and repositorios/ around it.
export default defineConfig(({ command }) => ({
  base: './',
  define: {
    // Dev serves the repository root; the build lives in next/ beside repositorios/.
    __LIBRARY_ROOT__: JSON.stringify(command === 'serve' ? './' : '../'),
    __APP_VERSION__: JSON.stringify(version),
  },
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
}));
