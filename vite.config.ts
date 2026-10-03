import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/** Emits sw.js with the precache list of this build (hashed assets + public shell files). */
function serviceWorker(): Plugin {
  return {
    name: 'tonga-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const publicFiles = ['theme-init.js', 'favicon.svg', 'ate-logo.png', 'manifest.webmanifest', ...readdirSync('public/icons').map((f) => `icons/${f}`)];
      const files = [...new Set(['index.html', ...publicFiles, ...Object.keys(bundle).filter((f) => !f.endsWith('.map'))])].sort();
      const hash = createHash('sha256');
      for (const f of publicFiles) hash.update(f).update(readFileSync(`public/${f}`));
      for (const [name, chunk] of Object.entries(bundle).sort(([a], [b]) => a.localeCompare(b))) hash.update(name).update('code' in chunk ? chunk.code : chunk.source);
      const version = hash.digest('hex').slice(0, 12);
      const source = readFileSync('src/sw.js', 'utf8').replace("'__VERSION__'", JSON.stringify(version)).replace('__PRECACHE__', JSON.stringify(['./', ...files.map((f) => `./${f}`)]));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// Public URL of the deployment: link previews (WhatsApp, social networks) need absolute URLs.
// Override for other deployments: VITE_SITE_URL=https://example.org/tonga/ npm run build
process.env.VITE_SITE_URL ??= 'https://ateeducacion.github.io/tonga/';

/**
 * The version shown in the app is the latest v* git tag ("2.1.1"), so tagging is enough.
 * The exact build ("2.1.1-3-gabc1234", from git describe) is only a tooltip, for bug reports.
 * TONGA_VERSION overrides both (release CI); package.json is the fallback without git history.
 */
function describe(...args: string[]): string | null {
  try {
    return execFileSync('git', ['describe', '--tags', '--match', 'v[0-9]*', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().replace(/^v/, '');
  } catch {
    return null;
  }
}
const fallback = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version;
const version = process.env.TONGA_VERSION?.replace(/^v/, '') ?? describe('--abbrev=0') ?? fallback;
const build = process.env.TONGA_VERSION?.replace(/^v/, '') ?? describe() ?? fallback;

// dist/ is fully static; scripts/copy-collections.mjs adds repositorios/ next to the app.
export default defineConfig({
  base: './',
  plugins: [serviceWorker()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_BUILD__: JSON.stringify(build),
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    // The eXeLearning files are fetched and zipped as they are: never inline them as data: URLs.
    assetsInlineLimit: (file) => (file.includes('/vendor/exelearning/') ? false : undefined),
  },
  test: {
    environment: 'jsdom',
    // Let jsdom decode <img> sources (with node-canvas), so image layers can be tested.
    environmentOptions: { jsdom: { resources: 'usable' } },
    include: ['test/**/*.test.ts'],
    // Vitest empties CSS by default, even ?raw imports; the eXeLearning theme must arrive intact.
    css: { include: [/vendor\/exelearning\//] },
    coverage: {
      provider: 'v8',
      // Logic modules. The DOM wiring (src/app, src/ui widgets, main, storage) is covered by the
      // Playwright suite in three browsers instead (docs/TESTING.md).
      include: ['src/project/**', 'src/history/**', 'src/canvas/**', 'src/export/**', 'src/import/sniff.ts', 'src/import/svg.ts', 'src/assets/catalog.ts', 'src/ui/shortcuts.ts'],
      thresholds: { lines: 98, statements: 97, functions: 97, branches: 90 },
      reporter: ['text-summary', 'lcov'],
    },
  },
});
