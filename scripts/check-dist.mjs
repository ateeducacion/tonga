// Sanity checks on the built dist/: entry points exist, relative URLs only, no source maps or dev files.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const must = ['dist/index.html', 'dist/catalog.json', 'dist/repositorios/lista.txt', 'dist/next/index.html'];
for (const f of must) if (!existsSync(f)) failures.push(`missing ${f}`);

const html = existsSync('dist/index.html') ? readFileSync('dist/index.html', 'utf8') : '';
if (/(src|href)="\//.test(html)) failures.push('dist/index.html uses root-absolute URLs (breaks subdirectory hosting)');
if (/<script(?![^>]*\bsrc=)[^>]*>/.test(html)) failures.push('dist/index.html has an inline script (blocks a strict CSP)');

// Link previews: og:image must be an absolute https URL and the image must ship.
const og = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
if (!og || !/^https:\/\//.test(og)) failures.push(`og:image must be an absolute https URL (got ${og})`);
if (!existsSync('dist/og-image.jpg')) failures.push('missing dist/og-image.jpg');

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
for (const f of walk('dist').filter((f) => !f.startsWith('dist/repositorios/'))) if (f.endsWith('.map') || f.endsWith('.ts')) failures.push(`dev file shipped: ${f}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('dist/ ok');
