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
 * The version shown in the app is package.json's: the release commit bumps it, so main is
 * deployed with the new number before the tag exists and tagging needs no redeploy.
 * The exact build ("2.2.0+abc1234", the commit) is only a tooltip, for bug reports.
 */
function commit(): string | null {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}
const version = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version;
const sha = commit();
const build = sha ? `${version}+${sha}` : version;

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
      include: ['src/project/**', 'src/history/**', 'src/canvas/**', 'src/export/**', 'src/import/sniff.ts', 'src/import/svg.ts', 'src/import/exe.ts', 'src/import/unzip.ts', 'src/assets/catalog.ts', 'src/ui/shortcuts.ts'],
      thresholds: { lines: 98, statements: 97, functions: 97, branches: 90 },
      reporter: ['text-summary', 'lcov'],
    },
  },
});
